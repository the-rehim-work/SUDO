import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDatabase, getDatabase, saveDatabase } from './database.js';
import { generateSudoku, generateKillerSudoku, validateSolution } from './sudoku.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sudoku-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

interface AuthRequest extends Request {
  userId?: number;
  username?: string;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  if (username.length < 3 || password.length < 4) {
    res.status(400).json({ error: 'Username must be 3+ chars, password 4+ chars' });
    return;
  }

  const db = getDatabase();
  const existing = db.exec(`SELECT id FROM users WHERE username = '${username.replace(/'/g, "''")}'`);

  if (existing.length > 0 && existing[0].values.length > 0) {
    res.status(400).json({ error: 'Username already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword]);
  saveDatabase();

  const result = db.exec(`SELECT id FROM users WHERE username = '${username.replace(/'/g, "''")}'`);
  const userId = result[0].values[0][0] as number;

  const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: userId, username } });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  const db = getDatabase();
  const result = db.exec(`SELECT id, password FROM users WHERE username = '${username.replace(/'/g, "''")}'`);

  if (result.length === 0 || result[0].values.length === 0) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const [userId, hashedPassword] = result[0].values[0] as [number, string];
  const validPassword = await bcrypt.compare(password, hashedPassword);

  if (!validPassword) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: userId, username } });
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ user: { id: req.userId, username: req.username } });
});

app.post('/api/game/new', authenticateToken, (req: AuthRequest, res: Response) => {
  const { gameType, difficulty, mistakesEnabled = false } = req.body;

  if (!['sudoku', 'killer'].includes(gameType)) {
    res.status(400).json({ error: 'Invalid game type' });
    return;
  }

  if (!['easy', 'medium', 'hard', 'expert'].includes(difficulty)) {
    res.status(400).json({ error: 'Invalid difficulty' });
    return;
  }

  const db = getDatabase();

  db.run(`DELETE FROM games WHERE user_id = ? AND is_completed = 0`, [req.userId!]);

  const puzzleData = gameType === 'killer'
    ? generateKillerSudoku(difficulty)
    : generateSudoku(difficulty);

  db.run(
    `INSERT INTO games (user_id, game_type, difficulty, puzzle, solution, current_state, notes, mistakes_enabled, cages) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.userId!,
      gameType,
      difficulty,
      JSON.stringify(puzzleData.puzzle),
      JSON.stringify(puzzleData.solution),
      JSON.stringify(puzzleData.puzzle),
      JSON.stringify(Array(9).fill(null).map(() => Array(9).fill([]))),
      mistakesEnabled ? 1 : 0,
      gameType === 'killer' && puzzleData.cages ? JSON.stringify(puzzleData.cages) : null
    ]
  );
  saveDatabase();

  const result = db.exec('SELECT last_insert_rowid() as id');
  const gameId = result[0].values[0][0] as number;

  if (gameType === 'killer' && puzzleData.cages) {
    db.run(
      `INSERT INTO game_cages (game_id, cages) VALUES (?, ?)`,
      [gameId, JSON.stringify(puzzleData.cages)]
    );
    saveDatabase();
  }

  res.json({
    gameId,
    puzzle: puzzleData.puzzle,
    solution: puzzleData.solution,
    currentState: puzzleData.puzzle,
    cages: puzzleData.cages,
    gameType,
    difficulty,
    mistakesEnabled
  });
});

app.get('/api/game/active/list', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const result = db.exec(
    `SELECT id, game_type, difficulty, time_seconds, mistakes_enabled, started_at 
     FROM games WHERE user_id = ${req.userId} AND is_completed = 0 
     ORDER BY started_at DESC LIMIT 1`
  );

  if (result.length === 0 || result[0].values.length === 0) {
    res.json({ games: [] });
    return;
  }

  const games = result[0].values.map(row => ({
    id: row[0],
    gameType: row[1],
    difficulty: row[2],
    timeSeconds: row[3],
    mistakesEnabled: Boolean(row[4]),
    startedAt: row[5]
  }));

  res.json({ games });
});

app.get('/api/game/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const result = db.exec(
    `SELECT id, game_type, difficulty, puzzle, solution, current_state, notes, time_seconds, is_completed, mistakes_enabled, cages 
   FROM games WHERE id = ${req.params.id} AND user_id = ${req.userId}`
  );

  if (result.length === 0 || result[0].values.length === 0) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  const [id, gameType, difficulty, puzzle, solution, currentState, notes, timeSeconds, isCompleted, mistakesEnabled, cages] = result[0].values[0];
  const puzzleData = JSON.parse(puzzle as string);
  const solutionData = solution ? JSON.parse(solution as string) : puzzleData;
  const cagesData = cages ? JSON.parse(cages as string) : undefined;

  res.json({
    gameId: id,
    gameType,
    difficulty,
    puzzle: puzzleData,
    solution: solutionData,
    cages: cagesData,
    currentState: JSON.parse(currentState as string),
    notes: JSON.parse(notes as string),
    timeSeconds,
    isCompleted: Boolean(isCompleted),
    mistakesEnabled: Boolean(mistakesEnabled)
  });
});

app.put('/api/game/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { currentState, notes, timeSeconds } = req.body;
  const db = getDatabase();

  const result = db.exec(
    `SELECT is_completed FROM games WHERE id = ${req.params.id} AND user_id = ${req.userId}`
  );

  if (result.length === 0 || result[0].values.length === 0) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  const [isCompleted] = result[0].values[0];
  if (isCompleted) {
    res.status(400).json({ error: 'Game already completed' });
    return;
  }

  db.run(
    `UPDATE games SET current_state = ?, notes = ?, time_seconds = ? WHERE id = ?`,
    [JSON.stringify(currentState), JSON.stringify(notes), timeSeconds, req.params.id]
  );
  saveDatabase();

  res.json({ success: true });
});

app.put('/api/game/:id/time', authenticateToken, (req: AuthRequest, res: Response) => {
  const { timeSeconds } = req.body;
  const db = getDatabase();

  db.run(
    `UPDATE games SET time_seconds = ? WHERE id = ? AND user_id = ? AND is_completed = 0`,
    [timeSeconds, req.params.id, req.userId]
  );
  saveDatabase();

  res.json({ success: true });
});

app.post('/api/game/:id/complete', authenticateToken, (req: AuthRequest, res: Response) => {
  const { currentState, timeSeconds } = req.body;
  const db = getDatabase();

  const result = db.exec(
    `SELECT solution, game_type, difficulty, is_completed, mistakes_enabled FROM games WHERE id = ${req.params.id} AND user_id = ${req.userId}`
  );

  if (result.length === 0 || result[0].values.length === 0) {
    res.status(404).json({ error: 'Game not found' });
    return;
  }

  const [solution, gameType, difficulty, isCompleted, mistakesEnabled] = result[0].values[0];
  if (isCompleted) {
    res.status(400).json({ error: 'Game already completed' });
    return;
  }

  const solutionData = JSON.parse(solution as string);
  const isValid = validateSolution(currentState, solutionData);

  if (!isValid) {
    res.status(400).json({ error: 'Solution is incorrect', valid: false });
    return;
  }

  db.run(
    `UPDATE games SET current_state = ?, time_seconds = ?, is_completed = 1, completed_at = datetime('now') WHERE id = ?`,
    [JSON.stringify(currentState), timeSeconds, req.params.id]
  );

  db.run(
    `INSERT INTO leaderboards (user_id, username, game_type, difficulty, time_seconds, mistakes_enabled) VALUES (?, ?, ?, ?, ?, ?)`,
    [req.userId, req.username, gameType, difficulty, timeSeconds, mistakesEnabled ? 1 : 0]
  );
  saveDatabase();

  res.json({ success: true, valid: true });
});

app.get('/api/user/statistics', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDatabase();
  const result = db.exec(
    `SELECT id, game_type, difficulty, time_seconds, mistakes_enabled, completed_at 
     FROM games WHERE user_id = ${req.userId} AND is_completed = 1 
     ORDER BY completed_at DESC LIMIT 100`
  );

  if (result.length === 0 || result[0].values.length === 0) {
    res.json({ games: [] });
    return;
  }

  const games = result[0].values.map(row => ({
    id: row[0],
    gameType: row[1],
    difficulty: row[2],
    timeSeconds: row[3],
    mistakesEnabled: Boolean(row[4]),
    completedAt: row[5]
  }));

  res.json({ games });
});

app.get('/api/leaderboard/:gameType/:difficulty', (req: Request, res: Response) => {
  const { gameType, difficulty } = req.params;
  const mistakesEnabled = req.query.mistakesEnabled === 'true';
  const db = getDatabase();

  const result = db.exec(
    `SELECT username, time_seconds, completed_at 
     FROM leaderboards 
     WHERE game_type = '${gameType}' AND difficulty = '${difficulty}' AND mistakes_enabled = ${mistakesEnabled ? 1 : 0}
     ORDER BY time_seconds ASC 
     LIMIT 20`
  );

  if (result.length === 0 || result[0].values.length === 0) {
    res.json({ entries: [] });
    return;
  }

  const entries = result[0].values.map((row, index) => ({
    rank: index + 1,
    username: row[0],
    timeSeconds: row[1],
    completedAt: row[2]
  }));

  res.json({ entries });
});

async function start() {
  await initDatabase();

  const db = getDatabase();

  try {
    db.exec(`ALTER TABLE games ADD COLUMN solution TEXT`);
  } catch { }

  try {
    db.exec(`ALTER TABLE games ADD COLUMN mistakes_enabled INTEGER DEFAULT 0`);
  } catch { }

  try {
    db.exec(`ALTER TABLE games ADD COLUMN cages TEXT`);
  } catch { }

  try {
    db.exec(`ALTER TABLE leaderboards ADD COLUMN mistakes_enabled INTEGER DEFAULT 0`);
  } catch { }

  try {
    db.exec(`CREATE TABLE IF NOT EXISTS game_cages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER NOT NULL,
      cages TEXT NOT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id)
    )`);
  } catch { }

  saveDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
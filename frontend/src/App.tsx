/* eslint-disable react-hooks/immutability */
import { useState, useEffect, useCallback, useMemo } from 'react';

const API_URL = 'http://localhost:3001/api';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
type GameMode = 'sudoku' | 'killer';
type Screen = 'menu' | 'game' | 'leaderboard' | 'auth' | 'newgame' | 'statistics';

interface User {
  id: number;
  username: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  timeSeconds: number;
  completedAt: string;
}

interface KillerCage {
  cells: [number, number][];
  sum: number;
  color: string;
}

interface ActiveGame {
  id: number;
  gameType: GameMode;
  difficulty: Difficulty;
  timeSeconds: number;
  mistakesEnabled: boolean;
  startedAt: string;
}

interface GameStatEntry {
  id: number;
  gameType: GameMode;
  difficulty: Difficulty;
  timeSeconds: number;
  mistakesEnabled: boolean;
  completedAt: string;
}

interface GameState {
  gameId: number | null;
  board: number[][];
  solution: number[][];
  initial: boolean[][];
  notes: number[][][];
  killerCages?: KillerCage[];
  startTime: number;
  elapsed: number;
  difficulty: Difficulty;
  mode: GameMode;
  selectedCell: [number, number] | null;
  isNoteMode: boolean;
  mistakes: Set<string>;
  mistakesEnabled: boolean;
  isComplete: boolean;
}

const CAGE_COLORS_NORMAL = [
  'bg-rose-200',
  'bg-sky-200',
  'bg-emerald-200',
  'bg-amber-200',
  'bg-violet-200',
  'bg-pink-200',
  'bg-cyan-200',
  'bg-lime-200',
  'bg-orange-200',
  'bg-indigo-200',
  'bg-teal-200',
  'bg-fuchsia-200',
];

const CAGE_COLORS_HIGHLIGHT = [
  'bg-rose-300',
  'bg-sky-300',
  'bg-emerald-300',
  'bg-amber-300',
  'bg-violet-300',
  'bg-pink-300',
  'bg-cyan-300',
  'bg-lime-300',
  'bg-orange-300',
  'bg-indigo-300',
  'bg-teal-300',
  'bg-fuchsia-300',
];

const CAGE_COLORS_SELECTED = [
  'bg-rose-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-lime-500',
  'bg-orange-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-fuchsia-500',
];

function generateSudoku(difficulty: Difficulty): { board: number[][], solution: number[][], initial: boolean[][] } {
  const solution = generateSolvedBoard();
  const board = JSON.parse(JSON.stringify(solution));
  const initial: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(true));

  const cellsToRemove = {
    easy: 35,      // 46 givens
    medium: 46,    // 35 givens
    hard: 54,      // 27 givens
    expert: 64,    // 17 givens (minimum for unique solution)
  }[difficulty];

  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }

  shuffleArray(positions);

  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const [r, c] = positions[i];
    board[r][c] = 0;
    initial[r][c] = false;
  }

  return { board, solution, initial };
}

function generateSolvedBoard(): number[][] {
  const board: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(nums);
  for (let c = 0; c < 9; c++) {
    board[0][c] = nums[c];
  }

  solveSudoku(board);
  return board;
}

function solveSudoku(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(nums);
        for (const num of nums) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            if (solveSudoku(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateKillerCages(solution: number[][]): KillerCage[] {
  const cages: KillerCage[] = [];
  const assigned: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));
  let colorIndex = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (assigned[r][c]) continue;

      const rand = Math.random();
      let targetSize: number;
      if (rand < 0.15) {
        targetSize = 2;
      } else if (rand < 0.50) {
        targetSize = 3;
      } else if (rand < 0.85) {
        targetSize = 4;
      } else {
        targetSize = 5;
      }

      const cells: [number, number][] = [[r, c]];
      assigned[r][c] = true;

      const directions: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

      while (cells.length < targetSize) {
        const candidates: [number, number][] = [];
        for (const [cr, cc] of cells) {
          for (const [dr, dc] of directions) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && !assigned[nr][nc]) {
              const alreadyCandidate = candidates.some(([r, c]) => r === nr && c === nc);
              if (!alreadyCandidate) candidates.push([nr, nc]);
            }
          }
        }
        if (candidates.length === 0) break;
        const [nr, nc] = candidates[Math.floor(Math.random() * candidates.length)];
        cells.push([nr, nc]);
        assigned[nr][nc] = true;
      }

      const sum = cells.reduce((acc, [r, c]) => acc + solution[r][c], 0);
      cages.push({
        cells,
        sum,
        color: CAGE_COLORS_NORMAL[colorIndex % CAGE_COLORS_NORMAL.length],
      });
      colorIndex++;
    }
  }

  return cages;
}

function getCellCage(cages: KillerCage[], row: number, col: number): KillerCage | undefined {
  return cages.find(cage => cage.cells.some(([r, c]) => r === row && c === col));
}

function getCellCageIndex(cages: KillerCage[], row: number, col: number): number {
  return cages.findIndex(cage => cage.cells.some(([r, c]) => r === row && c === col));
}

function isCageTopLeft(cage: KillerCage, row: number, col: number): boolean {
  const minRow = Math.min(...cage.cells.map(([r]) => r));
  const cellsInMinRow = cage.cells.filter(([r]) => r === minRow);
  const minCol = Math.min(...cellsInMinRow.map(([, c]) => c));
  return row === minRow && col === minCol;
}

function getCageBorders(cage: KillerCage, row: number, col: number): { top: boolean, right: boolean, bottom: boolean, left: boolean } {
  const inCage = (r: number, c: number) => cage.cells.some(([cr, cc]) => cr === r && cc === c);
  return {
    top: !inCage(row - 1, col),
    right: !inCage(row, col + 1),
    bottom: !inCage(row + 1, col),
    left: !inCage(row, col - 1),
  };
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function hasConflict(board: number[][], row: number, col: number): boolean {
  const val = board[row][col];
  if (val === 0) return false;

  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === val) return true;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === val) return true;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === val) return true;
    }
  }
  return false;
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<{ difficulty: Difficulty, mode: GameMode, mistakesEnabled: boolean }>({ difficulty: 'easy', mode: 'sudoku', mistakesEnabled: false });
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [menuDifficulty, setMenuDifficulty] = useState<Difficulty>('easy');
  const [menuMode, setMenuMode] = useState<GameMode>('sudoku');
  const [menuMistakesEnabled, setMenuMistakesEnabled] = useState(false);
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [statistics, setStatistics] = useState<GameStatEntry[]>([]);
  const [hasUnsavedGame, setHasUnsavedGame] = useState(false);

  useEffect(() => {
    if (!gameState || gameState.isComplete) return;
    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev) return null;
        const newState = { ...prev, elapsed: Math.floor((Date.now() - prev.startTime) / 1000) };
        if (user && prev.gameId && newState.elapsed % 5 === 0) {
          apiRequest(`/game/${prev.gameId}/time`, {
            method: 'PUT',
            body: JSON.stringify({ timeSeconds: newState.elapsed }),
          }).catch(console.error);
        }
        return newState;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState?.isComplete, gameState?.startTime, user]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      apiRequest('/auth/me')
        .then(data => {
          setUser(data.user);
          loadActiveGame();
          loadStatistics();
        })
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  useEffect(() => {
    if (gameState && !gameState.isComplete && !user) {
      setHasUnsavedGame(true);
    } else {
      setHasUnsavedGame(false);
    }
  }, [gameState, user]);

  useEffect(() => {
    if (!hasUnsavedGame) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedGame]);

  useEffect(() => {
    return () => {
      if (gameState && !gameState.isComplete && user && gameState.gameId) {
        navigator.sendBeacon(
          `${API_URL}/game/${gameState.gameId}`,
          JSON.stringify({
            currentState: gameState.board,
            notes: gameState.notes,
            timeSeconds: gameState.elapsed,
          })
        );
      }
    };
  }, []);

  const loadActiveGame = async () => {
    try {
      const data = await apiRequest('/game/active/list');
      if (data.games && data.games.length > 0) {
        setActiveGame(data.games[0]);
      } else {
        setActiveGame(null);
      }
    } catch {
      setActiveGame(null);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await apiRequest('/user/statistics');
      setStatistics(data.games || []);
    } catch {
      setStatistics([]);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = authMode === 'signin' ? '/auth/login' : '/auth/register';
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({ username: authUsername, password: authPassword }),
      });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setScreen('menu');
      setAuthUsername('');
      setAuthPassword('');
      loadActiveGame();
      loadStatistics();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveGame(null);
    setStatistics([]);
  };

  const continueGame = async () => {
    if (!activeGame) return;

    try {
      const data = await apiRequest(`/game/${activeGame.id}`);

      const initial: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));
      const puzzleData = data.puzzle;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          initial[r][c] = puzzleData[r][c] !== 0;
        }
      }

      const cagesWithColors = data.cages?.map((cage: { cells: [number, number][], sum: number }, idx: number) => ({
        ...cage,
        color: CAGE_COLORS_NORMAL[idx % CAGE_COLORS_NORMAL.length],
      }));

      setGameState({
        gameId: data.gameId,
        board: data.currentState,
        solution: data.solution,
        initial,
        notes: data.notes || Array(9).fill(null).map(() => Array(9).fill(null).map(() => [])),
        killerCages: cagesWithColors,
        startTime: Date.now() - (data.timeSeconds * 1000),
        elapsed: data.timeSeconds,
        difficulty: data.difficulty,
        mode: data.gameType,
        selectedCell: null,
        isNoteMode: false,
        mistakes: new Set(),
        mistakesEnabled: data.mistakesEnabled ?? false,
        isComplete: false,
      });
      setScreen('game');
    } catch (err) {
      console.error('Failed to load game:', err);
    }
  };

  const startNewGame = async () => {
    if (user) {
      try {
        const data = await apiRequest('/game/new', {
          method: 'POST',
          body: JSON.stringify({
            gameType: menuMode,
            difficulty: menuDifficulty,
            mistakesEnabled: menuMistakesEnabled,
          }),
        });

        const initial: boolean[][] = Array(9).fill(null).map(() => Array(9).fill(false));
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            initial[r][c] = data.puzzle[r][c] !== 0;
          }
        }

        setGameState({
          gameId: data.gameId,
          board: data.currentState || data.puzzle,
          solution: data.solution || data.puzzle,
          initial,
          notes: Array(9).fill(null).map(() => Array(9).fill(null).map(() => [])),
          killerCages: data.cages,
          startTime: Date.now(),
          elapsed: 0,
          difficulty: menuDifficulty,
          mode: menuMode,
          selectedCell: null,
          isNoteMode: false,
          mistakes: new Set(),
          mistakesEnabled: menuMistakesEnabled,
          isComplete: false,
        });
        setActiveGame({
          id: data.gameId,
          gameType: menuMode,
          difficulty: menuDifficulty,
          timeSeconds: 0,
          mistakesEnabled: menuMistakesEnabled,
          startedAt: new Date().toISOString(),
        });
        setScreen('game');
        return;
      } catch (err) {
        console.error('Failed to create game on server, falling back to local:', err);
      }
    }

    const { board, solution, initial } = generateSudoku(menuDifficulty);
    const notes: number[][][] = Array(9).fill(null).map(() =>
      Array(9).fill(null).map(() => [])
    );
    const killerCages = menuMode === 'killer' ? generateKillerCages(solution) : undefined;

    if (menuMode === 'killer' && killerCages) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          board[r][c] = 0;
          initial[r][c] = false;
        }
      }
    }

    setGameState({
      gameId: null,
      board,
      solution,
      initial,
      notes,
      killerCages,
      startTime: Date.now(),
      elapsed: 0,
      difficulty: menuDifficulty,
      mode: menuMode,
      selectedCell: null,
      isNoteMode: false,
      mistakes: new Set(),
      mistakesEnabled: menuMistakesEnabled,
      isComplete: false,
    });
    setScreen('game');
  };

  const handleCellClick = (row: number, col: number) => {
    if (!gameState || gameState.isComplete) return;
    setGameState(prev => prev ? { ...prev, selectedCell: [row, col] } : null);
  };

  const handleNumberInput = useCallback((num: number) => {
    if (!gameState || !gameState.selectedCell || gameState.isComplete) return;
    const [row, col] = gameState.selectedCell;
    if (gameState.initial[row][col]) return;
    if (numberCounts.get(num) === 9) return;

    setGameState(prev => {
      if (!prev) return null;
      const newState = { ...prev, mistakes: new Set(prev.mistakes) };

      if (prev.isNoteMode) {
        const newNotes = prev.notes.map(r => r.map(c => [...c]));
        const cellNotes = newNotes[row][col];
        const idx = cellNotes.indexOf(num);
        if (idx !== -1) {
          cellNotes.splice(idx, 1);
        } else {
          cellNotes.push(num);
          cellNotes.sort((a, b) => a - b);
        }
        newState.notes = newNotes;
        const newBoard = prev.board.map(r => [...r]);
        newBoard[row][col] = 0;
        newState.board = newBoard;

        if (user && prev.gameId) {
          apiRequest(`/game/${prev.gameId}`, {
            method: 'PUT',
            body: JSON.stringify({
              currentState: newBoard,
              notes: newNotes,
              timeSeconds: prev.elapsed,
            }),
          }).catch(console.error);
        }

      } else {
        const newBoard = prev.board.map(r => [...r]);
        newBoard[row][col] = num;
        newState.board = newBoard;

        const newNotes = prev.notes.map(r => r.map(c => [...c]));
        newNotes[row][col] = [];
        newState.notes = newNotes;

        if (prev.mistakesEnabled && num !== prev.solution[row][col]) {
          newState.mistakes.add(`${row}-${col}`);
        } else if (prev.mistakesEnabled) {
          newState.mistakes.delete(`${row}-${col}`);
        }

        const isComplete = newBoard.every((r, ri) =>
          r.every((c, ci) => c === prev.solution[ri][ci])
        );

        if (isComplete) {
          newState.isComplete = true;
          if (user && prev.gameId) {
            apiRequest(`/game/${prev.gameId}/complete`, {
              method: 'POST',
              body: JSON.stringify({
                currentState: newBoard,
                timeSeconds: prev.elapsed,
              }),
            }).then(() => {
              loadActiveGame();
              loadStatistics();
            }).catch(console.error);
          }
        }
        else if (user && prev.gameId) {
          apiRequest(`/game/${prev.gameId}`, {
            method: 'PUT',
            body: JSON.stringify({
              currentState: newBoard,
              notes: newNotes,
              timeSeconds: prev.elapsed,
            }),
          }).catch(console.error);
        }
      }
      return newState;
    });
  }, [gameState, user]);

  const handleClear = () => {
    if (!gameState || !gameState.selectedCell || gameState.isComplete) return;
    const [row, col] = gameState.selectedCell;
    if (gameState.initial[row][col]) return;

    setGameState(prev => {
      if (!prev) return null;
      const newBoard = prev.board.map(r => [...r]);
      newBoard[row][col] = 0;
      const newNotes = prev.notes.map(r => r.map(c => [...c]));
      newNotes[row][col] = [];
      const newMistakes = new Set(prev.mistakes);
      newMistakes.delete(`${row}-${col}`);

      const newState = { ...prev, board: newBoard, notes: newNotes, mistakes: newMistakes };

      if (user && prev.gameId) {
        apiRequest(`/game/${prev.gameId}`, {
          method: 'PUT',
          body: JSON.stringify({
            currentState: newBoard,
            notes: newNotes,
            timeSeconds: prev.elapsed,
          }),
        }).catch(console.error);
      }

      return newState;
    });
  };

  const toggleNoteMode = () => {
    setGameState(prev => prev ? { ...prev, isNoteMode: !prev.isNoteMode } : null);
  };

  const handleBackToMenu = async () => {
    if (hasUnsavedGame) {
      const confirmed = window.confirm('You have an unsaved game. Are you sure you want to leave? Your progress will be lost.');
      if (!confirmed) return;
    }

    if (user && gameState?.gameId && !gameState.isComplete) {
      try {
        await apiRequest(`/game/${gameState.gameId}`, {
          method: 'PUT',
          body: JSON.stringify({
            currentState: gameState.board,
            notes: gameState.notes,
            timeSeconds: gameState.elapsed,
          }),
        });
      } catch (err) {
        console.error('Failed to save before leaving:', err);
      }
    }

    setScreen('menu');
    setGameState(null);
    if (user) {
      loadActiveGame();
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await apiRequest(`/leaderboard/${leaderboardFilter.mode}/${leaderboardFilter.difficulty}?mistakesEnabled=${leaderboardFilter.mistakesEnabled}`);
      setLeaderboardData(data.entries || []);
    } catch (err) {
      console.error(err);
      setLeaderboardData([]);
    }
  };

  useEffect(() => {
    if (screen === 'leaderboard') {
      loadLeaderboard();
    }
  }, [screen, leaderboardFilter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game' || !gameState) return;
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
      } else if (e.key === 'n' || e.key === 'N') {
        toggleNoteMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, gameState, handleNumberInput]);

  const selectedValue = useMemo(() => {
    if (!gameState?.selectedCell) return null;
    const [r, c] = gameState.selectedCell;
    return gameState.board[r][c];
  }, [gameState?.selectedCell, gameState?.board]);

  const numberCounts = useMemo(() => {
    if (!gameState) return new Map<number, number>();
    const counts = new Map<number, number>();
    for (let n = 1; n <= 9; n++) counts.set(n, 0);
    for (const row of gameState.board) {
      for (const cell of row) {
        if (cell !== 0) counts.set(cell, (counts.get(cell) || 0) + 1);
      }
    }
    return counts;
  }, [gameState?.board]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 text-slate-100 font-sans">
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-slate-800/90 backdrop-blur-sm border-b border-slate-600/50">
        <button
          onClick={handleBackToMenu}
          className="cursor-pointer text-2xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          SUDOKU
        </button>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setScreen('statistics'); loadStatistics(); }}
                className="cursor-pointer text-slate-300 text-sm hover:text-white transition-colors"
              >
                Statistics
              </button>
              <span className="text-slate-300 text-sm">{user.username}</span>
              <button
                onClick={handleLogout}
                className="cursor-pointer px-4 py-2 text-sm rounded-lg bg-slate-600/50 hover:bg-slate-500/50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setAuthMode('signin'); setScreen('auth'); }}
                className="cursor-pointer px-4 py-2 text-sm rounded-lg bg-slate-600/50 hover:bg-slate-500/50 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('signup'); setScreen('auth'); }}
                className="cursor-pointer px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 transition-all"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="pt-20 min-h-screen flex items-center justify-center p-4">
        {screen === 'menu' && (
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                SUDOKU
              </h1>
              <p className="text-slate-400">Classic & Killer Sudoku</p>
            </div>

            <div className="space-y-3">
              {user && activeGame ? (
                <button
                  onClick={continueGame}
                  className="cursor-pointer w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg shadow-emerald-500/25"
                >
                  Continue Game
                  <span className="block text-sm font-normal opacity-80">
                    {activeGame.gameType === 'killer' ? 'Killer' : 'Classic'} • {activeGame.difficulty} • {formatTime(activeGame.timeSeconds)} played
                  </span>
                </button>
              ) : (
                <button
                  disabled={!user}
                  className="w-full py-4 rounded-xl text-lg font-semibold bg-slate-600/30 text-slate-500 cursor-not-allowed"
                >
                  Continue Game
                  <span className="block text-sm font-normal">
                    {user ? 'No active game' : 'Sign in to continue games'}
                  </span>
                </button>
              )}

              <button
                onClick={() => setScreen('newgame')}
                className="cursor-pointer w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 transition-all shadow-lg shadow-violet-500/25"
              >
                New Game
              </button>
            </div>

            <button
              onClick={() => setScreen('leaderboard')}
              className="cursor-pointer w-full py-3 rounded-xl text-sm font-medium bg-slate-700/50 border border-slate-600/50 hover:bg-slate-600/50 transition-colors"
            >
              View Leaderboard
            </button>

            {!user && (
              <p className="text-center text-slate-500 text-sm">
                Sign in to save your progress and appear on leaderboards
              </p>
            )}
          </div>
        )}

        {screen === 'newgame' && (
          <div className="w-full max-w-lg space-y-6">
            <button
              onClick={() => setScreen('menu')}
              className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors text-sm flex items-center gap-2"
            >
              ← Back to Menu
            </button>

            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">New Game</h2>
            </div>

            <div className="space-y-4 bg-slate-700/50 rounded-2xl p-6 border border-slate-600/50">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 uppercase tracking-wider">Game Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['sudoku', 'killer'] as GameMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setMenuMode(mode)}
                      className={`cursor-pointer py-3 px-4 rounded-xl text-sm font-medium transition-all ${menuMode === mode
                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-violet-500/25'
                        : 'bg-slate-600/50 text-slate-300 hover:bg-slate-500/50'
                        }`}
                    >
                      {mode === 'sudoku' ? 'Classic' : 'Killer'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 uppercase tracking-wider">Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map(diff => (
                    <button
                      key={diff}
                      onClick={() => setMenuDifficulty(diff)}
                      className={`cursor-pointer py-3 px-4 rounded-xl text-sm font-medium capitalize transition-all ${menuDifficulty === diff
                        ? 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white shadow-lg shadow-violet-500/25'
                        : 'bg-slate-600/50 text-slate-300 hover:bg-slate-500/50'
                        }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 uppercase tracking-wider">Options</label>
                <button
                  onClick={() => setMenuMistakesEnabled(!menuMistakesEnabled)}
                  className={`cursor-pointer w-full py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${menuMistakesEnabled
                    ? 'bg-rose-500/30 border border-rose-500/50 text-rose-200'
                    : 'bg-slate-600/50 text-slate-300 hover:bg-slate-500/50'
                    }`}
                >
                  <span>Track Mistakes</span>
                  <span className={`w-10 h-6 rounded-full transition-colors relative ${menuMistakesEnabled ? 'bg-rose-500' : 'bg-slate-500'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${menuMistakesEnabled ? 'left-5' : 'left-1'}`} />
                  </span>
                </button>
              </div>

              <button
                onClick={startNewGame}
                className="cursor-pointer w-full py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 transition-all shadow-lg shadow-violet-500/25"
              >
                Start Game
              </button>

              {user && activeGame && (
                <p className="text-center text-amber-400/80 text-sm">
                  Starting a new game will replace your current active game
                </p>
              )}
            </div>
          </div>
        )}

        {screen === 'auth' && (
          <div className="w-full max-w-sm space-y-6">
            <button
              onClick={() => setScreen('menu')}
              className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors text-sm flex items-center gap-2"
            >
              ← Back to Menu
            </button>

            <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600/50 space-y-6">
              <h2 className="text-2xl font-bold text-center">
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Username</label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={e => setAuthUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-600/50 border border-slate-500/50 focus:border-violet-500 focus:outline-none transition-colors"
                    required
                    autoComplete=''
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-600/50 border border-slate-500/50 focus:border-violet-500 focus:outline-none transition-colors"
                    autoComplete=''
                    required
                  />
                </div>

                {authError && (
                  <p className="text-rose-400 text-sm">{authError}</p>
                )}

                <button
                  type="submit"
                  className="cursor-pointer w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 transition-all"
                >
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-slate-400 text-sm">
                {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="cursor-pointer text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        )}

        {screen === 'statistics' && (
          <div className="w-full max-w-2xl space-y-6">
            <button
              onClick={() => setScreen('menu')}
              className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors text-sm flex items-center gap-2"
            >
              ← Back to Menu
            </button>

            <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600/50 space-y-6">
              <h2 className="text-2xl font-bold text-center">Your Statistics</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-600/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-cyan-400">{statistics.length}</div>
                  <div className="text-sm text-slate-400">Games Played</div>
                </div>
                <div className="bg-slate-600/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {statistics.filter(s => s.gameType === 'sudoku').length}
                  </div>
                  <div className="text-sm text-slate-400">Classic</div>
                </div>
                <div className="bg-slate-600/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-violet-400">
                    {statistics.filter(s => s.gameType === 'killer').length}
                  </div>
                  <div className="text-sm text-slate-400">Killer</div>
                </div>
                <div className="bg-slate-600/30 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-amber-400">
                    {statistics.length > 0 ? formatTime(Math.min(...statistics.map(s => s.timeSeconds))) : '--:--'}
                  </div>
                  <div className="text-sm text-slate-400">Best Time</div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h3 className="text-lg font-semibold text-slate-300">Recent Games</h3>
                {statistics.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No completed games yet</p>
                ) : (
                  statistics.slice(0, 20).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-600/30"
                    >
                      <span className={`px-2 py-1 rounded text-xs font-medium ${entry.gameType === 'killer' ? 'bg-violet-500/30 text-violet-300' : 'bg-cyan-500/30 text-cyan-300'
                        }`}>
                        {entry.gameType === 'killer' ? 'Killer' : 'Classic'}
                      </span>
                      <span className="capitalize text-slate-300">{entry.difficulty}</span>
                      {entry.mistakesEnabled && (
                        <span className="px-2 py-1 rounded text-xs bg-rose-500/30 text-rose-300">Mistakes</span>
                      )}
                      <span className="flex-1" />
                      <span className="text-slate-400 font-mono">{formatTime(entry.timeSeconds)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {screen === 'leaderboard' && (
          <div className="w-full max-w-2xl space-y-6">
            <button
              onClick={() => setScreen('menu')}
              className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors text-sm flex items-center gap-2"
            >
              ← Back to Menu
            </button>

            <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600/50 space-y-6">
              <h2 className="text-2xl font-bold text-center">Leaderboard</h2>

              <div className="flex gap-2 flex-wrap justify-center">
                <select
                  value={leaderboardFilter.mode}
                  onChange={e => setLeaderboardFilter(prev => ({ ...prev, mode: e.target.value as GameMode }))}
                  className="px-4 py-2 rounded-lg bg-slate-600/50 border border-slate-500/50 focus:outline-none"
                >
                  <option value="sudoku">Classic</option>
                  <option value="killer">Killer</option>
                </select>

                <select
                  value={leaderboardFilter.difficulty}
                  onChange={e => setLeaderboardFilter(prev => ({ ...prev, difficulty: e.target.value as Difficulty }))}
                  className="px-4 py-2 rounded-lg bg-slate-600/50 border border-slate-500/50 focus:outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>

                <select
                  value={leaderboardFilter.mistakesEnabled ? 'with' : 'without'}
                  onChange={e => setLeaderboardFilter(prev => ({ ...prev, mistakesEnabled: e.target.value === 'with' }))}
                  className="px-4 py-2 rounded-lg bg-slate-600/50 border border-slate-500/50 focus:outline-none"
                >
                  <option value="without">No Mistakes Mode</option>
                  <option value="with">With Mistakes Mode</option>
                </select>
              </div>

              <div className="space-y-2">
                {leaderboardData.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No scores yet</p>
                ) : (
                  leaderboardData.map((entry) => (
                    <div
                      key={`${entry.rank}-${entry.username}`}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-600/30"
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${entry.rank === 1 ? 'bg-amber-500 text-amber-900' :
                        entry.rank === 2 ? 'bg-slate-300 text-slate-700' :
                          entry.rank === 3 ? 'bg-amber-700 text-amber-100' :
                            'bg-slate-600 text-slate-300'
                        }`}>
                        {entry.rank}
                      </span>
                      <span className="flex-1 font-medium">{entry.username}</span>
                      <span className="text-slate-400">{formatTime(entry.timeSeconds)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {screen === 'game' && gameState && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Time:</span>
                <span className="font-mono text-lg">{formatTime(gameState.elapsed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Mode:</span>
                <span className="capitalize">{gameState.mode === 'sudoku' ? 'Classic' : 'Killer'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Difficulty:</span>
                <span className="capitalize">{gameState.difficulty}</span>
              </div>
              {gameState.mistakesEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Mistakes:</span>
                  <span className={gameState.mistakes.size > 0 ? 'text-rose-400' : ''}>{gameState.mistakes.size}</span>
                </div>
              )}
            </div>

            {gameState.isComplete && (
              <div className="bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 rounded-xl text-lg font-semibold animate-pulse">
                🎉 Congratulations! Puzzle Complete!
              </div>
            )}

            <div className="bg-slate-600/50 p-3 rounded-2xl shadow-2xl shadow-black/30">
              <div
                className="grid bg-slate-800 gap-0 rounded-lg overflow-hidden"
                style={{
                  gridTemplateColumns: 'repeat(9, 1fr)',
                  border: '3px solid rgb(30 41 59)'
                }}
              >
                {gameState.board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSelected = gameState.selectedCell?.[0] === rowIndex && gameState.selectedCell?.[1] === colIndex;
                    const isSameRow = gameState.selectedCell?.[0] === rowIndex;
                    const isSameCol = gameState.selectedCell?.[1] === colIndex;
                    const isSameBox = gameState.selectedCell &&
                      Math.floor(gameState.selectedCell[0] / 3) === Math.floor(rowIndex / 3) &&
                      Math.floor(gameState.selectedCell[1] / 3) === Math.floor(colIndex / 3);
                    const isSameValue = selectedValue && selectedValue !== 0 && cell === selectedValue;
                    const isInitial = gameState.initial[rowIndex][colIndex];
                    const isMistake = gameState.mistakesEnabled && gameState.mistakes.has(`${rowIndex}-${colIndex}`);
                    const isConflict = hasConflict(gameState.board, rowIndex, colIndex);
                    const notes = gameState.notes[rowIndex][colIndex];

                    const cage = gameState.killerCages ? getCellCage(gameState.killerCages, rowIndex, colIndex) : undefined;
                    const cageIndex = gameState.killerCages ? getCellCageIndex(gameState.killerCages, rowIndex, colIndex) : -1;
                    const showSum = cage && isCageTopLeft(cage, rowIndex, colIndex);
                    const cageBorders = cage ? getCageBorders(cage, rowIndex, colIndex) : undefined;

                    const isBoxRight = colIndex % 3 === 2 && colIndex !== 8;
                    const isBoxBottom = rowIndex % 3 === 2 && rowIndex !== 8;

                    let bgColor: string;
                    if (cage) {
                      if (isSelected) {
                        bgColor = CAGE_COLORS_SELECTED[cageIndex % CAGE_COLORS_SELECTED.length];
                      } else if (isSameValue) {
                        bgColor = 'bg-green-300';
                      } else if (isSameRow || isSameCol || isSameBox) {
                        bgColor = CAGE_COLORS_HIGHLIGHT[cageIndex % CAGE_COLORS_HIGHLIGHT.length];
                      } else {
                        bgColor = CAGE_COLORS_NORMAL[cageIndex % CAGE_COLORS_NORMAL.length];
                      }
                    } else {
                      if (isSelected) {
                        bgColor = 'bg-sky-400';
                      } else if (isSameValue) {
                        bgColor = 'bg-green-300';
                      } else if (isSameRow || isSameCol || isSameBox) {
                        bgColor = 'bg-slate-300';
                      } else {
                        bgColor = 'bg-slate-100';
                      }
                    }

                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        style={{
                          borderRight: isBoxRight ? '3px solid rgb(30 41 59)' : '1px solid rgb(148 163 184)',
                          borderBottom: isBoxBottom ? '3px solid rgb(30 41 59)' : '1px solid rgb(148 163 184)',
                        }}
                        className={`
                          w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center text-xl font-semibold cursor-pointer relative
                          transition-colors duration-100
                          ${bgColor}
                        `}
                      >
                        {cageBorders && (
                          <div className="absolute inset-0 pointer-events-none">
                            {cageBorders.top && <div className="absolute top-0 left-0 right-0 h-0 border-t-2 border-dashed border-slate-600" />}
                            {cageBorders.right && <div className="absolute top-0 right-0 bottom-0 w-0 border-r-2 border-dashed border-slate-600" />}
                            {cageBorders.bottom && <div className="absolute bottom-0 left-0 right-0 h-0 border-b-2 border-dashed border-slate-600" />}
                            {cageBorders.left && <div className="absolute top-0 left-0 bottom-0 w-0 border-l-2 border-dashed border-slate-600" />}
                          </div>
                        )}

                        {showSum && cage && (
                          <span className="absolute top-0 left-0.5 text-[9px] font-bold text-slate-800 leading-none pt-0.5">
                            {cage.sum}
                          </span>
                        )}

                        {cell !== 0 ? (
                          <span className={`
                              ${isInitial ? 'text-slate-900 font-bold' : 'text-blue-600'}
                              ${isConflict && !isInitial ? 'text-rose-600' : ''}
                              ${isMistake ? 'text-rose-600' : ''}
                              ${isSelected ? 'text-white' : ''}
                            `}>
                            {cell}
                          </span>
                        ) : notes.length > 0 ? (
                          <div className={`grid grid-cols-3 gap-0 text-[8px] w-full h-full p-0.5 ${isSelected ? 'text-white/80' : 'text-slate-600'}`}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                              <span key={n} className="flex items-center justify-center">
                                {notes.includes(n) ? n : ''}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
                  const isCompleted = numberCounts.get(num) === 9;
                  if (isCompleted) {
                    return (
                      <div
                        key={num}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-700/30 border border-slate-600/30"
                      />
                    );
                  }
                  return (
                    <button
                      key={num}
                      onClick={() => handleNumberInput(num)}
                      disabled={!gameState.selectedCell || gameState.initial[gameState.selectedCell[0]][gameState.selectedCell[1]]}
                      className="cursor-pointer w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-xl font-bold bg-slate-600/50 hover:bg-slate-500/50 active:bg-slate-400/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-500/50"
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={toggleNoteMode}
                  disabled={!gameState.selectedCell}
                  className={`cursor-pointer px-5 py-3 rounded-xl text-sm font-medium transition-colors border disabled:opacity-40 disabled:cursor-not-allowed ${gameState.isNoteMode
                    ? 'bg-violet-500/70 border-violet-400 text-white'
                    : 'bg-slate-600/50 hover:bg-slate-500/50 border-slate-500/50'
                    }`}
                >
                  Note
                </button>
                <button
                  onClick={handleClear}
                  disabled={!gameState.selectedCell || (gameState.selectedCell && gameState.initial[gameState.selectedCell[0]][gameState.selectedCell[1]])}
                  className="cursor-pointer px-5 py-3 rounded-xl text-sm font-medium bg-slate-600/50 hover:bg-slate-500/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-500/50"
                >
                  Clear
                </button>
              </div>
            </div>

            <button
              onClick={handleBackToMenu}
              className="cursor-pointer text-slate-400 hover:text-slate-300 transition-colors text-sm"
            >
              ← Back to Menu
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
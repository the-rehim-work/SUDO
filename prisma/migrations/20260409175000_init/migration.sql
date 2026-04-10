BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [username] NVARCHAR(50) NOT NULL,
    [passwordHash] NVARCHAR(255) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_username_key] UNIQUE NONCLUSTERED ([username])
);

-- CreateTable
CREATE TABLE [dbo].[Game] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [gameType] NVARCHAR(10) NOT NULL,
    [difficulty] NVARCHAR(10) NOT NULL,
    [puzzle] NVARCHAR(max) NOT NULL,
    [solution] NVARCHAR(max) NOT NULL,
    [currentState] NVARCHAR(max) NOT NULL,
    [notes] NVARCHAR(max) NOT NULL,
    [cages] NVARCHAR(max),
    [timeSeconds] INT NOT NULL CONSTRAINT [Game_timeSeconds_df] DEFAULT 0,
    [mistakesEnabled] BIT NOT NULL CONSTRAINT [Game_mistakesEnabled_df] DEFAULT 0,
    [isCompleted] BIT NOT NULL CONSTRAINT [Game_isCompleted_df] DEFAULT 0,
    [startedAt] DATETIME2 NOT NULL CONSTRAINT [Game_startedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [completedAt] DATETIME2,
    CONSTRAINT [Game_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Score] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [username] NVARCHAR(50) NOT NULL,
    [gameType] NVARCHAR(10) NOT NULL,
    [difficulty] NVARCHAR(10) NOT NULL,
    [timeSeconds] INT NOT NULL,
    [mistakesEnabled] BIT NOT NULL CONSTRAINT [Score_mistakesEnabled_df] DEFAULT 0,
    [completedAt] DATETIME2 NOT NULL CONSTRAINT [Score_completedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Score_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_username_idx] ON [dbo].[User]([username]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Game_userId_isCompleted_idx] ON [dbo].[Game]([userId], [isCompleted]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Game_userId_startedAt_idx] ON [dbo].[Game]([userId], [startedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Score_gameType_difficulty_mistakesEnabled_timeSeconds_idx] ON [dbo].[Score]([gameType], [difficulty], [mistakesEnabled], [timeSeconds]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Score_userId_gameType_difficulty_idx] ON [dbo].[Score]([userId], [gameType], [difficulty]);

-- AddForeignKey
ALTER TABLE [dbo].[Game] ADD CONSTRAINT [Game_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Score] ADD CONSTRAINT [Score_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

-- Create database
CREATE DATABASE IF NOT EXISTS agnes_x_games;
USE agnes_x_games;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    total_score INT DEFAULT 0,
    games_played INT DEFAULT 0
);

-- Game progress table
CREATE TABLE game_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    high_score INT DEFAULT 0,
    times_played INT DEFAULT 0,
    last_played TIMESTAMP NULL,
    progress_data TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY user_game (user_id, game_id)
);

-- Daily games schedule
CREATE TABLE daily_games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_date DATE UNIQUE NOT NULL,
    game_ids VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial game schedule
INSERT INTO daily_games (game_date, game_ids) VALUES 
(CURDATE(), '1,2,3,4,5,6,7'),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '8,9,10,11,12,13,14');

-- Games master list
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    difficulty VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert game data
INSERT INTO games (id, name, description, category, difficulty) VALUES
(1, 'Memory Matrix', 'Remember and replicate patterns', 'Memory', 'Easy'),
(2, 'Speed Typing', 'Type words as fast as you can', 'Speed', 'Medium'),
(3, 'Math Blitz', 'Solve math problems quickly', 'Math', 'Easy'),
(4, 'Color Match', 'Match colors with their names', 'Perception', 'Easy'),
(5, 'Pattern Puzzle', 'Complete the pattern', 'Logic', 'Medium'),
(6, 'Reaction Time', 'Click when you see the signal', 'Reaction', 'Easy'),
(7, 'Word Search', 'Find words in a grid', 'Language', 'Medium'),
(8, 'Sudoku Lite', 'Complete the Sudoku puzzle', 'Logic', 'Hard'),
(9, 'Aim Trainer', 'Click moving targets', 'Reaction', 'Medium'),
(10, 'Number Memory', 'Remember number sequences', 'Memory', 'Hard'),
(11, 'Vocabulary Builder', 'Match words with meanings', 'Language', 'Medium'),
(12, 'Sequence Master', 'Remember color sequences', 'Memory', 'Hard'),
(13, 'Quick Calculate', 'Rapid math calculations', 'Math', 'Hard'),
(14, 'Shape Match', 'Match similar shapes', 'Perception', 'Medium');
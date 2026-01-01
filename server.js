const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'agnes-x-games-secret-2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agnes_x_games',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const token = req.session.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'agnes-jwt-secret-2026');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// Routes

// Get today's games
app.get('/api/today-games', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT game_ids FROM daily_games WHERE game_date = CURDATE()'
        );
        
        if (rows.length > 0) {
            const gameIds = rows[0].game_ids.split(',').map(id => parseInt(id));
            
            const [games] = await pool.execute(
                'SELECT * FROM games WHERE id IN (?) ORDER BY FIELD(id, ?)',
                [gameIds, gameIds]
            );
            
            res.json(games);
        } else {
            // Fallback to default games
            const [games] = await pool.execute(
                'SELECT * FROM games WHERE id BETWEEN 1 AND 7'
            );
            res.json(games);
        }
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        
        // Check if user exists
        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const [result] = await pool.execute(
            'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
            [email, hashedPassword, username || email.split('@')[0]]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertId, email },
            process.env.JWT_SECRET || 'agnes-jwt-secret-2026',
            { expiresIn: '24h' }
        );
        
        req.session.token = token;
        
        res.json({
            success: true,
            message: 'Registration successful',
            user: {
                id: result.insertId,
                email,
                username: username || email.split('@')[0]
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'agnes-jwt-secret-2026',
            { expiresIn: '24h' }
        );
        
        // Update last login
        await pool.execute(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );
        
        req.session.token = token;
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                total_score: user.total_score,
                games_played: user.games_played
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, email, username, total_score, games_played, created_at FROM users WHERE id = ?',
            [req.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get game progress
        const [progress] = await pool.execute(
            'SELECT g.name, gp.high_score, gp.times_played FROM game_progress gp JOIN games g ON gp.game_id = g.id WHERE gp.user_id = ? ORDER BY gp.last_played DESC',
            [req.userId]
        );
        
        res.json({
            user: users[0],
            game_progress: progress
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save game score
app.post('/api/save-score', authenticateToken, async (req, res) => {
    try {
        const { gameId, score } = req.body;
        
        // Check if progress exists
        const [existing] = await pool.execute(
            'SELECT * FROM game_progress WHERE user_id = ? AND game_id = ?',
            [req.userId, gameId]
        );
        
        let highScore = score;
        
        if (existing.length > 0) {
            // Update if new score is higher
            highScore = Math.max(existing[0].high_score, score);
            
            await pool.execute(
                `UPDATE game_progress 
                 SET high_score = ?, times_played = times_played + 1, last_played = NOW() 
                 WHERE user_id = ? AND game_id = ?`,
                [highScore, req.userId, gameId]
            );
        } else {
            // Create new progress
            await pool.execute(
                `INSERT INTO game_progress (user_id, game_id, high_score, times_played, last_played) 
                 VALUES (?, ?, ?, 1, NOW())`,
                [req.userId, gameId, score]
            );
        }
        
        // Update total score and games played
        await pool.execute(
            `UPDATE users 
             SET total_score = total_score + ?, 
                 games_played = games_played + 1 
             WHERE id = ?`,
            [score, req.userId]
        );
        
        res.json({
            success: true,
            message: 'Score saved successfully',
            highScore: highScore
        });
    } catch (error) {
        console.error('Save score error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get game high scores
app.get('/api/game-leaderboard/:gameId', async (req, res) => {
    try {
        const { gameId } = req.params;
        
        const [scores] = await pool.execute(
            `SELECT u.username, gp.high_score, gp.last_played 
             FROM game_progress gp 
             JOIN users u ON gp.user_id = u.id 
             WHERE gp.game_id = ? 
             ORDER BY gp.high_score DESC 
             LIMIT 10`,
            [gameId]
        );
        
        res.json(scores);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Game routes
app.get('/game/:id', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `games/game${req.params.id}.html`));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Agnes X Games Platform - Created by Olayinka ©️ 2026`);
});
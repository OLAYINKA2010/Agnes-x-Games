// DOM Elements
const gamesGrid = document.getElementById('gamesGrid');
const activityList = document.getElementById('activityList');
const usernameElement = document.getElementById('username');
const welcomeNameElement = document.getElementById('welcomeName');
const totalScoreElement = document.getElementById('totalScore');
const currentDateElement = document.getElementById('currentDate');

// Current date
function updateDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Load user data
async function loadUserData() {
    try {
        const response = await fetch('/api/profile', {
            credentials: 'include'
        });
        
        if (response.status === 401) {
            // Not authenticated, redirect to login
            window.location.href = '/login';
            return;
        }
        
        const data = await response.json();
        
        // Update user info
        if (data.user) {
            usernameElement.textContent = data.user.username;
            welcomeNameElement.textContent = data.user.username;
            totalScoreElement.textContent = data.user.total_score;
            
            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Load activity
        loadActivity(data.game_progress);
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load today's games
async function loadTodaysGames() {
    try {
        const response = await fetch('/api/today-games', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load games');
        }
        
        const games = await response.json();
        displayGames(games);
    } catch (error) {
        console.error('Error loading games:', error);
        // Fallback to default games
        displayGames([
            { id: 1, name: 'Memory Matrix', description: 'Remember patterns', category: 'Memory' },
            { id: 2, name: 'Speed Typing', description: 'Type quickly', category: 'Speed' },
            { id: 3, name: 'Math Blitz', description: 'Solve math problems', category: 'Math' },
            { id: 4, name: 'Color Match', description: 'Match colors correctly', category: 'Perception' },
            { id: 5, name: 'Pattern Puzzle', description: 'Complete patterns', category: 'Logic' },
            { id: 6, name: 'Reaction Time', description: 'Test your reflexes', category: 'Reaction' },
            { id: 7, name: 'Word Search', description: 'Find hidden words', category: 'Language' }
        ]);
    }
}

// Display games in grid
function displayGames(games) {
    gamesGrid.innerHTML = '';
    
    games.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.dataset.gameId = game.id;
        
        const iconClass = getGameIconClass(game.category);
        
        gameCard.innerHTML = `
            <div class="game-card-icon ${iconClass}">
                <i class="${getGameIcon(game.category)}"></i>
            </div>
            <div class="game-card-content">
                <h3>${game.name}</h3>
                <p>${game.description}</p>
                <div class="game-card-meta">
                    <span class="game-category">${game.category}</span>
                    <span class="game-difficulty ${game.difficulty?.toLowerCase() || 'medium'}">
                        ${game.difficulty || 'Medium'}
                    </span>
                </div>
            </div>
            <button class="game-play-btn" onclick="playGame(${game.id})">
                <i class="fas fa-play"></i> Play
            </button>
        `;
        
        gamesGrid.appendChild(gameCard);
    });
}

// Get game icon based on category
function getGameIcon(category) {
    const icons = {
        'Memory': 'fas fa-brain',
        'Speed': 'fas fa-bolt',
        'Math': 'fas fa-calculator',
        'Perception': 'fas fa-eye',
        'Logic': 'fas fa-puzzle-piece',
        'Reaction': 'fas fa-running',
        'Language': 'fas fa-language'
    };
    
    return icons[category] || 'fas fa-gamepad';
}

function getGameIconClass(category) {
    const classes = {
        'Memory': 'memory',
        'Speed': 'speed',
        'Math': 'math',
        'Perception': 'perception',
        'Logic': 'logic',
        'Reaction': 'reaction',
        'Language': 'language'
    };
    
    return classes[category] || 'default';
}

// Load activity
function loadActivity(progress) {
    if (!progress || progress.length === 0) {
        activityList.innerHTML = `
            <div class="empty-activity">
                <i class="fas fa-gamepad"></i>
                <p>No games played yet. Start playing!</p>
            </div>
        `;
        return;
    }
    
    activityList.innerHTML = '';
    
    progress.forEach(item => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${getGameIcon(item.category || 'Game')}"></i>
            </div>
            <div class="activity-details">
                <h4>${item.name}</h4>
                <p>High Score: ${item.high_score}</p>
                <span class="activity-time">Played ${item.times_played} times</span>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Play game
function playGame(gameId) {
    window.location.href = `/game/${gameId}`;
}

// Logout
async function logout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        localStorage.removeItem('user');
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Initialize dashboard
async function initDashboard() {
    updateDate();
    await loadUserData();
    await loadTodaysGames();
    
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = '/login';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
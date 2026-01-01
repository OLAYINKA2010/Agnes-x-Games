class MemoryMatrixGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.timeLeft = 30;
        this.timer = null;
        this.gameActive = false;
        this.pattern = [];
        this.playerPattern = [];
        this.showingPattern = false;
        this.cells = [];
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.setupEventListeners();
        this.updateStats();
    }
    
    createBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        this.cells = [];
        
        const cellCount = 20; // 4x5 grid on mobile, 5x4 on desktop
        
        for (let i = 0; i < cellCount; i++) {
            const cell = document.createElement('div');
            cell.className = 'memory-cell hidden';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.handleCellClick(i));
            board.appendChild(cell);
            this.cells.push(cell);
        }
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('retryBtn').addEventListener('click', () => this.startGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
        document.getElementById('saveScoreBtn').addEventListener('click', () => this.saveScore());
    }
    
    startGame() {
        this.score = 0;
        this.level = 1;
        this.timeLeft = 30;
        this.gameActive = true;
        this.pattern = [];
        this.playerPattern = [];
        
        document.getElementById('gameResult').style.display = 'none';
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('retryBtn').style.display = 'inline-block';
        
        this.resetBoard();
        this.generatePattern();
        this.showPattern();
        this.startTimer();
    }
    
    generatePattern() {
        this.pattern = [];
        const patternLength = 2 + this.level; // Increase pattern length with level
        
        for (let i = 0; i < patternLength; i++) {
            let randomCell;
            do {
                randomCell = Math.floor(Math.random() * this.cells.length);
            } while (this.pattern.includes(randomCell));
            
            this.pattern.push(randomCell);
        }
    }
    
    showPattern() {
        this.showingPattern = true;
        this.disableCells();
        
        let delay = 0;
        this.pattern.forEach((cellIndex, i) => {
            setTimeout(() => {
                this.cells[cellIndex].classList.remove('hidden');
                this.cells[cellIndex].classList.add('active');
                
                setTimeout(() => {
                    this.cells[cellIndex].classList.remove('active');
                    this.cells[cellIndex].classList.add('hidden');
                    
                    if (i === this.pattern.length - 1) {
                        setTimeout(() => {
                            this.showingPattern = false;
                            this.enableCells();
                        }, 500);
                    }
                }, 800);
            }, delay);
            
            delay += 1200;
        });
    }
    
    handleCellClick(index) {
        if (!this.gameActive || this.showingPattern) return;
        
        this.playerPattern.push(index);
        this.cells[index].classList.remove('hidden');
        this.cells[index].classList.add('active');
        
        setTimeout(() => {
            this.cells[index].classList.remove('active');
            
            if (this.playerPattern.length === this.pattern.length) {
                this.checkPattern();
            } else {
                // Check if current sequence is correct so far
                const currentIndex = this.playerPattern.length - 1;
                if (this.playerPattern[currentIndex] !== this.pattern[currentIndex]) {
                    this.gameOver();
                }
            }
        }, 300);
    }
    
    checkPattern() {
        const isCorrect = this.pattern.every((cell, index) => 
            this.playerPattern[index] === cell
        );
        
        if (isCorrect) {
            this.levelComplete();
        } else {
            this.gameOver();
        }
    }
    
    levelComplete() {
        this.score += 100 * this.level;
        this.level++;
        this.timeLeft += 5; // Add extra time for next level
        this.playerPattern = [];
        
        // Update progress
        const progress = Math.min((this.level - 1) / 10 * 100, 100);
        document.getElementById('levelProgress').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${this.level - 1}/10`;
        
        this.updateStats();
        this.generatePattern();
        setTimeout(() => this.showPattern(), 1000);
    }
    
    gameOver() {
        this.gameActive = false;
        clearInterval(this.timer);
        
        // Show wrong cells
        this.pattern.forEach(index => {
            this.cells[index].classList.remove('hidden');
            this.cells[index].classList.add('correct');
        });
        
        this.playerPattern.forEach((index, i) => {
            if (this.pattern[i] !== index) {
                this.cells[index].classList.add('wrong');
            }
        });
        
        setTimeout(() => {
            this.showResult();
        }, 2000);
    }
    
    showResult() {
        const finalScore = this.score;
        document.getElementById('finalScore').textContent = finalScore;
        
        let message = '';
        if (finalScore >= 1000) {
            message = 'Excellent memory! You\'re a memory master!';
        } else if (finalScore >= 500) {
            message = 'Great job! Your memory skills are impressive.';
        } else {
            message = 'Good effort! Keep practicing to improve.';
        }
        
        document.getElementById('resultMessage').textContent = message;
        document.getElementById('gameResult').style.display = 'block';
    }
    
    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateStats();
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('time').textContent = `${this.timeLeft}s`;
    }
    
    resetBoard() {
        this.cells.forEach(cell => {
            cell.classList.remove('active', 'correct', 'wrong');
            cell.classList.add('hidden');
        });
    }
    
    disableCells() {
        this.cells.forEach(cell => {
            cell.style.pointerEvents = 'none';
        });
    }
    
    enableCells() {
        this.cells.forEach(cell => {
            cell.style.pointerEvents = 'auto';
        });
    }
    
    async saveScore() {
        try {
            const response = await fetch('/api/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: 1,
                    score: this.score
                }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Score saved successfully!');
                window.location.href = '/dashboard';
            } else {
                alert('Failed to save score: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving score:', error);
            alert('Network error. Please try again.');
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryMatrixGame();
});
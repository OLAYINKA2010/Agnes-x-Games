class SpeedTypingGame {
    constructor() {
        this.words = [
            'algorithm', 'binary', 'cache', 'database', 'encryption',
            'function', 'gateway', 'host', 'interface', 'javascript',
            'kernel', 'loop', 'matrix', 'network', 'object',
            'protocol', 'query', 'runtime', 'syntax', 'variable',
            'array', 'boolean', 'class', 'debug', 'exception',
            'float', 'global', 'import', 'json', 'keyword',
            'lambda', 'method', 'null', 'operator', 'pointer',
            'queue', 'recursion', 'string', 'tuple', 'unicode',
            'virtual', 'wrapper', 'xml', 'yield', 'zoom'
        ];
        
        this.currentWord = '';
        this.wordIndex = 0;
        this.score = 0;
        this.wpm = 0;
        this.accuracy = 100;
        this.timeLeft = 60;
        this.gameActive = false;
        this.timer = null;
        this.startTime = null;
        this.typedWords = 0;
        this.correctWords = 0;
        this.totalTyped = 0;
        this.totalCorrect = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadWordList();
        this.updateStats();
    }
    
    setupEventListeners() {
        const typingInput = document.getElementById('typingInput');
        typingInput.addEventListener('input', (e) => this.handleInput(e));
        typingInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.checkWord();
            }
        });
        
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('saveScoreBtn').addEventListener('click', () => this.saveScore());
    }
    
    loadWordList() {
        const wordsList = document.getElementById('wordsList');
        wordsList.innerHTML = '';
        
        // Show next 5 words
        const nextWords = this.getNextWords(5);
        nextWords.forEach((word, index) => {
            const wordPill = document.createElement('div');
            wordPill.className = 'word-pill';
            if (index === 0) wordPill.classList.add('current');
            wordPill.textContent = word;
            wordPill.dataset.word = word;
            wordsList.appendChild(wordPill);
        });
    }
    
    getNextWords(count) {
        const nextWords = [];
        for (let i = 0; i < count; i++) {
            const word = this.words[Math.floor(Math.random() * this.words.length)];
            nextWords.push(word);
        }
        return nextWords;
    }
    
    startGame() {
        this.gameActive = true;
        this.startTime = Date.now();
        this.timeLeft = 60;
        this.score = 0;
        this.wpm = 0;
        this.accuracy = 100;
        this.wordIndex = 0;
        this.typedWords = 0;
        this.correctWords = 0;
        this.totalTyped = 0;
        this.totalCorrect = 0;
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-block';
        document.getElementById('gameResult').style.display = 'none';
        
        this.loadWordList();
        this.setNextWord();
        this.startTimer();
        this.updateStats();
        
        const typingInput = document.getElementById('typingInput');
        typingInput.value = '';
        typingInput.disabled = false;
        typingInput.focus();
    }
    
    pauseGame() {
        this.gameActive = !this.gameActive;
        const pauseBtn = document.getElementById('pauseBtn');
        const typingInput = document.getElementById('typingInput');
        
        if (this.gameActive) {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            typingInput.disabled = false;
            typingInput.focus();
            this.startTimer();
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            typingInput.disabled = true;
            clearInterval(this.timer);
        }
    }
    
    restartGame() {
        clearInterval(this.timer);
        this.startGame();
    }
    
    setNextWord() {
        const words = document.querySelectorAll('.word-pill');
        if (words.length > 0) {
            this.currentWord = words[0].dataset.word;
            document.getElementById('currentWord').textContent = this.currentWord;
            
            // Update word pills
            words.forEach((pill, index) => {
                pill.classList.remove('current', 'completed');
                if (index === 0) {
                    pill.classList.add('current');
                } else if (index < this.wordIndex) {
                    pill.classList.add('completed');
                }
            });
            
            // If we need more words, add them
            if (this.wordIndex >= words.length - 2) {
                this.addMoreWords();
            }
        }
    }
    
    addMoreWords() {
        const wordsList = document.getElementById('wordsList');
        const newWords = this.getNextWords(3);
        
        newWords.forEach(word => {
            const wordPill = document.createElement('div');
            wordPill.className = 'word-pill';
            wordPill.textContent = word;
            wordPill.dataset.word = word;
            wordsList.appendChild(wordPill);
        });
    }
    
    handleInput(event) {
        if (!this.gameActive) return;
        
        const input = event.target.value;
        const feedback = document.getElementById('inputFeedback');
        
        if (this.currentWord.startsWith(input)) {
            feedback.textContent = '';
            feedback.className = 'input-feedback';
        } else {
            feedback.textContent = 'Incorrect!';
            feedback.className = 'input-feedback feedback-wrong';
        }
    }
    
    checkWord() {
        if (!this.gameActive) return;
        
        const typingInput = document.getElementById('typingInput');
        const input = typingInput.value.trim();
        const feedback = document.getElementById('inputFeedback');
        
        this.totalTyped++;
        
        if (input === this.currentWord) {
            // Correct word
            this.correctWords++;
            this.totalCorrect++;
            this.typedWords++;
            this.wordIndex++;
            
            feedback.textContent = 'Correct!';
            feedback.className = 'input-feedback feedback-correct';
            
            // Calculate score based on word length and speed
            const wordScore = this.currentWord.length * 10;
            this.score += wordScore;
            
            // Update WPM
            const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // in minutes
            this.wpm = Math.round(this.typedWords / timeElapsed);
            
            // Move to next word
            this.setNextWord();
        } else {
            // Incorrect word
            feedback.textContent = `Incorrect! The word was: ${this.currentWord}`;
            feedback.className = 'input-feedback feedback-wrong';
            this.wordIndex++;
            this.setNextWord();
        }
        
        // Update accuracy
        this.accuracy = Math.round((this.totalCorrect / this.totalTyped) * 100);
        
        typingInput.value = '';
        this.updateStats();
    }
    
    startTimer() {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (this.gameActive) {
                this.timeLeft--;
                this.updateStats();
                
                if (this.timeLeft <= 0) {
                    this.gameOver();
                }
            }
        }, 1000);
    }
    
    updateStats() {
        document.getElementById('wpm').textContent = this.wpm;
        document.getElementById('accuracy').textContent = `${this.accuracy}%`;
        document.getElementById('timeLeft').textContent = this.timeLeft;
        document.getElementById('score').textContent = this.score;
    }
    
    gameOver() {
        this.gameActive = false;
        clearInterval(this.timer);
        
        const finalScore = this.calculateFinalScore();
        
        // Show results
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('finalWPM').textContent = this.wpm;
        document.getElementById('finalAccuracy').textContent = `${this.accuracy}%`;
        document.getElementById('wordsTyped').textContent = this.typedWords;
        document.getElementById('resultScore').textContent = finalScore;
        document.getElementById('accuracyValue').textContent = `${this.accuracy}%`;
        
        // Update accuracy circle
        const accuracyCircle = document.querySelector('.accuracy-circle');
        const percentage = Math.min(this.accuracy, 100);
        accuracyCircle.style.background = `conic-gradient(var(--success-color) 0% ${percentage}%, #e1e5e9 ${percentage}% 100%)`;
        
        document.getElementById('gameResult').style.display = 'block';
        document.getElementById('startBtn').style.display = 'inline-block';
        document.getElementById('pauseBtn').style.display = 'none';
        
        const typingInput = document.getElementById('typingInput');
        typingInput.disabled = true;
        typingInput.value = '';
    }
    
    calculateFinalScore() {
        // Base score + bonus for WPM and accuracy
        const wpmBonus = this.wpm * 10;
        const accuracyBonus = this.accuracy * 5;
        return this.score + wpmBonus + accuracyBonus;
    }
    
    async saveScore() {
        const finalScore = this.calculateFinalScore();
        
        try {
            const response = await fetch('/api/save-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId: 2,
                    score: finalScore
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
    new SpeedTypingGame();
});
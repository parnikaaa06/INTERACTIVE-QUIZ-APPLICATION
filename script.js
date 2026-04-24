// Quiz Application JavaScript

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');

const userNameInput = document.getElementById('user-name');
const startQuizBtn = document.getElementById('start-quiz-btn');
const leaderboardBtn = document.getElementById('leaderboard-btn');
const themeToggle = document.getElementById('theme-toggle');
const restartBtn = document.getElementById('restart-btn');
const backToWelcomeBtn = document.getElementById('back-to-welcome-btn');
const backFromLeaderboardBtn = document.getElementById('back-from-leaderboard-btn');

const questionNumber = document.getElementById('question-number');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const feedback = document.getElementById('feedback');
const progressBar = document.getElementById('progress-bar');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const difficultyDisplay = document.getElementById('difficulty');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const timerProgressBar = document.getElementById('timer-progress-bar');

const finalScore = document.getElementById('final-score');
const accuracy = document.getElementById('accuracy');
const timeTaken = document.getElementById('time-taken');
const bestStreak = document.getElementById('best-streak');
const badgesContainer = document.getElementById('badges');
const leaderboardList = document.getElementById('leaderboard-list');

const soundToggle = document.getElementById('sound-toggle');
const confettiCanvas = document.getElementById('confetti-canvas');

// Quiz State Variables
let currentUser = '';
let currentQuestionIndex = 0;
let score = 0;
let timer = 30;
let timerInterval = null;
let questions = [];
let userAnswers = [];
let startTime = 0;
let currentStreak = 0;
let bestStreakValue = 0;
let soundEnabled = true;
let feedbackTimeout = null;

const TIMER_MAX = 30;
const AUTO_NEXT_DELAY = 1400;

const quizQuestions = [
    { question: 'What is the capital of France?', options: ['Paris', 'London', 'Berlin', 'Madrid'], correct: 0, difficulty: 'easy', category: 'Geography' },
    { question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1, difficulty: 'easy', category: 'Science' },
    { question: 'What is 2 + 2 × 3?', options: ['8', '12', '10', '6'], correct: 0, difficulty: 'medium', category: 'Math' },
    { question: 'Who painted the Mona Lisa?', options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'], correct: 2, difficulty: 'medium', category: 'Art' },
    { question: 'What is the largest ocean on Earth?', options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'], correct: 3, difficulty: 'easy', category: 'Geography' },
    { question: 'Which programming language is known for its use in web development and has a coffee-related name?', options: ['Python', 'JavaScript', 'Java', 'C++'], correct: 1, difficulty: 'easy', category: 'Technology' },
    { question: 'What is the chemical symbol for gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 2, difficulty: 'medium', category: 'Science' },
    { question: 'In which year did World War II end?', options: ['1944', '1945', '1946', '1947'], correct: 1, difficulty: 'medium', category: 'History' },
    { question: 'What is the square root of 144?', options: ['10', '12', '14', '16'], correct: 1, difficulty: 'easy', category: 'Math' },
    { question: 'Which company developed the iPhone?', options: ['Samsung', 'Google', 'Apple', 'Microsoft'], correct: 2, difficulty: 'easy', category: 'Technology' },
    { question: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], correct: 2, difficulty: 'medium', category: 'Science' },
    { question: "Who wrote 'Romeo and Juliet'?", options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'], correct: 1, difficulty: 'medium', category: 'Literature' },
    { question: 'What is the currency of Japan?', options: ['Won', 'Yen', 'Ringgit', 'Baht'], correct: 1, difficulty: 'easy', category: 'Geography' },
    { question: 'Which gas do plants absorb from the atmosphere during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 2, difficulty: 'medium', category: 'Science' },
    { question: 'What is the largest mammal in the world?', options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'], correct: 1, difficulty: 'easy', category: 'Science' }
];

function playSound(frequency, duration, type = 'sine') {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playCorrectSound() {
    playSound(800, 0.18);
    setTimeout(() => playSound(980, 0.18), 100);
}

function playIncorrectSound() {
    playSound(220, 0.25);
    setTimeout(() => playSound(160, 0.2), 120);
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const icon = themeToggle.querySelector('i');
    const isDark = document.body.classList.contains('dark');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        themeToggle.querySelector('i').className = 'fas fa-sun';
    }
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach((item) => item.classList.remove('active'));
    screen.classList.add('active');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initializeQuiz() {
    questions = shuffleArray([...quizQuestions]).slice(0, 10);
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = Array(questions.length).fill(null);
    currentStreak = 0;
    bestStreakValue = 0;
    startTime = Date.now();
    updateUI();
    showQuestion();
    startTimer();
}

function updateUI() {
    scoreDisplay.textContent = `Score: ${score}`;
    progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    questionNumber.textContent = `Question ${currentQuestionIndex + 1}/${questions.length}`;
}

function showQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.textContent = question.question;
    difficultyDisplay.textContent = question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1);
    difficultyDisplay.className = `difficulty ${question.difficulty}`;
    optionsContainer.innerHTML = '';

    question.options.forEach((optionText, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = optionText;
        button.dataset.index = index;
        button.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(button);
    });

    feedback.textContent = '';
    feedback.className = 'feedback';
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = userAnswers[currentQuestionIndex] === null;
    updateUI();
}

function selectAnswer(selectedIndex) {
    const question = questions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correct;
    userAnswers[currentQuestionIndex] = selectedIndex;

    if (isCorrect) {
        score += 1;
        currentStreak += 1;
        bestStreakValue = Math.max(bestStreakValue, currentStreak);
        feedback.textContent = 'Correct! 🎉';
        feedback.className = 'feedback correct';
        playCorrectSound();
    } else {
        currentStreak = 0;
        feedback.textContent = `Incorrect. The correct answer is: ${question.options[question.correct]}`;
        feedback.className = 'feedback incorrect';
        playIncorrectSound();
    }

    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    optionButtons.forEach((button, index) => {
        button.disabled = true;
        if (index === question.correct) {
            button.classList.add('correct');
        } else if (index === selectedIndex && !isCorrect) {
            button.classList.add('incorrect');
        }
    });

    nextBtn.disabled = false;
    updateUI();
    scheduleNextQuestion();
}

function startTimer() {
    stopTimer();
    timer = TIMER_MAX;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timer -= 1;
        updateTimerDisplay();
        if (timer <= 0) {
            timeUp();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    timerDisplay.textContent = timer;
    if (timerProgressBar) {
        timerProgressBar.style.width = `${Math.max((timer / TIMER_MAX) * 100, 0)}%`;
    }

    const lowTime = timer <= 5;
    timerDisplay.classList.toggle('low-time', lowTime);
    if (timerProgressBar) {
        timerProgressBar.classList.toggle('low-time', lowTime);
    }
}

function timeUp() {
    stopTimer();
    const question = questions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = -1;
    currentStreak = 0;

    feedback.textContent = `Time's up! The correct answer is: ${question.options[question.correct]}`;
    feedback.className = 'feedback incorrect';
    const optionButtons = optionsContainer.querySelectorAll('.option-btn');
    optionButtons.forEach((button, index) => {
        button.disabled = true;
        if (index === question.correct) {
            button.classList.add('correct');
        }
    });

    nextBtn.disabled = false;
    scheduleNextQuestion();
    playIncorrectSound();
}

function scheduleNextQuestion() {
    clearTimeout(feedbackTimeout);
    feedbackTimeout = setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            nextQuestion();
        } else {
            showResults();
        }
    }, AUTO_NEXT_DELAY);
}

function nextQuestion() {
    clearTimeout(feedbackTimeout);
    feedbackTimeout = null;
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex += 1;
        showQuestion();
        startTimer();
    } else {
        showResults();
    }
}

function prevQuestion() {
    if (currentQuestionIndex === 0) return;
    clearTimeout(feedbackTimeout);
    feedbackTimeout = null;
    currentQuestionIndex -= 1;
    showQuestion();
    startTimer();
}

function showResults() {
    stopTimer();
    clearTimeout(feedbackTimeout);
    feedbackTimeout = null;

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const accuracyValue = Math.round((score / questions.length) * 100);

    finalScore.textContent = `${score}/${questions.length}`;
    accuracy.textContent = `${accuracyValue}%`;
    timeTaken.textContent = `${totalTime}s`;
    bestStreak.textContent = bestStreakValue;

    badgesContainer.innerHTML = '';
    if (score === questions.length) addBadge('Perfect Score! 🏆');
    if (accuracyValue >= 80) addBadge('Quiz Master 🧠');
    if (bestStreakValue >= 5) addBadge('Streak Master 🔥');
    if (totalTime < 150) addBadge('Speed Demon ⚡');

    saveToLeaderboard(currentUser, score, accuracyValue, totalTime);
    showConfetti();
    showScreen(resultScreen);
}

function addBadge(text) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = text;
    badgesContainer.appendChild(badge);
}

function saveToLeaderboard(name, scoreValue, accuracyValue, time) {
    const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
    leaderboard.push({ name: name || 'Anonymous', score: scoreValue, accuracy: accuracyValue, time, date: new Date().toISOString() });
    leaderboard.sort((a, b) => (b.score - a.score) || (b.accuracy - a.accuracy) || (a.time - b.time));
    localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard.slice(0, 10)));
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
    leaderboardList.innerHTML = '';
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p>No scores yet. Be the first!</p>';
        return;
    }
    leaderboard.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `<span class="rank">#${index + 1}</span><span class="name">${entry.name}</span><span class="score">${entry.score}/10 (${entry.accuracy}%)</span>`;
        leaderboardList.appendChild(item);
    });
}

function showConfetti() {
    const canvas = confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    for (let i = 0; i < 120; i++) {
        particles.push({ x: Math.random() * canvas.width, y: -20 - Math.random() * canvas.height, vx: Math.random() * 6 - 3, vy: Math.random() * 4 + 4, size: Math.random() * 4 + 2, color: `hsl(${Math.random() * 360}, 90%, 65%)` });
    }
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.08;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            if (particle.y > canvas.height + 20) particles.splice(index, 1);
        });
        if (particles.length > 0) requestAnimationFrame(animate);
    }
    animate();
}

startQuizBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) {
        alert('Please enter your name to start the quiz.');
        return;
    }
    currentUser = name;
    initializeQuiz();
    showScreen(quizScreen);
});

leaderboardBtn.addEventListener('click', () => {
    displayLeaderboard();
    showScreen(leaderboardScreen);
});

themeToggle.addEventListener('click', toggleTheme);

restartBtn.addEventListener('click', () => {
    initializeQuiz();
    showScreen(quizScreen);
});

backToWelcomeBtn.addEventListener('click', () => showScreen(welcomeScreen));
backFromLeaderboardBtn.addEventListener('click', () => showScreen(welcomeScreen));
nextBtn.addEventListener('click', nextQuestion);
prevBtn.addEventListener('click', prevQuestion);

soundToggle.addEventListener('change', () => {
    soundEnabled = soundToggle.checked;
    localStorage.setItem('soundEnabled', soundEnabled);
});

window.addEventListener('load', () => {
    loadTheme();
    soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    soundToggle.checked = soundEnabled;
});

document.addEventListener('keydown', (event) => {
    if (!quizScreen.classList.contains('active')) return;
    if (event.key === 'ArrowRight' && !nextBtn.disabled) nextQuestion();
    if (event.key === 'ArrowLeft' && !prevBtn.disabled) prevQuestion();
});
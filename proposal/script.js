// State management
let noClickCount = 0;
let hasMovedButton = false;

// DOM elements
const questionCard = document.getElementById('questionCard');
const celebrationCard = document.getElementById('celebrationCard');
const questionText = document.getElementById('questionText');
const subtitleText = document.getElementById('subtitleText');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const buttonContainer = document.getElementById('buttonContainer');

// Messages for each "No" click - Bengali version for Ramy
const noMessages = [
    {
        question: "রেমি, তুমি কি নিশ্চিত? 🥺",
        subtitle: "একবার ভেবে দেখো তো, আমরা একসাথে কত সুন্দর সময় কাটাবো..."
    },
    {
        question: "সত্যি না বললে রেমি? 😢",
        subtitle: "আমি তো কতদিন ধরে তোমার অপেক্ষায় আছি!"
    },
    {
        question: "প্লিজ রেমি, আরেকবার ভাবো! 🙏",
        subtitle: "আমি প্রতিদিন তোমার প্রিয় খাবার বানাবো, প্রমিস করছি..."
    },
    {
        question: "রেমি, এভাবে বলো না... 💔",
        subtitle: "তোমার সব রাগ-অভিমান আমি সহ্য করবো, শুধু হ্যাঁ বলো..."
    },
    {
        question: "তুমি আমার হৃদয় ভেঙে দিচ্ছো! 😭",
        subtitle: "তোমার সাথে না থাকলে আমার জীবন অসম্পূর্ণ থেকে যাবে..."
    },
    {
        question: "আরেকটা সুযোগ দাও রেমি! 🌹",
        subtitle: "আমরা একসাথে কত স্বপ্ন দেখবো, কত জায়গায় ঘুরবো..."
    },
    {
        question: "আমি হার মানবো না! 💪",
        subtitle: "তোমার সব পছন্দ-অপছন্দ আমি মেনে নেবো, শুধু আমার হয়ে যাও..."
    },
    {
        question: "রেমি প্লিজ, আমার কথা শোনো! 🥰",
        subtitle: "তুমি ছাড়া আমার জীবন মানে হয় না..."
    },
    {
        question: "এটাই আমার শেষ অফার! 💍",
        subtitle: "মজা করছি! আমি সারাজীবন তোমাকে জিজ্ঞেস করতে থাকবো!"
    },
    {
        question: "তুমি জানো তুমি হ্যাঁ বলতে চাও! 😏",
        subtitle: "তোমার চোখেই তো সব দেখতে পাচ্ছি আমি..."
    },
    {
        question: "রেমি, তুমি আমার সবকিছু! 💖",
        subtitle: "প্লিজ রেমি, আমাকে তোমার জীবনের অংশ হতে দাও..."
    },
    {
        question: "শুধু একটা হ্যাঁ বলো রেমি! 🌟",
        subtitle: "আমি তোমাকে সারাজীবন হাসিখুশি রাখবো, এই প্রতিজ্ঞা করছি..."
    }
];

// Yes button click handler
yesBtn.addEventListener('click', () => {
    // Add celebration animation
    questionCard.style.animation = 'fadeInScale 0.5s reverse';

    setTimeout(() => {
        questionCard.style.display = 'none';
        celebrationCard.classList.add('show');
        createConfetti();
    }, 500);
});

// No button click handler - with better mobile support
function handleNoClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Shake the card for  dramatic effect
    questionCard.classList.add('shake');
    setTimeout(() => questionCard.classList.remove('shake'), 500);

    // Make Yes button bigger each time
    const currentSize = parseFloat(getComputedStyle(yesBtn).fontSize);
    yesBtn.style.fontSize = `${currentSize + 2}px`;
    yesBtn.classList.add('pulse');
    setTimeout(() => yesBtn.classList.remove('pulse'), 500);

    // Update the question text first
    if (noClickCount < noMessages.length) {
        questionText.textContent = noMessages[noClickCount].question;
        subtitleText.textContent = noMessages[noClickCount].subtitle;
        noClickCount++;
    } else {
        // After all messages, make it extra dramatic
        questionText.textContent = "রেমি, আমি কখনো হাল ছাড়বো না! 💕";
        subtitleText.textContent = "তুমি এখনই হ্যাঁ বলে দাও না রেমি, প্লিজ... 😊";
    }

    // Then move the button (with delay so it's harder to tap again)
    setTimeout(() => {
        if (window.innerWidth <= 768) {
            moveButtonRandomlyMobile();
        } else {
            makeNoButtonSmaller();
        }
    }, 100);
}

noBtn.addEventListener('click', handleNoClick);
noBtn.addEventListener('touchend', handleNoClick);

// Make No button smaller with each click (desktop)
function makeNoButtonSmaller() {
    const currentSize = parseFloat(getComputedStyle(noBtn).fontSize);
    if (currentSize > 10) {
        noBtn.style.fontSize = `${currentSize - 2}px`;
        const currentPadding = parseFloat(getComputedStyle(noBtn).padding);
        noBtn.style.padding = `${currentPadding - 1}px ${currentPadding * 2 - 2}px`;
    }
}

// Improved mobile button movement
function moveButtonRandomlyMobile() {
    const card = questionCard.getBoundingClientRect();
    const cardPadding = 25; // Card padding from CSS

    // Get available space within the card
    const availableWidth = card.width - (cardPadding * 2);
    const availableHeight = card.height - (cardPadding * 2) - 100; // Reserve space at bottom

    // Button dimensions (approximate)
    const buttonWidth = 120;
    const buttonHeight = 50;

    // Calculate max positions
    const maxX = Math.max(0, availableWidth - buttonWidth);
    const maxY = Math.max(0, availableHeight - buttonHeight - 100);

    // Generate safe random position
    let randomX = Math.random() * maxX;
    let randomY = Math.random() * maxY;

    // Ensure button doesn't overlap with Yes button area (center-left)
    if (!hasMovedButton) {
        // First time: move to a safe spot (right side or bottom)
        randomX = Math.random() > 0.5 ? maxX * 0.7 : maxX * 0.1;
        randomY = Math.random() * (maxY * 0.5) + (maxY * 0.3);
        hasMovedButton = true;
    }

    // Apply positioning
    buttonContainer.style.position = 'relative';
    buttonContainer.style.minHeight = '200px'; // Ensure enough space

    noBtn.style.position = 'absolute';
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
    noBtn.style.transition = 'all 0.3s ease';
}

// Make No button run away from cursor (desktop only)
let hasMouseListener = false;
function makeNoButtonRunAway() {
    if (!hasMouseListener && window.innerWidth > 768) {
        hasMouseListener = true;
        noBtn.addEventListener('mouseover', () => {
            const card = questionCard.getBoundingClientRect();
            const maxX = card.width - 150;
            const maxY = 200;

            const randomX = Math.random() * maxX;
            const randomY = Math.random() * maxY;

            buttonContainer.style.position = 'relative';
            noBtn.style.position = 'absolute';
            noBtn.style.transition = 'all 0.3s ease';
            noBtn.style.left = `${randomX}px`;
            noBtn.style.top = `${randomY}px`;
        });
    }
}

// Create confetti effect
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.animation = `confettiFall ${2 + Math.random() * 3}s linear`;
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.pointerEvents = 'none';

        celebrationCard.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Add keyboard support for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !celebrationCard.classList.contains('show')) {
        yesBtn.click();
    }
});

// If user gets to message 5+, start making button run away
if (noClickCount >= 5) {
    setTimeout(makeNoButtonRunAway, 1000);
}

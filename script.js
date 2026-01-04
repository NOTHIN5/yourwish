// ==========================================
// MINECRAFT THEME - INTERACTIVE FEATURES
// ==========================================

// ===== SMOOTH SCROLL TO PROJECTS =====
function scrollToProjects() {
    const projectsSection = document.getElementById('projects');
    projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Play click sound effect (simulated with visual feedback)
    createClickEffect(event);
}

// ===== SHOW/HIDE INFO BOX =====
function showInfo() {
    const infoBox = document.getElementById('infoBox');
    infoBox.classList.add('active');
    createClickEffect(event);
}

function hideInfo() {
    const infoBox = document.getElementById('infoBox');
    infoBox.classList.remove('active');
    createClickEffect(event);
}

// ===== CLICK EFFECT (Minecraft Click Feedback) =====
function createClickEffect(e) {
    if (!e) return;

    const click = document.createElement('div');
    click.style.position = 'fixed';
    click.style.left = e.clientX + 'px';
    click.style.top = e.clientY + 'px';
    click.style.width = '20px';
    click.style.height = '20px';
    click.style.background = '#ffeb3b';
    click.style.borderRadius = '0';
    click.style.pointerEvents = 'none';
    click.style.zIndex = '9999';
    click.style.animation = 'clickPop 0.5s ease-out';

    document.body.appendChild(click);

    setTimeout(() => click.remove(), 500);
}

// Add keyframe animation for click effect
const style = document.createElement('style');
style.textContent = `
    @keyframes clickPop {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ===== CREATE FLOATING PARTICLES (Grass, Dirt blocks) =====
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 20;
    const colors = ['#7cbd4e', '#8b5a3c', '#525252', '#4dd0e1'];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.width = particle.style.height = (Math.random() * 8 + 4) + 'px';

        particlesContainer.appendChild(particle);
    }
}

// ===== INVENTORY SLOT HOVER SOUND (Visual feedback) =====
document.addEventListener('DOMContentLoaded', () => {
    const inventorySlots = document.querySelectorAll('.inventory-slot');

    inventorySlots.forEach(slot => {
        // Skip coming soon slots from having click effect
        if (!slot.classList.contains('coming-soon')) {
            slot.addEventListener('click', function (e) {
                createClickEffect(e);
            });
        }

        // Hover effect
        slot.addEventListener('mouseenter', function () {
            if (!this.classList.contains('coming-soon')) {
                this.style.animation = 'bounceSlot 0.3s ease-out';
                setTimeout(() => {
                    this.style.animation = '';
                }, 300);
            }
        });
    });
});

// Add bounce animation for slots
const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
    @keyframes bounceSlot {
        0%, 100% { transform: translateY(-10px) scale(1.05); }
        50% { transform: translateY(-15px) scale(1.08); }
    }
`;
document.head.appendChild(bounceStyle);

// ===== STATS COUNTER ANIMATION =====
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');

    stats.forEach(stat => {
        const text = stat.textContent;
        // Only animate if it's a number
        if (!isNaN(parseInt(text))) {
            const target = parseInt(text);
            let current = 0;
            const increment = target / 50;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 30);
        }
    });
}

// ===== PARALLAX EFFECT ON SCROLL =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const clouds = document.querySelectorAll('.cloud');

    clouds.forEach((cloud, index) => {
        const speed = (index + 1) * 0.05;
        cloud.style.transform = `translateX(${scrolled * speed}px)`;
    });
});

// ===== KEYBOARD NAVIGATION (Minecraft style) =====
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'Escape':
            hideInfo();
            break;
        case 'Enter':
            const infoBox = document.getElementById('infoBox');
            if (infoBox.classList.contains('active')) {
                hideInfo();
            }
            break;
    }
});

// ===== MINECRAFT DAY/NIGHT CYCLE (Optional Feature) =====
let isDaytime = true;

function toggleDayNight() {
    const sky = document.querySelector('.minecraft-sky');
    isDaytime = !isDaytime;

    if (isDaytime) {
        sky.style.background = 'linear-gradient(180deg, #78a7ff 0%, #a8d5ff 50%, #d4e9ff 100%)';
    } else {
        sky.style.background = 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 50%, #2d2d5f 100%)';
    }
}

// Change to night every 30 seconds (you can adjust or remove this)
// setInterval(toggleDayNight, 30000);

// ===== RANDOM BLOCK PLACER (Easter Egg) =====
let blockCount = 0;

document.addEventListener('click', (e) => {
    // 5% chance to spawn a random block on click
    if (Math.random() < 0.05) {
        const block = document.createElement('div');
        block.style.position = 'fixed';
        block.style.left = e.clientX - 8 + 'px';
        block.style.top = e.clientY - 8 + 'px';
        block.style.width = '16px';
        block.style.height = '16px';
        block.style.background = ['#7cbd4e', '#8b5a3c', '#525252'][Math.floor(Math.random() * 3)];
        block.style.border = '1px solid #000';
        block.style.pointerEvents = 'none';
        block.style.zIndex = '1';
        block.style.animation = 'blockFade 2s ease-out forwards';

        document.body.appendChild(block);

        setTimeout(() => block.remove(), 2000);

        blockCount++;
    }
});

// Add block fade animation
const blockStyle = document.createElement('style');
blockStyle.textContent = `
    @keyframes blockFade {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0) rotate(180deg); }
    }
`;
document.head.appendChild(blockStyle);

// ===== BUTTON RIPPLE EFFECT =====
document.querySelectorAll('.mc-button').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to { transform: scale(2); opacity: 0; }
    }
`;
document.head.appendChild(rippleStyle);

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.inventory-slot, .stat-block').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
});

// Add fade in animation
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(fadeStyle);

// ===== INITIALIZE ON LOAD =====
window.addEventListener('load', () => {
    // Create floating particles
    createParticles();

    // Animate stats after a delay
    setTimeout(animateStats, 1000);

    // Add title animation
    const title = document.querySelector('.title-text');
    if (title) {
        title.style.animation = 'fadeInDown 1s ease-out';
    }
});

// Add fade in down animation
const fadeDownStyle = document.createElement('style');
fadeDownStyle.textContent = `
    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(fadeDownStyle);

// ===== CONSOLE EASTER EGG =====
console.log('%c🎮 Welcome to HyperForge! 🎮', 'color: #7cbd4e; font-size: 24px; font-weight: bold; font-family: monospace;');
console.log('%c⚒️ Built with Minecraft vibes and pixel-perfect love!', 'color: #ffeb3b; font-size: 14px; font-family: monospace;');
console.log('%c💎 Found a bug? Let me know! 💎', 'color: #4dd0e1; font-size: 12px; font-family: monospace;');
console.log('%cType "secretCommand()" for a surprise!', 'color: #ff6b00; font-size: 10px; font-family: monospace;');

// Secret command function
window.secretCommand = function () {
    alert('🎉 Achievement Unlocked: Developer Console Explorer! 🎉\n\nYou found the secret command! Keep exploring! ⛏️');
    console.log('%c🏆 Achievement Unlocked! 🏆', 'color: #ffeb3b; font-size: 20px; font-family: monospace; background: #000; padding: 10px;');
};

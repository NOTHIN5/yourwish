// ==========================================
// ANIME LANDING PAGE - INTERACTIVE FEATURES
// ==========================================

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active nav link based on scroll position
    let current = '';
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ===== MOBILE MENU TOGGLE =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== ANIMATED PARTICLES IN BACKGROUND =====
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';

        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.pointerEvents = 'none';

        particlesContainer.appendChild(particle);

        // Animate particle
        animateParticle(particle);
    }
}

function animateParticle(particle) {
    const duration = Math.random() * 10000 + 5000;
    const delay = Math.random() * 2000;

    anime({
        targets: particle,
        translateX: () => anime.random(-100, 100),
        translateY: () => anime.random(-100, 100),
        scale: [1, Math.random() * 1.5 + 0.5, 1],
        opacity: [
            { value: Math.random() * 0.5 + 0.2, duration: duration / 2 },
            { value: Math.random() * 0.3 + 0.1, duration: duration / 2 }
        ],
        duration: duration,
        delay: delay,
        easing: 'easeInOutSine',
        loop: true
    });
}

// ===== PARALLAX SCROLLING EFFECT =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxLayers = document.querySelectorAll('.parallax-layer');

    parallaxLayers.forEach((layer, index) => {
        const speed = (index + 1) * 0.1;
        layer.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// ===== COUNTER ANIMATION FOR STATS =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));

        anime({
            targets: counter,
            innerHTML: [0, target],
            duration: 2000,
            delay: 500,
            easing: 'easeOutExpo',
            round: 1,
            update: function (anim) {
                counter.innerHTML = Math.floor(anim.animations[0].currentValue).toLocaleString();
            }
        });
    });
}

// ===== INTERSECTION OBSERVER FOR SCROLL ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;

            // Fade in animation
            anime({
                targets: target,
                opacity: [0, 1],
                translateY: [50, 0],
                duration: 1000,
                easing: 'easeOutCubic'
            });

            animateOnScroll.unobserve(target);
        }
    });
}, observerOptions);

// Observe elements
document.addEventListener('DOMContentLoaded', () => {
    // Cards
    document.querySelectorAll('.about-card, .feature-card, .gallery-item').forEach(card => {
        card.style.opacity = '0';
        animateOnScroll.observe(card);
    });

    // Section headers
    document.querySelectorAll('.section-header').forEach(header => {
        header.style.opacity = '0';
        animateOnScroll.observe(header);
    });

    // Create particles
    createParticles();

    // Animate counters when hero is visible
    const heroSection = document.querySelector('.hero');
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    heroObserver.observe(heroSection);
});

// ===== TILT EFFECT FOR FEATURE CARDS =====
document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
});

// ===== SMOOTH SCROLL TO SECTIONS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));

        if (target) {
            const offsetTop = target.offsetTop - 80;

            anime({
                targets: 'html, body',
                scrollTop: offsetTop,
                duration: 1000,
                easing: 'easeInOutCubic'
            });
        }
    });
});

// ===== BUTTON RIPPLE EFFECT =====
document.querySelectorAll('button, .btn').forEach(button => {
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
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.pointerEvents = 'none';
        ripple.style.transform = 'scale(0)';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        anime({
            targets: ripple,
            scale: [0, 2],
            opacity: [1, 0],
            duration: 600,
            easing: 'easeOutExpo',
            complete: () => ripple.remove()
        });
    });
});

// ===== GALLERY ITEM CLICK ANIMATION =====
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function () {
        const overlay = this.querySelector('.gallery-overlay');

        anime({
            targets: overlay,
            scale: [0.95, 1],
            duration: 300,
            easing: 'easeOutBack'
        });
    });
});

// ===== HERO FLOATING CARDS ANIMATION =====
anime({
    targets: '.floating-card',
    translateY: [
        { value: -20, duration: 2000 },
        { value: 0, duration: 2000 }
    ],
    loop: true,
    easing: 'easeInOutSine',
    delay: anime.stagger(500)
});

// ===== GRADIENT ANIMATION ON HOVER =====
document.querySelectorAll('.btn-primary, .cta-button').forEach(btn => {
    btn.addEventListener('mouseenter', function () {
        anime({
            targets: this,
            scale: 1.05,
            duration: 300,
            easing: 'easeOutBack'
        });
    });

    btn.addEventListener('mouseleave', function () {
        anime({
            targets: this,
            scale: 1,
            duration: 300,
            easing: 'easeOutBack'
        });
    });
});

// ===== CURSOR TRAIL EFFECT (OPTIONAL - PREMIUM TOUCH) =====
let cursorTrail = [];
const trailLength = 20;

document.addEventListener('mousemove', (e) => {
    // Only on desktop
    if (window.innerWidth > 768) {
        cursorTrail.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        });

        if (cursorTrail.length > trailLength) {
            cursorTrail.shift();
        }
    }
});

// ===== LOADING ANIMATION =====
window.addEventListener('load', () => {
    // Animate hero content on load
    anime.timeline()
        .add({
            targets: '.hero-badge',
            opacity: [0, 1],
            translateY: [-30, 0],
            duration: 800,
            easing: 'easeOutCubic'
        })
        .add({
            targets: '.hero-title .title-line',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            delay: anime.stagger(100),
            easing: 'easeOutCubic'
        }, '-=400')
        .add({
            targets: '.hero-description',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            easing: 'easeOutCubic'
        }, '-=400')
        .add({
            targets: '.hero-buttons',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            easing: 'easeOutCubic'
        }, '-=400')
        .add({
            targets: '.hero-stats',
            opacity: [0, 1],
            translateY: [30, 0],
            duration: 800,
            easing: 'easeOutCubic'
        }, '-=400');
});

// ===== DYNAMIC BACKGROUND COLOR ON SCROLL =====
const sections = document.querySelectorAll('section');
const body = document.body;

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - 300) {
            current = section.getAttribute('id');
        }
    });

    // You could change background colors based on section here
    // For now, we'll keep it consistent
});

// ===== PERFORMANCE OPTIMIZATION =====
// Throttle scroll events for better performance
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to heavy scroll handlers
const throttledScroll = throttle(() => {
    // Any heavy scroll calculations
}, 100);

window.addEventListener('scroll', throttledScroll);

// ===== CONSOLE MESSAGE FOR DEVELOPERS =====
console.log('%c🎌 AnimeVerse Landing Page', 'color: #667eea; font-size: 24px; font-weight: bold;');
console.log('%cBuilt with ❤️ for anime fans worldwide', 'color: #f5576c; font-size: 14px;');
console.log('%cPowered by Anime.js, HTML5, CSS3 & JavaScript', 'color: #4facfe; font-size: 12px;');

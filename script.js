// ==========================================
// HYPERDEV - INTERACTIVE SCRIPT
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // ===== 3D TILT EFFECT =====
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', handleTilt);
        card.addEventListener('mouseleave', resetTilt);
    });

    function handleTilt(e) {
        const card = this;
        const cardRect = card.getBoundingClientRect();

        // Calculate mouse position relative to card center
        const x = e.clientX - cardRect.left;
        const y = e.clientY - cardRect.top;

        const centerX = cardRect.width / 2;
        const centerY = cardRect.height / 2;

        // Calculate rotation values (limit to +/- 5 degrees for subtler effect)
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        // Apply transformation
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    }

    function resetTilt() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }


    // ===== SMOOTH SCROLLING =====
    // Note: CSS scroll-behavior: smooth handles most cases, but this adds offset for fixed nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = document.querySelector('.glass-nav').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });


    // ===== NAVBAR SCROLL EFFECT =====
    const nav = document.querySelector('.glass-nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });


    // ===== SCROLL REVEAL ANIMATIONS =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate
    const animateElements = [
        '.section-title',
        '.section-desc',
        '.service-card',
        '.project-card',
        '.stat-item',
        '.contact-content'
    ];

    animateElements.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

            // Stagger effect based on index if it's a grid item/card
            // We reset index for different groups if we could, but global index is ok for now 
            // or we can select per group. let's keep it simple.
            if (el.classList.contains('service-card') || el.classList.contains('project-card') || el.classList.contains('stat-item')) {
                // Simple modulo to create stagger within rows
                el.style.transitionDelay = `${(index % 3) * 100}ms`;
            }

            observer.observe(el);
            el.classList.add('reveal-el');
        });
    });

    // Style injection for reveal class
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal-el.visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        /* Fix interaction between reveal and tilt hover */
        .reveal-el.visible:hover {
            transform: translateY(-5px) !important;
        }
        
        /* Specific fix for tilt cards to allow rotation after reveal */
        .tilt-card.reveal-el.visible:hover {
             /* The JS tilt effect sets inline styles which override this, 
                so we don't need !important on transform here, 
                but we need to reset the transition to allow fast tilt response */
             transition: transform 0.1s ease-out !important;
        }
    `;
    document.head.appendChild(style);


    // ===== CONSOLE WELCOME =====
    console.log(
        "%c HyperDev %c Ready to Build ",
        "background: #6366f1; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;",
        "color: #94a3b8; font-family: sans-serif;"
    );
});

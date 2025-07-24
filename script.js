document.addEventListener('mousemove', (e) => {
    const eye = document.getElementById('cursor-eye');
    const pupil = document.getElementById('pupil');

    eye.style.left = e.clientX + 'px';
    eye.style.top = e.clientY + 'px';

    const rect = pupil.getBoundingClientRect();
    const eyeX = rect.left + rect.width / 2;
    const eyeY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);

    const distance = Math.min(eye.offsetWidth / 4, Math.hypot(e.clientX - eyeX, e.clientY - eyeY));
    const pupilX = Math.cos(angle) * distance;
    const pupilY = Math.sin(angle) * distance;

    pupil.style.transform = `translate(-50%, -50%) translate(${pupilX}px, ${pupilY}px)`;
});

const ctaButton = document.getElementById('cta-button');

ctaButton.addEventListener('mouseenter', () => {
    ctaButton.style.transform = 'scale(1.1)';
});

ctaButton.addEventListener('mouseleave', () => {
    ctaButton.style.transform = 'scale(1)';
});

const creatureCards = document.querySelectorAll('.creature-card');

creatureCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.setProperty('--rotation', '5deg');
        card.style.animation = 'wobble 0.5s ease-in-out';
    });
    card.addEventListener('animationend', () => {
        card.style.animation = '';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        squareSize: 54,
        fillColor: '#442CBF',
        bgColor: '#000000',
        animationDelay: 500,
        fillDuration: 1500,
        fadeDuration: 2500,
        logoMoveDuration: 1000,
        targetLogoPosition: { x: 40, y: 53 },
        sizeLogo: { width: 200, height: 50 }
    };

    const width = window.innerWidth;
    if (width <= 820) {
        CONFIG.squareSize = 20;
    }

    const preloadContainer = document.querySelector('.preload-container');
    const canvas = document.querySelector('.preload-canvas');
    const ctx = canvas.getContext('2d');
    const logo = preloadContainer.querySelector('img');
    const progressText = document.querySelector('#js-cursor-progress span');
    let grid = [];
    let animationFrame;
    let startTime;
    let initialLogoPosition = { x: 0, y: 0 };
    let isPriorityVideoLoaded = false;
    let isGifLoaded = false;

    function initGrid() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const cols = Math.ceil(canvas.width / CONFIG.squareSize) + 1;
        const rows = Math.ceil(canvas.height / CONFIG.squareSize) + 1;

        grid = [];
        for (let y = -1; y < rows; y++) {
            for (let x = -1; x < cols; x++) {
                grid.push({
                    x: x * CONFIG.squareSize,
                    y: y * CONFIG.squareSize,
                    width: CONFIG.squareSize,
                    height: CONFIG.squareSize,
                    state: 'black',
                    alpha: 1
                });
            }
        }
        draw();
        shuffleGrid();
    }

    function shuffleGrid() {
        for (let i = grid.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [grid[i], grid[j]] = [grid[j], grid[i]];
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        grid.forEach(square => {
            if (square.state === 'black') {
                ctx.fillStyle = CONFIG.bgColor;
                ctx.globalAlpha = square.alpha;
                ctx.fillRect(square.x, square.y, square.width, square.height);
            } else if (square.state === 'color') {
                ctx.fillStyle = CONFIG.fillColor;
                ctx.globalAlpha = square.alpha;
                ctx.fillRect(square.x, square.y, square.width, square.height);
            }
        });
        ctx.globalAlpha = 1;
    }

    function animateFill(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / CONFIG.fillDuration, 1);

        const squaresToFill = Math.floor(progress * grid.length);

        for (let i = 0; i < squaresToFill; i++) {
            if (i < grid.length) {
                grid[i].state = 'color';
            }
        }
        if (document.querySelector('.cursor')) {
            const percent = Math.floor(progress * 99);
            progressText.textContent = `${percent.toString().padStart(2, '0')}%`;
        }
        draw();

        if (progress < 1) {
            animationFrame = requestAnimationFrame(animateFill);
        } else {
            startTime = null;
            shuffleGrid();
            animationFrame = requestAnimationFrame(animateFade);
        }
    }

    function animateFade(timestamp) {
        if (!startTime) startTime = timestamp;
        canvas.style.background = 'transparent';
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / CONFIG.fadeDuration, 1);
        const logoProgress = Math.min(elapsed / CONFIG.logoMoveDuration, 1);
        const easeOut = easeOutCubic(logoProgress);

        setTimeout(() => {
            logo.animate({
                opacity: 0
            }, 1000)
        }, 1500);

        setTimeout(() => {
            $('.main__body .stroke div').addClass('anim_stroke')
        }, 2000);

        const squaresToFade = Math.floor(progress * grid.length);
        for (let i = 0; i < squaresToFade; i++) {
            if (i < grid.length) {
                grid[i].state = 'transparent';
                grid[i].alpha = 1 - progress;
            }
        }
        if (document.querySelector('.cursor')) {
            if (progressText.parentElement) {
                progressText.parentElement.style.opacity = 1 - progress;
            }
        }


        draw();

        if (progress < 1) {
            animationFrame = requestAnimationFrame(animateFade);
        } else {
            completeAnimation();
        }
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function completeAnimation() {
        preloadContainer.style.transition = 'opacity 0.5s ease';
        preloadContainer.style.opacity = '0';

        setTimeout(() => {
            preloadContainer.remove();
        }, 500);
    }

    function startAnimation() {
        if (!isPriorityVideoLoaded || !isGifLoaded) return;

        const centerX = (window.innerWidth - logo.offsetWidth) / 2;
        const centerY = (window.innerHeight - logo.offsetHeight) / 2;
        initialLogoPosition = {
            x: centerX / parseFloat(getComputedStyle(document.documentElement).fontSize),
            y: centerY / parseFloat(getComputedStyle(document.documentElement).fontSize)
        };

        setTimeout(() => {
            startTime = null;
            animationFrame = requestAnimationFrame(animateFill);
        }, CONFIG.animationDelay);
    }
    function checkPriorityVideoLoad() {
        const priorityVideo = document.querySelector('.priority-video');
        const gifImage = document.querySelector('.about-parallax img[src*="about-gif.gif"]');
        if (priorityVideo) {
            if (priorityVideo.readyState === 4) {
                isPriorityVideoLoaded = true;
                tryStartAnimation();
            } else {
                priorityVideo.addEventListener('loadeddata', () => {
                    isPriorityVideoLoaded = true;
                    tryStartAnimation();
                });

                priorityVideo.addEventListener('error', () => {
                    console.warn('Priority video failed to load, continuing anyway');
                    isPriorityVideoLoaded = true;
                    tryStartAnimation();
                });
            }
        } else {
            console.warn('Priority video not found, continuing');
            isPriorityVideoLoaded = true;
            tryStartAnimation();
        }
        if (gifImage) {
            if (gifImage.complete && gifImage.naturalHeight !== 0) {
                isGifLoaded = true;
                tryStartAnimation();
            } else {
                gifImage.addEventListener('load', () => {
                    isGifLoaded = true;
                    tryStartAnimation();
                });

                gifImage.addEventListener('error', () => {
                    console.warn('Gif image failed to load, continuing anyway');
                    isGifLoaded = true;
                    tryStartAnimation();
                });
            }
        } else {
            console.warn('Gif image not found, continuing');
            isGifLoaded = true;
            tryStartAnimation();
        }
        setTimeout(() => {
            if (!isPriorityVideoLoaded || !isGifLoaded) {
                console.warn('Assets loading timeout, starting animation anyway');
                isPriorityVideoLoaded = true;
                isGifLoaded = true;
                tryStartAnimation();
            }
        }, 5000);
    }
    function tryStartAnimation() {
        if (isPriorityVideoLoaded && isGifLoaded && isPageLoaded) {
            startAnimation();
        }
    }
    initGrid();

    checkPriorityVideoLoad();

    window.addEventListener('resize', () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        initGrid();
        draw();
    });
});
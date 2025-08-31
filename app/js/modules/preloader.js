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
        // Проверяем, полностью ли загружена страница
        if (document.readyState !== 'complete') {
            window.addEventListener('load', checkPriorityVideoLoad);
            return;
        }

        const priorityVideo = document.querySelector('.priority-video');
        const aboutVideo = document.querySelector('.about-parallax video');

        // Флаг для отслеживания таймаута
        let timeoutReached = false;

        // Обработчик для принудительного запуска после таймаута
        const forceStart = () => {
            if (!timeoutReached) return;
            isPriorityVideoLoaded = true;
            isGifLoaded = true;
            tryStartAnimation();
        };

        // Устанавливаем таймаут
        setTimeout(() => {
            timeoutReached = true;
            if (!isPriorityVideoLoaded || !isGifLoaded) {
                console.warn('Assets loading timeout, starting animation anyway');
                forceStart();
            }
        }, 5000);

        // Проверка priority video
        if (priorityVideo) {
            // На мобильных устройствах может потребоваться явно запустить загрузку
            if (priorityVideo.readyState === 4) {
                isPriorityVideoLoaded = true;
                tryStartAnimation();
            } else {
                // Для мобильных устройств: попробовать запустить загрузку вручную
                try {
                    priorityVideo.load();
                } catch (e) {
                    console.log('Cannot manually load video:', e);
                }

                const videoHandler = () => {
                    isPriorityVideoLoaded = true;
                    tryStartAnimation();
                    priorityVideo.removeEventListener('loadeddata', videoHandler);
                    priorityVideo.removeEventListener('error', videoHandler);
                };

                priorityVideo.addEventListener('loadeddata', videoHandler);
                priorityVideo.addEventListener('error', videoHandler);

                // Дополнительная проверка для мобильных устройств
                if (isMobileDevice() && priorityVideo.readyState === 0) {
                    console.log('Mobile device detected, video not started loading');
                    // На мобильных устройствах видео может не загружаться до взаимодействия пользователя
                    setTimeout(() => {
                        if (!isPriorityVideoLoaded) {
                            console.warn('Video not loading on mobile, continuing');
                            isPriorityVideoLoaded = true;
                            tryStartAnimation();
                        }
                    }, 2000);
                }
            }
        } else {
            console.warn('Priority video not found, continuing');
            isPriorityVideoLoaded = true;
            tryStartAnimation();
        }

        // Проверка about video
        if (aboutVideo) {
            if (aboutVideo.readyState === 4) {
                isGifLoaded = true;
                tryStartAnimation();
            } else {
                // Для мобильных устройств: попробовать запустить загрузку вручную
                try {
                    aboutVideo.load();
                } catch (e) {
                    console.log('Cannot manually load about video:', e);
                }

                const aboutVideoHandler = () => {
                    isGifLoaded = true;
                    tryStartAnimation();
                    aboutVideo.removeEventListener('loadeddata', aboutVideoHandler);
                    aboutVideo.removeEventListener('error', aboutVideoHandler);
                };

                aboutVideo.addEventListener('loadeddata', aboutVideoHandler);
                aboutVideo.addEventListener('error', aboutVideoHandler);

                // Дополнительная проверка для мобильных устройств
                if (isMobileDevice() && aboutVideo.readyState === 0) {
                    setTimeout(() => {
                        if (!isGifLoaded) {
                            console.warn('About video not loading on mobile, continuing');
                            isGifLoaded = true;
                            tryStartAnimation();
                        }
                    }, 2000);
                }
            }
        } else {
            console.warn('About video not found, continuing');
            isGifLoaded = true;
            tryStartAnimation();
        }
    }
    function tryStartAnimation() {
        if (isPriorityVideoLoaded && isGifLoaded) {
            // Небольшая задержка для гарантии, что все готово
            setTimeout(() => {
                startAnimation();
            }, 100);
        }
    }
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
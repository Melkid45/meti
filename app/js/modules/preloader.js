document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация
    const CONFIG = {
        squareSize: 54, // Размер квадрата в px
        fillColor: '#442CBF', // Акцентный цвет
        bgColor: '#000000', // Начальный цвет (черный)
        animationDelay: 500, // Задержка перед анимацией (мс)
        fillDuration: 1500, // Длительность заливки (мс)
        fadeDuration: 2500, // Длительность исчезновения (мс)
        logoMoveDuration: 1000, // Длительность движения логотипа (мс)
        targetLogoPosition: { x: 40, y: 53 }, // Целевая позиция логотипа в rem
        sizeLogo: { width: 200, height: 50 }
    };
    if (width <= 750) {
        CONFIG.squareSize = 20;
        CONFIG.targetLogoPosition.x = 20;
        CONFIG.targetLogoPosition.y = 20;
        CONFIG.sizeLogo.width = 120;
        CONFIG.sizeLogo.height = 30;
    }
    // Элементы
    const preloadContainer = document.querySelector('.preload-container');
    const canvas = document.querySelector('.preload-canvas');
    const ctx = canvas.getContext('2d');
    const logo = preloadContainer.querySelector('img');
    const progressText = document.querySelector('#js-cursor-progress span');
    const body = document.body;
    const logoHeader = document.querySelector('.header__body-logo');

    // Состояние
    let grid = [];
    let animationFrame;
    let startTime;
    let initialLogoPosition = { x: 0, y: 0 };

    // Инициализация сетки
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
                    state: 'black', // 'black' -> 'color' -> 'transparent'
                    alpha: 1
                });
            }
        }

        // Начальная отрисовка черных квадратов
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
            // Прозрачные квадраты не рисуем
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

        const percent = Math.floor(progress * 99);
        progressText.textContent = `${percent.toString().padStart(2, '0')}%`;

        draw();

        if (progress < 1) {
            animationFrame = requestAnimationFrame(animateFill);
        } else {
            startTime = null;
            shuffleGrid(); // Перемешиваем для фазы исчезновения
            animationFrame = requestAnimationFrame(animateFade);
        }
    }

    function animateFade(timestamp) {
        if (!startTime) startTime = timestamp;
        canvas.style.background = 'transparent';
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / CONFIG.fadeDuration, 1);
        // Анимация логотипа
        const logoProgress = Math.min(elapsed / CONFIG.logoMoveDuration, 1);
        const easeOut = easeOutCubic(logoProgress);

        // Движение логотипа
        const currentX = initialLogoPosition.x + (CONFIG.targetLogoPosition.x - initialLogoPosition.x) * easeOut;
        const currentY = initialLogoPosition.y + (CONFIG.targetLogoPosition.y - initialLogoPosition.y) * easeOut;
        logo.style.left = `${currentX}rem`;
        logo.style.top = `${currentY}rem`;
        logo.style.width = `${CONFIG.sizeLogo.width}rem`;
        logo.style.height = `${CONFIG.sizeLogo.height}rem`;
        setTimeout(() => {
            logoHeader.style.opacity = '1';
        }, 2000);
        setTimeout(() => {
            $('.main__body .stroke div p').each(function () {
                $(this).shuffleLetters({
                    step: 5,
                    fps: 120,
                    text: $(this).text()
                });
            })
        }, 500);
        setTimeout(() => {
            $('.main__body .stroke div').addClass('anim_stroke')
        }, 3500);
        // Анимация прозрачности
        const squaresToFade = Math.floor(progress * grid.length);
        for (let i = 0; i < squaresToFade; i++) {
            if (i < grid.length) {
                grid[i].state = 'transparent';
                grid[i].alpha = 1 - progress;
            }
        }

        // Прозрачность текста прогресса
        if (progressText.parentElement) {
            progressText.parentElement.style.opacity = 1 - progress;
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
        // Фиксируем конечное положение логотипа
        logo.style.left = `${CONFIG.targetLogoPosition.x}rem`;
        logo.style.top = `${CONFIG.targetLogoPosition.y}rem`;

        // Плавное исчезновение прелоадера
        preloadContainer.style.transition = 'opacity 0.5s ease';
        preloadContainer.style.opacity = '0';

        setTimeout(() => {
            preloadContainer.remove();
            body.style.overflow = 'auto';
        }, 500);
    }

    function startAnimation() {
        body.style.overflow = 'hidden';

        // Начальная позиция логотипа (центр)
        const centerX = (window.innerWidth - logo.offsetWidth) / 2;
        const centerY = (window.innerHeight - logo.offsetHeight) / 2;
        initialLogoPosition = {
            x: centerX / parseFloat(getComputedStyle(document.documentElement).fontSize),
            y: centerY / parseFloat(getComputedStyle(document.documentElement).fontSize)
        };

        // logo.style.position = 'absolute';
        // logo.style.left = `${initialLogoPosition.x}rem`;
        // logo.style.top = `${initialLogoPosition.y}rem`;
        // logo.style.transition = 'left 1.5s cubic-bezier(0.22, 1, 0.36, 1), top 1.5s cubic-bezier(0.22, 1, 0.36, 1)';
        // progressText.textContent = '00%';

        // Запускаем анимацию с задержкой
        setTimeout(() => {
            startTime = null;
            animationFrame = requestAnimationFrame(animateFill);
        }, CONFIG.animationDelay);
    }

    // Инициализация
    initGrid();
    startAnimation();

    window.addEventListener('resize', () => {
        cancelAnimationFrame(animationFrame);
        initGrid();
        draw();
    });
});
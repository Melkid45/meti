document.addEventListener('DOMContentLoaded', () => {
    // Функция для конвертации rem в пиксели (1rem = 100vw/1920)


    const CONFIG = {
        squareSize: 54,      // 40px = 2.5rem (40/(1920/100))
        gap: 0,               // 0rem
        fillColor: '#000000',
        bgColor: '#F4F4F403', // rgba(244, 244, 244, 0.03)
        animationDuration: 2000,
        widthView: 1920
    };
    if (width <= 750){
        CONFIG.widthView = 375;
        CONFIG.squareSize = 20;
    }
    function remToPx(rem) {
        return rem * (window.innerWidth / CONFIG.widthView);
    }
    const canvas = document.getElementById('grid-canvas-begin');
    const ctx = canvas.getContext('2d');
    let grid = [];
    let shuffledIndices = [];
    let lastFilledCount = 0;

    // Инициализация сетки с учетом rem
    function initGrid() {
        const container = document.querySelector('.main');
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Учет devicePixelRatio для четкого отображения
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);

        // Конвертируем rem в пиксели
        const squareSizePx = Math.floor(remToPx(CONFIG.squareSize));
        const gapPx = Math.floor(remToPx(CONFIG.gap));

        // Расчет сетки с перекрытием для устранения полос
        const cols = Math.ceil(width / (squareSizePx + gapPx)) + 1;
        const rows = Math.ceil(height / (squareSizePx + gapPx)) + 1;

        // Центрирование сетки
        const gridWidth = cols * (squareSizePx + gapPx);
        const gridHeight = rows * (squareSizePx + gapPx);
        const offsetX = Math.floor((width - gridWidth) / 2);
        const offsetY = Math.floor((height - gridHeight) / 2);

        // Создаем сетку
        grid = [];
        for (let y = -1; y < rows; y++) {
            for (let x = -1; x < cols; x++) {
                grid.push({
                    x: x * (squareSizePx + gapPx) + offsetX,
                    y: y * (squareSizePx + gapPx) + offsetY,
                    width: squareSizePx,
                    height: squareSizePx, // Гарантируем квадраты
                    filled: false
                });
            }
        }

        // Перемешиваем индексы для случайного порядка заполнения
        shuffledIndices = [...Array(grid.length).keys()];
        shuffleArray(shuffledIndices);
        lastFilledCount = 0;

        draw();
    }

    // Функция для перемешивания массива (без изменений)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Отрисовка сетки с pixel-perfect подходом
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        // Заливаем фон
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Рисуем квадраты
        grid.forEach(square => {
            const x = Math.floor(square.x);
            const y = Math.floor(square.y);
            const size = Math.floor(square.width);

            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(x, y, size, size);
        });
    }

    // Обновление состояния квадратов (логика без изменений)
    function updateGrid(filledCount) {
        if (filledCount < lastFilledCount) {
            for (let i = lastFilledCount - 1; i >= filledCount; i--) {
                if (i >= 0 && i < shuffledIndices.length) {
                    grid[shuffledIndices[i]].filled = false;
                }
            }
        } else {
            for (let i = lastFilledCount; i < filledCount; i++) {
                if (i >= 0 && i < shuffledIndices.length) {
                    grid[shuffledIndices[i]].filled = true;
                }
            }
        }

        lastFilledCount = filledCount;
        draw();
    }

    const controller = new ScrollMagic.Controller();

    new ScrollMagic.Scene({
        triggerElement: ".main",
        duration: CONFIG.animationDuration,
        triggerHook: 0,
    })
        .setPin('.main')
        .on("progress", (e) => {
            const filledCount = Math.floor(e.progress * grid.length);
            updateGrid(filledCount);
        })
        .addTo(controller);

    // Инициализация
    initGrid();

    // Оптимизированный ресайз
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initGrid();
            controller.update();
        }, 100);
    });
});
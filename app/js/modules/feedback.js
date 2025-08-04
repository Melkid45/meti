document.addEventListener('DOMContentLoaded', () => {
    // Функция для точного расчета rem в пикселях (1rem = 100vw/1920)


    const FEEDBACK_CONFIG = {
        squareSize: 54,       // 54rem (54*(100vw/1920))
        gap: 0,               // 0rem
        fillColor: '#442CBF',
        bgColor: '#000000',
        animationDuration: 1200,
        maxSpeed: 0.1,
        widthView: 1920,
        hookTrigger: 0.5
    };
    if (width <= 750) {
        FEEDBACK_CONFIG.widthView = 375;
        FEEDBACK_CONFIG.squareSize = 20;
        FEEDBACK_CONFIG.hookTrigger = 1
    }
    function remToPx(rem) {
        return rem * (window.innerWidth / FEEDBACK_CONFIG.widthView);
    }
    const feedbackCanvas = document.getElementById('feedback-grid-canvas');
    const feedbackCtx = feedbackCanvas.getContext('2d');
    let feedbackGrid = [];
    let feedbackShuffledIndices = [];
    let feedbackTargetFilled = 0;
    let feedbackCurrentFilled = 0;
    let feedbackLastTime = 0;
    let feedbackLastProgress = 0;
    let feedbackAnimationId = null;

    function initFeedbackGrid() {
        const container = document.querySelector('.feedback__top');
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Учет devicePixelRatio и точная настройка canvas
        const dpr = window.devicePixelRatio || 1;
        feedbackCanvas.style.width = width + 'px';
        feedbackCanvas.style.height = height + 'px';
        feedbackCanvas.width = Math.floor(width * dpr);
        feedbackCanvas.height = Math.floor(height * dpr);
        feedbackCtx.scale(dpr, dpr);
        feedbackCtx.imageSmoothingEnabled = false;

        // Конвертация в пиксели с округлением
        const squareSizePx = Math.floor(remToPx(FEEDBACK_CONFIG.squareSize));
        const gapPx = Math.floor(remToPx(FEEDBACK_CONFIG.gap));

        // Расчет сетки с перекрытием на 1px для устранения полос
        const cols = Math.ceil(width / (squareSizePx + gapPx)) + 1;
        const rows = Math.ceil(height / (squareSizePx + gapPx)) + 1;
        const gridWidth = (cols - 2) * (squareSizePx + gapPx); // -2 из-за -1..cols
        const gridHeight = (rows - 2) * (squareSizePx + gapPx);
        const offsetX = (width - gridWidth) / 2;
        const offsetY = (height - gridHeight) / 2;
        feedbackGrid = [];
        for (let y = -1; y < rows; y++) {
            for (let x = -1; x < cols; x++) {
                feedbackGrid.push({
                    x: x * (squareSizePx + gapPx) + offsetX,
                    y: y * (squareSizePx + gapPx) + offsetY,
                    width: squareSizePx,
                    height: squareSizePx,
                    filled: false
                });
            }
        }

        // Перемешивание индексов
        feedbackShuffledIndices = [...Array(feedbackGrid.length).keys()];
        for (let i = feedbackShuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [feedbackShuffledIndices[i], feedbackShuffledIndices[j]] = [feedbackShuffledIndices[j], feedbackShuffledIndices[i]];
        }

        feedbackTargetFilled = 0;
        feedbackCurrentFilled = 0;
        drawFeedbackGrid();
    }

    function drawFeedbackGrid() {
        feedbackCtx.clearRect(0, 0, feedbackCanvas.width, feedbackCanvas.height);

        feedbackCtx.fillStyle = FEEDBACK_CONFIG.bgColor;
        feedbackCtx.fillRect(0, 0, feedbackCanvas.width, feedbackCanvas.height);

        for (let i = 0; i < feedbackCurrentFilled; i++) {
            const index = feedbackShuffledIndices[i];
            const square = feedbackGrid[index];

            const x = square.x;
            const y = square.y;
            const width = square.width;
            const height = square.height;

            feedbackCtx.fillStyle = FEEDBACK_CONFIG.fillColor;
            feedbackCtx.fillRect(x, y, width, height);
        }
    }
    function updateFeedbackGrid() {
        if (feedbackCurrentFilled < feedbackTargetFilled) {
            const toFill = Math.min(feedbackTargetFilled - feedbackCurrentFilled, 50);
            feedbackCurrentFilled += toFill;
        }
        else if (feedbackCurrentFilled > feedbackTargetFilled) {
            const toClear = Math.min(feedbackCurrentFilled - feedbackTargetFilled, 50);
            feedbackCurrentFilled -= toClear;
        }

        drawFeedbackGrid();

        if (feedbackCurrentFilled !== feedbackTargetFilled) {
            feedbackAnimationId = requestAnimationFrame(updateFeedbackGrid);
        } else {
            feedbackAnimationId = null;
        }
    }

    const feedbackController = new ScrollMagic.Controller();

    new ScrollMagic.Scene({
        triggerElement: ".feedback__top",
        duration: FEEDBACK_CONFIG.animationDuration,
        triggerHook: FEEDBACK_CONFIG.hookTrigger,
    })
        .on("progress", (e) => {
            const now = performance.now();
            const deltaTime = now - feedbackLastTime;
            feedbackLastTime = now;

            const deltaProgress = e.progress - feedbackLastProgress;
            const speed = deltaTime > 0 ? Math.abs(deltaProgress) / (deltaTime / 1000) : 0;
            feedbackLastProgress = e.progress;

            const safeProgress = speed > FEEDBACK_CONFIG.maxSpeed * 1000
                ? feedbackLastProgress + Math.sign(deltaProgress) * FEEDBACK_CONFIG.maxSpeed * (deltaTime / 1000)
                : e.progress;

            feedbackTargetFilled = Math.floor(safeProgress * feedbackGrid.length);

            if (!feedbackAnimationId) {
                feedbackAnimationId = requestAnimationFrame(updateFeedbackGrid);
            }
        })
        .addTo(feedbackController);

    // Инициализация
    initFeedbackGrid();

    // Ресайз с throttling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            cancelAnimationFrame(feedbackAnimationId);
            feedbackAnimationId = null;
            initFeedbackGrid();
            feedbackController.update();
        }, 100);
    });

    // Очистка
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(feedbackAnimationId);
    });
});
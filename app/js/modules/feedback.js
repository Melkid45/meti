document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        squareSize: 54,
        gap: 0,
        fillColor: '#442CBF',
        bgColor: '#000000',
        animationDuration: 1000,
        widthView: 1920
    };

    function applyResponsiveConfig() {
        if (window.innerWidth <= 750) {
            CONFIG.widthView = 375;
            CONFIG.squareSize = 20;
            CONFIG.animationDuration = 500;
        } else {
            CONFIG.widthView = 1920;
            CONFIG.squareSize = 54;
            CONFIG.animationDuration = 1000;
        }
    }

    applyResponsiveConfig();

    function remToPx(rem) {
        return rem * (window.innerWidth / CONFIG.widthView);
    }

    const canvas = document.getElementById('feedback-grid-canvas');
    const ctx = canvas.getContext('2d');
    let grid = [];
    let shuffledIndices = [];

    function initGrid() {
        const container = document.querySelector('.feedback__top');
        const width = container.clientWidth;
        const height = container.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const squareSizePx = Math.round(remToPx(CONFIG.squareSize));
        const gapPx = Math.round(remToPx(CONFIG.gap));

        const cols = Math.ceil(width / (squareSizePx + gapPx));
        const rows = Math.ceil(height / (squareSizePx + gapPx));

        const startX = -((cols * (squareSizePx + gapPx) - width) / 2);
        const startY = -((rows * (squareSizePx + gapPx) - height) / 2);

        grid = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                grid.push({
                    x: startX + x * (squareSizePx + gapPx),
                    y: startY + y * (squareSizePx + gapPx),
                    width: squareSizePx,
                    height: squareSizePx,
                    filled: false
                });
            }
        }

        shuffledIndices = [...Array(grid.length).keys()];
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }

        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        grid.forEach(square => {
            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(square.x, square.y, square.width + 0.5, square.height + 0.5);
        });
    }

    function updateGrid(progress) {
        const filledCount = Math.floor(progress * grid.length);
        grid.forEach(sq => sq.filled = false);
        for (let i = 0; i < filledCount; i++) {
            grid[shuffledIndices[i]].filled = true;
        }
        draw();
    }

    gsap.registerPlugin(ScrollTrigger);

    function createScroll() {
        ScrollTrigger.create({
            trigger: ".feedback",
            start: "top bottom",
            end: "+=" + CONFIG.animationDuration,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => updateGrid(self.progress)
        });
    }

    // 1. Сначала рисуем сетку
    initGrid();

    // 2. Ждём полной загрузки страницы
    window.addEventListener('load', () => {
        createScroll();
        ScrollTrigger.refresh();
    });

    // 3. При resize пересобираем
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            applyResponsiveConfig();
            initGrid();
            ScrollTrigger.refresh();
        }, 100);
    });
});

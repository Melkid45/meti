document.addEventListener('DOMContentLoaded', () => {

    const CONFIG = {
        squareSize: 54,
        gap: 0,
        fillColor: '#000000',
        bgColor: '#F4F4F403',
        animationDuration: 500,
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

    function initGrid() {
        const container = document.querySelector('.main');
        const width = container.clientWidth;
        const height = container.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);
        const squareSizePx = Math.floor(remToPx(CONFIG.squareSize));
        const gapPx = Math.floor(remToPx(CONFIG.gap));
        const cols = Math.ceil(width / (squareSizePx + gapPx)) + 1;
        const rows = Math.ceil(height / (squareSizePx + gapPx)) + 1;
        const gridWidth = cols * (squareSizePx + gapPx);
        const gridHeight = rows * (squareSizePx + gapPx);
        const offsetX = Math.round((width - gridWidth) / 2);
        const offsetY = Math.round((height - gridHeight) / 2);
        grid = [];
        for (let y = -1; y < rows; y++) {
            for (let x = -1; x < cols; x++) {
                grid.push({
                    x: x * (squareSizePx + gapPx) + offsetX,
                    y: y * (squareSizePx + gapPx) + offsetY,
                    width: squareSizePx,
                    height: squareSizePx,
                    filled: false
                });
            }
        }
        shuffledIndices = [...Array(grid.length).keys()];
        shuffleArray(shuffledIndices);
        lastFilledCount = 0;

        draw();
    }
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        grid.forEach(square => {
            const x = Math.round(square.x);
            const y = Math.round(square.y);
            const size = Math.round(square.width);

            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(x, y, size, size);
        });
    }
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
        .on("progress", (e) => {
            const filledCount = Math.floor(e.progress * grid.length);
            updateGrid(filledCount);
            if (e.progress >= 0.90){
                canvas.style.background = '#000'
            }else{
                canvas.style.background = 'transparent'
            }
        })
        .addTo(controller);
    initGrid();
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initGrid();
            controller.update();
        }, 100);
    });
});
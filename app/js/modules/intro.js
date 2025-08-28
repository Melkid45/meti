document.addEventListener('DOMContentLoaded', () => {

    const CONFIG = {
        squareSize: 54,
        gap: 0,
        fillColor: '#000000',
        bgColor: '#F4F4F400',
        animationDuration: 500,
        widthView: 1920
    };
    if (width <= 750) {
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
        canvas.width = Math.ceil(width * dpr);
        canvas.height = Math.ceil(height * dpr);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const squareSizePx = Math.round(remToPx(CONFIG.squareSize));
        const gapPx = 0;
        const cols = Math.ceil(width / squareSizePx);
        const rows = Math.ceil(height / squareSizePx);
        const gridWidth = cols * squareSizePx;
        const gridHeight = rows * squareSizePx;
        const offsetX = Math.floor((width - gridWidth) / 2);
        const offsetY = Math.floor((height - gridHeight) / 2);



        grid = [];
        for (let y = 0; y <= rows; y++) { 
            for (let x = 0; x <= cols; x++) {
                grid.push({
                    x: x * squareSizePx,
                    y: y * squareSizePx,
                    width: squareSizePx + 1,
                    height: squareSizePx + 1,
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
            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(square.x, square.y, square.width, square.height);
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
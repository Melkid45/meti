
document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        squareSize: 40,
        gap: 0,
        fillColor: '#442CBF',
        bgColor: '#000000',
        batchSize: 50,
        animationDuration: 2000
    };

    const canvas = document.getElementById('grid-canvas');
    const ctx = canvas.getContext('2d');
    let grid = [];
    let shuffledIndices = [];
    let filledCount = 0;

    function initGrid() {
        const container = document.querySelector('.feedback__top');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        const cols = Math.floor(canvas.width / (CONFIG.squareSize + CONFIG.gap));
        const rows = Math.floor(canvas.height / (CONFIG.squareSize + CONFIG.gap));
        
        grid = Array(cols * rows).fill().map((_, i) => ({
            x: (i % cols) * (CONFIG.squareSize + CONFIG.gap),
            y: Math.floor(i / cols) * (CONFIG.squareSize + CONFIG.gap),
            width: CONFIG.squareSize,
            height: CONFIG.squareSize,
            filled: false
        }));
        
        shuffledIndices = [...Array(grid.length).keys()].sort(() => Math.random() - 0.5);
        filledCount = 0;
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        grid.forEach((square, i) => {
            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(square.x, square.y, square.width, square.height);
            
            if (!square.filled) {
                ctx.strokeRect(square.x, square.y, square.width, square.height);
            }
        });
    }

    const controller = new ScrollMagic.Controller();

    new ScrollMagic.Scene({
        triggerElement: ".feedback__top",
        duration: CONFIG.animationDuration,
        triggerHook: 0,
    })
    .setPin('.feedback__top')
    .on("progress", (e) => {
        const targetFilled = Math.floor(e.progress * grid.length);
        const toFill = Math.min(targetFilled - filledCount, CONFIG.batchSize);
        
        if (toFill > 0) {
            for (let i = 0; i < toFill; i++) {
                if (filledCount < grid.length) {
                    const idx = shuffledIndices[filledCount];
                    grid[idx].filled = true;
                    filledCount++;
                }
            }
            draw();
        }
        else if (toFill < 0) {
            for (let i = 0; i > toFill; i--) {
                if (filledCount > 0) {
                    filledCount--;
                    const idx = shuffledIndices[filledCount];
                    grid[idx].filled = false;
                }
            }
            draw();
        }
    })
    .addTo(controller);

    initGrid();
    window.addEventListener('resize', () => {
        controller.updateScene(); // Обновляем сцену при ресайзе
        initGrid();
    });
});
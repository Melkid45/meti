document.addEventListener('DOMContentLoaded', function () {
    const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const CONFIG = {
        squareSize: 54,
        gap: 0,
        fillColor: 'rgba(244, 244, 244, 0.03)',
        bgColor: '#000000',
        fillDuration: 0.45,
        delayDuration: 0.1,
        clearDuration: 0.45
    };
    if (width <= 750) {
        CONFIG.squareSize = 20;
    }
    function remToPx(rem) {
        return rem * remInPx;
    }
    const canvas = document.getElementById('grid-canvas-video');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.showreel');
    let grid = [];
    let shuffledIndices = [];
    let lastProgress = 0;
    function initGrid() {
        const width = Math.floor(container.clientWidth);
        const height = Math.floor(container.clientHeight);
        const dpr = window.devicePixelRatio || 1;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = Math.ceil(width * dpr);
        canvas.height = Math.ceil(height * dpr);

        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;

        const squareSizePx = Math.floor(remToPx(CONFIG.squareSize)) + 1;
        const gapPx = Math.floor(remToPx(CONFIG.gap));
        const cols = Math.ceil(width / (squareSizePx + gapPx));
        const rows = Math.ceil(height / (squareSizePx + gapPx));

        const gridWidth = cols * (squareSizePx + gapPx);
        const gridHeight = rows * (squareSizePx + gapPx);
        const offsetX = Math.max(0, Math.floor((width - gridWidth) / 2));
        const offsetY = Math.max(0, Math.floor((height - gridHeight) / 2));

        grid = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const posX = Math.floor(x * (squareSizePx + gapPx) + offsetX);
                const posY = Math.floor(y * (squareSizePx + gapPx) + offsetY);
                grid.push({
                    x: posX,
                    y: posY,
                    width: squareSizePx,
                    height: squareSizePx,
                    filled: false
                });
            }
        }

        shuffledIndices = Array.from({ length: grid.length }, (_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }

        draw();
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;
        grid.forEach(square => {
            const x = square.x;
            const y = square.y;
            const width = square.width;
            const height = square.height;

            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(x, y, width, height);
        });
    }
    function updateAnimation(progress) {
        const isScrollingDown = progress > lastProgress;
        lastProgress = progress;

        const fillEnd = CONFIG.fillDuration;
        const clearStart = fillEnd + CONFIG.delayDuration;
        const totalDuration = fillEnd + CONFIG.delayDuration + CONFIG.clearDuration;

        if (isScrollingDown) {
            if (progress <= fillEnd) {
                const fillProgress = progress / fillEnd;
                const squaresToFill = Math.floor(fillProgress * grid.length);

                for (let i = 0; i < squaresToFill; i++) {
                    grid[shuffledIndices[i]].filled = true;
                }
            }
            else if (progress <= clearStart) {
                grid.forEach(sq => sq.filled = true);
            }
            else {
                const clearProgress = (progress - clearStart) / CONFIG.clearDuration;
                const squaresToClear = Math.floor(clearProgress * grid.length);

                if (progress >= 0.99 * totalDuration) {
                    grid.forEach(sq => sq.filled = false);
                } else {
                    for (let i = 0; i < squaresToClear; i++) {
                        grid[shuffledIndices[grid.length - 1 - i]].filled = false;
                    }
                }
            }
        }
        else {
            if (progress >= clearStart) {
                const clearProgress = (progress - clearStart) / CONFIG.clearDuration;
                const squaresToRestore = grid.length - Math.floor(clearProgress * grid.length);

                for (let i = 0; i < squaresToRestore; i++) {
                    grid[shuffledIndices[i]].filled = true;
                }
            }
            else if (progress >= fillEnd) {
                grid.forEach(sq => sq.filled = true);
            }
            else {
                const fillProgress = progress / fillEnd;
                const squaresToUnfill = grid.length - Math.floor(fillProgress * grid.length);

                for (let i = 0; i < squaresToUnfill; i++) {
                    grid[shuffledIndices[i]].filled = false;
                }
            }
        }

        draw();
    }

    function initScrollMagic() {
        const controller = new ScrollMagic.Controller();

        const totalDuration = CONFIG.fillDuration + CONFIG.delayDuration + CONFIG.clearDuration;

        new ScrollMagic.Scene({
            triggerElement: ".showreel",
            duration: `${totalDuration * 200}%`,
            triggerHook: 1,
        })
            .on("progress", function (e) {
                updateAnimation(e.progress);
            })
            .addTo(controller);
    }
    initGrid();
    initScrollMagic();
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === container) {
                initGrid();
            }
        }
    });
    resizeObserver.observe(container);
    window.addEventListener('beforeunload', () => {
        resizeObserver.disconnect();
    });
});
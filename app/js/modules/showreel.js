document.addEventListener('DOMContentLoaded', function () {
    const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const CONFIG = {
        squareSize: 54,   
        gap: 0,       
        fillColor: 'rgba(244, 244, 244, 0.03)',
        bgColor: '#000000',
        fillDuration: 0.45, 
        delayDuration: 0.1,
        clearDuration: 0.45
    };

    const container = document.querySelector('.showreel') || document.body;
    const canvas = document.getElementById('grid-canvas-video');
    if (!canvas) {
        console.warn('Не найден canvas#grid-canvas-video');
        return;
    }
    const ctx = canvas.getContext('2d');

    function remToPx(rem) {
        return rem * remInPx;
    }
    if ((window.innerWidth || document.documentElement.clientWidth) <= 750) {
        CONFIG.squareSize = 20;
    }

    let grid = [];
    let shuffledIndices = [];
    let cols = 0;
    let rows = 0;
    const totalTimeline = CONFIG.fillDuration + CONFIG.delayDuration + CONFIG.clearDuration;

    function initGrid() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = (width) + 'px';
        canvas.style.height = (height) + 'px';
        canvas.width = Math.ceil((width) * dpr);
        canvas.height = Math.ceil((height) * dpr);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;

        const squareSizePx = remToPx(CONFIG.squareSize);
        const gapPx = remToPx(CONFIG.gap);

        cols = Math.ceil((width) / (squareSizePx + gapPx));
        rows = Math.ceil((height) / (squareSizePx + gapPx));

        grid = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                grid.push({
                    x: x * (squareSizePx + gapPx),
                    y: y * (squareSizePx + gapPx),
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

    function clamp(v, a, b) {
        return Math.max(a, Math.min(b, v));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        grid.forEach(square => {
            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(square.x, square.y, square.width, square.height);
        });
    }

    function updateAnimation(progress) {
        progress = clamp(progress, 0, 1);
        const t = progress * totalTimeline;

        const fillEnd = CONFIG.fillDuration;
        const clearStart = fillEnd + CONFIG.delayDuration;

        let targetCount = 0;
        if (t <= fillEnd) {
            const fillProgress = fillEnd > 0 ? (t / fillEnd) : 1;
            targetCount = Math.round(fillProgress * grid.length);
        } else if (t <= clearStart) {
            targetCount = grid.length;
        } else {
            const clearProgress = CONFIG.clearDuration > 0 ? ((t - clearStart) / CONFIG.clearDuration) : 1;
            const remaining = 1 - clamp(clearProgress, 0, 1);
            targetCount = Math.round(remaining * grid.length);
        }

        targetCount = clamp(targetCount, 0, grid.length);

        for (let i = 0; i < grid.length; i++) {
            const gridIndex = shuffledIndices[i];
            grid[gridIndex].filled = i < targetCount;
        }

        draw();
    }

    function initScrollMagic() {
        if (typeof ScrollMagic === 'undefined') {
            console.warn('ScrollMagic не найден — вызов updateAnimation(progress) можно сделать вручную.');
            return;
        }

        const controller = new ScrollMagic.Controller();

        const sceneDurationPercent = Math.max(100, totalTimeline * 200);
        new ScrollMagic.Scene({
            triggerElement: ".showreel",
            duration: `${sceneDurationPercent}%`,
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

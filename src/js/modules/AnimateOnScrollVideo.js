import { gsap, ScrollTrigger } from './ScrollTriggerInit.js';

document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        squareSize: 40,
        gap: 0,
        fillColor: '#F4F4F403',
        bgColor: '#000000',
        batchSize: 50,
        fillSpeed: 0.5
    };

    const canvas = document.getElementById('grid-canvas-video');
    const ctx = canvas.getContext('2d');
    let grid = [];
    let shuffledIndices = [];
    let lastProgress = 0;
    let filledCount = 0;
    function initGrid() {
        const container = document.querySelector('.intro');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const cols = Math.ceil(canvas.width / (CONFIG.squareSize + CONFIG.gap));
        const rows = Math.ceil(canvas.height / (CONFIG.squareSize + CONFIG.gap));

        grid = Array(cols * rows).fill().map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return {
                x: col * (CONFIG.squareSize + CONFIG.gap),
                y: row * (CONFIG.squareSize + CONFIG.gap),
                width: CONFIG.squareSize,
                height: CONFIG.squareSize,
                filled: false
            };
        });

        shuffledIndices = [...Array(grid.length).keys()].sort(() => Math.random() - 0.5);
        filledCount = 0;
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        grid.forEach(square => {
            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(square.x, square.y, square.width, square.height);
        });
    }

    ScrollTrigger.create({
        trigger: ".showreel__video-wrapper",
        start: "top top",
        end: "+=400%",
        scrub: CONFIG.fillSpeed,
        pin: true,
        markers: true,
        onUpdate: (self) => {
            const currentProgress = self.progress;
            const targetFilled = Math.floor(currentProgress * grid.length * 2); // Умножаем на 2 для двух фаз

            const isScrollingDown = currentProgress > lastProgress;
            lastProgress = currentProgress;

            if (targetFilled <= grid.length) {
                const fillCount = Math.min(targetFilled, grid.length);
                for (let i = 0; i < fillCount; i++) {
                    if (!grid[shuffledIndices[i]].filled) {
                        grid[shuffledIndices[i]].filled = true;
                    }
                }
                for (let i = fillCount; i < grid.length; i++) {
                    grid[shuffledIndices[i]].filled = false;
                }
            } else {
                const clearCount = Math.min(targetFilled - grid.length, grid.length);
                for (let i = 0; i < clearCount; i++) {
                    if (grid[shuffledIndices[grid.length - 1 - i]].filled) {
                        grid[shuffledIndices[grid.length - 1 - i]].filled = false;
                    }
                }
                for (let i = clearCount; i < grid.length; i++) {
                    grid[shuffledIndices[grid.length - 1 - i]].filled = true;
                }
            }

            draw();
        },
        onRefresh: initGrid
    });

    // Запуск
    initGrid();
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });
});
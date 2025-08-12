document.addEventListener('DOMContentLoaded', function () {
    // базовые настройки
    const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const CONFIG = {
        squareSize: 54,         // rem
        gap: 0,                 // rem
        fillColor: 'rgba(244, 244, 244, 0.03)',
        bgColor: '#000000',
        fillDuration: 0.45,     // часть таймлайна
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

    // если экран узкий — уменьшаем квадраты
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

        // +1px по ширине и высоте в CSS px
        canvas.style.width = (width + 1) + 'px';
        canvas.style.height = (height + 1) + 'px';
        canvas.width = Math.ceil((width + 1) * dpr);
        canvas.height = Math.ceil((height + 1) * dpr);

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = false;

        const squareSizePx = remToPx(CONFIG.squareSize);
        const gapPx = remToPx(CONFIG.gap);

        cols = Math.ceil((width + 1) / (squareSizePx + gapPx));
        rows = Math.ceil((height + 1) / (squareSizePx + gapPx));

        grid = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                grid.push({
                    x: x * (squareSizePx + gapPx),
                    y: y * (squareSizePx + gapPx),
                    width: squareSizePx + 0.5,
                    height: squareSizePx + 0.5,
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

    // Основная, упрощённая и детерминированная функция обновления.
    // progress: ScrollMagic progress (0..1)
    function updateAnimation(progress) {
        // защитная обработка
        progress = clamp(progress, 0, 1);

        // приводим прогресс к "временной" шкале (в тех же единицах, что и durations)
        const t = progress * totalTimeline;

        const fillEnd = CONFIG.fillDuration;
        const clearStart = fillEnd + CONFIG.delayDuration;

        let targetCount = 0;
        if (t <= fillEnd) {
            // стадия заполнения
            const fillProgress = fillEnd > 0 ? (t / fillEnd) : 1;
            targetCount = Math.round(fillProgress * grid.length);
        } else if (t <= clearStart) {
            // пауза — всё заполнено
            targetCount = grid.length;
        } else {
            // стадия очищения
            const clearProgress = CONFIG.clearDuration > 0 ? ((t - clearStart) / CONFIG.clearDuration) : 1;
            const remaining = 1 - clamp(clearProgress, 0, 1);
            targetCount = Math.round(remaining * grid.length);
        }

        targetCount = clamp(targetCount, 0, grid.length);

        // Устанавливаем filled детерминированно по shuffledIndices:
        // первыми заполняются элементы с индексами shuffledIndices[0..targetCount-1]
        for (let i = 0; i < grid.length; i++) {
            const gridIndex = shuffledIndices[i];
            grid[gridIndex].filled = i < targetCount;
        }

        draw();
    }

    // Инициализация ScrollMagic (или любой другой скролл-логики).
    function initScrollMagic() {
        if (typeof ScrollMagic === 'undefined') {
            console.warn('ScrollMagic не найден — вызов updateAnimation(progress) можно сделать вручную.');
            return;
        }

        const controller = new ScrollMagic.Controller();

        // продление сцены: оставляем процент от высоты в зависимости от totalTimeline,
        // но чаще всего totalTimeline == 1, тогда duration можно выставлять как "200%" (как было у тебя).
        // Оставим поведение похожим на твоё, но без прямой зависимости внутри updateAnimation.
        const sceneDurationPercent = Math.max(100, totalTimeline * 200); // если totalTimeline=1 => 200%
        new ScrollMagic.Scene({
            triggerElement: ".showreel",
            duration: `${sceneDurationPercent}%`,
            triggerHook: 1,
        })
            .on("progress", function (e) {
                updateAnimation(e.progress); // e.progress ∈ [0..1]
            })
            .addTo(controller);
    }

    // Запуск
    initGrid();
    initScrollMagic();

    // Реагируем на ресайз контейнера
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

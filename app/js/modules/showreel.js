document.addEventListener('DOMContentLoaded', function() {
    // Получаем размер 1rem в пикселях
    const remInPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    
    // Конфигурация (все размеры в rem)
    const CONFIG = {
        squareSize: 54,      // 54px / 16 = 3.375rem
        gap: 0,                 // 0rem
        fillColor: 'rgba(244, 244, 244, 0.03)',
        bgColor: '#000000',
        fillDuration: 0.4,      // 40% на заполнение
        delayDuration: 0.3,     // 30% на задержку
        clearDuration: 0.3      // 30% на очистку
    };
    if (width <= 750){
        CONFIG.squareSize = 20;
    }
    // Функция для конвертации rem в px
    function remToPx(rem) {
        return rem * remInPx;
    }

    // Элементы
    const canvas = document.getElementById('grid-canvas-video');
    const ctx = canvas.getContext('2d');
    const container = document.querySelector('.showreel');
    
    // Состояние
    let grid = [];
    let shuffledIndices = [];
    let lastProgress = 0;

    // 1. Инициализация сетки
    function initGrid() {
        // Получаем точные размеры контейнера
        const width = Math.floor(container.clientWidth);
        const height = Math.floor(container.clientHeight);
        
        // Устанавливаем размеры canvas с учетом devicePixelRatio
        const dpr = window.devicePixelRatio || 1;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.scale(dpr, dpr);

        // Конвертируем rem в px для расчетов
        const squareSizePx = Math.floor(remToPx(CONFIG.squareSize));
        const gapPx = Math.floor(remToPx(CONFIG.gap));

        // Рассчитываем количество столбцов и строк
        const cols = Math.ceil(width / (squareSizePx + gapPx));
        const rows = Math.ceil(height / (squareSizePx + gapPx));

        // Вычисляем общий размер сетки и центрируем
        const gridWidth = cols * (squareSizePx + gapPx);
        const gridHeight = rows * (squareSizePx + gapPx);
        const offsetX = Math.max(0, (width - gridWidth) / 2);
        const offsetY = Math.max(0, (height - gridHeight) / 2);

        grid = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // Округляем координаты до целых пикселей
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

        // Перемешивание индексов
        shuffledIndices = Array.from({length: grid.length}, (_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }

        draw();
    }

    // 2. Отрисовка сетки с антиалиасингом
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Отключаем сглаживание для четких границ
        ctx.imageSmoothingEnabled = false;
        
        grid.forEach(square => {
            // Округляем координаты еще раз для точности
            const x = Math.floor(square.x);
            const y = Math.floor(square.y);
            const width = Math.floor(square.width);
            const height = Math.floor(square.height);
            
            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(x, y, width, height);
        });
    }

    // 3. Обновление анимации
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

    // 4. Инициализация ScrollMagic
    function initScrollMagic() {
        const controller = new ScrollMagic.Controller();
        
        const totalDuration = CONFIG.fillDuration + CONFIG.delayDuration + CONFIG.clearDuration;
        
        new ScrollMagic.Scene({
            triggerElement: ".showreel",
            duration: `${totalDuration * 200}%`,
            triggerHook: 0
        })
        .setPin(".showreel")
        .on("progress", function(e) {
            updateAnimation(e.progress);
        })
        .addTo(controller);
    }

    // Запуск
    initGrid();
    initScrollMagic();
    
    // Оптимизированный ресайз с debounce и ResizeObserver
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === container) {
                initGrid();
            }
        }
    });
    resizeObserver.observe(container);

    // Очистка при размонтировании
    window.addEventListener('beforeunload', () => {
        resizeObserver.disconnect();
    });
});
document.addEventListener('DOMContentLoaded', () => {
    // Конфигурация
    const CONFIG = {
        squareSize: 40, // Размер квадрата в rem (2.5rem ≈ 40px при стандартном размере шрифта)
        fillColor: '#000000', // Цвет заливки
        initialFillRatio: 0.3, // Процент изначально заполненных квадратов
        animationDuration: 50, // Длительность анимации одного квадрата (мс)
        staggerDelay: 2 // Задержка между анимациями квадратов (мс)
    };
    if (width <= 750){
        CONFIG.squareSize = 20;
    }
    const button = document.querySelector('.feedback_btn');
    const canvas = button.querySelector('.btn_canvas');
    const ctx = canvas.getContext('2d');
    let grid = [];
    let isHovered = false;

    // Функция для преобразования rem в px
    function remToPx(rem) {
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    // Инициализация canvas
    function initCanvas() {
        // Получаем размеры кнопки в px
        const buttonWidth = button.offsetWidth;
        const buttonHeight = button.offsetHeight;
        
        // Устанавливаем размеры canvas
        canvas.width = buttonWidth;
        canvas.height = buttonHeight;
        
        // Конвертируем размер квадрата из rem в px
        const squareSizePx = remToPx(CONFIG.squareSize);
        
        // Рассчитываем количество квадратов
        const cols = Math.ceil(buttonWidth / squareSizePx);
        const rows = Math.ceil(buttonHeight / squareSizePx);
        
        // Создаем сетку квадратов
        grid = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                grid.push({
                    x: x * squareSizePx,
                    y: y * squareSizePx,
                    width: squareSizePx,
                    height: squareSizePx,
                    filled: Math.random() < CONFIG.initialFillRatio,
                    initialFilled: false,
                    progress: 0
                });
            }
        }
        
        // Сохраняем исходное состояние
        grid.forEach(square => {
            square.initialFilled = square.filled;
        });
        
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        grid.forEach(square => {
            if (square.filled || square.progress > 0) {
                ctx.fillStyle = CONFIG.fillColor;
                ctx.globalAlpha = square.filled ? 1 : square.progress;
                ctx.fillRect(square.x, square.y, square.width, square.height);
                ctx.globalAlpha = 1;
            }
        });
    }

    async function animateSquare(square, targetState, delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                const startTime = performance.now();
                
                function update(time) {
                    const elapsed = time - startTime;
                    const progress = Math.min(elapsed / CONFIG.animationDuration, 1);
                    
                    square.progress = targetState ? progress : 1 - progress;
                    draw();
                    
                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        square.filled = targetState;
                        square.progress = 0;
                        resolve();
                    }
                }
                
                requestAnimationFrame(update);
            }, delay);
        });
    }

    async function startHoverAnimation() {
        isHovered = true;
        const shuffledGrid = [...grid].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < shuffledGrid.length; i++) {
            if (!isHovered) break;
            const square = shuffledGrid[i];
            if (!square.filled) {
                await animateSquare(square, true, i * CONFIG.staggerDelay);
            }
        }
    }

    async function startLeaveAnimation() {
        isHovered = false;
        const shuffledGrid = [...grid].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < shuffledGrid.length; i++) {
            if (isHovered) break;
            const square = shuffledGrid[i];
            if (square.filled && !square.initialFilled) {
                await animateSquare(square, false, i * CONFIG.staggerDelay);
            }
        }
    }

    // Инициализация
    initCanvas();
    
    // Обработчики событий
    button.addEventListener('mouseenter', startHoverAnimation);
    button.addEventListener('mouseleave', startLeaveAnimation);
    
    // Обработчик ресайза
    window.addEventListener('resize', initCanvas);
});
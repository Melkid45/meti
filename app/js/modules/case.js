document.addEventListener('DOMContentLoaded', function() {
    // 1. Инициализация контроллера
    const controller = new ScrollMagic.Controller();
    const config = {
        delay: 0.2
    }
    if (width <= 750){
        config.delay = 0.5
    }
    console.log()
    // 2. Подготовка всех элементов
    const items = document.querySelectorAll('.case__soft .item');
    const canvasData = [];
    
    // Загружаем все изображения
    items.forEach((item, index) => {
        const canvas = item.querySelector('.grid-canvas-case');
        const img = item.querySelector('.media img');
        
        const newImg = new Image();
        newImg.onload = function() {
            const ctx = canvas.getContext('2d');
            canvas.width = newImg.naturalWidth;
            canvas.height = newImg.naturalHeight;
            
            // Начальное состояние - сильная пикселизация
            renderPixelated(canvas, ctx, newImg, 20);
            
            // Сохраняем данные для анимации
            canvasData.push({
                item: item,
                canvas: canvas,
                ctx: ctx,
                img: newImg,
                index: index
            });
            
            // Когда все изображения загружены - запускаем анимацию
            if (canvasData.length === items.length) {
                initScrollAnimation();
            }
        };
        newImg.src = img.src;
    });
    
    // 3. Инициализация анимации прокрутки
    function initScrollAnimation() {
        const sceneDuration = items.length * 150 + '%';
        
        // Создаем главную временную шкалу
        const masterTl = gsap.timeline();
        
        canvasData.forEach(data => {
            // Анимация для текущего элемента
            const itemTl = gsap.timeline()
                .fromTo(data.item, 
                    { y: 0, opacity: 1 },
                    { top: '-95%', opacity: 1, duration: width <= 750 ? 1.5 : 1 }
                )
                .to({size: 20}, {
                    size: 1,
                    duration: width <= 750 ? 0.8 : 0.6,// Увеличили длительность анимации пикселизации
                    ease: "power2.out",
                    onUpdate: function() {
                        renderPixelated(
                            data.canvas, 
                            data.ctx, 
                            data.img, 
                            this.targets()[0].size
                        );
                    }
                }, 0); // Начинаем пикселизацию почти сразу (раньше было 0.3)
            
            masterTl.add(itemTl, data.index * config.delay);
        });
        
        // 4. Создаем сцену ScrollMagic с измененным распределением анимации
        new ScrollMagic.Scene({
            triggerElement: ".case",
            triggerHook: "onLeave",
            duration: sceneDuration,
            offset: 0 // Сдвигаем начало анимации раньше
        })
        .setPin(".case")
        .setTween(masterTl)
        .addTo(controller);
    }
    
    // Функция рендеринга пиксельного эффекта
    function renderPixelated(canvas, ctx, img, pixelSize) {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (pixelSize <= 1) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            return;
        }
        
        const smallWidth = Math.floor(canvas.width / pixelSize);
        const smallHeight = Math.floor(canvas.height / pixelSize);
        
        ctx.drawImage(img, 0, 0, smallWidth, smallHeight);
        ctx.drawImage(
            canvas, 
            0, 0, smallWidth, smallHeight,
            0, 0, canvas.width, canvas.height
        );
    }
});
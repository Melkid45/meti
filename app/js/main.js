// cursor

gsap.set('.cursor', { xPercent: -50, yPercent: -50 });

// Анимация движения
$(document).mousemove(function (event) {
    gsap.to('.cursor', {
        x: event.clientX,
        y: event.clientY,
        duration: 0.1,
        ease: 'power1.out'
    });
});

$(document).on('mouseenter', 'a', function () {
    console.log($(this).attr('href'))
    let attr = $(this).attr('href')
    $('.default_text').fadeIn(200)
    if (attr.includes('tel')) {
        $('.default_text').text('Позвонить')
        $('.cursor .phone').css({
            scale: '1'
        });
        $('.cursor svg').not('.cursor .arrow').css({
            scale: 0
        })
    } else if (attr.includes('mail')) {
        $('.cursor .mail').css({
            scale: '1'
        });
        $('.cursor svg').not('.cursor .arrow').css({
            scale: 0
        })
        $('.default_text').text('Написать')
    } else {
        $('.default_text').text('Клик')
        $('.cursor .arrow').css({
            scale: '1'
        });
        $('.cursor svg').not('.cursor .arrow').css({
            scale: 0
        })
    }
}).on('mouseleave', 'a', function () {
    $('.cursor svg').css({
        scale: '0'
    });
    $('.default_text').fadeOut(200)
});
$(document).on({
    mouseleave: function () {
        $('.cursor svg').css('scale', '0');
        $('.default_text').fadeOut(200)
    },
    mousemove: function () {
        updateVideoCursor();
    },
    click: function (event) {
        event.preventDefault();
        toggleVideoPlayback();
    },
}, '.showreel');

const video = document.querySelector('.showreel__video'); // Кэшируем элемент

function toggleVideoPlayback() {
    if (!video) return;

    if (video.paused || video.ended) {
        video.play().catch(e => console.error('Video play error:', e));
    } else {
        video.pause();
    }
    updateVideoCursor();
}

function updateVideoCursor() {
    if (!video) return;

    const isPlaying = !video.paused && !video.ended;
    const $cursor = $('.cursor');

    $cursor.find('.pause').css('scale', isPlaying ? '1' : '0');
    $cursor.find('.play').css('scale', isPlaying ? '0' : '1');
    $('.default_text').fadeIn(200)
    $('.default_text').text(isPlaying ? 'Пауза' : 'воспроизвести')
}


function onEntry(entry) {
    entry.forEach(change => {
        if (change.isIntersecting) {
            change.target.classList.add('element-show');
        }
    });
}

let options = { threshold: [0.5] };
let observer = new IntersectionObserver(onEntry, options);
let elements = document.querySelectorAll('.element-animation');

for (let elm of elements) {
    observer.observe(elm);
}


let lastScrollTop = 0;
window.addEventListener('scroll', function () {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > lastScrollTop) {
        document.querySelector('.header').classList.add('back')
    } else {
        document.querySelector('.header').classList.remove('back')
    }
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});



document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        squareSize: 40,
        gap: 0,
        fillColor: '#000000',
        bgColor: '#F4F4F403',
        animationDuration: 2000
    };

    const canvas = document.getElementById('grid-canvas-begin');
    const ctx = canvas.getContext('2d');
    let grid = [];
    let shuffledIndices = [];
    let lastFilledCount = 0;

    // Инициализация сетки
    function initGrid() {
        const container = document.querySelector('.main');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const cols = Math.ceil(canvas.width / (CONFIG.squareSize + CONFIG.gap));
        const rows = Math.ceil(canvas.height / (CONFIG.squareSize + CONFIG.gap));

        // Создаем сетку
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

        // Перемешиваем индексы для случайного порядка заполнения
        shuffledIndices = [...Array(grid.length).keys()];
        shuffleArray(shuffledIndices);
        lastFilledCount = 0;

        draw();
    }

    // Функция для перемешивания массива
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // Отрисовка сетки
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        grid.forEach(square => {
            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(square.x, square.y, square.width, square.height);
        });
    }

    // Обновление состояния квадратов
    function updateGrid(filledCount) {
        // Сначала сбрасываем все квадраты
        if (filledCount < lastFilledCount) {
            for (let i = lastFilledCount - 1; i >= filledCount; i--) {
                if (i >= 0 && i < shuffledIndices.length) {
                    grid[shuffledIndices[i]].filled = false;
                }
            }
        }
        // Затем заполняем новые
        else {
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
        .setPin('.main')
        .on("progress", (e) => {
            const filledCount = Math.floor(e.progress * grid.length);
            updateGrid(filledCount);
        })
        .addTo(controller);

    initGrid();
    window.addEventListener('resize', () => {
        initGrid();
        controller.update();
    });
});

const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = '../images/dist/about.webp';

img.onload = function () {
    initCanvas();
    window.addEventListener('resize', initCanvas);

    // Создаем объект с параметрами анимации
    const pixelAnimation = { pixelSize: 20 };

    gsap.to(pixelAnimation, {
        scrollTrigger: {
            trigger: ".about",
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
        },
        pixelSize: 1,
        onUpdate: function () {
            // Передаем текущее значение pixelSize напрямую
            renderPixelated(pixelAnimation.pixelSize);
        }
    });
};

function initCanvas() {
    canvas.width = img.width;
    canvas.height = img.height;
    renderPixelated(20); // Передаем просто число
}

// Изменяем функцию чтобы она принимала просто значение
function renderPixelated(pixelSize) {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Временно уменьшаем изображение
    const smallWidth = Math.floor(canvas.width / pixelSize);
    const smallHeight = Math.floor(canvas.height / pixelSize);

    ctx.drawImage(img, 0, 0, smallWidth, smallHeight);
    // Увеличиваем обратно с пикселизацией
    ctx.drawImage(canvas, 0, 0, smallWidth, smallHeight,
        0, 0, canvas.width, canvas.height);
}



class DynamicGrid {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellPool = [];
        this.activeCells = [];
        this.mouse = { x: -1000, y: -1000 };
        this.lastMouse = { x: -1000, y: -1000 };
        this.velocity = { x: 0, y: 0 };

        this.settings = {
            baseSize: 60,
            sizeVariation: 0,
            spacing: 0,
            activationRadius: 120,
            fadeSpeed: 0.02,
            maxRotation: 0.0,
            rotationSpeed: 0,
            borderColor: { r: 244, g: 244, b: 244, a: 0.24 },
            fillColor: { r: 0, g: 0, b: 0, a: 0 }
        };

        this.resize();
        this.initPool();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.gridCols = Math.ceil(this.width / (this.settings.baseSize + this.settings.spacing));
        this.gridRows = Math.ceil(this.height / (this.settings.baseSize + this.settings.spacing));
    }

    initPool() {
        for (let y = 0; y < this.gridRows; y++) {
            for (let x = 0; x < this.gridCols; x++) {
                const size = this.settings.baseSize +
                    (Math.random() - 0.5) * this.settings.sizeVariation;

                this.cellPool.push({
                    x: x * (this.settings.baseSize + this.settings.spacing),
                    y: y * (this.settings.baseSize + this.settings.spacing),
                    width: size,
                    height: size,
                    rotation: (Math.random() - 0.5) * this.settings.maxRotation,
                    targetRotation: 0,
                    alpha: 0,
                    active: false,
                    lastActiveTime: 0,
                    borderWidth: 1
                });
            }
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        document.querySelector('.about').addEventListener('mousemove', (e) => {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            this.velocity.x = this.mouse.x - this.lastMouse.x;
            this.velocity.y = this.mouse.y - this.lastMouse.y;
        });

        document.querySelector('.about').addEventListener('mouseout', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    updateCells() {
        const now = performance.now();
        const activationRadiusSq = this.settings.activationRadius * this.settings.activationRadius;

        for (let cell of this.cellPool) {
            const dx = this.mouse.x - (cell.x + cell.width) + 30;
            const dy = this.mouse.y - (cell.y + cell.height) + 90;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < activationRadiusSq) {
                cell.active = true;
                cell.lastActiveTime = now;

                cell.targetRotation = Math.atan2(this.velocity.y, this.velocity.x) * 0.2;

                cell.alpha = Math.min(1);
            } else {
                if (cell.active && now - cell.lastActiveTime > 300) {
                    cell.active = false;
                }

                cell.alpha = Math.max(0, cell.alpha - this.settings.fadeSpeed);
                cell.targetRotation = 0;
            }

            cell.rotation += (cell.targetRotation - cell.rotation) * this.settings.rotationSpeed;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let cell of this.cellPool) {
            if (cell.alpha <= 0) continue;

            this.ctx.save();
            this.ctx.translate(
                cell.x + cell.width / 2,
                cell.y + cell.height / 2
            );
            this.ctx.rotate(cell.rotation);

            this.ctx.fillStyle = `rgba(${this.settings.fillColor.r}, ${this.settings.fillColor.g}, ${this.settings.fillColor.b}, ${this.settings.fillColor.a * cell.alpha})`;
            this.ctx.fillRect(
                -cell.width / 2,
                -cell.height / 2,
                cell.width,
                cell.height
            );

            this.ctx.strokeStyle = `rgba(${this.settings.borderColor.r}, ${this.settings.borderColor.g}, ${this.settings.borderColor.b}, ${this.settings.borderColor.a * cell.alpha})`;
            this.ctx.lineWidth = cell.borderWidth;
            this.ctx.strokeRect(
                -cell.width / 2,
                -cell.height / 2,
                cell.width,
                cell.height
            );

            this.ctx.restore();
        }
    }

    animate() {
        this.updateCells();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gridCanvas');
    const grid = new DynamicGrid(canvas);
});




// Конфигурация
const GRID_SIZE = 14;
const CELL_SIZE = 40;
const SHAPES = {
    heart: [[1, 6], [1, 5], [1, 4], [2, 3], [3, 2], [4, 2], [5, 3], [6, 4], [7, 4], [8, 3], [9, 2], [10, 2], [11, 3], [12, 4], [12, 5], [12, 6], [11, 7], [10, 8], [9, 9], [8, 10], [7, 11], [6, 11], [5, 10], [4, 9], [3, 8], [2, 7]],
    sound: [[6, 11], [5, 10], [4, 9], [3, 8], [2, 8], [1, 8], [1, 7], [1, 6], [1, 5], [2, 5], [3, 5], [4, 4], [5, 3], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [6, 10], [8, 9], [9, 9], [10, 8], [10, 7], [10, 6], [10, 5], [9, 4], [8, 4], [8, 11], [9, 11], [10, 11], [11, 10], [12, 9], [12, 8], [12, 7], [12, 6], [12, 5], [12, 4], [11, 3], [10, 2], [9, 2], [8, 2],],
    glass: [
        [6, 7], [6, 6], [7, 6], [7, 7], [0, 6], [0, 7], [1, 5], [2, 4], [3, 3], [4, 3], [5, 2], [6, 2],
        [7, 2], [8, 2], [9, 3], [10, 3], [11, 4], [12, 5], [13, 6], [13, 7], [12, 8], [11, 9], [10, 10],
        [9, 10], [8, 11], [7, 11], [6, 11], [5, 11], [4, 10], [3, 10], [2, 9], [1, 8]
    ],
    cmile: [[1, 8], [1, 7], [1, 6], [1, 5], [2, 4], [2, 3], [3, 2], [4, 2], [5, 1], [6, 1], [7, 1], [8, 1], [9, 2], [10, 2], [11, 3], [11, 4], [12, 5], [12, 6], [12, 7], [12, 8], [11, 9], [11, 10], [10, 11], [9, 11], [8, 12], [7, 12], [6, 12], [5, 12], [4, 11], [3, 11], [2, 10], [2, 9], [5, 6], [5, 5], [5, 4], [8, 6], [8, 5], [8, 4], [4, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 8],],
    kind: [[8, 1], [7, 1], [6, 1], [5, 1], [4, 2], [3, 2], [2, 3], [2, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 9], [2, 10], [3, 11], [4, 11], [5, 12], [6, 12], [7, 12], [8, 12], [9, 11], [10, 11], [11, 10], [11, 9], [12, 8], [12, 7], [12, 6], [12, 5], [10, 2], [10, 3], [11, 3], [9, 4], [8, 5], [7, 6], [6, 6], [6, 7], [7, 7], [6, 4], [5, 4], [4, 5], [4, 6], [4, 7], [4, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 8], [9, 7]],
    creative: [[8, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [6, 8], [5, 7], [5, 6], [5, 5], [4, 5], [6, 5], [4, 8], [3, 7], [3, 6], [3, 5], [3, 4], [2, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 12], [6, 12], [7, 12], [8, 11], [9, 11], [10, 10], [11, 9], [11, 8], [12, 7], [12, 6], [12, 5], [11, 5], [10, 6], [9, 6], [9, 7], [9, 5], [9, 4], [9, 3], [9, 2],],
    camera: [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8], [8, 9], [8, 10], [8, 11], [7, 11], [6, 11], [5, 11], [4, 11], [3, 11], [2, 11], [1, 11], [1, 10], [1, 9], [1, 8], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [9, 5], [10, 4], [11, 3], [12, 2], [12, 3], [12, 4], [12, 5], [12, 6], [12, 7], [12, 8], [12, 9], [12, 10], [12, 11], [11, 10], [10, 9], [9, 8]],
    photo: [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [12, 4], [12, 5], [12, 6], [12, 7], [12, 8], [12, 9], [12, 10], [12, 11], [11, 11], [10, 11], [9, 11], [8, 11], [7, 11], [6, 11], [5, 11], [4, 11], [3, 11], [2, 11], [1, 11], [1, 10], [1, 9], [1, 8], [1, 7], [1, 6], [1, 5], [1, 4], [3, 2], [4, 2], [8, 6], [9, 6], [10, 7], [10, 8], [9, 9], [8, 9], [7, 8], [7, 7]],
    arrow: [[1, 12], [1, 11], [1, 10], [2, 9], [3, 8], [4, 7], [5, 6], [6, 5], [7, 4], [8, 3], [9, 2], [10, 1], [12, 1], [11, 0], [13, 2], [12, 3], [11, 4], [10, 5], [9, 6], [8, 7], [7, 8], [6, 9], [5, 10], [4, 11], [3, 12], [2, 12], [3, 10], [10, 3],]
};

const TITLES = [
    "Спецпроекты",
    "Smm",
    "Аналитика",
    "influence marketing",
    "Стратегии",
    "Креатив",
    "видео-продакшн",
    "фото-продакшн",
    "дизайн и брендинг"
];

const svg = document.getElementById('interactive-grid');
const colors = ["#442CBF"];

for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
        const cell = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        cell.setAttribute('x', x * CELL_SIZE);
        cell.setAttribute('y', y * CELL_SIZE);
        cell.setAttribute('width', CELL_SIZE);
        cell.setAttribute('height', CELL_SIZE);
        cell.setAttribute('stroke', '#272727');
        cell.setAttribute('fill', 'transparent');
        cell.classList.add('cell');

        Object.keys(SHAPES).forEach(shape => {
            if (SHAPES[shape].some(pos => pos[0] === x && pos[1] === y)) {
                cell.dataset[shape] = 'true';
            }
        });

        svg.appendChild(cell);
    }
}

const titlesContainer = document.querySelector('.services__body-block-titles');
const titles = Array.from(titlesContainer.querySelectorAll('h3'));
const descContainer = document.querySelector('.services__body-block-desc');
const desc = Array.from(descContainer.querySelectorAll('p'));
gsap.set(titles, { opacity: 0, display: 'none' });
gsap.set(desc, { opacity: 0, display: 'none' });
gsap.ticker.lagSmoothing(0);
ScrollTrigger.normalizeScroll(true);
const masterTL = gsap.timeline({
    scrollTrigger: {
        trigger: ".services",
        start: "top -5.5%",
        end: "+=1000%", // Уменьшенное значение
        scrub: 0.5, // Более быстрый отклик
        pin: true,
        onEnter: () => masterTL.play(),
        onLeave: () => masterTL.progress(1),
        onEnterBack: () => masterTL.play(),
        onLeaveBack: () => masterTL.progress(0),
        fastScrollEnd: true // Специальная опция для быстрого скролла
    }
});
if (masterTL.scrollTrigger) {  // Добавьте проверку
    const st = ScrollTrigger.getById(masterTL.scrollTrigger.id);
    if (st && st.progress > 0.9) masterTL.progress(1);
}
let lastScrollTime = 0;
window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastScrollTime < 50 && masterTL.scrollTrigger) { // Проверяем наличие scrollTrigger
        const st = ScrollTrigger.getById(masterTL.scrollTrigger.id);
        if (st && st.progress > 0.9) masterTL.progress(1); // Проверяем st
        if (st && st.progress < 0.1) masterTL.progress(0);
    }
    lastScrollTime = now;
});
const numberElement = document.getElementById('number');

Object.keys(SHAPES).forEach((shape, index) => {
    const shapeCells = gsap.utils.toArray(`[data-${shape}="true"]`);
    const currentTitle = titles[index];
    const prevTitle = titles[index - 1];
    const currentDesc = desc[index];
    const prevDesc = desc[index - 1];
    masterTL.to(".cell", {
        fill: 'transparent',
        duration: 0.2,
        ease: "power2.inOut"
    }, `shape-${index}-start`);

    // masterTL.to(".cell", {
    //     fill: () => gsap.utils.random(["#442CBF"]),
    //     duration: 0.3,
    //     stagger: {
    //         each: 0.03,
    //         from: "random",
    //         repeat: 3,
    //         yoyo: true
    //     },
    //     onComplete: function () {
    //         gsap.set(".cell", { fill: 'transparent' });
    //     }
    // }, ">0.3");

    if (prevTitle && prevDesc) {
        masterTL.to([prevTitle, prevDesc], {
            opacity: 0,
            display: 'none',
            duration: 0.3,
            ease: "power2.in"
        }, ">0.1");
    }
    masterTL.call(() => {
        const currentNumber = (index + 1).toString().padStart(2, '0');
        gsap.fromTo(numberElement,
            { y: -10, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.5,
                innerText: currentNumber,
                snap: { innerText: 1 },
                ease: "back.out(1.2)",
                modifiers: {
                    innerText: function (innerText) {
                        return parseInt(innerText).toString().padStart(2, '0');
                    }
                }
            }
        );
    }, null, ">0.1");
    masterTL.to(currentTitle, {
        opacity: 1,
        display: 'block',
        duration: 0.5,
        ease: "power2.out"
    }, "<");
    masterTL.to(currentDesc, {
        opacity: 1,
        display: 'block',
        duration: 0.5,
        ease: "power2.out"
    }, "<");
    masterTL.to(shapeCells, {
        fill: '#442CBF',
        duration: 1.2,
        ease: "back.out(1.2)",
        stagger: {
            each: 0.05,
            from: "center"
        }
    }, ">0.3");

    masterTL.to({}, { duration: 0.5 }, ">");
});


masterTL.eventCallback("onComplete", () => {
    masterTL.progress(0).pause();
    ScrollTrigger.refresh();
});


document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        squareSize: 40,
        gap: 0,
        fillColor: '#F4F4F403',
        bgColor: '#000000',
        batchSize: 50,
        fillSpeed: 0.5
    };

    // Initialize ScrollMagic controller
    const controller = new ScrollMagic.Controller();

    const canvas = document.getElementById('grid-canvas-video');
    const ctx = canvas.getContext('2d');
    let grid = [];
    let shuffledIndices = [];
    let lastProgress = 0;
    let filledCount = 0;

    function initGrid() {
        const container = document.querySelector('.showreel');
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

    function updateGrid(progress) {
        const targetFilled = Math.floor(progress * grid.length * 2); // Multiply by 2 for two phases

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
    }

    // Create ScrollMagic scene
    new ScrollMagic.Scene({
        triggerElement: ".showreel",
        duration: "400%",
        triggerHook: 0
    })
        .setPin(".showreel")
        .on("progress", function (event) {
            updateGrid(event.progress);
        })
        .addTo(controller)
    initGrid();
    window.addEventListener('resize', () => {
        initGrid();
        controller.update();
    });
});


// Case


gsap.ticker.lagSmoothing(0);
ScrollTrigger.normalizeScroll(true);


document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем контроллер ScrollMagic
    const controller = new ScrollMagic.Controller();

    // Создаем GSAP анимацию
    const caseTween = gsap.fromTo('.case__soft',
        { y: '150%' },
        {
            y: '-350%',
            ease: Linear.easeNone
        }
    );

    // Создаем сцену ScrollMagic
    new ScrollMagic.Scene({
        triggerElement: '.case',
        triggerHook: 0,
        duration: '400%',
        offset: 0
    })
        .setTween(caseTween)
        .setPin('.case')
        .addTo(controller);
});



// Feedback



document.addEventListener('DOMContentLoaded', () => {
    const FEEDBACK_CONFIG = {
        squareSize: 40,
        gap: 0,
        fillColor: '#442CBF',
        bgColor: '#000000',
        animationDuration: 2000,
        maxSpeed: 0.1 // Максимальное изменение progress за кадр
    };

    const feedbackCanvas = document.getElementById('feedback-grid-canvas');
    const feedbackCtx = feedbackCanvas.getContext('2d');
    let feedbackGrid = [];
    let feedbackShuffledIndices = [];
    let feedbackTargetFilled = 0;
    let feedbackCurrentFilled = 0;
    let feedbackLastTime = 0;
    let feedbackLastProgress = 0;
    let feedbackAnimationId = null;

    function initFeedbackGrid() {
        const container = document.querySelector('.feedback__top');
        feedbackCanvas.width = container.clientWidth;
        feedbackCanvas.height = container.clientHeight;

        const cols = Math.floor(feedbackCanvas.width / (FEEDBACK_CONFIG.squareSize + FEEDBACK_CONFIG.gap));
        const rows = Math.floor(feedbackCanvas.height / (FEEDBACK_CONFIG.squareSize + FEEDBACK_CONFIG.gap));

        feedbackGrid = Array(cols * rows).fill().map((_, i) => ({
            x: (i % cols) * (FEEDBACK_CONFIG.squareSize + FEEDBACK_CONFIG.gap),
            y: Math.floor(i / cols) * (FEEDBACK_CONFIG.squareSize + FEEDBACK_CONFIG.gap),
            width: FEEDBACK_CONFIG.squareSize,
            height: FEEDBACK_CONFIG.squareSize,
            filled: false
        }));

        // Перемешиваем индексы для случайного заполнения
        feedbackShuffledIndices = [...Array(feedbackGrid.length).keys()];
        for (let i = feedbackShuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [feedbackShuffledIndices[i], feedbackShuffledIndices[j]] = [feedbackShuffledIndices[j], feedbackShuffledIndices[i]];
        }

        feedbackTargetFilled = 0;
        feedbackCurrentFilled = 0;
        drawFeedbackGrid();
    }

    function drawFeedbackGrid() {
        feedbackCtx.clearRect(0, 0, feedbackCanvas.width, feedbackCanvas.height);
        feedbackGrid.forEach(square => {
            feedbackCtx.fillStyle = square.filled ? FEEDBACK_CONFIG.fillColor : FEEDBACK_CONFIG.bgColor;
            feedbackCtx.fillRect(square.x, square.y, square.width, square.height);
        });
    }

    function updateFeedbackGrid() {
        // Очищаем или заполняем квадраты до нужного количества
        if (feedbackCurrentFilled < feedbackTargetFilled) {
            const toFill = Math.min(feedbackTargetFilled - feedbackCurrentFilled, 50);
            for (let i = 0; i < toFill; i++) {
                const idx = feedbackShuffledIndices[feedbackCurrentFilled + i];
                feedbackGrid[idx].filled = true;
            }
            feedbackCurrentFilled += toFill;
        }
        else if (feedbackCurrentFilled > feedbackTargetFilled) {
            const toClear = Math.min(feedbackCurrentFilled - feedbackTargetFilled, 50);
            for (let i = 0; i < toClear; i++) {
                const idx = feedbackShuffledIndices[feedbackCurrentFilled - i - 1];
                feedbackGrid[idx].filled = false;
            }
            feedbackCurrentFilled -= toClear;
        }

        drawFeedbackGrid();

        if (feedbackCurrentFilled !== feedbackTargetFilled) {
            feedbackAnimationId = requestAnimationFrame(updateFeedbackGrid);
        } else {
            feedbackAnimationId = null;
        }
    }

    const feedbackController = new ScrollMagic.Controller();

    new ScrollMagic.Scene({
        triggerElement: ".feedback__top",
        duration: FEEDBACK_CONFIG.animationDuration,
        triggerHook: 0,
    })
        .setPin('.feedback__top')
        .on("progress", (e) => {
            const now = performance.now();
            const deltaTime = now - feedbackLastTime;
            feedbackLastTime = now;

            // Ограничение скорости изменения
            const deltaProgress = e.progress - feedbackLastProgress;
            const speed = deltaTime > 0 ? Math.abs(deltaProgress) / (deltaTime / 1000) : 0;
            feedbackLastProgress = e.progress;

            const safeProgress = speed > FEEDBACK_CONFIG.maxSpeed * 1000
                ? feedbackLastProgress + Math.sign(deltaProgress) * FEEDBACK_CONFIG.maxSpeed * (deltaTime / 1000)
                : e.progress;

            feedbackTargetFilled = Math.floor(safeProgress * feedbackGrid.length);

            if (!feedbackAnimationId) {
                feedbackAnimationId = requestAnimationFrame(updateFeedbackGrid);
            }
        })
        .addTo(feedbackController);

    // Инициализация
    initFeedbackGrid();

    // Оптимизированный ресайз
    const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(feedbackAnimationId);
        feedbackAnimationId = null;
        initFeedbackGrid();
        feedbackController.update();
    });
    resizeObserver.observe(document.querySelector('.feedback__top'));

    // Очистка
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(feedbackAnimationId);
        resizeObserver.disconnect();
    });
});


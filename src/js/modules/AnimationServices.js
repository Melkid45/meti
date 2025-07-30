import { gsap, ScrollTrigger } from './ScrollTriggerInit.js';

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

const titlesContainer = document.querySelector('.services__list-titles');
const titles = Array.from(titlesContainer.querySelectorAll('h3'));
const descContainer = document.querySelector('.services__list-desc');
const desc = Array.from(descContainer.querySelectorAll('p'));
gsap.set(titles, { opacity: 0, display: 'none' });
gsap.set(desc, { opacity: 0, display: 'none' });
const masterTL = gsap.timeline({
    scrollTrigger: {
        trigger: ".services__list",
        start: "top top",
        end: "+=1200%",
        scrub: 1,
        pin: true,
        markers: true
    }
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

    masterTL.to(".cell", {
        fill: () => gsap.utils.random(["#442CBF"]),
        duration: 0.3,
        stagger: {
            each: 0.03,
            from: "random",
            repeat: 3,
            yoyo: true
        },
        onComplete: function () {
            gsap.set(".cell", { fill: 'transparent' });
        }
    }, ">0.3");

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
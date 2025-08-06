(function ($) {
    $.fn.shuffleLetters = function (prop) {
        var options = $.extend({
            "step": 8,
            "fps": 25,
            "text": "",
            "callback": function () { }
        }, prop);
        function getTextNodes(node) {
            var textNodes = [];
            for (var i = 0; i < node.childNodes.length; i++) {
                var child = node.childNodes[i];
                if (child.nodeType === 3) {
                    textNodes.push(child);
                } else if (child.nodeType === 1) {
                    textNodes = textNodes.concat(getTextNodes(child));
                }
            }
            return textNodes;
        }
        function charType(ch) {
            if (ch === " ") return "space";
            if (/[a-z]/.test(ch)) return "lowerLetter";
            if (/[A-Z]/.test(ch)) return "upperLetter";
            if (/[А-ЯЁ]/.test(ch)) return "rusupperLetter";
            if (/[а-яё]/.test(ch)) return "ruslowerLetter";
            return "symbol";
        }
        function randomChar(type) {
            var pool = "";

            if (type == "lowerLetter") {
                pool = "abcdefghijklmnopqrstuvwxyz0123456789";
            } else if (type == "upperLetter") {
                pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            } else if (type == "rusupperLetter") {
                pool = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
            } else if (type == "ruslowerLetter") {
                pool = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
            } else if (type == "symbol") {
                pool = ",.?/\\(^)![]{}*&^%$#'\"";
            }

            var arr = pool.split('');
            return arr[Math.floor(Math.random() * arr.length)];
        }

        return this.each(function () {
            var el = $(this);

            if (el.data('animated')) {
                return true;
            }
            el.data('animated', true);
            var originalHtml = el.html();
            el.data('originalHtml', originalHtml);
            if (!el.find('.shuffle-wrapper').length) {
                el.html('<span class="shuffle-wrapper">' + originalHtml + '</span>');
            }

            var wrapper = el.find('.shuffle-wrapper')[0];
            var textNodes = getTextNodes(wrapper);
            var allChars = [];
            textNodes.forEach((node) => {
                for (var i = 0; i < node.textContent.length; i++) {
                    allChars.push({
                        node: node,
                        index: i,
                        char: node.textContent[i],
                        type: charType(node.textContent[i])
                    });
                }
            });
            var letters = allChars.reduce((acc, c, idx) => {
                if (c.type !== "space") acc.push(idx);
                return acc;
            }, []);

            (function shuffle(start) {
                if (start > letters.length) {
                    el.data('animated', false);
                    el.html(originalHtml);
                    options.callback(el);
                    return;
                }
                var newTexts = textNodes.map(tn => tn.textContent.split(''));
                for (var i = Math.max(start, 0); i < letters.length; i++) {
                    var charInfo = allChars[letters[i]];
                    if (i < start + options.step) {
                        newTexts[textNodes.indexOf(charInfo.node)][charInfo.index] = randomChar(charInfo.type);
                    } else {
                        newTexts[textNodes.indexOf(charInfo.node)][charInfo.index] = '';
                    }
                }
                textNodes.forEach((tn, i) => {
                    tn.textContent = newTexts[i].join('');
                });

                setTimeout(function () {
                    shuffle(start + 1);
                }, 1000 / options.fps);
            })(-options.step);
        });
    };
})(jQuery);


$(function () {
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

    const svg = document.getElementById('interactive-grid');
    const colors = ["#442CBF"];

    // Создаем сетку SVG
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
                    cell.setAttribute(`data-${shape}`, 'true');
                }
            });

            svg.appendChild(cell);
        }
    }
    const titlesContainer = document.querySelector('.services__body-block-titles');
    const titles = Array.from(titlesContainer.querySelectorAll('h3'));
    const descContainer = document.querySelector('.services__body-block-desc');
    const desc = Array.from(descContainer.querySelectorAll('p'));
    titles.forEach(title => {
        title.dataset.originalHtml = title.innerHTML;
    });

    gsap.set(titles, { autoAlpha: 0 });
    gsap.set(desc, { autoAlpha: 0 });

    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.normalizeScroll(true);

    const SCENE_DURATION = 3.2;

    const masterTL = gsap.timeline({
        scrollTrigger: {
            id: "services-scroll",
            trigger: ".services",
            start: "top -5.5%",
            end: `+=${Object.keys(SHAPES).length * SCENE_DURATION * 800}`,
            scrub: 1,
            pin: true,
            onEnter: () => masterTL.play(),
            onLeave: () => masterTL.pause(),
            onEnterBack: () => masterTL.play(),
            onLeaveBack: () => masterTL.pause(),
            fastScrollEnd: true,
            preventOverlaps: true,
        }
    });

    let currentActiveIndex = -1;
    const numberElement = document.getElementById('number');

    Object.keys(SHAPES).forEach((shape, index) => {
        const shapeCells = gsap.utils.toArray(`[data-${shape}="true"]`);
        const currentTitle = titles[index];
        const prevTitle = titles[index - 1];
        const currentDesc = desc[index];
        const prevDesc = desc[index - 1];
        const label = `scene-${index}`;

        masterTL.addLabel(label);
        masterTL.set(shapeCells, { fill: 'transparent' }, label);
        if (prevTitle && prevDesc) {
            masterTL.to([prevTitle, prevDesc], {
                autoAlpha: 0,
                duration: 0.2,
                ease: 'power1.inOut'
            }, label);
        }
        masterTL.call(() => {
            numberElement.innerText = (index + 1).toString().padStart(2, '0');
        }, null, `${label}+=0`);
        masterTL.fromTo(numberElement,
            { y: -10, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
            label);
        masterTL.to(currentDesc, {
            autoAlpha: 1,
            duration: 0.3
        }, `>`);
        masterTL.to(currentTitle, {
            autoAlpha: 1,
            duration: 0.4,
            ease: 'power2.out',
            onStart: () => {
                if (currentActiveIndex !== index) {
                    currentActiveIndex = index;
                    $(currentTitle).shuffleLetters({
                        step: 5,
                        fps: 45,
                        text: currentTitle.textContent
                    });
                }
            }
        }, `${label}+=0.4`);

        masterTL.to(shapeCells, {
            fill: colors[0],
            duration: 0.6,
            ease: 'power2.out',
            stagger: {
                each: 0.025,
                from: 'edges',
                grid: [GRID_SIZE, GRID_SIZE],
            }
        }, `${label}+=0.5`);
        masterTL.to(shapeCells, {
            fill: 'transparent',
            duration: 0.2,
            ease: 'power2.in',
            stagger: {
                each: 0.02,
                from: 'center'
            }
        }, `${label}+=2.0`); 
        masterTL.addPause(`${label}+=${SCENE_DURATION}`);
    });

});

$.fn.shuffleLetters = function (options) {
    const settings = $.extend({
      step: 8,
      fps: 60,
      text: "",
      duration: 1000,
      symbols: "!<>-_[]{}—=+*^?#%$@",
      symbolsProbability: 1,
      callback: function () { }
    }, options);

    function getTextNodes(element) {
      let textNodes = [];
      for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];
        if (node.nodeType === 3) {
          textNodes.push(node);
        } else if (node.nodeType === 1) {
          textNodes = textNodes.concat(getTextNodes(node));
        }
      }
      return textNodes;
    }

    function getCharType(char) {
      if (char === " ") return "space";
      if (/[a-z]/.test(char)) return "lowerLetter";
      if (/[A-Z]/.test(char)) return "upperLetter";
      if (/[А-ЯЁ]/.test(char)) return "rusUpperLetter";
      if (/[а-яё]/.test(char)) return "rusLowerLetter";
      return "symbol";
    }

    function getRandomChar(targetType, allChars, useSymbol) {
      if (useSymbol && Math.random() < settings.symbolsProbability && settings.symbols.length > 0) {
        return settings.symbols[Math.floor(Math.random() * settings.symbols.length)];
      }
      let matchingChars = allChars.filter(char => getCharType(char) === targetType);
      if (matchingChars.length === 0) {
        matchingChars = allChars.filter(char => {
          if (targetType === "rusUpperLetter" || targetType === "rusLowerLetter") {
            return /[А-Яа-яЁё]/.test(char);
          } else if (targetType === "upperLetter" || targetType === "lowerLetter") {
            return /[A-Za-z]/.test(char);
          }
          return getCharType(char) === "symbol";
        });
      }
      return matchingChars.length > 0 ? matchingChars[Math.floor(Math.random() * matchingChars.length)] : "";
    }

    return this.each(function () {
      const $element = $(this);
      if ($element.data("animated")) return;
      $element.data("animated", true);

      const originalHtml = $element.html();
      $element.data("originalHtml", originalHtml);

      if (!$element.find(".shuffle-wrapper").length) {
        $element.html('<span class="shuffle-wrapper">' + originalHtml + '</span>');
      }

      const textNodes = getTextNodes($element.find(".shuffle-wrapper")[0]);
      const allChars = [];
      textNodes.forEach(node => {
        allChars.push(...node.textContent.split(""));
      });

      const charInfo = [];
      textNodes.forEach(node => {
        const chars = node.textContent.split("");
        chars.forEach((char, index) => {
          charInfo.push({
            node: node,
            index: index,
            char: char,
            type: getCharType(char)
          });
        });
      });

      const nonSpaceIndices = charInfo.reduce((indices, info, index) => {
        if (info.type !== "space") indices.push(index);
        return indices;
      }, []);

      let startTime = null;
      const frameDuration = 1000 / settings.fps;
      let lastFrameTime = 0;

      function animate(currentTime) {
        if (!startTime) startTime = currentTime;
        if (currentTime - lastFrameTime < frameDuration) {
          requestAnimationFrame(animate);
          return;
        }

        lastFrameTime = currentTime;
        const progress = Math.min((currentTime - startTime) / settings.duration, 1);
        const newTexts = textNodes.map(node => node.textContent.split(""));
        const charsToAnimate = Math.floor(progress * nonSpaceIndices.length);
        const useSymbols = Math.random() < settings.symbolsProbability * (1 - progress);

        nonSpaceIndices.forEach((charIndex, i) => {
          const info = charInfo[charIndex];
          const nodeIndex = textNodes.indexOf(info.node);

          if (i < charsToAnimate) {
            if (progress > 0.95 || Math.random() > 0.3) {
              newTexts[nodeIndex][info.index] = info.char;
            } else {
              newTexts[nodeIndex][info.index] = getRandomChar(info.type, allChars, useSymbols);
            }
          } else {
            newTexts[nodeIndex][info.index] = getRandomChar(info.type, allChars, true);
          }
        });

        textNodes.forEach((node, i) => {
          node.textContent = newTexts[i].join("");
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          $element.data("animated", false);
          $element.html(originalHtml);
          settings.callback($element);
        }
      }

      requestAnimationFrame(animate);
    });
  };

  /***********************
   * GRID + SHAPES + ScrollTrigger
   ***********************/
  (function () {
    gsap.registerPlugin(ScrollTrigger);

    const GRID_SIZE = 14;
    const CELL_SIZE = 40; // px
    const colors = ["#442CBF"];

    const SHAPES = {
      heart: [[1, 6], [1, 5], [1, 4], [2, 3], [3, 2], [4, 2], [5, 3], [6, 4], [7, 4], [8, 3], [9, 2], [10, 2], [11, 3], [12, 4], [12, 5], [12, 6], [11, 7], [10, 8], [9, 9], [8, 10], [7, 11], [6, 11], [5, 10], [4, 9], [3, 8], [2, 7]],
      sound: [[6, 11], [5, 10], [4, 9], [3, 8], [2, 8], [1, 8], [1, 7], [1, 6], [1, 5], [2, 5], [3, 5], [4, 4], [5, 3], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [6, 10], [8, 9], [9, 9], [10, 8], [10, 7], [10, 6], [10, 5], [9, 4], [8, 4], [8, 11], [9, 11], [10, 11], [11, 10], [12, 9], [12, 8], [12, 7], [12, 6], [12, 5], [12, 4], [11, 3], [10, 2], [9, 2], [8, 2]],
      glass: [
        [6, 7], [6, 6], [7, 6], [7, 7], [0, 6], [0, 7], [1, 5], [2, 4], [3, 3], [4, 3], [5, 2], [6, 2],
        [7, 2], [8, 2], [9, 3], [10, 3], [11, 4], [12, 5], [13, 6], [13, 7], [12, 8], [11, 9], [10, 10],
        [9, 10], [8, 11], [7, 11], [6, 11], [5, 11], [4, 10], [3, 10], [2, 9], [1, 8]
      ],
      cmile: [[1, 8], [1, 7], [1, 6], [1, 5], [2, 4], [2, 3], [3, 2], [4, 2], [5, 1], [6, 1], [7, 1], [8, 1], [9, 2], [10, 2], [11, 3], [11, 4], [12, 5], [12, 6], [12, 7], [12, 8], [11, 9], [11, 10], [10, 11], [9, 11], [8, 12], [7, 12], [6, 12], [5, 12], [4, 11], [3, 11], [2, 10], [2, 9], [5, 6], [5, 5], [5, 4], [8, 6], [8, 5], [8, 4], [4, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 8]],
      kind: [[8, 1], [7, 1], [6, 1], [5, 1], [4, 2], [3, 2], [2, 3], [2, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 9], [2, 10], [3, 11], [4, 11], [5, 12], [6, 12], [7, 12], [8, 12], [9, 11], [10, 11], [11, 10], [11, 9], [12, 8], [12, 7], [12, 6], [12, 5], [10, 2], [10, 3], [11, 3], [9, 4], [8, 5], [7, 6], [6, 6], [6, 7], [7, 7], [6, 4], [5, 4], [4, 5], [4, 6], [4, 7], [4, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 8], [9, 7]],
      creative: [[8, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [6, 8], [5, 7], [5, 6], [5, 5], [4, 5], [6, 5], [4, 8], [3, 7], [3, 6], [3, 5], [3, 4], [2, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 12], [6, 12], [7, 12], [8, 11], [9, 11], [10, 10], [11, 9], [11, 8], [12, 7], [12, 6], [12, 5], [11, 5], [10, 6], [9, 6], [9, 7], [9, 5], [9, 4], [9, 3], [9, 2]],
      camera: [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8], [8, 9], [8, 10], [8, 11], [7, 11], [6, 11], [5, 11], [4, 11], [3, 11], [2, 11], [1, 11], [1, 10], [1, 9], [1, 8], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [9, 5], [10, 4], [11, 3], [12, 2], [12, 3], [12, 4], [12, 5], [12, 6], [12, 7], [12, 8], [12, 9], [12, 10], [12, 11], [11, 10], [10, 9], [9, 8]],
      photo: [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [12, 4], [12, 5], [12, 6], [12, 7], [12, 8], [12, 9], [12, 10], [12, 11], [11, 11], [10, 11], [9, 11], [8, 11], [7, 11], [6, 11], [5, 11], [4, 11], [3, 11], [2, 11], [1, 11], [1, 10], [1, 9], [1, 8], [1, 7], [1, 6], [1, 5], [1, 4], [3, 2], [4, 2], [8, 6], [9, 6], [10, 7], [10, 8], [9, 9], [8, 9], [7, 8], [7, 7]],
      arrow: [[1, 12], [1, 11], [1, 10], [2, 9], [3, 8], [4, 7], [5, 6], [6, 5], [7, 4], [8, 3], [9, 2], [10, 1], [12, 1], [11, 0], [13, 2], [12, 3], [11, 4], [10, 5], [9, 6], [8, 7], [7, 8], [6, 9], [5, 10], [4, 11], [3, 12], [2, 12], [3, 10], [10, 3]]
    };

    const svg = document.getElementById('interactive-grid');

    // Создаём сетку клеток и запоминаем в 2D массиве cellsGrid[y][x]
    const cellsGrid = [];
    const allCells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      cellsGrid[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute('x', x * CELL_SIZE);
        rect.setAttribute('y', y * CELL_SIZE);
        rect.setAttribute('width', CELL_SIZE);
        rect.setAttribute('height', CELL_SIZE);
        rect.setAttribute('stroke', '#272727');
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('fill', 'transparent');
        rect.classList.add('cell');
        rect.dataset.x = x;
        rect.dataset.y = y;
        svg.appendChild(rect);
        cellsGrid[y][x] = rect;
        allCells.push(rect);
      }
    }

    // Установим viewBox размеры в зависимости от GRID_SIZE и CELL_SIZE (на случай, если поменяешь)
    svg.setAttribute('viewBox', `0 0 ${GRID_SIZE * CELL_SIZE} ${GRID_SIZE * CELL_SIZE}`);
    svg.setAttribute('width', GRID_SIZE * CELL_SIZE);
    svg.setAttribute('height', GRID_SIZE * CELL_SIZE);

    // Заполним правую колонку элементами, соответствующими SHAPES
    const itemsLine = document.querySelector('.items__line');
    const shapeNames = Object.keys(SHAPES);

    // Подготовим элементы и размеры для корректного перемещения itemsLine
    const wrapper = document.querySelector('.wrapper');
    const items = document.querySelectorAll('.items__line .item');
    const $titles = $('.items__line .item h3');

    function layoutItems() {
      const wrapperH = wrapper.clientHeight;
      // высота всей полосы = кол-во элементов * высота обёртки
      itemsLine.style.height = (shapeNames.length * wrapperH) + 'px';
      items.forEach(it => it.style.height = wrapperH + 'px');
      itemsLine.style.top = '0px';
    }
    layoutItems();
    window.addEventListener('resize', () => {
      layoutItems();
    });

    // Функция — отрисовать фигуру по имени (чисто и с нормальным stagger)
    let lastTargetCells = [];
    function drawShape(shapeName) {
      const coords = SHAPES[shapeName];
      if (!coords) return;
      // build array of DOM nodes
      const targetCells = coords.map(([x,y]) => {
        if (cellsGrid[y] && cellsGrid[y][x]) return cellsGrid[y][x];
        return null;
      }).filter(Boolean);

      // прекращаем текущие твины и очищаем заливку всех клеток
      gsap.killTweensOf(allCells);
      gsap.set(allCells, { attr: { fill: 'transparent' } });

      if (targetCells.length === 0) return;

      // анимируем нужные клетки единым вызовом (stagger отрабатывает корректно)
      gsap.to(targetCells, {
        attr: { fill: colors[0] },
        duration: 0.55,
        ease: 'power2.out',
        stagger: {
          each: 0.03,
          from: 'center',
          grid: [GRID_SIZE, GRID_SIZE]
        }
      });

      lastTargetCells = targetCells;
    }

    // Показ первой фигуры
    drawShape(shapeNames[0]);

    // ScrollTrigger: пинит .services__new и обновляет положение itemsLine
    let currentActiveIndex = 0;
    ScrollTrigger.create({
      trigger: ".services__new",
      start: "top top",
      end: `+=${shapeNames.length * 100}%`, // длинная зона прокрутки внутри блока
      pin: true,
      scrub: 1,
      onUpdate: self => {
        const progress = self.progress; // 0..1
        const wrapperH = wrapper.clientHeight;
        // Перемещаем itemsLine вертикально в px
        const maxTranslate = (shapeNames.length - 1) * wrapperH;
        const topPx = -progress * maxTranslate;
        gsap.set(itemsLine, { y: topPx });

        // Определяем активный индекс (round)
        const activeIndex = Math.max(0, Math.min(shapeNames.length - 1, Math.round(progress * (shapeNames.length - 1))));
        if (activeIndex !== currentActiveIndex) {
          currentActiveIndex = activeIndex;
          const shapeName = shapeNames[activeIndex];
          drawShape(shapeName);

          // shuffle title
          $titles.eq(activeIndex).shuffleLetters({
            step: 5, fps: 60, text: $titles.eq(activeIndex).text(), duration: 700
          });
        }
      }
    });

  })();
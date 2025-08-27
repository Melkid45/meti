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

const isFullEffect = window.innerWidth > 750;
const timeOutShape = isFullEffect ? 400 : 200;
(function () {
  gsap.registerPlugin(ScrollTrigger);

  const GRID_SIZE = 14;
  const CELL_SIZE_REM = 54;
  const LINE_WIDTH_REM = 1;
  const REM = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const CELL_SIZE = CELL_SIZE_REM * REM;
  const LINE_WIDTH = LINE_WIDTH_REM * REM;
  const LINE_COLOR = '#272727';
  const colors = ["#442CBF"];
  const ANIMATION_SETTINGS = { startOffset: 0.16, endOffset: 0.84 };

  const SHAPES = {
    heart: [[1, 6], [1, 5], [1, 4], [2, 3], [3, 2], [4, 2], [5, 3], [6, 4], [7, 4], [8, 3], [9, 2], [10, 2], [11, 3], [12, 4], [12, 5], [12, 6], [11, 7], [10, 8], [9, 9], [8, 10], [7, 11], [6, 11], [5, 10], [4, 9], [3, 8], [2, 7]],
    sound: [[6, 11], [5, 10], [4, 9], [3, 8], [2, 8], [1, 8], [1, 7], [1, 6], [1, 5], [2, 5], [3, 5], [4, 4], [5, 3], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [6, 10], [8, 9], [9, 9], [10, 8], [10, 7], [10, 6], [10, 5], [9, 4], [8, 4], [8, 11], [9, 11], [10, 11], [11, 10], [12, 9], [12, 8], [12, 7], [12, 6], [12, 5], [12, 4], [11, 3], [10, 2], [9, 2], [8, 2]],
    glass: [[6, 7], [6, 6], [7, 6], [7, 7], [0, 6], [0, 7], [1, 5], [2, 4], [3, 3], [4, 3], [5, 2], [6, 2], [7, 2], [8, 2], [9, 3], [10, 3], [11, 4], [12, 5], [13, 6], [13, 7], [12, 8], [11, 9], [10, 10], [9, 10], [8, 11], [7, 11], [6, 11], [5, 11], [4, 10], [3, 10], [2, 9], [1, 8]],
    cmile: [[1, 8], [1, 7], [1, 6], [1, 5], [2, 4], [2, 3], [3, 2], [4, 2], [5, 1], [6, 1], [7, 1], [8, 1], [9, 2], [10, 2], [11, 3], [11, 4], [12, 5], [12, 6], [12, 7], [12, 8], [11, 9], [11, 10], [10, 11], [9, 11], [8, 12], [7, 12], [6, 12], [5, 12], [4, 11], [3, 11], [2, 10], [2, 9], [5, 6], [5, 5], [5, 4], [8, 6], [8, 5], [8, 4], [4, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 8]],
    kind: [[8, 1], [7, 1], [6, 1], [5, 1], [4, 2], [3, 2], [2, 3], [2, 4], [1, 5], [1, 6], [1, 7], [1, 8], [2, 9], [2, 10], [3, 11], [4, 11], [5, 12], [6, 12], [7, 12], [8, 12], [9, 11], [10, 11], [11, 10], [11, 9], [12, 8], [12, 7], [12, 6], [12, 5], [10, 2], [10, 3], [11, 3], [9, 4], [8, 5], [7, 6], [6, 6], [6, 7], [7, 7], [6, 4], [5, 4], [4, 5], [4, 6], [4, 7], [4, 8], [5, 9], [6, 9], [7, 9], [8, 9], [9, 8], [9, 7]],
    creative: [[8, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [6, 8], [5, 7], [5, 6], [5, 5], [4, 5], [6, 5], [4, 8], [3, 7], [3, 6], [3, 5], [3, 4], [2, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [2, 10], [3, 11], [4, 12], [5, 12], [6, 12], [7, 12], [8, 11], [9, 11], [10, 10], [11, 9], [11, 8], [12, 7], [12, 6], [12, 5], [11, 5], [10, 6], [9, 6], [9, 7], [9, 5], [9, 4], [9, 3], [9, 2]],
    camera: [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8], [8, 9], [8, 10], [8, 11], [7, 11], [6, 11], [5, 11], [4, 11], [3, 11], [2, 11], [1, 11], [1, 10], [1, 9], [1, 8], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [9, 5], [10, 4], [11, 3], [12, 2], [12, 3], [12, 4], [12, 5], [12, 6], [12, 7], [12, 8], [12, 9], [12, 10], [12, 11], [11, 10], [10, 9], [9, 8]],
    photo: [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [12, 4], [12, 5], [12, 6], [12, 7], [12, 8], [12, 9], [12, 10], [12, 11], [11, 11], [10, 11], [9, 11], [8, 11], [7, 11], [6, 11], [5, 11], [4, 11], [3, 11], [2, 11], [1, 11], [1, 10], [1, 9], [1, 8], [1, 7], [1, 6], [1, 5], [1, 4], [3, 2], [4, 2], [8, 6], [9, 6], [10, 7], [10, 8], [9, 9], [8, 9], [7, 8], [7, 7]],
    arrow: [[1, 12], [1, 11], [1, 10], [2, 9], [3, 8], [4, 7], [5, 6], [6, 5], [7, 4], [8, 3], [9, 2], [10, 1], [12, 1], [11, 0], [13, 2], [12, 3], [11, 4], [10, 5], [9, 6], [8, 7], [7, 8], [6, 9], [5, 10], [4, 11], [3, 12], [2, 12], [3, 10], [10, 3]]
  };

  const items = Array.from(document.querySelectorAll('.items__line .item'));
  const $titles = $('.items__line .item h3');
  const wrapper = document.querySelector('.wrapper');
  const itemsLine = document.querySelector('.items__line');

  let total = $('.items__line .item').length;
  $('.items__line .item').each(function () {
    $(this).find('.total-slides').text(`0${total}`);
  });
  if (!items || items.length === 0) return;

  const itemShapes = items.map(item => item.dataset.item);
  const svgGrids = [];
  const allCellsGrids = [];

  function createGrid(svg) {
    const cellsGrid = [];
    const allCells = [];
    const offset = LINE_WIDTH / 2;

    for (let y = 0; y < GRID_SIZE; y++) {
      cellsGrid[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute('x', x * CELL_SIZE + offset);
        rect.setAttribute('y', y * CELL_SIZE + offset);
        rect.setAttribute('width', CELL_SIZE);
        rect.setAttribute('height', CELL_SIZE);
        rect.setAttribute('fill', 'transparent');
        svg.appendChild(rect);
        cellsGrid[y][x] = rect;
        allCells.push(rect);
      }
    }

    for (let x = 0; x <= GRID_SIZE; x++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const pos = x * CELL_SIZE + offset;
      line.setAttribute('x1', pos);
      line.setAttribute('y1', offset);
      line.setAttribute('x2', pos);
      line.setAttribute('y2', GRID_SIZE * CELL_SIZE + offset);
      line.setAttribute('stroke', LINE_COLOR);
      line.setAttribute('stroke-width', LINE_WIDTH);
      svg.appendChild(line);
    }

    for (let y = 0; y <= GRID_SIZE; y++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const pos = y * CELL_SIZE + offset;
      line.setAttribute('x1', offset);
      line.setAttribute('y1', pos);
      line.setAttribute('x2', GRID_SIZE * CELL_SIZE + LINE_WIDTH);
      line.setAttribute('y2', pos);
      line.setAttribute('stroke', LINE_COLOR);
      line.setAttribute('stroke-width', LINE_WIDTH);
      svg.appendChild(line);
    }

    svg.setAttribute('viewBox', `0 0 ${GRID_SIZE * CELL_SIZE + LINE_WIDTH} ${GRID_SIZE * CELL_SIZE + LINE_WIDTH}`);
    svg.setAttribute('width', GRID_SIZE * CELL_SIZE + LINE_WIDTH);
    svg.setAttribute('height', GRID_SIZE * CELL_SIZE + LINE_WIDTH);

    return { cellsGrid, allCells };
  }

  const mainExisting = document.getElementById('interactive-grid');
  items.forEach((item, i) => {
    let svg;
    if (i === 0 && mainExisting) {
      svg = mainExisting;
      if (!wrapper.contains(svg)) wrapper.appendChild(svg);
    } else {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add('interactive-grid');
      wrapper.appendChild(svg);
    }
    svgGrids.push(svg);
    const { cellsGrid, allCells } = createGrid(svg);
    allCellsGrids.push({ cellsGrid, allCells });
  });

  const wrapperImages = Array.from(document.querySelectorAll('.interactive-grid'));
  gsap.set(wrapperImages, { clipPath: 'inset(100% 0 0 0)' });
  if (wrapperImages[0]) gsap.set(wrapperImages[0], { clipPath: 'inset(0% 0 0 0)' });

  function layoutItems() {
    const wrapperH = wrapper.clientHeight;
    itemsLine.style.height = (items.length * wrapperH) + 'px';
    items.forEach(it => it.style.height = wrapperH + 'px');
    itemsLine.style.top = '0px';
  }
  layoutItems();
  window.addEventListener('resize', layoutItems);

  function drawShape(shapeName, gridIndex = 0, clear = false) {
    if (gridIndex < 0 || gridIndex >= allCellsGrids.length) gridIndex = 0;
    const { cellsGrid, allCells } = allCellsGrids[gridIndex];
    if (clear || !shapeName) {
      gsap.killTweensOf(allCells);
      gsap.set(allCells, { attr: { fill: 'transparent' } });
      return;
    }
    const coords = SHAPES[shapeName];
    if (!coords) {
      gsap.killTweensOf(allCells);
      gsap.set(allCells, { attr: { fill: 'transparent' } });
      return;
    }
    const targetCells = coords.map(([x, y]) => cellsGrid[y]?.[x]).filter(Boolean);
    gsap.killTweensOf(allCells);
    gsap.set(allCells, { attr: { fill: 'transparent' } });
    gsap.to(targetCells, {
      attr: { fill: colors[0] },
      duration: 0.55,
      ease: 'power2.out',
      stagger: { each: 0.03, from: 'center', grid: [GRID_SIZE, GRID_SIZE] }
    });
  }
  const scroller = document.scrollingElement || document.documentElement;
  const pager = {
    index: 0,
    animating: false,
    steps: itemShapes.length - 1
  };
  let animationComplete = false;
  let ActiveIndex;
  drawShape(itemShapes[0], 0);
  let currentActiveIndex = -1;
  const st = ScrollTrigger.create({
    trigger: ".services__new",
    start: "top -5.5%",
    end: `+=${(itemShapes.length) * wrapper.clientHeight * 10}`,
    pin: true,
    scrub: false,
    PinType: "transform",
    paused: true,
    onUpdate: self => {
      const progress = self.progress;
      items.forEach((item, index) => {
        const img = wrapperImages[index];
        if (!img) return;
        const itemRect = item.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();
        const intersectionStart = wrapperRect.bottom - itemRect.top;
        const intersectionEnd = wrapperRect.top - itemRect.bottom;

        let animProgress = 0;
        if (intersectionStart > 0 && intersectionEnd < 0) {
          const visibleHeight = wrapperRect.height * ANIMATION_SETTINGS.endOffset -
            wrapperRect.height * ANIMATION_SETTINGS.startOffset;
          animProgress = (intersectionStart - wrapperRect.height * ANIMATION_SETTINGS.startOffset) / (visibleHeight || 1);
          animProgress = Math.min(1, Math.max(0, animProgress));
        }
        gsap.to(img, {
          clipPath: `inset(${100 - animProgress * 100}% 0 0 0)`,
          duration: 0.12,
          overwrite: true
        });
      });
      if (!pager.animating && archorTime) {
        const targetIndex = Math.min(Math.floor(progress * (pager.steps + 1)), pager.steps);
        if (targetIndex == items.length - 1) {
          LeaveBack = true;
        }
        if (targetIndex !== pager.index) {
          goToIndex(targetIndex, { duration: 0.2 });
        }
      }
    },
  });


  function blockTouchEvents(block) {
    if (block) {
      document.addEventListener('touchmove', preventDefault, { passive: false });
      document.addEventListener('touchstart', preventDefault, { passive: false });
    } else {
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('touchstart', preventDefault);
    }
  }

  function preventDefault(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }


  let touchStartY = 0;
  let touchDeltaY = 0;
  let wheelDelta = 0;

  function sectionInView() {
    const y = scroller.scrollTop;
    return y >= st.start && y <= st.end;
  }

  function indexToScrollTop(i) {
    const clamped = Math.max(0, Math.min(pager.steps, i));
    const progress = clamped / pager.steps;
    return st.start + progress * (st.end - st.start);
  }
  let LeaveBack = false;
  function goToIndex(i, opts = {}) {
    if (pager.animating) return;
    const targetIndex = Math.max(0, Math.min(i, pager.steps));
    pager.index = targetIndex;
    pager.animating = true;
    wheelDelta = 0;
    const wrapperH = wrapper.clientHeight;
    const targetY = -targetIndex * wrapperH;
    ActiveIndex = i;
    if (i == items.length - 1 && !archorTime) {
      let end = st.end
      setTimeout(() => {
        lenis.scrollTo(end, {
          immediate: true
        });

        lenis.emit();
        lenis.resize();
        lenis.raf(0);

        lenis.stop();
        blockTouchEvents(true);

        setTimeout(() => {
          lenis.start();
          blockTouchEvents(false);
        }, 300);
      }, 1000);

      LeaveBack = true;
    }
    if (i == 0 && LeaveBack && !archorTime) {
      let start = st.start
      setTimeout(() => {
        lenis.scrollTo(start, {
          immediate: true
        });

        lenis.emit();
        lenis.resize();
        lenis.raf(0);

        lenis.stop();
        blockTouchEvents(true);

        setTimeout(() => {
          lenis.start();
          blockTouchEvents(false);
        }, 300);
      }, 1000);
      LeaveBack = false;
    }
    gsap.to(itemsLine, {
      y: targetY,
      duration: opts.duration ?? 0.8,
      ease: opts.ease ?? "power2.inOut",
      onComplete: () => {
        pager.animating = false;
        if (pager.index === pager.steps) {
          gsap.to(itemsLine, {
            y: -pager.index * wrapper.clientHeight,
            duration: 0.1,
            ease: "power1.out"
          });
        }
      },
    });
    setTimeout(() => {
      drawShape(itemShapes[targetIndex], targetIndex);
    }, timeOutShape);
    if ($titles && $titles.eq(targetIndex).length) {
      $titles.eq(targetIndex).shuffleLetters({
        step: 5,
        fps: 60,
        text: $titles.eq(targetIndex).text(),
        duration: 700
      });
    }
  }

  function onWheel(e) {
    if (!sectionInView() || pager.animating) return;

    const atStart = pager.index === 0;
    const atEnd = pager.index === pager.steps;

    if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;

    e.preventDefault();
    e.stopPropagation();
    wheelDelta += e.deltaY;

    const threshold = 50;
    if (wheelDelta >= threshold) goToIndex(pager.index + 1);
    else if (wheelDelta <= -threshold) goToIndex(pager.index - 1);
  }

  function onTouchStart(e) {
    touchStartY = e.touches[0].clientY;
    touchDeltaY = 0;
  }

  function onTouchMove(e) {
    touchDeltaY = e.touches[0].clientY - touchStartY;
    e.preventDefault();
  }

  function onTouchEnd() {
    if (!sectionInView() || pager.animating) return;

    const atStart = pager.index === 0;
    const atEnd = pager.index === pager.steps;
    const threshold = 40;

    if ((atStart && touchDeltaY > threshold) || (atEnd && touchDeltaY < -threshold)) return;

    if (touchDeltaY < -threshold) goToIndex(pager.index + 1);
    else if (touchDeltaY > threshold) goToIndex(pager.index - 1);
  }

  function onKeyDown(e) {
    if (!sectionInView() || pager.animating) return;

    const atStart = pager.index === 0;
    const atEnd = pager.index === pager.steps;

    if (["ArrowDown", "PageDown", " "].includes(e.key)) {
      if (!atEnd) goToIndex(pager.index + 1);
    } else if (["ArrowUp", "PageUp"].includes(e.key)) {
      if (!atStart) goToIndex(pager.index - 1);
    } else return;

    e.preventDefault();
  }

  function onResizeRecalc() {
    if (!sectionInView()) return;
    goToIndex(pager.index, { duration: 0.001, ease: "none" });
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: false });
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', () => ScrollTrigger.refresh());
  ScrollTrigger.addEventListener("refreshInit", () => {
    if (pager.animating) gsap.killTweensOf(scroller);
  });
  ScrollTrigger.addEventListener("refresh", onResizeRecalc);

  setTimeout(() => {
    if (sectionInView()) {
      const progress = st.progress;
      const nearest = Math.round(progress * pager.steps);
      pager.index = nearest;
      goToIndex(nearest, { duration: 0.001 });
    }
  }, 0);


})();







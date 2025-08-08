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


const wrapper = document.querySelector('.wrapper');
const wrapperImages = document.querySelectorAll('.wrapper img');
const itemsLine = document.querySelector('.items__line');
const items = document.querySelectorAll('.items__line .item');
const titles = $('.items__line .item h3')
const ANIMATION_SETTINGS = {
  startOffset: 0.16,
  endOffset: 0.84
};
gsap.set(wrapperImages, { clipPath: 'inset(100% 0 0 0)' });
gsap.set(wrapperImages[0], { clipPath: 'inset(0% 0 0 0)' });
const titleAnimationStates = Array(titles.length).fill(false);
ScrollTrigger.create({
  trigger: ".services__new",
  start: "top -=5.5%",
  end: `+=${(items.length - 1) * 100}%`,
  pin: true,
  scrub: 1,
  onUpdate: self => {
    const progress = self.progress;
    gsap.to(itemsLine, {
      top: `-${self.progress * 100 * (items.length - 1)}%`,
      ease: "none"
    });
    items.forEach((item, index) => {
      if (index === 0) return;
      const img = wrapperImages[index];
      const itemRect = item.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const intersectionStart = wrapperRect.bottom - itemRect.top;
      const intersectionEnd = wrapperRect.top - itemRect.bottom;
      let animProgress = 0;
      if (intersectionStart > 0 && intersectionEnd < 0) {
        const visibleHeight = wrapperRect.height * ANIMATION_SETTINGS.endOffset -
          wrapperRect.height * ANIMATION_SETTINGS.startOffset;
        animProgress = (intersectionStart - wrapperRect.height * ANIMATION_SETTINGS.startOffset) / visibleHeight;
        animProgress = Math.min(1, Math.max(0, animProgress));
      }
      gsap.to(img, {
        clipPath: `inset(${100 - animProgress * 100}% 0 0 0)`,
        duration: 0.1,
        overwrite: true
      });
      if (animProgress > 0.5 && !titleAnimationStates[index]) {
        titleAnimationStates[index] = true;
        const title = titles.eq(index);
        title.shuffleLetters({
          step: 5,
          fps: 60,
          text: title.text(),
          duration: 800,
          callback: function() {

          }
        });
      } else if (animProgress <= 0.5 && titleAnimationStates[index]) {
        titleAnimationStates[index] = false;
      }
    });
  }
});
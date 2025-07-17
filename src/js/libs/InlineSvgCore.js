const after = (times, func) => {
  return function() {
    if (--times < 1) {
      return func.apply(this, arguments);
    }
  };
};

const extend = (...args) => {
  let extended = {};
  let deep = false;
  let i = 0;
  let length = args.length;

  if (Object.prototype.toString.call(args[0]) === '[object Boolean]') {
    deep = args[0];
    i++;
  }

  const merge = (obj) => {
    for (let prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          extended[prop] = extend(true, extended[prop], obj[prop]);
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for (; i < length; i++) {
    const obj = args[i];
    merge(obj);
  }

  return extended;
};

const InlineSvgCore = (() => {
  let settings;

  const getAll = () => {
    const svgs = document.querySelectorAll(settings.svgSelector);
    return svgs;
  };

  const inliner = (cb) => {
    const svgs = getAll();
    if (svgs.length === 0) {
      cb();
      return;
    }

    const callback = after(svgs.length, cb);

    Array.prototype.forEach.call(svgs, (svg) => {
      const src = svg.src || svg.getAttribute('data-src');
      const attributes = svg.attributes;

      const request = new XMLHttpRequest();
      request.open('GET', src, true);

      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          const parser = new DOMParser();
          const result = parser.parseFromString(request.responseText, 'text/xml');
          const inlinedSVG = result.getElementsByTagName('svg')[0];

          inlinedSVG.removeAttribute('xmlns:a');
          inlinedSVG.removeAttribute('width');
          inlinedSVG.removeAttribute('height');
          inlinedSVG.removeAttribute('x');
          inlinedSVG.removeAttribute('y');
          inlinedSVG.removeAttribute('enable-background');
          inlinedSVG.removeAttribute('xmlns:xlink');
          inlinedSVG.removeAttribute('xml:space');
          inlinedSVG.removeAttribute('version');

          Array.prototype.slice.call(attributes).forEach((attribute) => {
            if (attribute.name !== 'src' && attribute.name !== 'alt') {
              inlinedSVG.setAttribute(attribute.name, attribute.value);
            }
          });

          if (inlinedSVG.classList) {
            inlinedSVG.classList.add('inlined-svg');
          } else {
            inlinedSVG.className += ' inlined-svg';
          }

          inlinedSVG.setAttribute('role', 'img');

          if (attributes.longdesc) {
            const description = document.createElementNS('http://www.w3.org/2000/svg', 'desc');
            const descriptionText = document.createTextNode(attributes.longdesc.value);
            description.appendChild(descriptionText);
            inlinedSVG.insertBefore(description, inlinedSVG.firstChild);
          }

          if (attributes.alt) {
            inlinedSVG.setAttribute('aria-labelledby', 'title');
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            const titleText = document.createTextNode(attributes.alt.value);
            title.appendChild(titleText);
            inlinedSVG.insertBefore(title, inlinedSVG.firstChild);
          }

          svg.parentNode.replaceChild(inlinedSVG, svg);
          callback(settings.svgSelector);
        } else {
          console.error('Error getting SVG source.');
        }
      };

      request.onerror = () => {
        console.error('Server connection error.');
      };

      request.send();
    });
  };

  const init = (options, callback) => {
    const supports = !!document.querySelector && !!root.addEventListener;
    if (!supports) return;

    settings = extend(false, {
      svgSelector: 'img.js-inlinesvg',
      initClass: 'js-is-inlinesvg-loaded'
    }, options || {});

    inliner(callback || function() {});
    document.documentElement.className += ' ' + settings.initClass;
  };

  return {
    init: init
  };
})();

export default InlineSvgCore;
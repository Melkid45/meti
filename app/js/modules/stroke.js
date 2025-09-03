function updateMarqueeAnimation() {
    const marqueeContainer = document.getElementById('marqueeContainer');
    const strokeItems = document.querySelectorAll('.stoke__item');

    if (!marqueeContainer || strokeItems.length === 0) return;

    const itemWidth = strokeItems[0].scrollWidth;
    const containerWidth = marqueeContainer.parentElement.offsetWidth;
    
    const computedStyle = window.getComputedStyle(strokeItems[0]);
    const gap = parseFloat(getComputedStyle(marqueeContainer).gap) || 
               parseFloat(computedStyle.marginRight) || 
               0;
    
    const totalItemWidth = itemWidth + gap;
    
    const translateValue = -(totalItemWidth / containerWidth * 100);

    let style = document.getElementById('dynamic-marquee');
    if (!style) {
        style = document.createElement('style');
        style.id = 'dynamic-marquee';
        document.head.appendChild(style);
    }

    style.innerHTML = `
        @keyframes animFooter {
            0% { transform: translateX(0%); }
            100% { transform: translateX(${translateValue}%); }
        }
    `;
}

let resizeTimeout;
function debouncedUpdate() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateMarqueeAnimation, 250);
}

document.addEventListener('DOMContentLoaded', function () {
    setTimeout(updateMarqueeAnimation, 100);
});

window.addEventListener('resize', debouncedUpdate);
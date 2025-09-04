function updateMarqueeAnimation() {
    const marqueeContainer = document.getElementById('marqueeContainer');
    const strokeItems = document.querySelectorAll('.stoke__item');

    if (!marqueeContainer || strokeItems.length === 0) return;

    const itemWidth = strokeItems[0].scrollWidth;
    const containerWidth = marqueeContainer.parentElement.offsetWidth;
    
    const gap = parseFloat(getComputedStyle(marqueeContainer).gap) || 0;
    const totalItemWidth = itemWidth + gap;
    
    const translateValue = -(totalItemWidth / containerWidth * 100);

    let style = document.getElementById('dynamic-marquee');
    if (!style) {
        style = document.createElement('style');
        style.id = 'dynamic-marquuee';
        document.head.appendChild(style);
    }

    style.innerHTML = `
        @keyframes animFooter {
            0% { 
                transform: translateX(0);
                opacity: 1;
            }
            95% {
                opacity: 1;
            }
            100% { 
                transform: translateX(${translateValue}%);
                opacity: 1;
            }
        }
        
        .stroke {
            animation-fill-mode: both;
        }
    `;
    
    marqueeContainer.style.animation = 'none';
    setTimeout(() => {
        marqueeContainer.style.animation = '';
    }, 10);
}

document.getElementById('marqueeContainer')?.addEventListener('animationiteration', function() {
    this.style.opacity = '1';
});

let resizeTimeout;
function debouncedUpdate() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateMarqueeAnimation, 250);
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateMarqueeAnimation, 100);
    updateMarqueeAnimation();
});

window.addEventListener('resize', debouncedUpdate);
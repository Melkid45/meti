import Splide from 'https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.esm.js';
ScrollTrigger.normalizeScroll(true);
gsap.ticker.lagSmoothing(0);
ScrollTrigger.config({
    limitCallbacks: true,
    autoAdjustLag: true
});
function onEntry(entry) {
    entry.forEach(change => {
        if (change.isIntersecting) {
            change.target.classList.add('element-show');
        }
    });
}


let currentTime = new Date();
// Format the time as HH:MM
let formattedTime = currentTime.getHours().toString().padStart(2, '0') + ':' +
    currentTime.getMinutes().toString().padStart(2, '0');

// Update the element with class 'currentTime'
document.addEventListener('DOMContentLoaded', function () {
    const timeElements = document.querySelectorAll('.currentTime');
    timeElements.forEach(element => {
        element.textContent = formattedTime;
    });
});

let currentScroll;
let lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    autoRaf: true,
    smooth: true,
    infinite: false,
    touchMultiplier: 1.5,
})
if ($(window).width() > 750) {
    let lastScrollTop = 0;
    let isScrollingDown = false;
    const scrollThreshold = 5;
    const activationThreshold = 50;

    lenis.on('scroll', ({ scroll }) => {
        ScrollTrigger.update()
        currentScroll = scroll;
        const header = document.querySelector('.header');

        if (Math.abs(currentScroll - lastScrollTop) > scrollThreshold) {
            isScrollingDown = currentScroll > lastScrollTop;
            lastScrollTop = currentScroll;
        }

        if (isScrollingDown && currentScroll > activationThreshold) {
            header.classList.add('back');
        } else {
            header.classList.remove('back');
        }
    });
} else {
    lenis.on('scroll', ({ scroll }) => {
        ScrollTrigger.update()
        currentScroll = scroll;
    });
}

let options = { threshold: [0.5] };
let observer = new IntersectionObserver(onEntry, options);
let elements = document.querySelectorAll('.element-animation');

for (let elm of elements) {
    observer.observe(elm);
}

$('.burger').on('click', function (e) {
    $('.header__mobile').toggleClass('show')
    $(this).find('.current').toggleClass('show')
})
$('.header__mobile-menu ul li').on('click', function (e) {
    $('.header__mobile').removeClass('show')
    $('.burger').find('.current').removeClass('show')
})
let archorTime = false;
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    lenis.scrollTo(0);
    lenis.emit();
    lenis.resize();
    lenis.raf(0);
    setTimeout(() => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                archorTime = true;
                setTimeout(() => {
                    archorTime = false;
                }, 1000);
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                let parent = target.parentNode
                console.log(parent)
                if (parent.classList.contains('pin-spacer')) {
                    const previos = parent.previousElementSibling;
                    const height = previos.clientHeight;
                    lenis.scrollTo(previos.offsetTop + height, { lerp: 0.1, duration: 2.5 });
                } else {
                    lenis.scrollTo(target, { lerp: 0.1, duration: 2.5 });
                }
            });
        });
    }, 500);
});
window.addEventListener("resize load", () => controller.update(true));
window.addEventListener("hashchange", () => {
    ScrollTrigger.refresh();
});
if (document.querySelector('.splide')) {
    var splide = new Splide('.splide', {
        rewind: true,
        type: 'loop',
        arrows: false,
        pagination: false
    });

    splide.mount();
}

let allowInstantScroll = true

lenis.on('scroll', () => {
    allowInstantScroll = false
})

if (window.location.hash && allowInstantScroll) {
    const target = document.querySelector(window.location.hash)
    if (target) {
        lenis.stop()
        window.scrollTo(0, target.offsetTop)
        setTimeout(() => lenis.start(), 3000)
    }
}

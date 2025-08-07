const video = document.querySelector('.priority-video');
const videoShowreel = document.querySelector('.priority-video');
video.load();
videoShowreel.load();

video.setAttribute('webkit-playsinline', '');
video.setAttribute('x-webkit-airplay', 'allow');

videoShowreel.setAttribute('webkit-playsinline', '');
videoShowreel.setAttribute('x-webkit-airplay', 'allow');

video.addEventListener('loadedmetadata', function () {
    video.style.opacity = 1;
});
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
let lastScrollTop = 0
const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true
})
if ($(window).width() > 750) {
    lenis.on('scroll', ({ scroll }) => {
        const currentScroll = scroll
        const header = document.querySelector('.header')

        if (currentScroll > lastScrollTop && currentScroll > 50) {
            header.classList.add('back')
        } else {
            header.classList.remove('back')
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll
    })
}
gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
})

function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}
gsap.ticker.lagSmoothing(0);

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
    $(this).find('.current').removeClass('show')
})
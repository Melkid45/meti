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
let lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    autoRaf: true,
})
if ($(window).width() > 750) {
    lenis.on('scroll', ({scroll}) => {
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
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        lenis.scrollTo(target, { lerp: 0.1, duration: 2.5 });
    });
});
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
});
window.addEventListener("resize load", () => controller.update(true));
window.addEventListener("hashchange", () => {
    ScrollTrigger.refresh();
});
window.addEventListener('load', () => {
    lenis.scrollTo(0); // Сброс позиции
    lenis.emit(); // Принудительное обновление
});
if (document.querySelector('.splide')){
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

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
let lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    autoRaf: true,
})
if ($(window).width() > 750) {
    let lastScrollTop = 0;
    let isScrollingDown = false;
    const scrollThreshold = 5; // Минимальное изменение для определения направления
    const activationThreshold = 50; // Активация после 50px

    lenis.on('scroll', ({ scroll }) => {
        const currentScroll = scroll;
        const header = document.querySelector('.header');

        // Определяем направление с порогом
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
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
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
})

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
window.addEventListener('load', () => {
    lenis.resize(); // Пересчитываем размеры
    lenis.raf(0); // Сбрасываем анимацию
});
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
let options = { threshold: [0.5] };
let observer = new IntersectionObserver(onEntry, options);
let elements = document.querySelectorAll('.element-animation');

for (let elm of elements) {
    observer.observe(elm);
}

if ($(window).width() > 750) {
    let lastScrollTop = 0;
    window.addEventListener('scroll', function () {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        if (currentScroll > lastScrollTop) {
            document.querySelector('.header').classList.add('back')
        } else {
            document.querySelector('.header').classList.remove('back')
        }
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    });
}
$('.burger').on('click', function (e) {
    $('.header__mobile').toggleClass('show')
    $(this).find('.current').toggleClass('show')
})
$('.header__mobile-menu ul li').on('click', function (e) {
    $('.header__mobile').removeClass('show')
    $(this).find('.current').removeClass('show')
})
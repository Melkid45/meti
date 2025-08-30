let width = $(window).width()
if (width <= 820) {
    $('.header__body-menu').remove()
    $('.about-p1').remove()
    $('.difference-desk').remove()
    $('.brand').attr('placeholder', 'Имя бренда')
    $('.awards__desk').remove()
} else if (width >= 1024 && isTouchDevice) {
    $('.cursor').remove()
    $('.header__body-menu').remove()
    $('.difference-mobile').remove()
    $('.muteor').remove()
    $('.splide').remove()
    $('.about-p2').remove()
} else {
    $('.burger').remove()
    $('.about-p2').remove()
    $('.difference-mobile').remove()
    $('.header__mobile').remove()
    $('.muteor').remove()
    $('.splide').remove()
}


if (width <= 820) {
    document.addEventListener('DOMContentLoaded', function () {
        const lazyVideos = document.querySelectorAll('video.lazy');

        if ('IntersectionObserver' in window) {
            const lazyVideoObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (video) {
                    if (video.isIntersecting) {
                        for (var source in video.target.children) {
                            var videoSource = video.target.children[source];
                            if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
                                videoSource.src = videoSource.dataset.src;
                            }
                        }
                        video.target.load();
                        video.target.classList.remove("lazy");
                        lazyVideoObserver.unobserve(video.target);
                    }
                });
            });

            lazyVideos.forEach(function (lazyVideo) {
                lazyVideoObserver.observe(lazyVideo);
            });
        }
    });
}
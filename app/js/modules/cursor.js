
if (width > 750) {
    gsap.set('.cursor', { xPercent: -50, yPercent: -50 });

    $(document).mousemove(function (event) {
        gsap.to('.cursor', {
            x: event.clientX,
            y: event.clientY,
            duration: 0.1,
            ease: 'power1.out'
        });
    });

    $(document).on('mouseenter', 'a', function () {
        console.log($(this).attr('href'))
        let attr = $(this).attr('href')
        $('.default_text').fadeIn(200)
        if (attr.includes('tel')) {
            $('.default_text').text('Позвонить')
            $('.cursor .phone').css({
                scale: '1'
            });
            $('.cursor svg').not('.cursor .arrow').css({
                scale: 0
            })
        } else if (attr.includes('mail')) {
            $('.cursor .mail').css({
                scale: '1'
            });
            $('.cursor svg').not('.cursor .arrow').css({
                scale: 0
            })
            $('.default_text').text('Написать')
        } else {
            $('.default_text').text('Клик')
            $('.cursor .arrow').css({
                scale: '1'
            });
            $('.cursor svg').not('.cursor .arrow').css({
                scale: 0
            })
        }
    }).on('mouseleave', 'a', function () {
        $('.cursor svg').css({
            scale: '0'
        });
        $('.default_text').fadeOut(200)
    });
    $(document).on({
        mouseleave: function () {
            $('.cursor svg').css('scale', '0');
            $('.default_text').fadeOut(200)
        },
        mousemove: function () {
            updateVideoCursor();
        },
        click: function (event) {
            event.preventDefault();
            toggleVideoPlayback();
        },
    }, '.showreel');

    const video = document.querySelector('.showreel__video'); // Кэшируем элемент

    function toggleVideoPlayback() {
        if (!video) return;

        if (video.paused || video.ended) {
            video.play().catch(e => console.error('Video play error:', e));
        } else {
            video.pause();
        }
        updateVideoCursor();
    }

    function updateVideoCursor() {
        if (!video) return;

        const isPlaying = !video.paused && !video.ended;
        const $cursor = $('.cursor');

        $cursor.find('.pause').css('scale', isPlaying ? '1' : '0');
        $cursor.find('.play').css('scale', isPlaying ? '0' : '1');
        $('.default_text').fadeIn(200)
        $('.default_text').text(isPlaying ? 'Пауза' : 'воспроизвести')
    }
}

$('.muteor').on('click', function (e) {
    const video = document.querySelector('.showreel__video');
    if (video.muted) {
        video.muted = false;
        $('.mute').fadeIn(300)
        $('.sound').fadeOut(300)
    } else {
        video.muted = true;
        $('.mute').fadeOut(300)
        $('.sound').fadeIn(300)
    }
})
if (width > 750) {
    gsap.set('.cursor', { xPercent: -50, yPercent: -50 });
    let lastCursorState = null;
    let lastMouseX = 0;
    let lastMouseY = 0;
    const video = document.querySelector('.showreel__video');
    function moveCursor(x, y) {
        gsap.to('.cursor', {
            x: x,
            y: y,
            duration: 0.1,
            ease: 'power1.out'
        });
    }
    function checkCursorOverShowreel(mouseX, mouseY) {
        const showreel = document.querySelector('.showreel');
        if (!showreel) return;

        const rect = showreel.getBoundingClientRect();

        const isOver = mouseX >= rect.left &&
                       mouseX <= rect.right &&
                       mouseY >= rect.top &&
                       mouseY <= rect.bottom;

        if (isOver !== lastCursorState) {
            lastCursorState = isOver;

            if (isOver) {
                updateVideoCursor();
            } else {
                $('.cursor .mute, .cursor .pause, .cursor .play').css('scale', '0');
                const text = $('.default_text').text();
                if (text === ConFigNames.pause || text === ConFigNames.play) {
                    $('.default_text').fadeOut(200);
                }
            }
        }
    }
    function updateVideoCursor() {
        if (!video) return;

        const isPlaying = !video.paused && !video.ended;
        const $cursor = $('.cursor');

        $cursor.find('.pause').css('scale', isPlaying ? '1' : '0');
        $cursor.find('.play').css('scale', isPlaying ? '0' : '1');
        $('.default_text').fadeIn(200).text(isPlaying ? ConFigNames.pause : ConFigNames.play);
    }
    function toggleVideoPlayback() {
        if (!video) return;

        if (video.paused || video.ended) {
            video.play().catch(e => console.error('Video play error:', e));
        } else {
            video.pause();
        }
        updateVideoCursor();
    }
    $(document).on('mousemove', function(e) {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        moveCursor(lastMouseX, lastMouseY);
        checkCursorOverShowreel(lastMouseX, lastMouseY);
    });
    $(document).on('mouseenter', 'a', function () {
        const attr = $(this).attr('href') || '';
        $('.default_text').fadeIn(200);

        if (attr.includes('tel')) {
            $('.default_text').text(`${ConFigNames.phone}`);
            $('.cursor .phone').css('scale', '1');
            $('.cursor svg').not('.cursor .arrow, .cursor .phone').css('scale', 0);
        } else if (attr.includes('mail')) {
            $('.default_text').text(`${ConFigNames.email}`);
            $('.cursor .mail').css('scale', '1');
            $('.cursor svg').not('.cursor .arrow, .cursor .mail').css('scale', 0);
        } else {
            $('.default_text').text(`${ConFigNames.click}`);
            $('.cursor .arrow').css('scale', '1');
            $('.cursor svg').not('.cursor .arrow').css('scale', 0);
        }
    }).on('mouseleave', 'a', function () {
        $('.cursor svg').css('scale', '0');
        $('.default_text').fadeOut(200);
    });
    $(document).on({
        mouseleave: function () {
            $('.cursor svg').css('scale', '0');
            $('.default_text').fadeOut(200);
        },
        mousemove: function () {
            updateVideoCursor();
        },
        click: function (event) {
            event.preventDefault();
            toggleVideoPlayback();
        }
    }, '.showreel');

    $('.muteor').on('click', function () {
        if (!video) return;

        if (video.muted) {
            video.muted = false;
            $('.mute').fadeIn(300);
            $('.sound').fadeOut(300);
        } else {
            video.muted = true;
            $('.mute').fadeOut(300);
            $('.sound').fadeIn(300);
        }
    });

    let scrollTimeout;
    $(window).on('scroll', function () {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            checkCursorOverShowreel(lastMouseX, lastMouseY);
        }, 10);
    });

    setInterval(() => {
        checkCursorOverShowreel(lastMouseX, lastMouseY);
    }, 300);

    $(document).ready(function () {
        $('.cursor svg').css('scale', '0');
        $('.default_text').hide();
        setTimeout(() => {
            checkCursorOverShowreel(lastMouseX, lastMouseY);
        }, 10);
    });
}

if (window.innerWidth > 750) {
    gsap.set('.cursor', { xPercent: -50, yPercent: -50 });

    let insideShowreel = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const video = document.querySelector('.showreel__video');
    const cursor = document.querySelector('.cursor');
    const defaultText = document.querySelector('.default_text');
    const showreel = document.querySelector('.showreel');

    const $cursor = $(cursor);
    const $defaultText = $(defaultText);
    const $showreel = $(showreel);

    function moveCursor(x, y) {
        gsap.to($cursor, {
            x,
            y,
            duration: 0.1,
            ease: 'power1.out'
        });
    }

    function updateVideoCursor() {
        if (!video) return;
        const isPlaying = !video.paused && !video.ended;
        $cursor.stop(true).animate({ width: '40rem', height: '40rem' }, 200);
        $cursor.find('.arrow').css('scale', '0');
        $cursor.find('.pause').css('scale', isPlaying ? '1' : '0');
        $cursor.find('.play').css('scale', isPlaying ? '0' : '1');
        $defaultText.stop(true, true).fadeIn(200).text(isPlaying ? ConFigNames.pause : ConFigNames.play);
    }

    function resetCursor() {
        $cursor.find('svg').css('scale', '0');
        $defaultText.stop(true, true).fadeOut(200);
        $cursor.stop(true).animate({ width: '20rem', height: '20rem' }, 200);
    }

    function checkCursorPosition(mouseX, mouseY) {
        if (!showreel) return;
        const rect = showreel.getBoundingClientRect();
        const isInside = mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom;

        if (isInside && !insideShowreel) {
            insideShowreel = true;
            updateVideoCursor();
        } 
        else if (!isInside && insideShowreel) {
            insideShowreel = false;
            resetCursor();
        }
    }
    $('button').on('mouseover', function(e){
        $cursor.stop(true).animate({ width: '40rem', height: '40rem' }, 200);
    })
    $('button').on('mouseout', function(e){
        $cursor.stop(true).animate({ width: '20rem', height: '20rem' }, 200);
        $cursor.find('svg').css('scale', '0');
    })
    $(document)
        .on('mousemove', function (e) {
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            moveCursor(lastMouseX, lastMouseY);
            checkCursorPosition(lastMouseX, lastMouseY);
        })
        .on('mouseenter', 'a', function () {
            const href = $(this).attr('href') || '';
            $defaultText.stop(true, true).fadeIn(200);
            $cursor.stop(true).animate({ width: '40rem', height: '40rem' }, 200);

            if (href.includes('tel')) {
                $defaultText.text(ConFigNames.phone);
                $cursor.find('.phone').css('scale', '1').siblings('svg').not('.arrow, .phone').css('scale', '0');
            } else if (href.includes('mail')) {
                $defaultText.text(ConFigNames.email);
                $cursor.find('.mail').css('scale', '1').siblings('svg').not('.arrow, .mail').css('scale', '0');
            } else if (href.includes('#')) {
                $defaultText.text('');
                $cursor.find('.arrow').css('scale', '0').siblings('svg').not('.arrow').css('scale', '0');
            }else{
                $defaultText.text('');
                $cursor.find('.arrow').css('scale', '1').siblings('svg').not('.arrow').css('scale', '0');
            }
        })
        .on('mouseleave', 'a', function () {
            if (insideShowreel) {
                updateVideoCursor();
            } else {
                resetCursor();
            }
        });

    $showreel.on('click', function (e) {
        if (!video) return;
        e.preventDefault();
        if (video.paused || video.ended) {
            video.play().catch(err => console.error('Video play error:', err));
        } else {
            video.pause();
        }
        updateVideoCursor();
    });

    $('.muteor').on('click', function () {
        if (!video) return;
        video.muted = !video.muted;
        $cursor.find('.mute').toggle(!video.muted);
        $cursor.find('.sound').toggle(video.muted);
    });

    $(document).on('mouseleave', function () {
        insideShowreel = false;
        resetCursor();
    });

    $(window).on('scroll resize', function () {
        checkCursorPosition(lastMouseX, lastMouseY);
    });

    $(function () {
        resetCursor();
    });

    $(window).on('resize', function () {
        if (window.innerWidth <= 750) {
            $(document).off('mousemove mouseenter mouseleave');
            $showreel.off('click');
            $('.muteor').off('click');
            $(window).off('scroll resize');
        }
    });
}

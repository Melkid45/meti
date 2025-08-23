document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        squareSize: 54,
        gap: 0,
        fillColor: '#442CBF',
        bgColor: '#000000',
        animationDuration: 800,
        widthView: 1920
    };

    if (window.innerWidth <= 750) {
        CONFIG.widthView = 375;
        CONFIG.squareSize = 20;
        CONFIG.animationDuration = 500;
    }

    function remToPx(rem) {
        return rem * (window.innerWidth / CONFIG.widthView);
    }

    const canvas = document.getElementById('feedback-grid-canvas');
    const ctx = canvas.getContext('2d');
    let grid = [];
    let shuffledIndices = [];
    let lastFilledCount = 0;

    function initGrid() {
        const container = document.querySelector('.feedback__top');
        const width = container.clientWidth;
        const height = container.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        const squareSizePx = remToPx(CONFIG.squareSize);
        const gapPx = remToPx(CONFIG.gap);

        const cols = Math.ceil(width / (squareSizePx + gapPx));
        const rows = Math.ceil(height / (squareSizePx + gapPx));

        const startX = 0;
        const startY = 0;

        grid = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                grid.push({
                    x: startX + x * (squareSizePx + gapPx),
                    y: startY + y * (squareSizePx + gapPx),
                    width: squareSizePx,
                    height: squareSizePx,
                    filled: false
                });
            }
        }

        shuffledIndices = [...Array(grid.length).keys()];
        shuffleArray(shuffledIndices);
        lastFilledCount = 0;

        draw();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = CONFIG.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        grid.forEach(square => {
            const x = square.x;
            const y = square.y;
            const size = square.width;

            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(x, y, size + 0.5, size + 0.5);
        });
    }


    function updateGrid(filledCount) {
        if (filledCount < lastFilledCount) {
            for (let i = lastFilledCount - 1; i >= filledCount; i--) {
                if (i >= 0 && i < shuffledIndices.length) {
                    grid[shuffledIndices[i]].filled = false;
                }
            }
        } else {
            for (let i = lastFilledCount; i < filledCount; i++) {
                if (i >= 0 && i < shuffledIndices.length) {
                    grid[shuffledIndices[i]].filled = true;
                }
            }
        }

        lastFilledCount = filledCount;
        draw();
    }

    const controller = new ScrollMagic.Controller();
    new ScrollMagic.Scene({
        triggerElement: ".feedback",
        duration: CONFIG.animationDuration,
        triggerHook: 1,
    })
        .on("progress", (e) => {
            const filledCount = Math.floor(e.progress * grid.length);
            updateGrid(filledCount);
        })
        .addTo(controller);

    initGrid();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth <= 750) {
                CONFIG.widthView = 375;
                CONFIG.squareSize = 20;
                CONFIG.animationDuration = 500;
            } else {
                CONFIG.widthView = 1920;
                CONFIG.squareSize = 54;
                CONFIG.animationDuration = 1000;
            }
            initGrid();
            controller.update();
        }, 100);
    });
});

$.ajaxSetup({
    headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
    }
});
const tippyInstances = [];
$('.input__wrap p').each(function (e) {
    const inputName = $(this).parents('.input__wrap').find('input').attr('name');
    const tippyElement = this
    const Text = $(this).attr('data-tippy')
    const instance = tippy(tippyElement, {
        content: `${Text}`,
        placement: 'top',
        animation: 'fade',
        arrow: true,
        name: inputName,
        theme: 'custom',
        trigger: 'mouseenter manual',
    });
    tippyInstances.push(instance);
})
$('.feedback_btn').on('click', function (e) {
    let col = 0;
    let formData = {};
    $('.inputs input').each(function () {
        const nameInput = $(this).attr('name')
        if ($(this).val() == '') {
            $(this).addClass('error');
            tippyInstances.forEach((item) =>{
                if (item.props.name == nameInput){
                    item.show()
                }
            })
        } else {
            $(this).removeClass('error');
            tippyInstances.forEach((item) =>{
                if (item.props.name == nameInput){
                    item.hide()
                }
            })
            col++;
            const name = $(this).attr('name');
            formData[name] = $(this).val();
        }
    });
    if (col == 5) {
        if ($('.feedback_btn').hasClass('send_feedback')) {
            $.ajax({
                url: '/feedback',
                type: 'POST',
                data: formData,
                success: function (response) {
                    $('.feedback__bot-form').fadeOut(300);
                    $('.feedback__bot-thank').fadeIn(300);
                    const successTitle = $('.title__feed').attr('data-success');
                    $('.title__feed').text(successTitle);
                },
                error: function (xhr, status, error) {
                    // alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте еще раз.');
                    console.error(error);
                }
            });
        } else {
            $('.feedback__bot-form').fadeOut(300);
            $('.feedback__bot-thank').fadeIn(300);
            const successTitle = $('.title__feed').attr('data-success');
            $('.title__feed').text(successTitle);
        }

    }
});
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

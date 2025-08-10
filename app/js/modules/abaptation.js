let width = $(window).width()
if (width <= 750){
    $('.header__body-menu').remove()
    $('.about-p1').remove()
    $('.difference-desk').remove()
    $('.brand').attr('placeholder', 'Имя бренда')
}else{
    $('.burger').remove()
    $('.about-p2').remove()
    $('.difference-mobile').remove()
    $('.header__mobile').remove()
    $('.muteor').remove()
}
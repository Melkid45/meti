let width = $(window).width()
if (width <= 750){
    $('.header__body-menu').remove()
    $('.about-p1').remove()
    $('.difference').text('уровня сетевых')
    $('.difference2').text('рекламных')
    $('.brand').attr('placeholder', 'Имя бренда')
}else{
    $('.burger').remove()
    $('.about-p2').remove()
    $('.difference').text('уровня')
    $('.difference2').text('сетевых рекламных')
}
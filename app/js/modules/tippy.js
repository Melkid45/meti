$('.input__wrap p').each(function(e){
    const tippyElement = this
    const Text = $(this).attr('data-tippy')
    tippy(tippyElement, {
        content: `${Text}`,
        placement: 'top',
        animation: 'fade',
        arrow: true
    });
})
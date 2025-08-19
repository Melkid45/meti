$('.input__wrap p').each(function (e) {
    const tippyElement = this
    const Text = $(this).attr('data-tippy')
    tippy(tippyElement, {
        onMount(instance) {
            const box = instance.popper.firstElementChild;
            requestAnimationFrame(() => {
                box.classList.add('animated');
                box.classList.add('wobble');
            });
        },
        content: `${Text}`,
        placement: 'top',
        animation: 'fade',
        arrow: true,
        theme: 'custom',
    });
})


if (width > 750) {
    $(function () {
        // Инициализация контроллера
        var controller = new ScrollMagic.Controller();

        // Создаем временную шкалу с плавными анимациями
        var wipeAnimation = new TimelineMax({ smoothChildTiming: true })
            // Анимация для каждого элемента с задержкой 0.3s
            .fromTo(".item1", 1.5,
                { y: "0%" },
                { top: "-110%", opacity: 1, ease: Power2.easeOut }, 0)
            .fromTo(".item2", 1.5,
                { y: "0%" },
                { top: "-110%", opacity: 1, ease: Power2.easeOut }, 0.3)
            .fromTo(".item3", 1.5,
                { y: "0%" },
                { top: "-110%", opacity: 1, ease: Power2.easeOut }, 0.6)
            .fromTo(".item4", 1.5,
                { y: "0%" },
                { top: "-110%", opacity: 1, ease: Power2.easeOut }, 0.9)
            .fromTo(".item5", 1.5,
                { y: "0%" },
                { top: "-110%", opacity: 1, ease: Power2.easeOut }, 1.2)
            .fromTo(".item6", 1.5,
                { y: "0%" },
                { top: "-110%", opacity: 1, ease: Power2.easeOut }, 1.5)

        // Создаем сцену
        new ScrollMagic.Scene({
            triggerElement: ".case",
            triggerHook: "onLeave",
            duration: "700%" // Увеличили длительность для плавности
        })
            .setPin(".case")
            .setTween(wipeAnimation)
            .addTo(controller);
    });
}else{
    $(function () {
        // Инициализация контроллера
        var controller = new ScrollMagic.Controller();

        // Создаем временную шкалу с плавными анимациями
        var wipeAnimation = new TimelineMax({ smoothChildTiming: true })
            // Анимация для каждого элемента с задержкой 0.3s
            .fromTo(".case__soft", 1.5,
                { y: "105%" },
                { y: "-450%", opacity: 1, ease: Power2.easeOut }, 0)
        // Создаем сцену
        new ScrollMagic.Scene({
            triggerElement: ".case",
            triggerHook: "onLeave",
            duration: "700%" // Увеличили длительность для плавности
        })
            .setPin(".case")
            .setTween(wipeAnimation)
            .addTo(controller);
    });
}

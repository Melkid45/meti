

if (width > 750) {
    $(function () {
        var controller = new ScrollMagic.Controller();
        var wipeAnimation = new TimelineMax({ smoothChildTiming: true })
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
        new ScrollMagic.Scene({
            triggerElement: ".case",
            triggerHook: "onLeave",
            duration: "700%"
        })
            .setPin(".case")
            .setTween(wipeAnimation)
            .addTo(controller);
    });
}else{
    $(function () {
        var controller = new ScrollMagic.Controller();
        var wipeAnimation = new TimelineMax({ smoothChildTiming: true })
            .fromTo(".case__soft", 1.5,
                { y: "105%" },
                { y: "-450%", opacity: 1, ease: Power2.easeOut }, 0)
        new ScrollMagic.Scene({
            triggerElement: ".case",
            triggerHook: "onLeave",
            duration: "700%"
        })
            .setPin(".case")
            .setTween(wipeAnimation)
            .addTo(controller);
    });
}

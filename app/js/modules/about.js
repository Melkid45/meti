const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = '../images/dist/about.webp';
const ABOUTCONFIG = {
    animCanvas: -250,
    StartAnim: "top top",
    StartAnimPixel: "top top",
    endAnim: "+=30%"
}
if (width <= 750){
    ABOUTCONFIG.animCanvas = -50;
    ABOUTCONFIG.StartAnim = "top center";
    ABOUTCONFIG.StartAnimPixel = "+=10%";
    ABOUTCONFIG.endAnim = "+=30%";
}
img.onload = function () {
    initCanvas();
    window.addEventListener('resize', initCanvas);

    gsap.to(canvas, {
        y: ABOUTCONFIG.animCanvas,
        scrollTrigger: {
            trigger: ".about",
            start: ABOUTCONFIG.StartAnim,
            end: "bottom center",
            scrub: 2,
            ease: "sine.inOut"
        }
    });

    const pixelAnimation = { pixelSize: 20 };

    gsap.to(pixelAnimation, {
        scrollTrigger: {
            trigger: ".about",
            start: ABOUTCONFIG.StartAnimPixel,
            end: ABOUTCONFIG.endAnim,
            scrub: 1,
            ease: "sine.inOut",
        },
        pixelSize: 1,
        onUpdate: function () {
            renderPixelated(pixelAnimation.pixelSize);
        }
    });
};

function initCanvas() {
    canvas.width = img.width;
    canvas.height = img.height;
    renderPixelated(20);
}

function renderPixelated(pixelSize) {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const smallWidth = Math.floor(canvas.width / pixelSize);
    const smallHeight = Math.floor(canvas.height / pixelSize);

    ctx.drawImage(img, 0, 0, smallWidth, smallHeight);
    ctx.drawImage(canvas, 0, 0, smallWidth, smallHeight, 0, 0, canvas.width, canvas.height);
}


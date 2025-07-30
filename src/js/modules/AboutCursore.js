class DynamicGrid {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellPool = [];
        this.activeCells = [];
        this.mouse = { x: -1000, y: -1000 };
        this.lastMouse = { x: -1000, y: -1000 };
        this.velocity = { x: 0, y: 0 };

        this.settings = {
            baseSize: 60,
            sizeVariation: 0,
            spacing: 0,
            activationRadius: 120,
            fadeSpeed: 0.01,
            maxRotation: 0.0,
            rotationSpeed: 0,
            borderColor: { r: 244, g: 244, b: 244, a: 0.24 },
            fillColor: { r: 0, g: 0, b: 0, a: 0 }
        };

        this.resize();
        this.initPool();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.gridCols = Math.ceil(this.width / (this.settings.baseSize + this.settings.spacing));
        this.gridRows = Math.ceil(this.height / (this.settings.baseSize + this.settings.spacing));
    }

    initPool() {
        for (let y = 0; y < this.gridRows; y++) {
            for (let x = 0; x < this.gridCols; x++) {
                const size = this.settings.baseSize +
                    (Math.random() - 0.5) * this.settings.sizeVariation;

                this.cellPool.push({
                    x: x * (this.settings.baseSize + this.settings.spacing),
                    y: y * (this.settings.baseSize + this.settings.spacing),
                    width: size,
                    height: size,
                    rotation: (Math.random() - 0.5) * this.settings.maxRotation,
                    targetRotation: 0,
                    alpha: 0,
                    active: false,
                    lastActiveTime: 0,
                    borderWidth: 1
                });
            }
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());

        document.querySelector('.about').addEventListener('mousemove', (e) => {
            this.lastMouse.x = this.mouse.x;
            this.lastMouse.y = this.mouse.y ;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;

            this.velocity.x = this.mouse.x - this.lastMouse.x;
            this.velocity.y = this.mouse.y - this.lastMouse.y;
        });

        document.querySelector('.about').addEventListener('mouseout', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });
    }

    updateCells() {
        const now = performance.now();
        const activationRadiusSq = this.settings.activationRadius * this.settings.activationRadius;

        for (let cell of this.cellPool) {
            const dx = this.mouse.x - (cell.x + cell.width) + 30;
            const dy = this.mouse.y - (cell.y + cell.height) + 120;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < activationRadiusSq) {
                cell.active = true;
                cell.lastActiveTime = now;

                cell.targetRotation = Math.atan2(this.velocity.y, this.velocity.x) * 0.2;

                cell.alpha = Math.min(1);
            } else {
                if (cell.active && now - cell.lastActiveTime > 300) {
                    cell.active = false;
                }

                cell.alpha = Math.max(0, cell.alpha - this.settings.fadeSpeed);
                cell.targetRotation = 0;
            }

            cell.rotation += (cell.targetRotation - cell.rotation) * this.settings.rotationSpeed;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let cell of this.cellPool) {
            if (cell.alpha <= 0) continue;

            this.ctx.save();
            this.ctx.translate(
                cell.x + cell.width / 2,
                cell.y + cell.height / 2
            );
            this.ctx.rotate(cell.rotation);

            this.ctx.fillStyle = `rgba(${this.settings.fillColor.r}, ${this.settings.fillColor.g}, ${this.settings.fillColor.b}, ${this.settings.fillColor.a * cell.alpha})`;
            this.ctx.fillRect(
                -cell.width / 2,
                -cell.height / 2,
                cell.width,
                cell.height
            );

            this.ctx.strokeStyle = `rgba(${this.settings.borderColor.r}, ${this.settings.borderColor.g}, ${this.settings.borderColor.b}, ${this.settings.borderColor.a * cell.alpha})`;
            this.ctx.lineWidth = cell.borderWidth;
            this.ctx.strokeRect(
                -cell.width / 2,
                -cell.height / 2,
                cell.width,
                cell.height
            );

            this.ctx.restore();
        }
    }

    animate() {
        this.updateCells();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gridCanvas');
    const grid = new DynamicGrid(canvas);

    document.body.style.cursor = 'none';
});
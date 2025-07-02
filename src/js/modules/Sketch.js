import * as THREE from 'three';
import fragment from '../shader/fragment.glsl';
import vertex from '../shader/vertex.glsl';
import GUI from 'lil-gui';

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();
    this.container = options.dom;
    this.img = this.container.querySelector('img');
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.physicallyCorrectLights = true;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.OrthographicCamera(
      -0.5, 0.5, 0.5, -0.5,
      -1000, 1000
    );
    this.camera.position.set(0, 0, 2);

    this.time = 0;

    this.mouse = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };
    this.isPlaying = true;

    this.settings = {
      grid: parseFloat(this.container.dataset.grid || 34),
      mouse: parseFloat(this.container.dataset.mouse || 0.25),
      strength: parseFloat(this.container.dataset.strength || 1),
      relaxation: parseFloat(this.container.dataset.relaxation || 0.9),
    };

    this.initGUI();
    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    this.mouseEvents();
  }

  initGUI() {
    this.gui = new GUI();
    // this.gui.add(this.settings, "grid", 2, 1000, 1).onFinishChange(() => this.regenerateGrid());
    // this.gui.add(this.settings, "mouse", 0, 1, 0.01);
    // this.gui.add(this.settings, "strength", 0, 1, 0.01);
    // this.gui.add(this.settings, "relaxation", 0, 1, 0.01);
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();

    const imageAspect = 1 / 1.5;
    const a1 = this.height / this.width > imageAspect
      ? (this.width / this.height) * imageAspect
      : 1;
    const a2 = this.height / this.width > imageAspect
      ? 1
      : (this.height / this.width) / imageAspect;

    if (this.material?.uniforms.resolution?.value) {
      this.material.uniforms.resolution.value.set(this.width, this.height, a1, a2);
    }

    this.regenerateGrid();
  }

  mouseEvents() {
    window.addEventListener('mousemove', (e) => {
      const bounds = this.container.getBoundingClientRect();
      this.mouse.x = (e.clientX - bounds.left) / bounds.width;
      this.mouse.y = (e.clientY - bounds.top) / bounds.height;
      this.mouse.vX = this.mouse.x - this.mouse.prevX;
      this.mouse.vY = this.mouse.y - this.mouse.prevY;
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
    });
  }

  regenerateGrid() {
    this.size = this.settings.grid;
    const data = new Float32Array(3 * this.size * this.size);

    for (let i = 0; i < data.length; i += 3) {
      data[i] = Math.random() * 255 - 125;
      data[i + 1] = Math.random() * 255 - 125;
      data[i + 2] = Math.random() * 255 - 125;
    }

    this.texture = new THREE.DataTexture(data, this.size, this.size, THREE.RGBFormat, THREE.FloatType);
    this.texture.magFilter = this.texture.minFilter = THREE.NearestFilter;
    this.texture.needsUpdate = true;

    if (this.material?.uniforms?.uDataTexture?.value) {
      this.material.uniforms.uDataTexture.value = this.texture;
    }
  }

  addObjects() {
    this.regenerateGrid();

    const texture = new THREE.Texture(this.img);
    texture.needsUpdate = true;

    this.material = new THREE.ShaderMaterial({
      extensions: { derivatives: "#extension GL_OES_standard_derivatives : enable" },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        uTexture: { value: texture },
        uDataTexture: { value: this.texture },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    this.plane = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.plane);
  }

  updateDataTexture() {
    const data = this.texture.image.data;
    const gridMouseX = this.size * this.mouse.x;
    const gridMouseY = this.size * (1 - this.mouse.y);
    const maxDist = this.size * this.settings.mouse;
    const aspect = this.height / this.width;

    for (let i = 0; i < data.length; i += 3) {
      data[i] *= this.settings.relaxation;
      data[i + 1] *= this.settings.relaxation;
    }

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const distance = ((gridMouseX - i) ** 2) / aspect + (gridMouseY - j) ** 2;
        if (distance < maxDist ** 2) {
          const index = 3 * (i + this.size * j);
          let power = maxDist / Math.sqrt(distance);
          power = clamp(power, 0, 10);
          data[index] += this.settings.strength * 100 * this.mouse.vX * power;
          data[index + 1] -= this.settings.strength * 100 * this.mouse.vY * power;
        }
      }
    }

    this.mouse.vX *= 0.9;
    this.mouse.vY *= 0.9;
    this.texture.needsUpdate = true;
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    this.updateDataTexture();
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

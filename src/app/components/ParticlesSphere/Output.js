import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

import GUI from 'lil-gui';

import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import simVertexShader from './shaders/simVertex.glsl';
import simFragmentPosition from './shaders/simFragment.glsl';
import simFragmentVelocity from './shaders/simFragmentVelocity.glsl';

import texture from './test.jpg';
import t1 from './threejs.png';
import t2 from './superman.png';

const lerp = (a, b, n) => {
  return (1 - n) * a + n * b;
};

const loadImage = (path) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // to avoid CORS if used with Canvas
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
};

export default class Output {
  constructor(_options = {}) {
    // Basic setup
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.targetElement = _options.targetElement;

    this.time = 0;
    this.size = this.isMobileDevice() ? 256 : 256;
    this.number = this.size * this.size;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(0, 0);

    this.mousepressed = false;

    this.setupSettings();

    this.setScene();
    this.setRenderer();
    this.setCamera();
    this.setupFBO();
    this.initGPGPU();
    this.mouseEvents();
    this.setupResize();
    this.addObjects();
    this.initAnimation();
    this.render();
  }

  isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  async getPixelDataFromImage(url) {
    let img = await loadImage(url);
    let width = 200;
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = width;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, width);
    let canvasData = ctx.getImageData(0, 0, width, width).data;

    let pixels = [];
    for (let i = 0; i < canvasData.length; i += 4) {
      let x = (i / 4) % width;
      let y = Math.floor(i / 4 / width);
      if (canvasData[i] < 5) {
        pixels.push({ x: x / width - 0.5, y: 0.5 - y / width });
      }
    }

    const data = new Float32Array(4 * this.number);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;
        let randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
        if (Math.random() > 0.9) {
          randomPixel = {
            x: 3 * (Math.random() - 0.5),
            y: 3 * (Math.random() - 0.5),
          };
        }
        data[4 * index] = randomPixel.x + (Math.random() - 0.5) * 0.01;
        data[4 * index + 1] = randomPixel.y + (Math.random() - 0.5) * 0.01;
        data[4 * index + 2] = (Math.random() - 0.5) * 0.01;
        data[4 * index + 3] = (Math.random() - 0.5) * 0.01;
      }
    }

    let dataTexture = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;

    return dataTexture;
  }

  setupSettings() {
    this.settings = {
      progress: 0,
    };
  }

  // sphere
  getPointsOnSphere() {
    const data = new Float32Array(4 * this.number);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;

        // generate points on a sphere
        let theta = Math.random() * Math.PI * 2;
        let phi = Math.acos(Math.random() * 2 - 1);
        let x = Math.sin(phi) * Math.cos(theta);
        let y = Math.sin(phi) * Math.sin(theta);
        let z = Math.cos(phi);

        data[4 * index] = x;
        data[4 * index + 1] = y;
        data[4 * index + 2] = z;
        data[4 * index + 3] = (Math.random() - 0.5) * 0.01;
      }
    }

    let dataTexture = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;

    return dataTexture;
  }

  // velocity sphere
  getVelocitiesOnSphere() {
    const data = new Float32Array(4 * this.number);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;

        // generate points on a sphere
        let theta = Math.random() * Math.PI * 2;
        let phi = Math.acos(Math.random() * 2 - 1);
        let x = Math.sin(phi) * Math.cos(theta);
        let y = Math.sin(phi) * Math.sin(theta);
        let z = Math.cos(phi);

        // we want the initial speed to be 0
        data[4 * index] = 0;
        data[4 * index + 1] = 0;
        data[4 * index + 2] = 0;
        data[4 * index + 3] = 0;
      }
    }

    let dataTexture = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;

    return dataTexture;
  }

  // cube
  getPointsOnCube() {
    const data = new Float32Array(4 * this.number);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;

        // Pick a random face of the cube (6 total)
        const face = Math.floor(Math.random() * 6);
        let x, y, z;

        const a = Math.random() * 2 - 1; // in [-1, 1]
        const b = Math.random() * 2 - 1;

        switch (face) {
          case 0:
            x = 1;
            y = a;
            z = b;
            break; // +X face
          case 1:
            x = -1;
            y = a;
            z = b;
            break; // -X face
          case 2:
            x = a;
            y = 1;
            z = b;
            break; // +Y face
          case 3:
            x = a;
            y = -1;
            z = b;
            break; // -Y face
          case 4:
            x = a;
            y = b;
            z = 1;
            break; // +Z face
          case 5:
            x = a;
            y = b;
            z = -1;
            break; // -Z face
        }

        data[4 * index] = x;
        data[4 * index + 1] = y;
        data[4 * index + 2] = z;
        data[4 * index + 3] = (Math.random() - 0.5) * 0.01;
      }
    }

    let dataTexture = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;

    return dataTexture;
  }

  setScene() {
    this.scene = new THREE.Scene();
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0); // Set clear color to transparent
    this.renderer.setSize(this.width, this.height);
    this.targetElement.appendChild(this.renderer.domElement);
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  initGPGPU() {
    this.gpuCompute = new GPUComputationRenderer(
      this.size,
      this.size,
      this.renderer
    );

    this.pointsOnASphere = this.getPointsOnSphere();
    this.velocitiesOnASphere = this.getVelocitiesOnSphere();

    // create new variables
    this.positionVariable = this.gpuCompute.addVariable(
      'uCurrentPosition',
      simFragmentPosition,
      this.pointsOnASphere
    );
    this.velocityVariable = this.gpuCompute.addVariable(
      'uCurrentVelocity',
      simFragmentVelocity,
      this.velocitiesOnASphere
    );

    // set dependencies
    this.gpuCompute.setVariableDependencies(this.positionVariable, [
      this.positionVariable,
      this.velocityVariable,
    ]);
    this.gpuCompute.setVariableDependencies(this.velocityVariable, [
      this.positionVariable,
      this.velocityVariable,
    ]);

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.positionUniforms.uTime = { value: 0.0 };
    this.positionUniforms.uProgress = { value: 0.0 };
    this.positionUniforms.uMouse = { value: new THREE.Vector3(0, 0, 0) };
    this.positionUniforms.uOriginalPosition = { value: this.pointsOnASphere };

    this.velocityUniforms = this.velocityVariable.material.uniforms;
    this.velocityUniforms.uTime = { value: 0.0 };
    this.velocityUniforms.uProgress = { value: 0.0 };
    this.velocityUniforms.uMouse = { value: new THREE.Vector3(0, 0, 0) };
    this.velocityUniforms.uOriginalPosition = { value: this.pointsOnASphere };

    this.gpuCompute.init();
  }

  setupFBO() {
    // create data texture
    const data = new Float32Array(4 * this.number);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;
        data[4 * index] = lerp(-0.5, 0.5, j / (this.size - 1));
        data[4 * index + 1] = lerp(-0.5, 0.5, i / (this.size - 1));
        data[4 * index + 2] = 0;
        data[4 * index + 3] = 1;
      }
    }

    this.positions = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    this.positions.needsUpdate = true;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    this.camera.updateProjectionMatrix();
  }

  mouseEvents() {
    this.sphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 30, 30),
      new THREE.MeshBasicMaterial()
    );
    this.dummy = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 32, 32),
      new THREE.MeshNormalMaterial()
    );
    // this.scene.add(this.dummy);
    this.finalMesh = this.sphereMesh;

    window.addEventListener('mousemove', (e) => {
      this.pointer.x = (e.clientX / this.width) * 2 - 1;
      this.pointer.y = -(e.clientY / this.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects([this.finalMesh]);
      if (intersects.length > 0) {
        this.dummy.position.copy(intersects[0].point);
        this.positionUniforms.uMouse.value = intersects[0].point;
        this.velocityUniforms.uMouse.value = intersects[0].point;
      } else {
        // Restart logic
        this.dummy.position.set(0, 0, 0); // Optional: hide or reset dummy
        this.positionUniforms.uMouse.value.set(0, 0, 0);
        this.velocityUniforms.uMouse.value.set(0, 0, 0);
      }
    });

    window.addEventListener('mousedown', (e) => {
      this.mousepressed = true;
    });
    window.addEventListener('mouseup', (e) => {
      this.mousepressed = false;
    });

    // touch events
    // Touch events for mobile
    window.addEventListener('touchstart', (event) => {
      this.mousepressed = true;
      const touch = event.touches[0];
      this.setPointerFromTouch(touch);
      this.setMousePosition(touch.clientX, touch.clientY);
    });

    window.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      this.setPointerFromTouch(touch);
      if (this.mousepressed) {
        this.setMousePosition(touch.clientX, touch.clientY);
      }
    });

    window.addEventListener('touchend', () => {
      this.mousepressed = false;
    });
  }
  // Helper method to update pointer from touch
  setPointerFromTouch(touch) {
    this.pointer.x = (touch.clientX / this.width) * 2 - 1;
    this.pointer.y = -(touch.clientY / this.height) * 2 + 1;
  }

  // Update uniforms with raycast
  setMousePosition(x, y) {
    const mouse = new THREE.Vector2(
      (x / this.width) * 2 - 1,
      -(y / this.height) * 2 + 1
    );

    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObjects([this.finalMesh]); // or whichever mesh you want to test

    if (intersects.length > 0) {
      const p = intersects[0].point;
      this.positionUniforms.uMouse.value = p;
      this.velocityUniforms.uMouse.value = p;
    }
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.01,
      10
    );

    this.cameraZ = 2.5;

    this.camera.position.z = this.cameraZ;
  }

  addObjects() {
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(this.number * 3);
    const uvs = new Float32Array(this.number * 2);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;
        positions[3 * index] = j / this.size - 0.5;
        positions[3 * index + 1] = i / this.size - 0.5;
        positions[3 * index + 2] = 0;
        uvs[2 * index] = j / (this.size - 1);
        uvs[2 * index + 1] = i / (this.size - 1);
      }
    }
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        uTexture: { value: this.positions },
        uParticleStartColor: { value: new THREE.Color(0x9e889d) },
        uParticleEndColor: { value: new THREE.Color(0xcccccc) },
        uTime: { value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);

    this.mesh.scale.set(0, 0, 0);
  }

  initAnimation() {
    gsap.to(this.mesh.scale, {
      x: 1,
      y: 1,
      z: 1,
      delay: 1,
      duration: 2,
    });
  }

  // update
  render() {
    let angle = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      this.time += 0.05;

      this.material.uniforms.time.value = this.time;

      this.gpuCompute.compute();
      this.renderer.render(this.scene, this.camera);

      this.material.uniforms.uTime.value = this.time;
      this.material.uniforms.uTexture.value =
        this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
      /* this.material.uniforms.uVelocity.value =
        this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture; */

      this.positionUniforms.uTime.value = this.time;
      this.velocityUniforms.uTime.value = this.time;

      if (!this.mousepressed) {
        angle += 0.0025;
      }

      const radius = this.cameraZ; // Distance from target

      this.camera.position.x = radius * Math.cos(angle);
      this.camera.position.z = radius * Math.sin(angle);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    };
    animate();
  }
}

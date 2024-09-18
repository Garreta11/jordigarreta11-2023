import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';

import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import vertexShader from './shaders/vertex.glsl';
import vertexShaderInstanced from './shaders/vertexInstanced.glsl';
import fragmentShader from './shaders/fragment.glsl';
import simVertex from './shaders/simVertex.glsl';
import simFragmentPosition from './shaders/simFragment.glsl';
import simFragmentVelocity from './shaders/simFragmentVelocity.glsl';

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

    this.size = 128;
    this.number = this.size * this.size;

    // scene
    this.scene = new THREE.Scene();

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0); // Set clear color to transparent
    this.renderer.setSize(this.width, this.height);
    this.targetElement.appendChild(this.renderer.domElement);

    // camera
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.01,
      10
    );

    this.camera.position.z = 5;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.loader = new GLTFLoader();

    this.time = 0;
    this._position = new THREE.Vector3();
    // this.setupSettigs();
    Promise.all([this.loader.loadAsync('/models/jordi.glb')]).then(
      ([model]) => {
        this.suzanne = model.scene.children[0];
        this.suzanne.geometry.rotateX(-Math.PI / 2);
        this.suzanne.material = new THREE.MeshNormalMaterial();

        this.sampler = new MeshSurfaceSampler(this.suzanne).build();

        // this.scene.add(this.suzanne);
        this.data1 = this.getPointsOnSphere();
        this.data2 = this.getPointsOnSphere();
        this.mouseEvents();
        this.setupFBO();
        this.initGPGPU();

        this.setOrbitControls();

        this.addObjects();

        window.addEventListener('resize', this.onResize.bind(this));

        this.render();
      }
    );
  }

  setupSettigs() {
    this.settings = {
      progress: 0,
    };

    this.gui = new GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.01).onChange((val) => {
      this.simMaterial.uniforms.uProgress.value = val;
    });
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

  getPointsOnSuzanne() {
    const data = new Float32Array(4 * this.number);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;

        this.sampler.sample(this._position);

        data[4 * index] = this._position.x;
        data[4 * index + 1] = this._position.y;
        data[4 * index + 2] = this._position.z;
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

  mouseEvents() {
    this.raycasterMesh = new THREE.Mesh(
      this.suzanne.geometry,
      new THREE.MeshBasicMaterial()
    );

    // Function to handle raycasting on both touch and mouse events
    const handleInteraction = (x, y) => {
      this.pointer.x = (x / this.width) * 2 - 1;
      this.pointer.y = -(y / this.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects([this.raycasterMesh]);
      if (intersects.length > 0) {
        this.simMaterial.uniforms.uMouse.value = intersects[0].point;
        this.positionUniforms.uMouse.value = intersects[0].point;
        this.velocityUniforms.uMouse.value = intersects[0].point;
      }
    };

    // Mouse event
    window.addEventListener('mousemove', (e) => {
      handleInteraction(e.clientX, e.clientY);
    });

    // Touch event
    window.addEventListener('touchmove', (e) => {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    });

    window.addEventListener('touchstart', (e) => {
      handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    });
  }

  initGPGPU() {
    this.gpuCompute = new GPUComputationRenderer(
      this.size,
      this.size,
      this.renderer
    );

    this.pointsOnASphere = this.getPointsOnSuzanne();
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
    this.velocityUniforms.uMouse = { value: new THREE.Vector3(0, 0, 0) };
    this.velocityUniforms.uOriginalPosition = { value: this.pointsOnASphere };

    const error = this.gpuCompute.init();
    if (error !== null) {
      console.error(error);
    }
  }

  setupFBO() {
    // create Data Texture
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

    // create FBO Scene
    this.sceneFBO = new THREE.Scene();
    this.cameraFBO = new THREE.OrthographicCamera(-1, 1, 1, -1, -2, 2);
    this.cameraFBO.position.z = 1;
    this.cameraFBO.lookAt(new THREE.Vector3(0, 0, 0));

    let geo = new THREE.PlaneGeometry(2, 2, 2, 2);
    this.simMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      wireframe: true,
    });
    this.simMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        uProgress: { value: 0.0 },
        uCurrentPosition: { value: this.data1 },
        uOriginalPosition: { value: this.data1 },
        uOriginalPosition1: { value: this.data2 },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
        uTime: { value: 0.0 },
      },
      vertexShader: simVertex,
      fragmentShader: simFragmentPosition,
    });
    this.simMesh = new THREE.Mesh(geo, this.simMaterial);
    this.sceneFBO.add(this.simMesh);

    this.renderTarget = new THREE.WebGLRenderTarget(this.size, this.size, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });

    this.renderTarget1 = new THREE.WebGLRenderTarget(this.size, this.size, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Set min and max zoom distance
    this.controls.minDistance = 2.5; // Minimum zoom distance
    this.controls.maxDistance = 5; // Maximum zoom distance
    // Disable panning and rotation dragging
    this.controls.enablePan = false;
    this.controls.enableRotate = true;
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
        positions[3 * index + 2] = 0.0;

        uvs[2 * index] = j / (this.size - 1);
        uvs[2 * index + 1] = i / (this.size - 1);
      }
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    this.geometryInstanced = new THREE.SphereGeometry(0.02, 20, 20);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointsSize: { value: 2 },
        uTexture: { value: this.positions },
        uVelocity: { value: null },
        uMatcap: {
          value: new THREE.TextureLoader().load('/matcaps/matcap3.png'),
        },
      },
      vertexShader: vertexShaderInstanced,
      fragmentShader: fragmentShader,
      transparent: true,
    });

    this.mesh = new THREE.InstancedMesh(
      this.geometryInstanced,
      this.material,
      this.number
    );

    // create instance uv reference
    let uvInstanced = new Float32Array(this.number * 2);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = i * this.size + j;
        uvInstanced[2 * index] = j / (this.size - 1);
        uvInstanced[2 * index + 1] = i / (this.size - 1);
      }
    }
    this.geometryInstanced.setAttribute(
      'uvRef',
      new THREE.InstancedBufferAttribute(uvInstanced, 2)
    );

    this.scene.add(this.mesh);
  }

  render() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.time += 0.05;

      this.material.uniforms.time.value = this.time;

      this.gpuCompute.compute();
      this.renderer.render(this.scene, this.camera);

      this.material.uniforms.uTexture.value =
        this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture;
      this.material.uniforms.uVelocity.value =
        this.gpuCompute.getCurrentRenderTarget(this.velocityVariable).texture;

      this.positionUniforms.uTime.value = this.time;
      this.velocityUniforms.uTime.value = this.time;

      this.controls.update();
    };
    animate();
  }
}

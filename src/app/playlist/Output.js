import * as THREE from 'three';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

export default class Output {
  constructor(_options = {}) {
    this.targetElement = _options.targetElement;
    this.width = this.targetElement.clientWidth;
    this.height = this.targetElement.clientHeight;
    this.window = _options.window;

    this.audio = _options.audio;

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.renderer.setPixelRatio(this.window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x080808, 0);

    this.targetElement.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.001,
      1000
    );

    this.loader = new THREE.TextureLoader();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.camera.position.set(0, 0, 2.5);

    this.addObjects();

    this.materials = [];
    this.meshes = [];
    this.groups = [];
    this.pivots = [];
    this.handleImages();

    // Add event listener for mouse movement
    this.onMouseMove = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.onMouseMove, false);

    // Add event listener for mouse clicks
    /* this.handleClick = this.handleClick.bind(this);
    window.addEventListener('click', this.handleClick, false); */

    this.render();
  }

  onMouseMove(event) {
    this.mouse.x = (event.clientX / this.window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / this.window.innerHeight) * 2 + 1;

    //console.log(this.mouse);
  }

  addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
        distanceFromCenter: { type: 'f', value: 0 },
        texture1: { type: 't', value: null },
        resolution: { type: 'v4', value: new THREE.Vector4() },
        uvRate1: {
          value: new THREE.Vector2(1, 1),
        },
      },
      // wireframe: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });
  }

  handleImages() {
    let images = [...document.querySelectorAll('.gallery-images-playlist')];
    images.forEach((im, i) => {
      let mat = this.material.clone();

      this.materials.push(mat);

      let group = new THREE.Group();

      this.loader.load(
        im.src,
        function (texture) {
          mat.uniforms.texture1.value = texture;
        },
        function (err) {
          console.error('An error happened.');
        }
      );

      let geo = new THREE.PlaneGeometry(1, 1, 20, 20);
      // let geo = new THREE.BoxGeometry(1, 1, 0.01);
      let mesh = new THREE.Mesh(geo, mat);

      mesh.userData.url = im.getAttribute('data-song');

      this.pivot = new THREE.Object3D();
      this.pivot.position.set(0, 0, 0);

      mesh.position.set(0, 1 / 2, 0);
      this.pivot.add(mesh);

      this.pivot.rotation.x = 0;

      group.add(this.pivot);

      this.pivots.push(this.pivot);
      this.groups.push(group);
      this.scene.add(group);
      this.meshes.push(mesh);

      //mesh.position.y = i * 3;
      //group.rotation.x = -Math.PI / 4;
    });
  }

  render() {
    this.time += 0.05;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

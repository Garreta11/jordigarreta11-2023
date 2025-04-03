import * as THREE from 'three';
import * as Tone from 'tone';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Resources from './utils/Resources';
import sources from './utils/sources';

export default class Output {
  constructor(_options = {}) {
    this.window = _options.window;
    this.targetElement = _options.targetElement;
    this.resources = new Resources(sources);
    this.resources.on('ready', () => {
      this.setRenderer();
      this.setScene();
      this.setCamera();
      this.setLights();

      // this.setOrbitControls();

      this.setToneJS();

      // this.setHands();

      this.render();
    });
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(this.window.devicePixelRatio);
    this.renderer.setSize(this.window.innerWidth, this.window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.targetElement.appendChild(this.renderer.domElement);
  }

  setScene() {
    this.scene = new THREE.Scene();
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.window.innerWidth / this.window.innerHeight,
      0.1,
      10000
    );

    this.camera.position.y = 0;
    this.camera.position.z = 5;
  }

  setLights() {
    let ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);
  }

  setHands() {
    this.hand = this.resources.items.hand.scenes[0];
    this.scene.add(this.hand);
    const handScale = 0.15;
    this.hand.scale.set(handScale, handScale, handScale);
    console.log(this.hand);

    this.hand.position.set(0, 0, 0);

    // Find the skinned mesh inside the model
    this.skinMesh = this.hand.children[0].children[0];
    console.log(this.skinMesh);

    this.bones = this.skinMesh.skeleton.bones;
    console.log(this.bones);
  }

  moveHand(_landmarks) {
    if (_landmarks.length <= 0) return;
    const pos_hands = _landmarks[0][0];

    const x = this.mapRange(pos_hands.x, 0, 1, 3.5, -3.5);
    const y = this.mapRange(pos_hands.y, 0, 1, 1.5, -2.5);
    const z = pos_hands.z;

    this.hand.position.set(x, y, z);
  }

  mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  setToneJS() {
    this.synth = new Tone.Oscillator().toDestination();
    this.synth.start();
  }

  controlTheremin(x, y) {
    if (!this.synth) return; // Ensure synth is initialized

    const minFreq = 100; // Lower bound for frequency
    const maxFreq = 1000; // Upper bound for frequency
    const frequency = minFreq + (x / window.innerWidth) * (maxFreq - minFreq); // Map X to frequency range
    const volume = Tone.gainToDb(1 - y / window.innerHeight); // Map Y to volume

    this.synth.frequency.value = frequency;
    this.synth.volume.value = volume;
  }

  onResize() {
    // Update renderer size
    this.renderer.setSize(this.window.innerWidth, this.window.innerHeight);

    // Update camera aspect ratio
    this.camera.aspect = this.window.innerWidth / this.window.innerHeight;

    // Update the projection matrix of the camera to apply the aspect ratio change
    this.camera.updateProjectionMatrix();
  }

  render() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }
}

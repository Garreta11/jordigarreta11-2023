import EventEmitter from './EventEmitter';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    // Setup
    this.sources = sources;
    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
    this.fbxLoader = new FBXLoader();
    this.rgbeLoader = new RGBELoader();
  }

  startLoading() {
    for (const source of this.sources) {
      if (source.type === 'gltfModel') {
        this.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'fbxModel') {
        this.fbxLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'environmentMap') {
        this.rgbeLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === 'texture') {
        this.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;
    this.loaded++;
    if (this.loaded === this.toLoad) {
      this.trigger('ready');
    }
  }
}

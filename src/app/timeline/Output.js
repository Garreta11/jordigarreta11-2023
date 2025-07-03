import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

import GUI from 'lil-gui';

// data
import timeline from './timeline.json';

// shaders
import vertexShader from './shaders/terrain/vertex.glsl';
import fragmentShader from './shaders/terrain/fragment.glsl';

import Delaunator from 'delaunator';
import PoissonDiskSampling from 'poisson-disk-sampling';


gsap.registerPlugin(ScrollTrigger);


const SIZE = 50;
var p = new PoissonDiskSampling({
  shape: [SIZE, SIZE],
  minDistance: 0.1,
  maxDistance: 0.3,
  tries: 10
});
var points = p.fill();

let points3D = points.map(p => {
  return new THREE.Vector3(p[0], 0, p[1]);
})

let indexDelaunay = Delaunator.from(
  points.map(p => {
    return [p[0], p[1]];
  })
);

export default class Output {
  constructor(_options = {}) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.targetElement = _options.targetElement;

    this.timelineData = timeline;
    this.setScene();
    this.setRenderer();
    this.setCamera();
    this.setMouseMovement();
    this.setLights();

    this.set3dTimeline();
    this.setMediaPlanes();

    this.setGround()
    // this.setupSettigs();

    this.setScroll()
    this.setResize();
    this.render();
  }

  setupSettigs() {
    this.settings = {
      valleyWidth: 0.5,
      valleySharpness: 0.5
    };

    this.gui = new GUI();
    this.gui.add(this.settings, 'valleyWidth', 0, 1, 0.01).onChange((val) => {
      this.groundMaterial.uniforms.valleyWidth.value = val;
    });
    this.gui.add(this.settings, 'valleySharpness', 0, 1, 0.01).onChange((val) => {
      this.groundMaterial.uniforms.valleySharpness.value = val;
    });
  }

  setScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog( this.timelineData[0].skyColor, 0.1, 5 );
  }

  setRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setSize(this.width, this.height);
    this.targetElement.appendChild(this.renderer.domElement);
  }

  setCamera() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.01,
      1000
    );

    this.cameraZ = 1;
    this.camera.position.z = this.cameraZ;

    // this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  setLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(1, 1, 1);
    this.scene.add(this.directionalLight);
  }

  setGround() {

    this.groundMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        uColor: { value: new THREE.Color(0xFFFFFF) },
        valleyWidth: { value: 0.5 },
        valleySharpness: { value: 0.5 }
      },
      wireframe: true
    });

    this.geometry = new THREE.BufferGeometry().setFromPoints(points3D);
    let meshIndex = [];
    for (let i = 0; i < indexDelaunay.triangles.length; i+=1) {
      meshIndex.push(indexDelaunay.triangles[i]);
    }
    this.geometry.computeVertexNormals();
    this.geometry.setIndex(meshIndex);
    
    this.mesh = new THREE.Mesh(this.geometry, this.groundMaterial);
    this.mesh.position.x = -SIZE/2;
    this.mesh.position.y = -0.25;
    this.mesh.position.z = -SIZE/2;
    
    this.scene.add(this.mesh);

  }

  set3dTimeline() {
    const loader = new FontLoader();
    loader.load('/fonts/HelveticaNeueBlackExt.json', (font) => {
      this.textMeshes = [];
  
      timeline.forEach((entry, index) => {
        // Create year text
        const yearText = entry.endYear ? `${entry.year} - ${entry.endYear}` : `${entry.year}`;
        const yearGeo = new TextGeometry(yearText, {
          font,
          size: 0.01,  // Slightly larger for year
          height: 0.0025,
        });
        yearGeo.computeBoundingBox();
        const yearWidth = yearGeo.boundingBox.max.x - yearGeo.boundingBox.min.x;
  
        // Create title text
        const titleGeo = new TextGeometry(entry.title, {
          font,
          size: 0.01,  // Smaller for title
          height: 0.0025,
        });
        titleGeo.computeBoundingBox();
        const titleWidth = titleGeo.boundingBox.max.x - titleGeo.boundingBox.min.x;
  
        // Materials
        const yearMaterial = new THREE.MeshStandardMaterial({ 
          color: this.timelineData[index].skyColor, 
          transparent: true, 
          opacity: 0 
        });
        const titleMaterial = new THREE.MeshStandardMaterial({ 
          color: this.timelineData[index].skyColor,
          transparent: true, 
          opacity: 0 
        });
  
        // Create meshes
        const yearMesh = new THREE.Mesh(yearGeo, yearMaterial);
        const titleMesh = new THREE.Mesh(titleGeo, titleMaterial);
  
        const lineSpacing = 0.015; // Distance between lines
  
        // Position year text (top line)
        yearMesh.position.set(
          -yearWidth / 2,     // Center horizontally
          0.05 + lineSpacing / 2,    // Position above center
          -index * 2          // Z spacing for timeline
        );
  
        // Position title text (bottom line)
        titleMesh.position.set(
          -titleWidth / 2,    // Center horizontally
          0.05 + -lineSpacing / 2,   // Position below center
          -index * 2          // Z spacing for timeline
        );
  
        // Add to scene
        this.scene.add(yearMesh);
        this.scene.add(titleMesh);
  
        // Store both meshes for fade animation
        this.textMeshes.push(yearMesh);
        this.textMeshes.push(titleMesh);
      });
    });
  }

  setMediaPlanes() {
    this.mediaPlanes = [];
    const textureLoader = new THREE.TextureLoader();
  
    timeline.forEach((entry, entryIndex) => {
      if (!entry.media || entry.media.length === 0) return;
  
      const mediaCount = entry.media.length;
      const spacing = 0.7; // Space between media items
      const totalWidth = (mediaCount - 1) * spacing;
      const startX = -totalWidth / 2; // Center the media group
  
      entry.media.forEach((mediaItem, mediaIndex) => {
        let material;
        let width, height;
  
        if (mediaItem.type === 'image') {
          // Load image texture
          const texture = textureLoader.load(mediaItem.src);
  
          // Create a temporary image to get size
          const img = new Image();
          img.src = mediaItem.src;
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            height = 0.4; // fixed height you want
            width = height * aspectRatio;
  
            const planeGeometry = new THREE.PlaneGeometry(width, height);
            material = new THREE.MeshStandardMaterial({ 
              map: texture,
              transparent: true,
              opacity: 0
            });
  
            const plane = new THREE.Mesh(planeGeometry, material);
            const currentZ = -entryIndex * 2;
            const nextZ = -(entryIndex + 1) * 2;
            const mediaZ = currentZ + (nextZ - currentZ) * (0.25 + Math.random() * (0.75 - 0.25));

            const yOffset = (mediaIndex % 2 === 0 ? 1 : -1) * 0.05;
  
            plane.position.set(
              startX + mediaIndex * spacing, // distribute horizontally
              yOffset,
              mediaZ
            );
  
            this.scene.add(plane);
            this.mediaPlanes.push(plane);
          };
          return; // exit forEach here because we wait for img.onload
        }
        else if (mediaItem.type === 'video') {
          const video = document.createElement('video');
          video.src = mediaItem.src;
          video.crossOrigin = 'anonymous';
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
  
          const videoTexture = new THREE.VideoTexture(video);
          videoTexture.minFilter = THREE.LinearFilter;
          videoTexture.magFilter = THREE.LinearFilter;
  
          video.addEventListener('loadedmetadata', () => {
            const aspectRatio = video.videoWidth / video.videoHeight;
            height = 0.4;
            width = height * aspectRatio;
  
            const planeGeometry = new THREE.PlaneGeometry(width, height);
            material = new THREE.MeshStandardMaterial({ 
              map: videoTexture,
              transparent: true,
              opacity: 0
            });
  
            material.video = video;
  
            const plane = new THREE.Mesh(planeGeometry, material);
            const currentZ = -entryIndex * 2;
            const nextZ = -(entryIndex + 1) * 2;
            const mediaZ = currentZ + (nextZ - currentZ) * (0.25 + Math.random() * (0.75 - 0.25));

            const yOffset = (mediaIndex % 2 === 0 ? 1 : -1) * 0.05;
  
            plane.position.set(
              startX + mediaIndex * spacing,
              yOffset,
              mediaZ
            );
  
            this.scene.add(plane);
            this.mediaPlanes.push(plane);
  
            // Start playing video
            video.play();
          });
          return; // exit forEach, wait for video metadata
        }
      });
    });
  }
  
  // scroll
  setScroll() {
    if (!this.timelineData) return;

    const entries = this.timelineData.length;
    const totalScroll = 100 * (entries * 2); // e.g., 100% per entry
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.targetElement,
        start: 'top top',
        end: `+=${totalScroll}%`,
        markers: true,
        scrub: true,
        onUpdate: (self) => {
          // Calculate which timeline entry we're currently at
          const progress = self.progress;
          const currentIndex = Math.floor(progress * (entries - 1));
          const nextIndex = Math.min(currentIndex + 1, entries - 1);
          const localProgress = (progress * (entries - 1)) - currentIndex;
          
          // Get current and next colors
          const currentColor = new THREE.Color(this.timelineData[currentIndex].skyColor);
          const nextColor = new THREE.Color(this.timelineData[nextIndex].skyColor);
          
          // Interpolate between colors
          const interpolatedColor = currentColor.clone().lerp(nextColor, localProgress);
          
          // Update renderer clear color and scene fog
          //this.renderer.setClearColor(interpolatedColor);
          if (this.groundMaterial) {
            this.groundMaterial.uniforms.uColor.value = interpolatedColor;
          }
          if (this.scene.fog) {
            this.scene.fog.color.copy(interpolatedColor);
          }
        }
      },
    });

    tl.to(this.camera.position, {
      z: -2 * timeline.length,
      ease: 'none',
    });
  }

  // mouse
  setMouseMovement() {
    // Mouse tracking variables
    this.mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    };
    
    // Camera offset limits
    this.cameraOffset = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      maxX: 0.2, // Maximum horizontal movement
      maxY: 0.1  // Maximum vertical movement
    };
    
    // Mouse move event listener
    window.addEventListener('mousemove', (event) => {
      // Normalize mouse coordinates to -1 to 1
      this.mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Calculate camera target positions
      this.cameraOffset.targetX = this.mouse.targetX * this.cameraOffset.maxX;
      this.cameraOffset.targetY = this.mouse.targetY * this.cameraOffset.maxY;
    });
    
    // Optional: Reset camera position when mouse leaves window
    window.addEventListener('mouseleave', () => {
      this.cameraOffset.targetX = 0;
      this.cameraOffset.targetY = 0;
    });
  }

  // resize
  setResize() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.renderer.setSize(this.width, this.height);
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    });
  }

  // update
  render() {
    const animate = () => {
      requestAnimationFrame(animate);
  
      // Smooth mouse interpolation
      this.mouse.x = gsap.utils.interpolate(this.mouse.x, this.mouse.targetX, 0.05);
      this.mouse.y = gsap.utils.interpolate(this.mouse.y, this.mouse.targetY, 0.05);
      
      // Smooth camera offset interpolation
      this.cameraOffset.x = gsap.utils.interpolate(
        this.cameraOffset.x, 
        this.cameraOffset.targetX, 
        0.08
      );
      this.cameraOffset.y = gsap.utils.interpolate(
        this.cameraOffset.y, 
        this.cameraOffset.targetY, 
        0.08
      );
      
      // Apply camera offset (only when not being controlled by scroll)
      this.camera.position.x = this.cameraOffset.x;
      this.camera.position.y = this.cameraOffset.y;
      
      // Optional: Add subtle camera rotation based on mouse movement
      this.camera.rotation.x = this.mouse.y * 0.05;
      this.camera.rotation.y = this.mouse.x * 0.05;
  
      // Fade text meshes based on camera distance
      if (this.textMeshes && this.camera) {
        this.textMeshes.forEach((mesh) => {
          const distance = Math.abs(this.camera.position.z - mesh.position.z);
          const maxFadeDistance = 2;
          const fade = Math.max(0, 1 - distance / maxFadeDistance);
          mesh.material.opacity = fade;
        });
      }
      
      // Fade media planes and control video playback
      if (this.mediaPlanes && this.camera) {
        this.mediaPlanes.forEach((plane) => {
          const distance = Math.abs(this.camera.position.z - plane.position.z);
          const maxFadeDistance = 3.0; // Larger fade distance
          
          // Exponential curve - reaches 1 much earlier, then slowly fades out
          const normalizedDistance = distance / maxFadeDistance;
          const fade = Math.max(0, Math.pow(1 - normalizedDistance, 0.5)); // Square root for faster initial appearance
          
          plane.material.opacity = fade;
          
          if (plane.material.video) {
            if (fade > 0.1) {
              plane.material.video.play().catch(() => {});
            } else {
              plane.material.video.pause();
            }
          }
        });
      }

      // Update ground shader
      if (this.groundMaterial) {
        this.groundMaterial.uniforms.time.value += 0.02;
      }
  
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }
  
  
}
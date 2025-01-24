import * as THREE from 'three';
import { gsap } from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Resources from './utils/Resources';
import sources from './utils/sources';

export default class Output {
  constructor(_options = {}) {
    this.window = _options.window;
    this.targetElement = _options.targetElement;

    this.numberBalls = 75;
    this.gridRows = 5; // Define the number of rows
    this.gridColumns = 15; // Define the number of columns

    this.radius = 5;
    this.initSpeed = 1;
    this.settings = {
      speed: this.initSpeed,
    };

    // Initialize targetPositions and any other state you need
    this.targetPositions = Array(this.numberBalls).fill(null); // Store target positions for selected meshes

    this.resources = new Resources(sources);
    this.resources.on('ready', () => {
      this.setRenderer();
      this.setScene();
      this.setCamera();
      this.setLights();
      this.setHDRI();

      //this.setOrbitControls();

      this.setWorld();

      this.setBoard();
      this.setInstanceMesh();

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
      0.01,
      10000
    );

    this.camera.position.y = 0;
    this.camera.position.z = 90;
  }

  setLights() {
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Point Light
    const bulbLight = new THREE.PointLight(0xf0a030, 1000, 1000); // Warm yellow light
    bulbLight.castShadow = true; // Enable shadows
    this.scene.add(bulbLight);
    bulbLight.position.y = 25;
    bulbLight.position.z = 43;
  }

  setHDRI() {
    this.hdri = this.resources.items.envmap;
    this.hdri.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.environment = this.hdri;
    this.scene.environmentIntensity = 0.1;
  }

  setWorld() {
    // FLOOR
    this.floorGeometry = new THREE.PlaneGeometry(500, 500);
    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xc2c2c2,
      map: this.resources.items.floorDiff, // Applies the diffuse map
      normalMap: this.resources.items.floorNormal, // Applies the normal map
      roughnessMap: this.resources.items.floorRough, // Applies the roughness map
      side: THREE.DoubleSide,
    });
    this.floor = new THREE.Mesh(this.floorGeometry, this.floorMaterial);
    this.scene.add(this.floor);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -33;
    this.floor.receiveShadow = true;

    // WALLS
    this.wall = new THREE.PlaneGeometry(500, 200);
    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: 0x4d4d4d,
      map: this.resources.items.wall, // Applies the diffuse map
      normalMap: this.resources.items.floorNormal, // Applies the normal map
      roughnessMap: this.resources.items.floorRough, // Applies the roughness map
      side: THREE.DoubleSide,
    });
    this.wall1 = new THREE.Mesh(this.wall, this.wallMaterial);
    this.wall1.position.y = 50;
    this.wall1.receiveShadow = true;
    this.wall1.castShadow = true;

    this.wall2 = this.wall1.clone();
    this.wall3 = this.wall1.clone();

    this.wall1.position.z = -150;

    this.wall2.position.x = 175;
    this.wall2.rotation.y = Math.PI / 2;

    this.wall3.position.x = -175;
    this.wall3.rotation.y = -Math.PI / 2;

    this.scene.add(this.wall1);
    this.scene.add(this.wall2);
    this.scene.add(this.wall3);

    // PLANT
    this.plant = this.resources.items.plant.scenes[0];
    this.scene.add(this.plant);
    const plantScale = 50;
    this.plant.scale.set(plantScale, plantScale, plantScale);
    this.plant.position.x = 50;
    this.plant.position.y = -33;
    this.plant.position.z = -20;
    this.plant.rotation.x = 0;
    this.plant.rotation.y = 0;
    this.plant.rotation.z = 0;
    this.plant.receiveShadow = true;
    this.plant.castShadow = true;

    // PICTURE
    this.picture = this.resources.items.picture.scene;
    this.scene.add(this.picture);
    const pictureScale = 150;
    this.picture.scale.set(pictureScale, pictureScale, pictureScale);
    this.picture.position.x = -40;
    this.picture.position.y = 2;
    this.picture.position.z = -20;
    this.picture.rotation.y = Math.PI / 5;
    this.picture.castShadow = true;

    // LAMP
    this.lamp = this.resources.items.lamp.scene;
    this.scene.add(this.lamp);
    const lampScale = 40;
    this.lamp.scale.set(lampScale, lampScale, lampScale);
    this.lamp.position.x = 0;
    this.lamp.position.y = 10;
    this.lamp.position.z = 43;

    // TABLE
    this.table = this.resources.items.table.scenes[0];
    this.scene.add(this.table);
    const tableScale = 50;
    this.table.scale.set(tableScale, tableScale, tableScale);
    this.table.position.x = 0;
    this.table.position.y = -33;
    this.table.position.z = 43;
    this.table.rotation.x = 0;
    this.table.rotation.y = 0;
    this.table.rotation.z = 0;
    this.table.receiveShadow = true;
    this.table.castShadow = true;

    // ASHTRAY
    this.ashtray = this.resources.items.ashtray.scenes[0];
    this.scene.add(this.ashtray);
    const ashtrayScale = 50;
    this.ashtray.scale.set(ashtrayScale, ashtrayScale, ashtrayScale);
    this.ashtray.position.x = 12;
    this.ashtray.position.y = -9;
    this.ashtray.position.z = 37;
    this.ashtray.rotation.x = 0;
    this.ashtray.rotation.y = 0;
    this.ashtray.rotation.z = 0;
    this.ashtray.receiveShadow = true;
    this.ashtray.castShadow = true;

    // WHISKY
    this.whisky = this.resources.items.whisky.scenes[0];
    console.log(this.resources.items.whisky.scenes[0]);
    this.scene.add(this.whisky);
    const whiskyScale = 1.5;
    this.whisky.scale.set(whiskyScale, whiskyScale, whiskyScale);
    this.whisky.position.x = -16;
    this.whisky.position.y = -10.8;
    this.whisky.position.z = 35;
    this.whisky.rotation.x = 0;
    this.whisky.rotation.y = Math.PI / 4;
    this.whisky.rotation.z = 0;
    this.whisky.receiveShadow = true;
    this.whisky.castShadow = true;

    // CHAIR #1
    this.chair = this.resources.items.chair.scenes[0];
    this.scene.add(this.chair);
    const chairScale = 25;
    this.chair.scale.set(chairScale, chairScale, chairScale);
    this.chair.position.x = 40;
    this.chair.position.y = -33;
    this.chair.position.z = 30;
    this.chair.rotation.x = 0;
    this.chair.rotation.y = -Math.PI / 4;
    this.chair.rotation.z = 0;
    this.chair.receiveShadow = true;
    this.chair.castShadow = true;

    // CHAIR #2
    this.chair2 = this.chair.clone();
    this.scene.add(this.chair2);
    this.chair2.scale.set(chairScale, chairScale, chairScale);
    this.chair2.position.x = -40;
    this.chair2.position.y = -33;
    this.chair2.position.z = 30;
    this.chair2.rotation.x = 0;
    this.chair2.rotation.y = Math.PI / 4;
    this.chair2.rotation.z = 0;
  }

  setBoard() {
    // Load the texture from the JPG image
    const texture = this.resources.items.board;

    const geometry = new THREE.PlaneGeometry(15, 5);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    this.board = new THREE.Mesh(geometry, material);
    this.scene.add(this.board);

    // scale
    const scale = 2;
    this.board.scale.set(scale, scale, scale);

    // position
    this.board.position.x = 0;
    this.board.position.y = -8.5;
    this.board.position.z = 47.5;

    // rotation
    this.board.rotation.x = -Math.PI / 2;
  }

  setInstanceMesh() {
    // Glass
    const geometrySphere = new THREE.SphereGeometry(6, 32, 64);
    const materialSphere = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 1.0, // Makes the material transparent
      ior: 1.5, // Index of Refraction
      envMap: this.resources.items.envmap,
      envMapIntensity: 0.1,
      clearcoat: 1.0, // Adds a shiny layer
      clearcoatRoughness: 0.1,
    });
    const sphere = new THREE.Mesh(geometrySphere, materialSphere);
    this.scene.add(sphere);
    sphere.position.x = 0;
    sphere.position.y = -3;
    sphere.position.z = 37;

    // Instance meshes
    const geometry = new THREE.IcosahedronGeometry(1, 3);
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.3, // Slightly rough for metallic look
      metalness: 1.0, // Fully metallic
      color: 0xffd700, // Metallic gold color
    });
    this.mesh = new THREE.InstancedMesh(geometry, material, this.numberBalls);
    this.scene.add(this.mesh);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = -3;
    this.mesh.position.z = 37;

    const radius = this.radius;
    this.dummy = new THREE.Object3D();

    // Store positions and velocities for each instance
    this.positions = [];
    this.velocities = [];
    this.rotationTargets = [];
    this.scales = [];

    for (let i = 0; i < this.numberBalls; i++) {
      // Generate spherical coordinates
      const phi = Math.acos(2 * Math.random() - 1); // Polar angle [0, π]
      const theta = Math.random() * 2 * Math.PI; // Azimuthal angle [0, 2π]
      const r = Math.cbrt(Math.random()) * radius; // Random radius within the sphere

      // Convert to Cartesian coordinates
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      // Store initial position and a random velocity
      this.positions.push({ x, y, z });
      this.velocities.push({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1,
      });

      const s_x = 0.5;
      const s_y = 0.5;
      const s_z = 0.5;
      this.scales.push({ s_x, s_y, s_z });

      // Initialize rotation targets for GSAP
      const rotationTarget = {
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2,
      };
      this.rotationTargets.push(rotationTarget);

      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(
        rotationTarget.x,
        rotationTarget.y,
        rotationTarget.z
      );
      this.dummy.scale.set(s_x, s_y, s_z);

      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
      // this.mesh.setColorAt(i, new THREE.Color(Math.random() * 0xffffff));
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    // this.mesh.instanceColor.needsUpdate = true;
  }

  selectMesh(index) {
    index -= 1;

    // Calculate the 5x15 grid position for the selected index
    const row = 4 - Math.floor(index / this.gridColumns); // Get the row (0-4)
    let col = index % this.gridColumns; // Get the column (0-14)

    // Define the grid spacing, adjust based on your scene scale
    const gridSpacing = 2; // Adjust spacing between grid positions

    // Calculate the position in the grid
    const targetX =
      1 + col * gridSpacing - (this.gridColumns * gridSpacing) / 2;
    const targetY =
      -9.5 + row * gridSpacing - (this.gridRows * gridSpacing) / 2;
    const targetZ = -8 + 3;

    gsap.to(this.settings, {
      speed: 3,
    });

    document.getElementsByClassName('play-btn')[0].style.display = 'none';

    setTimeout(() => {
      // Store the target position for the selected instance
      this.targetPositions[index] = { x: targetX, y: targetY, z: targetZ };

      // Optionally animate the mesh to the new position with GSAP
      gsap.to(this.positions[index], {
        x: targetX,
        y: targetY,
        z: targetZ,
        duration: 2, // Duration for animation
        ease: 'power2.out',
      });
      gsap.to(this.settings, {
        speed: this.initSpeed,
      });

      gsap.fromTo(
        '.number',
        {
          opacity: 0,
          fontSize: 0,
        },
        {
          opacity: 1,
          fontSize: 300,
        }
      );

      document.getElementsByClassName('play-btn')[0].style.display = 'block';
      document.getElementsByClassName('play-btn')[0].style.zIndex = '1';
    }, 7000);
  }

  setOrbitControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  startExperience() {
    document.getElementsByClassName('play-btn')[0].style.display = 'none';
    gsap.fromTo(
      this.camera.position,
      {
        z: 180,
        y: 0,
      },
      {
        z: 65,
        y: 16,
        duration: 3,
        delay: 2,
      }
    );
    gsap.fromTo(
      this.camera.rotation,
      {
        x: 0,
      },
      {
        x: -Math.PI / 4,
        duration: 1,
        delay: 4,
        onComplete() {
          document.getElementsByClassName('play-btn')[0].style.display = 'block';
          document.getElementsByClassName('play-btn')[0].style.zIndex = 1;
        },
      }
    );
  }

  render() {
    const animate = () => {
      requestAnimationFrame(animate);

      // Animate instance positions
      for (let i = 0; i < this.numberBalls; i++) {
        const pos = this.positions[i];
        const vel = this.velocities[i];
        const rot = this.rotationTargets[i];
        const sc = this.scales[i];

        // If this instance has a target position (e.g., after selectMesh), animate towards it
        if (this.targetPositions[i]) {
          const target = this.targetPositions[i];
          // Move towards target position
          pos.x += (target.x - pos.x) * 0.05; // 0.05 is the speed towards the target
          pos.y += (target.y - pos.y) * 0.05;
          pos.z += (target.z - pos.z) * 0.05; // Z position is fixed to keep the instance in the same plane

          sc.s_x += (0.5 - sc.s_x) * 0.05;
          sc.s_y += (0.5 - sc.s_y) * 0.05;
          sc.s_z += (0.5 - sc.s_z) * 0.05;
        } else {
          // Normal animation logic for position
          pos.x += vel.x * this.settings.speed;
          pos.y += vel.y * this.settings.speed;
          pos.z += vel.z * this.settings.speed;

          // Reflect velocity if outside bounds
          const length = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
          if (length > this.radius) {
            const normal = {
              x: pos.x / length,
              y: pos.y / length,
              z: pos.z / length,
            };
            const dot = vel.x * normal.x + vel.y * normal.y + vel.z * normal.z;
            vel.x -= 2 * dot * normal.x;
            vel.y -= 2 * dot * normal.y;
            vel.z -= 2 * dot * normal.z;
            pos.x = normal.x * this.radius;
            pos.y = normal.y * this.radius;
            pos.z = normal.z * this.radius;
            gsap.to(rot, {
              duration: 1,
              x: Math.random() * Math.PI * 2,
              y: Math.random() * Math.PI * 2,
              z: Math.random() * Math.PI * 2,
            });
          }
        }

        this.dummy.scale.set(sc.s_x, sc.s_y, sc.s_z);
        this.dummy.position.set(pos.x, pos.y, pos.z);
        this.dummy.rotation.set(rot.x, rot.y, rot.z);
        this.dummy.updateMatrix();
        this.mesh.setMatrixAt(i, this.dummy.matrix);
      }
      this.mesh.instanceMatrix.needsUpdate = true;

      this.renderer.render(this.scene, this.camera);
      if (this.controls) this.controls.update();
    };

    animate();
  }
}

'use client'
import styles from './Particles.module.scss'
import { useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three'

import TouchTexture from "../TouchTexture/TouchTexture";

const WIDTH = 16
const HEIGHT = 9

const ParticleMaterial = shaderMaterial(
    {
        uRandom: 0.1,
        uSizePart: 0.1,
        uTouch: null,
        uTime: 0,
        uDepth: 0.0,
        uSize: 0.0,
        uTextureSize: new THREE.Vector2(0, 0)
    },
    // vertex shader
    /*glsl*/`
        attribute float pindex;
        attribute vec3 offset;
        attribute float angle;

        uniform float uSizePart;
        uniform float uRandom;
        uniform float uTime;
        uniform float uDepth;
        uniform float uSize;
        uniform vec2 uTextureSize;

        uniform float scale;

        float random(float n) {
            return fract(sin(n) * 43758.5453123);
        }

        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                -0.577350269189626, 0.024390243902439);
            
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod(i, 289.0);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
            
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            #include <begin_vertex>

            float grey = 0.5;

            // displacement
            vec3 displaced = offset;

            // randomise
            displaced.xy += vec2(random(pindex) - 0.5, random(offset.x + pindex) - 0.5) * uRandom;
            float rndz = (random(pindex) + snoise(vec2(pindex * 0.1, uTime * 0.1)));
            displaced.z += rndz * (random(pindex) * 2.0 * uDepth);

            // center
            displaced.xy -= uTextureSize * 0.5;

            // particle size
            float psize = (snoise(vec2(uTime, pindex) * 0.5) + 2.0);
            psize *= max(grey, 0.2);
            psize *= uSize;

            // final position
            vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
            mvPosition.xyz += position * psize;
            vec4 finalPosition = projectionMatrix * mvPosition;

            gl_Position = finalPosition;
            gl_PointSize = uSizePart;
        }

    `,
    // fragment shader
    /*glsl*/`
        float circle(vec2 uv, float border) {
            float radius = 0.5;
            float dist = radius - distance(uv, vec2(0.5));
            return smoothstep(0.0, border, dist);
        }

        void main() {
            vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
            
            gl_FragColor = color;
            gl_FragColor.a *= circle(gl_PointCoord, 0.2);
        }
    `
)

extend({ ParticleMaterial })


const Particles = () => {

    console.log("particles")

    return (
        <div className={styles.particles}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <OrbitControls />
                <directionalLight position={[1, 1, 1]} />
                <ambientLight intensity={1} color="#b0b0b0"/>
                <Scene />
            </Canvas>
        </div>
    )
}

const Scene = () => {

    const { camera, mouse } = useThree();

    const particlesRef = useRef()
    const touchRef = useRef()
    const particlesMatRef = useRef()

    const [touchTexture, setTouchTexture] = useState()
    const [hovered, setHovered] = useState();

    const [widthTexture, setWidthTexture] = useState(WIDTH)
    const [heightTexture, setHeightTexture] = useState(HEIGHT)

    const raycaster = new THREE.Raycaster();

    const customBufferGeometry = useMemo(() => {

        const numPoints = WIDTH * HEIGHT

        setWidthTexture(WIDTH)
        setHeightTexture(HEIGHT)

        const geometry = new THREE.InstancedBufferGeometry();
        
        // positions
        const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
        positions.setXYZ(0, -0.5, 0.5, 0.0);
        positions.setXYZ(1, 0.5, 0.5, 0.0);
        positions.setXYZ(2, -0.5, -0.5, 0.0);
        positions.setXYZ(3, 0.5, -0.5, 0.0);
        geometry.setAttribute('position', positions);

        // uvs
        const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
        uvs.setXYZ(0, 0.0, 0.0);
        uvs.setXYZ(1, 1.0, 0.0);
        uvs.setXYZ(2, 0.0, 1.0);
        uvs.setXYZ(3, 1.0, 1.0);
        geometry.setAttribute('uv', uvs);

        // index
        geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([ 0, 2, 1, 2, 3, 1 ]), 1));

        const indices = new Uint16Array(numPoints);
        const offsets = new Float32Array(numPoints * 3);
        const angles = new Float32Array(numPoints);

        for (let i = 0, j = 0; i < numPoints; i++) {

            offsets[j * 3 + 0] = i % WIDTH;
            offsets[j * 3 + 1] = Math.floor(i / WIDTH);
        
            indices[j] = i;
        
            angles[j] = Math.random() * Math.PI;

            j++;
        }

        geometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
        geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
        geometry.setAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));        

        setTouchTexture(new TouchTexture(this))

        return geometry;
    }, [WIDTH, HEIGHT])

    useFrame(({ clock }) => {
        // const time = clock.elapsedTime;
        // particlesMatRef.current.uniforms.uTime.value = time;

        // if (touchTexture) {
        //     touchTexture.update()
        //     // particlesRef.current.material.uniforms.uTouch.value = touchTexture.texture;

        //     raycaster.setFromCamera(mouse, camera);
        //     const intersects = raycaster.intersectObject(touchRef.current);
        //     if (intersects.length > 0) {
        //         const intersectionUV = intersects[0].uv;
        //         if (touchTexture) touchTexture.addTouch(intersectionUV);
        //     }
        // }
    })

    return(
        <>
            {/* <points
                ref={particlesRef}
                position={[0, 0, 0]}
            >
                <instancedBufferGeometry attach="geometry" {...customBufferGeometry} />
                <particleMaterial
                    ref={particlesMatRef}
                    uSizePart={3.5}
                    uTextureSize={new THREE.Vector2(widthTexture, heightTexture)}
                />
            </points> */}

            <mesh>
                <boxGeometry />
                <meshStandardMaterial />                
            </mesh>

            {/* {touchTexture && (
                <mesh
                    ref={touchRef}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                    visible={true}
                >
                    <planeGeometry attach="geometry" args={[widthTexture, heightTexture]} />
                    <meshStandardMaterial map={touchTexture.texture}/>
                </mesh>
            )} */}
        </>
    )
}

export default Particles;
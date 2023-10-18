'use client'
import styles from './Particles.module.scss'
import { useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial, OrbitControls } from '@react-three/drei';
import { useControls } from 'leva'
import gsap from 'gsap'

const ParticleMaterial = shaderMaterial(
    {
        uFrequency: 0.7,
        uAmplitude: 0.3,
        uMaxDistance: 1.,
        uSphere: 1.0,
        uSize: 0.596,
        uTime: 0.0,
        uSpeed: 0.1
    },
    // vertex shader
    /*glsl*/`
        uniform float uFrequency;
        uniform float uAmplitude;
        uniform float uMaxDistance;
        uniform float uSphere;
        uniform float uSize;
        uniform float uTime;
        uniform float uSpeed;

        vec3 mod289(vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec2 mod289(vec2 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec3 permute(vec3 x) {
            return mod289(((x*34.0)+1.0)*x);
        }

        float noise(vec2 v) {
            const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                            -0.577350269189626,  // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
            // First corner
            vec2 i  = floor(v + dot(v, C.yy) );
            vec2 x0 = v -   i + dot(i, C.xx);
        
            // Other corners
            vec2 i1;
            //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
            //i1.y = 1.0 - i1.x;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            // x0 = x0 - 0.0 + 0.0 * C.xx ;
            // x1 = x0 - i1 + 1.0 * C.xx ;
            // x2 = x0 - 1.0 + 2.0 * C.xx ;
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
        
            // Permutations
            i = mod289(i); // Avoid truncation effects in permutation
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
        
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ;
            m = m*m ;
        
            // Gradients: 41 points uniformly over a line, mapped onto a diamond.
            // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
        
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
        
            // Normalise gradients implicitly by scaling m
            // Approximation of: m *= inversesqrt( a0*a0 + h*h );
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        
            // Compute final noise value at P
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }
            
        vec3 curl(float	x,	float	y,	float	z) {
                
            float	eps	= 1., eps2 = 2. * eps;
            float	n1,	n2,	a,	b;
        
            x += uTime * uSpeed;
            y += uTime * uSpeed;
            z += uTime * uSpeed;
        
            vec3	curl = vec3(0.);
        
            n1	=	noise(vec2( x,	y	+	eps ));
            n2	=	noise(vec2( x,	y	-	eps ));
            a	=	(n1	-	n2)/eps2;
        
            n1	=	noise(vec2( x,	z	+	eps));
            n2	=	noise(vec2( x,	z	-	eps));
            b	=	(n1	-	n2)/eps2;
        
            curl.x	=	a	-	b;
        
            n1	=	noise(vec2( y,	z	+	eps));
            n2	=	noise(vec2( y,	z	-	eps));
            a	=	(n1	-	n2)/eps2;
        
            n1	=	noise(vec2( x	+	eps,	z));
            n2	=	noise(vec2( x	+	eps,	z));
            b	=	(n1	-	n2)/eps2;
        
            curl.y	=	a	-	b;
        
            n1	=	noise(vec2( x	+	eps,	y));
            n2	=	noise(vec2( x	-	eps,	y));
            a	=	(n1	-	n2)/eps2;
        
            n1	=	noise(vec2(  y	+	eps,	z));
            n2	=	noise(vec2(  y	-	eps,	z));
            b	=	(n1	-	n2)/eps2;
        
            curl.z	=	a	-	b;
        
            return	curl;
        }

        void main() {
            
            #include <begin_vertex>

            float f = uFrequency;
            float amplitude = uAmplitude;
            float maxDistance = uMaxDistance;

            vec3 target = position + amplitude * curl(f * transformed.x, f * transformed.y, f * transformed.z);
            float d = length(transformed - target) / maxDistance;
            transformed = mix(position, target, pow(d, uSphere)) * uSize;

            vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
            vec4 finalPosition = projectionMatrix * mvPosition;

            gl_Position = finalPosition;
            gl_PointSize = 1.5;
        }
    `,

    // fragment shader
    /*glsl*/`
        void main() {
            vec4 color = vec4(0.18, 0.18, 0.18, 1.0);

            gl_FragColor = color;
        }
    `
)

extend({ ParticleMaterial })

const mapValue = (value, fromLow, fromHigh, toLow, toHigh) => {
    return (value - fromLow) * (toHigh - toLow) / (fromHigh - fromLow) + toLow;
}


const Particles = ({zoom}) => {

    return (
        <div className={styles.particles}>
            <Canvas camera={{ position: [0, 0, 2] }}>
                <OrbitControls />
                <Lights />
                <Mesh zoom={zoom}/>
            </Canvas>
        </div>
    )
}

const Lights = () => {
    return (
        <>
            <ambientLight color="#404040"/>
            <directionalLight position={[1, 1, 1]} />
        </>
    )
}

const Mesh = ({zoom}) => {

    const meshRef = useRef()
    const matRef = useRef()

    useEffect(() => {
        gsap.to(matRef.current.uniforms.uSize, {
            value: 0.596,
            duration: 3.,

        })
    }, [])

    useEffect(() => {
        if (zoom) {
            gsap.to(matRef.current.uniforms.uSize, {
                value: 5.,
                duration: 3.,
    
            })
        }
    }, [zoom])
    
    useFrame((state, delta) => {

        // uTime
        const elapsedTime = state.clock.elapsedTime
        matRef.current.uniforms.uTime.value = elapsedTime

        // speedRotation
        const speed = 0.5;
        meshRef.current.rotation.y -= delta * speed

        // uAmplitude and uMaxDistance
        const newAmplitude = mapValue(state.mouse.x, -1, 1, 0.3, 0.9)
        gsap.to(matRef.current.uniforms.uAmplitude, {
            value: newAmplitude
        })
        const newFreq = mapValue(state.mouse.y, -1, 1, 1., 0.4)
        gsap.to(matRef.current.uniforms.uFrequency, {
            value: newFreq
        })
    })

    // const particles = useControls({
    //     speedRotation: { value: 1., min: 0.0, max: 1.0, step: 0.001 }
    // })

    // const options = useMemo(() => {
    //     return {
    //       uSize: { value: 0.596, min: 0.05, max: 2.0, step: 0.0001 },
    //       uSpeed: { value: 0.1, min: 0.0001, max: 0.5, step: 0.0001},
    //       uFrequency: { value: 0.7, min: 0.7, max: 7.0, step: 0.001 },
    //       uAmplitude: { value: 0.3, min: 0.3, max: 1.0, step: 0.001 },
    //       uMaxDistance: { value: 1., min: 0.1, max: 1.0, step: 0.001 },
    //     }
    // }, [])
    // const curlNoise = useControls('Curl Noise', options)
    

    return (
        <>
            <points ref={meshRef}>
                <icosahedronGeometry args={[1, 50]} />
                <particleMaterial
                    ref={matRef}
                    uSize={0}
                    uSpeed={0.3}
                    uMaxDistance={1.}
                    transparent
                />
            </points>
        </>
    )
}

export default Particles;
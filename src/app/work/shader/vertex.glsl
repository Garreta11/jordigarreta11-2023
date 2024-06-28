uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform vec2 pixels;
uniform float distanceFromCenter;
float PI = 3.141592653589793238;
void main() {

  // scale
  vUv = (uv - vec2(0.5)) * (0.9 - 0.1 * distanceFromCenter) + vec2(0.5);

  vec3 pos = position;

  // bending image
  pos.y += sin(PI * uv.x * 3.0 + time) * 0.001;
  pos.z += sin(PI * uv.y * 3.0 + time) * 0.001;

  // parallax
  pos.y += sin(time * 0.3) * 0.02;
  vUv.y -= sin(time * 0.3) * 0.02;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
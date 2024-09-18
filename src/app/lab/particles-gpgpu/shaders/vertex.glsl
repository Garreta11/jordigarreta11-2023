uniform float pointsSize;
uniform float time;
uniform sampler2D uTexture;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 newpos = position;

  vec4 color = texture2D(uTexture, vUv);
  newpos.xyz = color.xyz;

  vec4 mvPosition = modelViewMatrix * vec4(newpos, 1.0);

  gl_PointSize = (pointsSize / -mvPosition.z);

  gl_Position = projectionMatrix * mvPosition;
}
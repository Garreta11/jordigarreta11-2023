// uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginalPosition;
uniform float uTime;
uniform vec3 uMouse;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float mod289(float x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 perm(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float noise(vec3 p) {
  vec3 a = floor(p);
  vec3 d = p - a;
  d = d * d * (3.0 - 2.0 * d);

  vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
  vec4 k1 = perm(b.xyxy);
  vec4 k2 = perm(k1.xyxy + b.zzww);

  vec4 c = k2 + a.zzzz;
  vec4 k3 = perm(c);
  vec4 k4 = perm(c + 1.0);

  vec4 o1 = fract(k3 * (1.0 / 41.0));
  vec4 o2 = fract(k4 * (1.0 / 41.0));

  vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
  vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

  return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main() {

  vec2 vUv = gl_FragCoord.xy / resolution.xy;

  float offset = rand(vUv);

  vec3 position = texture2D(uCurrentPosition, vUv).xyz;
  vec3 original = texture2D(uOriginalPosition, vUv).xyz;
  vec3 velocity = texture2D(uCurrentVelocity, vUv).xyz;

  velocity *= 0.9;

  // particle attraction to shape force
  vec3 direction = normalize(original - position);
  float dist = length(original - position);
  if(dist > 0.01) {
    velocity += direction * 0.0005;
  }

  // mouse repel force
  float mouseDistance = distance(position, uMouse);
  float maxDistance = 0.5;
  if(mouseDistance < maxDistance) {
    vec3 direction = normalize(position - uMouse);
    velocity += direction * (1.0 - mouseDistance / maxDistance) * 0.01;
  }

  gl_FragColor = vec4(velocity, 1.);
}
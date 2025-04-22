// uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginalPosition;
uniform float uTime;
uniform vec3 uMouse;

void main() {

  vec2 vUv = gl_FragCoord.xy / resolution.xy;

  vec3 position = texture2D(uCurrentPosition, vUv).xyz;
  vec3 original = texture2D(uOriginalPosition, vUv).xyz;
  vec3 velocity = texture2D(uCurrentVelocity, vUv).xyz;

  velocity *= 0.9;

  // particle attraction to shape force
  vec3 direction = normalize(original - position);
  float dist = length(original - position);
  if(dist > 0.01) {
    velocity += direction * 0.001;
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
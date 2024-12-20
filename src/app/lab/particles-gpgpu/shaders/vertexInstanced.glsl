uniform float pointsSize;
uniform float time;
uniform sampler2D uTexture;
uniform sampler2D uVelocity;
attribute vec2 uvRef;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

vec3 rotate3D(vec3 v, vec3 vel) {
  vec3 newpos = v;
  vec3 up = vec3(0, 1, 0);
  vec3 axis = normalize(cross(up, vel));
  float angle = acos(dot(up, normalize(vel)));
  newpos = newpos * cos(angle) + cross(axis, newpos) * sin(angle) + axis * dot(axis, newpos) * (1. - cos(angle));
  return newpos;

}

void main() {
  vUv = uv;
  vec4 color = texture2D(uTexture, uvRef);
  vec4 vel = texture2D(uVelocity, uvRef);

  // vec3 newpos = color.xyz + position.y * vel.xyz * 100.;
  vec3 newpos = color.xyz;

  vec3 transformed = position.xyz;
  if(length(vel.xyz) < 0.0001) {
    vel.xyz = vec3(0., 0.0001, 0.0001);
  }
  // transformed.y *= max(1., length(vel.xyz) * 500.);
  transformed = rotate3D(transformed, vel.xyz);

  vNormal = rotate3D(normal, vel.xyz);

  mat4 instanceMat = instanceMatrix;

  instanceMat[3].x = newpos.x;
  instanceMat[3].y = newpos.y;
  instanceMat[3].z = newpos.z;

  vec4 mvPosition = modelViewMatrix * instanceMat * vec4(transformed, 1.0);

  // gl_PointSize = (pointsSize / -mvPosition.z);
  vViewPosition = -mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;
}
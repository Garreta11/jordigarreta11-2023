
uniform vec3 uColor;
varying vec3 vViewPosition;

void main() {

  /* vec3 normal = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));

  vec3 viewDir = normalize(vViewPosition);
  vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
  vec3 y = cross(viewDir, x);
  vec2 uv = vec2(dot(x, normal), dot(y, normal)) * 0.495 + 0.5;
  
  vec4 color = vec4(uv, 0.0, 1.0); */

  gl_FragColor = vec4(uColor, 1.0);
}
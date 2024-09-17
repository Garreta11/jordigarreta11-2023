varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform sampler2D uTexture;
uniform sampler2D uMatcap;

void main() {

  vec3 viewDir = normalize(vViewPosition);
  vec3 x = normalize(vec3(viewDir.z, 0.0, -viewDir.x));
  vec3 y = cross(viewDir, x);
  vec2 uv = vec2(dot(x, vNormal), dot(y, vNormal)) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

  vec4 matcapcolor = texture2D(uMatcap, uv);

  vec4 color = texture2D(uTexture, uv);

  // gl_FragColor = color;
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
  gl_FragColor = vec4(vNormal, 1.0);
  gl_FragColor = matcapcolor;
}
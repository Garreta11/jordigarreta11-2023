uniform float time;
uniform sampler2D uTexture;
varying vec2 vUv;
varying vec3 vParticleColor;

float shapeTexture(vec2 shape, vec2 pc) {
  float maxdist = 0.5;
  vec2 center = vec2(0.5);
  float falloff = smoothstep(0.0, 1.0, maxdist - length(center - pc));
  if(shape.x < 1.0) { // circle
    return falloff;
  } else if(shape.x < 2.0) { // 4-ray star
    float x = pc.s - 0.5;
    float y = 0.5 - pc.t;
    float n = 1.0;
    float xy = x * y;
    if(xy != 0.0)
      n = abs(1.0 / xy);
    return falloff * shape.y * n;
  }
  return 1.0;
}

void main() {
  vec2 shape = vec2(0, 0.002);
  float alpha = shapeTexture(shape, gl_PointCoord);
  vec3 color = vParticleColor; // pink color
  color *= alpha;
  gl_FragColor = vec4(color, alpha); // use alpha here!
}

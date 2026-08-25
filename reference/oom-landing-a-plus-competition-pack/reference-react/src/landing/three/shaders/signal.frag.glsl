precision highp float;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.08, d);

  vec3 color = mix(
    vec3(0.48, 0.94, 0.84),
    vec3(0.58, 0.67, 1.0),
    gl_PointCoord.y
  );

  gl_FragColor = vec4(color, alpha);
}

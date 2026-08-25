// Optional future shader reference.
// The first implementation can use PointsMaterial.
// Move to ShaderMaterial only after baseline performance is measured.

uniform float uTime;
uniform float uProgress;
uniform vec2 uPointer;

void main() {
  vec3 p = position;

  float ripple = sin(p.x * 3.0 + uTime * 1.2) * 0.035;
  p.z += ripple * (0.5 + uProgress);

  float pointerDistance = distance(p.xy, uPointer);
  p.z += exp(-pointerDistance * 2.8) * 0.08;

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 3.0 * (1.0 / -mvPosition.z);
}

uniform float uStress;
uniform vec3 uBaseColor;
uniform vec3 uFatigueColor;

varying vec2 vUv;

void main() {
  float s = clamp(uStress, 0.0, 1.0);
  
  // Usamos un factor de potencia para que el color base domine al inicio 
  // y el rojo entre con fuerza al final.
  float factor = pow(s, 0.8);
  vec3 color = mix(uBaseColor, uFatigueColor, factor);
  
  // Añadimos brillo aditivo para que resalte en compresión (espiras juntas)
  color += uFatigueColor * s * 0.35;
  
  gl_FragColor = vec4(color, 1.0);
}

attribute vec2 textCoordinate;

uniform mat3 camera;
uniform vec2 dataOffset;

void main() {
  vec3 screenHG = camera * vec3(textCoordinate + dataOffset, 1);
  gl_Position = vec4(screenHG.xy, 0, screenHG.z);
}

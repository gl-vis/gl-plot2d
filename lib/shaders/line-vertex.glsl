attribute float linePosition;

uniform mat3 camera;
uniform vec2 start, end;

void main() {
  vec3 screenHG = camera * vec3(mix(start,end,linePosition), 1);
  gl_Position = vec4(screenHG.xy, 0, screenHG.z);
}

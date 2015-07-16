attribute vec3 textCoordinate;

uniform vec2 dataScale, dataShift, dataAxis, screenOffset, textScale;

void main() {
  float dataOffset  = textCoordinate.z;
  vec2 glyphOffset  = textCoordinate.xy;
  vec2 screenCoordinate = dataAxis * (dataScale * dataOffset - dataShift) +
    glyphOffset * textScale +
    screenOffset;
  gl_Position = vec4(screenCoordinate, 0, 1);
}

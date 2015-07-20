precision mediump float;

attribute vec2 coord;

uniform vec4 screenShape;
uniform vec2 start, end;
uniform float width;

vec2 perp(vec2 v) {
  return vec2(v.y, -v.x);
}

void main() {
  vec2 shape = screenShape.zw - screenShape.xy;
  vec2 delta = normalize(shape * perp(end - start)) * width / shape;
  vec2 offset = (mix(start, end, 0.5 * (coord.y+1.0)) - screenShape.xy) / shape;
  gl_Position = vec4(coord.x*delta + offset, 0, 1);
}

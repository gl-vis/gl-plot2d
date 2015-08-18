'use strict'

var glslify = require('glslify')

module.exports = {
  lineVert: glslify('./shaders/line-vertex.glsl'),
  lineFrag: glslify('./shaders/line-fragment.glsl'),
  textVert: glslify('./shaders/text-vertex.glsl'),
  textFrag: glslify('./shaders/text-fragment.glsl'),
  gridVert: glslify('./shaders/grid-vertex.glsl'),
  gridFrag: glslify('./shaders/grid-fragment.glsl'),
  boxVert:  glslify('./shaders/box-vertex.glsl'),
  tickVert: glslify('./shaders/tick-vertex.glsl')
}

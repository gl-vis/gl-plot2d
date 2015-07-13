'use strict'

var glslify = require('glslify')

exports.lineVert = glslify('./shaders/line-vertex.glsl')
exports.lineFrag = glslify('./shaders/line-fragment.glsl')
exports.textVert = glslify('./shaders/text-vertex.glsl')
exports.textFrag = glslify('./shaders/text-fragment.glsl')

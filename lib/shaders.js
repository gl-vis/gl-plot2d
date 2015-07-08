'use strict'

var glslify = require('glslify')

exports.lineVert = glslify('./shaders/line-vertex.glsl')
exports.lineFrag = glslify('./shaders/line-fragment.glsl')

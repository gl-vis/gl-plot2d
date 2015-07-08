'use strict'

var createBuffer = require('gl-buffer')
var createShader = require('gl-shader')

var shaders = require('./shaders')

function Lines(gl, vbo, shader) {
  this.gl     = gl
  this.vbo    = vbo
  this.shader = shader
}

var proto = Lines.prototype

proto.drawAxesLine = function(camera, start, end) {
  this.vbo.bind()
  this.shader.bind()
  this.shader.uniforms.camera = camera
  this.gl.drawArrays(gl.LINES, 0, 2)
}

proto.update = function(options) {
  vbo.update([
    0, 1
  ])
}

proto.dispose = function() {
  this.vbo.dispose()
  this.shader.dispose()
}

function createLines(gl, options) {
  var vbo = createBuffer(gl)
  var shader = createShader(gl, shaders.lineVert, shaders.lineFrag)
  var lines = new Lines(gl, vbo, shader)
  lines.update(options)
  return lines
}

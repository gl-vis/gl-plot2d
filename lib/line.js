'use strict'

module.exports = createLines

var createBuffer = require('gl-buffer')
var createShader = require('gl-shader')

var shaders = require('./shaders')

function Lines(plot, vbo, shader) {
  this.plot   = plot
  this.vbo    = vbo
  this.shader = shader
}

var proto = Lines.prototype

proto.bind = function() {
  var shader = this.shader
  this.vbo.bind()
  this.shader.bind()
  //shader.attributes.coord.pointer()
  shader.uniforms.screenSize = this.plot.screenBox
}

proto.drawLine = (function() {
  var start = [0,0]
  var end   = [0,0]
  return function(startX, startY, endX, endY, width, color) {
    var gl = this.plot.gl
    var shader = this.shader
    start[0] = startX
    start[1] = startY
    end[0]   = endX
    end[1]    = endY
    shader.uniforms.start  = start
    shader.uniforms.end    = end
    shader.uniforms.width  = width
    shader.uniforms.color  = color
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}())

proto.dispose = function() {
  this.vbo.dispose()
  this.shader.dispose()
}

function createLines(plot) {
  var gl  = plot.gl
  var vbo = createBuffer(gl, [
    0,0,
    0,1,
    1,0,
    1,1])
  var shader  = createShader(gl, shaders.lineVert, shaders.lineFrag)
  var lines   = new Lines(plot, vbo, shader)
  return lines
}

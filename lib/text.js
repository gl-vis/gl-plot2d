'use strict'

module.exports = createTextElements

var createBuffer = require('gl-buffer')
var createShader = require('gl-shader')
var getText = require('text-cache')
var shaders = require('./shaders')

function TextElements(gl, vbo, shader) {
  this.gl           = gl
  this.vbo          = vbo
  this.shader       = shader
  this.tickOffset   = [0,0]
  this.tickCount    = [0,0]
  this.labelOffset  = [0,0]
  this.labelCount   = [0,0]
}

var proto = TextElements.prototype

proto.bind = function(camera) {
  this.vbo.bind()
  var shader = this.shader
  shader.bind()
  shader.uniforms.camera = camera
  shader.attributes.textCoordinate.pointer()
}

proto.drawTicks = function(dimension, dataOffset) {
  this.shader.uniforms.dataOffset = dataOffset
  this.gl.drawArrays(this.gl.TRIANGLES, this.tickOffset[dimension], this.tickCount[dimension])
}

proto.drawLabel = function(dimension, dataOffset) {
  this.shader.uniforms.dataOffset = dataOffset
  this.gl.drawArrays(this.gl.TRIANGLES, this.labelOffset[dimension], this.labelCount[dimension])
}

proto.update = function(options) {
  var vertices  = []
  var axesTicks = options.ticks

  for(var dimension=0; dimension<2; ++dimension) {
    this.tickOffset[dimension] = vertices.length >>> 1

    //Copy vertices over to buffer
    var ticks = axesTicks[dimension]
    for(var i=0; i<ticks.length; ++i) {
      var tick  = ticks[i]
      var x     = tick.x
      var text  = tick.text
      var font  = tick.font || 'sans-serif'
      var scale = (tick.fontSize || 12) / 12

      var pslg = getText(font, text)
      var cells = pslg.cells
      var verts = pslg.positions

      for(var j=0; j<cells.length; ++j) {
        var cell = cells[j]
        for(var k=0; k<3; ++k) {
          var p = verts[cell[k]]
          vertices.push(p[0]*scale, -p[1]*scale)
          vertices[vertices.length-2+dimension] += x
        }
      }
    }

    //Draw tick text
    this.tickCount[dimension] = (vertices.length>>>1) - this.tickOffset[dimension]
  }

  //Add labels
  for(var dimension=0; dimension<2; ++dimension) {
    this.labelOffset[dimension] = (vertices.length>>>1)

    var pslg  = getText(options.labelFont[dimension], options.labels[dimension])
    var cells = pslg.cells
    var verts = pslg.positions
    var scale = options.labelSize[dimension] / 12
    for(var j=0; j<cells.length; ++j) {
      var cell = cells[j]
      for(var k=0; k<3; ++k) {
        var p = verts[cell[k]]
        vertices.push(p[0]*scale, -p[1]*scale)
      }
    }

    this.labelCount[dimension] = (vertices.length>>>1) - this.labelOffset[dimension]
  }

  //Upload new vertices
  this.vbo.update(vertices)
}

proto.dispose = function() {
  this.buffer.dispose()
  this.shader.dispose()
}

function createTextElements(gl) {
  var vbo = createBuffer(gl)
  var shader = createShader(gl, shaders.textVert, shaders.textFrag)
  var text = new TextElements(gl, vbo, shader)
  return text
}

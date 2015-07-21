'use strict'

module.exports = createGrid

var createBuffer  = require('gl-buffer')
var createShader  = require('gl-shader')
var shaders       = require('./shaders')

function Grid(plot, vbo, shader) {
  this.plot   = plot
  this.vbo    = vbo
  this.shader = shader
  this.ticks  = [[], []]
}

var proto = Grid.prototype

proto.draw = (function() {

  var DATA_SHIFT = [0,0]
  var DATA_SCALE = [0,0]
  var DATA_AXIS  = [0,0]

  return function() {
    var plot       = this.plot
    var vbo        = this.vbo
    var shader     = this.shader
    var ticks      = this.ticks
    var gl         = plot.gl
    var bounds     = plot._tickBounds
    var dataBox    = plot.dataBox
    var viewPixels = plot.viewBox
    var lineWidth  = plot.gridLineWidth
    var gridColor  = plot.gridLineColor
    var pixelRatio = plot.pixelRatio

    for(var i=0; i<2; ++i) {
      var lo = bounds[i]
      var hi = bounds[i+2]
      var boundScale = hi - lo
      var dataCenter  = 0.5 * (dataBox[i+2] + dataBox[i])
      var dataWidth   = (dataBox[i+2] - dataBox[i])
      DATA_SCALE[i] = 2.0 * boundScale / dataWidth
      DATA_SHIFT[i] = 2.0 * (lo - dataCenter) / dataWidth
    }

    shader.bind()
    vbo.bind()
    shader.attributes.dataCoord.pointer()
    shader.uniforms.dataShift = DATA_SHIFT
    shader.uniforms.dataScale = DATA_SCALE

    var offset = 0
    for(var i=0; i<2; ++i) {
      DATA_AXIS[0] = DATA_AXIS[1] = 0
      DATA_AXIS[i] = 1
      shader.uniforms.dataAxis  = DATA_AXIS
      shader.uniforms.lineWidth = lineWidth[i] / (viewPixels[i+2] - viewPixels[i]) * pixelRatio
      shader.uniforms.color     = gridColor[i]

      var size = ticks[i].length * 6
      gl.drawArrays(gl.TRIANGLES, offset, size)
      offset += size
    }
  }
})()


proto.update = (function() {
  var OFFSET_X = [1,  1, -1, -1,  1, -1]
  var OFFSET_Y = [1, -1,  1,  1, -1, -1]

  return function(options) {
    var ticks  = options.ticks
    var bounds = options.bounds
    var data   = new Float32Array(6 * 3 * (ticks[0].length + ticks[1].length))

    var ptr    = 0
    var gridTicks = [[], []]
    for(var dim=0; dim<2; ++dim) {
      var localTicks = gridTicks[dim]
      var axisTicks = ticks[dim]
      var lo = bounds[dim]
      var hi = bounds[dim+2]
      for(var i=0; i<axisTicks.length; ++i) {
        var x = (axisTicks[i].x - lo) / (hi - lo)
        localTicks.push(x)
        for(var j=0; j<6; ++j) {
          data[ptr++] = x
          data[ptr++] = OFFSET_X[j]
          data[ptr++] = OFFSET_Y[j]
        }
      }
    }

    this.ticks = gridTicks
    this.vbo.update(data)
  }
})()

proto.dispose = function() {
  this.vbo.dispose()
  this.shader.dispose()
}

function createGrid(plot) {
  var gl     = plot.gl
  var vbo    = createBuffer(gl)
  var shader = createShader(gl, shaders.gridVert, shaders.gridFrag)
  var grid   = new Grid(plot, vbo, shader)
  return grid
}

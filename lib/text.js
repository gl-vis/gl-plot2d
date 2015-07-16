'use strict'

module.exports = createTextElements

var createBuffer = require('gl-buffer')
var createShader = require('gl-shader')
var getText      = require('text-cache')
var bsearch      = require('binary-search-bounds')
var shaders      = require('./shaders')

function TextElements(plot, vbo, shader) {
  this.plot         = plot
  this.vbo          = vbo
  this.shader       = shader
  this.tickOffset   = [[],[]]
  this.tickX        = [[],[]]
  this.labelOffset  = [0,0]
  this.labelCount   = [0,0]
}

var proto = TextElements.prototype

proto.drawTicks = (function() {
  var DATA_AXIS = [0,0]
  var SCREEN_OFFSET = [0,0]

  return function(axis) {
    var plot        = this.plot
    var shader      = this.shader
    var tickX       = this.tickX[axis]
    var tickOffset  = this.tickOffset[axis]
    var gl          = plot.gl
    var viewBox     = plot.viewBox
    var dataBox     = plot.dataBox
    var screenBox   = plot.screenBox
    var pixelRatio  = plot.pixelRatio
    var tickPad     = plot.tickPad

    var start = bsearch.lt(tickX, dataBox[axis])
    var end   = bsearch.le(tickX, dataBox[axis+2])
    if(end <= start) {
      return
    }

    DATA_AXIS[0] = DATA_AXIS[1] = 0
    DATA_AXIS[axis] = 1

    SCREEN_OFFSET[axis] = 2.0 * (viewBox[2+axis] + viewBox[axis])

    shader.uniforms.dataAxis     = DATA_AXIS

    if(plot.tickMirror[axis]) {
      SCREEN_OFFSET[axis^1] = viewBox[2+(axis^1)] +
        2.0 * pixelRatio * tickPad[axis] /
          (screenBox[2+(axis^1)] - screenBox[axis^1])
      shader.uniforms.screenOffset = SCREEN_OFFSET

      gl.drawArrays(
        gl.TRIANGLES,
        tickOffset[start],
        tickOffset[end] - tickOffset[start])
    }
    if(plot.tickEnable[axis]) {
      SCREEN_OFFSET[axis^1] = viewBox[(axis^1)] -
        2.0 * pixelRatio * tickPad[axis] /
          (screenBox[2+(axis^1)] - screenBox[axis^1])
      shader.uniforms.screenOffset = SCREEN_OFFSET

      gl.drawArrays(
        gl.TRIANGLES,
        tickOffset[start],
        tickOffset[end] - tickOffset[start])
    }
  }
})()

proto.drawLabel = (function() {
  var DATA_AXIS = [0,0]
  return function(axis) {
  }
})()

proto.drawTitle = function() {
}

proto.bind = (function() {
  var DATA_SHIFT = [0,0]
  var DATA_SCALE = [0,0]
  var TEXT_SCALE = [0,0]

  return function() {
    var plot      = this.plot
    var shader    = this.shader
    var bounds    = plot._tickBounds
    var dataBox   = plot.dataBox
    var screenBox = plot.screenBox
    var viewBox   = plot.viewBox

    shader.bind()

    //Set up coordinate scaling uniforms
    for(var i=0; i<2; ++i) {
      DATA_SCALE[i] =
        (viewBox[i+2] - viewBox[i]) * (bounds[i+2] - bounds[i]) / (dataBox[i+2] - dataBox[i])
      DATA_SHIFT[i] =
        0.5 * (viewBox[i+2] - viewBox[i]) * (dataBox[i+2] + dataBox[i]) /
         (dataBox[i+2] - dataBox[i]) +
         bounds[i] * DATA_SCALE[i]
    }

    TEXT_SCALE[1] = 2.0 * plot.pixelRatio / (screenBox[3] - screenBox[1])
    TEXT_SCALE[0] = TEXT_SCALE[1] * (screenBox[3] - screenBox[1]) / (screenBox[2] - screenBox[0])

    shader.uniforms.dataScale = DATA_SCALE
    shader.uniforms.dataShift = DATA_SHIFT
    shader.uniforms.textScale = TEXT_SCALE


    //Set attributes
    this.vbo.bind()
    shader.attributes.textCoordinate.pointer()
  }
})()

proto.update = function(options) {
  var vertices  = []
  var axesTicks = options.ticks
  var bounds    = options.bounds

  for(var dimension=0; dimension<2; ++dimension) {
    var offsets = [Math.floor(vertices.length/3)], tickX = [-Infinity]

    //Copy vertices over to buffer
    var ticks = axesTicks[dimension]
    for(var i=0; i<ticks.length; ++i) {
      var tick  = ticks[i]
      var x     = tick.x
      var text  = tick.text
      var font  = tick.font || 'sans-serif'
      var scale = (tick.fontSize || 12)

      var pslg  = getText(font, text)
      var cells = pslg.cells
      var verts = pslg.positions

      var coordScale = 1.0 / (bounds[dimension+2] - bounds[dimension])
      var coordShift = bounds[dimension]

      for(var j=0; j<cells.length; ++j) {
        var cell = cells[j]
        for(var k=0; k<3; ++k) {
          var p = verts[cell[k]]
          vertices.push(p[0]*scale, -p[1]*scale, (x - coordShift) * coordScale)
        }
      }

      offsets.push(Math.floor(vertices.length/3))
      tickX.push(x)
    }

    this.tickOffset[dimension] = offsets
    this.tickX[dimension] = tickX
  }

  //Add labels
  for(var dimension=0; dimension<2; ++dimension) {
    this.labelOffset[dimension] = Math.floor(vertices.length/3)

    var pslg  = getText(options.labelFont[dimension], options.labels[dimension])
    var cells = pslg.cells
    var verts = pslg.positions
    var scale = options.labelSize[dimension]
    for(var j=0; j<cells.length; ++j) {
      var cell = cells[j]
      for(var k=0; k<3; ++k) {
        var p = verts[cell[k]]
        vertices.push(p[0]*scale, -p[1]*scale, 0)
      }
    }

    this.labelCount[dimension] =
      Math.floor(vertices.length/3) - this.labelOffset[dimension]
  }

  //Upload new vertices
  this.vbo.update(vertices)
}

proto.dispose = function() {
  this.buffer.dispose()
  this.shader.dispose()
}

function createTextElements(plot) {
  var gl = plot.gl
  var vbo = createBuffer(gl)
  var shader = createShader(gl, shaders.textVert, shaders.textFrag)
  var text = new TextElements(plot, vbo, shader)
  return text
}

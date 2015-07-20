'use strict'

module.exports = createGLPlot2D

var createGrid = require('./lib/grid')
var createText = require('./lib/text')
var createLine = require('./lib/line')

function GLPlot2D(gl) {
  this.gl               = gl
  this.screenBox        = [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]
  this.viewBox          = [0, 0, 0, 0]
  this.dataBox          = [-10, -10, 10, 10]

  this.gridLineWidth    = [1,1]
  this.gridLineColor    = [[0,0,0,1],
                           [0,0,0,1]]

  this.pixelRatio       = 1

  this.tickPad          = [15, 15]
  this.tickEnable       = [true, true]
  this.tickMirror       = [false, false]

  this.borderColor      = [0,0,0,0]
  this.backgroundColor  = [0,0,0,0]

  this.zeroLineEnable   = [true,true]
  this.zeroLineWidth    = [4, 4]
  this.zeroLineColor    = [0, 0, 0, 1]

  this.borderLineEnable = [true,true,true,true]
  this.borderLineWidth  = [2,2,2,2]
  this.borderLineColor  = [[0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1]]

  //Drawing parameters
  this.grid             = null
  this.text             = null
  this.line             = null
  this.objects          = []

  this._tickBounds      = [Infinity, Infinity, -Infinity, -Infinity]

  this.dirty      = false
  this.pickDirty  = false
}

var proto = GLPlot2D.prototype

proto.redraw = function() {
  if(this.dirty) {
    this.draw()
    this.dirty = false
  }
}

proto.setDataBox = function(box) {
  var _box = this.dataBox
  for(var i=0; i<4; ++i) {
    _box[i] = box[i]
  }
  this.setDirty()
}

proto.setViewport = function(view) {
}

proto.setDirty = function() {
  this.dirty = this.pickDirty = true
}

function lerp(a, b, t) {
  var s = 0.5 * (t + 1.0)
  return Math.floor((1.0-s)*a + s*b)|0
}

proto.draw = function() {
  var gl         = this.gl
  var screenBox  = this.screenBox
  var viewPixels = this.viewBox
  var grid       = this.grid

  //Set viewport and scissor
  gl.enable(gl.SCISSOR_TEST)
  gl.enable(gl.DEPTH_TEST)
  gl.viewport(
    screenBox[0],
    screenBox[1],
    screenBox[2]-screenBox[0],
    screenBox[3]-screenBox[1])
  gl.scissor(
    screenBox[0],
    screenBox[1],
    screenBox[2]-screenBox[0],
    screenBox[3]-screenBox[1])
  var borderColor = this.borderColor
  gl.clearColor(
    borderColor[0],
    borderColor[1],
    borderColor[2],
    borderColor[3])
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  //Draw tick spikes

  //Draw center pane
  gl.scissor(
    viewPixels[0],
    viewPixels[1],
    viewPixels[2]-viewPixels[0],
    viewPixels[3]-viewPixels[1])
  gl.viewport(
    viewPixels[0],
    viewPixels[1],
    viewPixels[2]-viewPixels[0],
    viewPixels[3]-viewPixels[1])
  var backgroundColor = this.backgroundColor
  gl.clearColor(
    backgroundColor[0],
    backgroundColor[1],
    backgroundColor[2],
    backgroundColor[3])
  gl.clear(gl.COLOR_BUFFER_BIT)

  gl.enable(gl.BLEND)
  gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
  gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);

  //Draw grid
  grid.draw()

  //Draw traces

  //Return viewport to default
  gl.viewport(
    screenBox[0],
    screenBox[1],
    screenBox[2]-screenBox[0],
    screenBox[3]-screenBox[1])
  gl.scissor(
    screenBox[0],
    screenBox[1],
    screenBox[2]-screenBox[0],
    screenBox[3]-screenBox[1])

  //Draw border lines
  var line = this.line
  var borderLineEnable = this.borderLineEnable
  var borderLineWidth  = this.borderLineWidth
  var borderLineColor  = this.borderLineColor
  line.bind()
  if(borderLineEnable[0]) {
    line.drawLine(viewPixels[0], viewPixels[1], viewPixels[0], viewPixels[3],
      borderLineWidth[0], borderLineColor[0])
  }
  if(borderLineEnable[1]) {
    line.drawLine(viewPixels[0], viewPixels[1], viewPixels[2], viewPixels[1],
      borderLineWidth[1], borderLineColor[1])
  }
  if(borderLineEnable[2]) {
    line.drawLine(viewPixels[2], viewPixels[1], viewPixels[2], viewPixels[3],
      borderLineWidth[2], borderLineColor[2])
  }
  if(borderLineEnable[3]) {
    line.drawLine(viewPixels[0], viewPixels[3], viewPixels[2], viewPixels[3],
      borderLineWidth[3], borderLineColor[3])
  }

  //Draw text elements
  var text = this.text
  text.bind()
  for(var i=0; i<2; ++i) {
    text.drawTicks(i)
    text.drawLabel(i)
  }
  text.drawTitle()

  //Draw spikes

  //Draw overlay elements

  //Turn off scissor test
  gl.disable(gl.SCISSOR_TEST)
  gl.disable(gl.BLEND)
}

proto.update = function(options) {
  options = options || {}

  var gl = this.gl
  this.pixelRatio      = options.pixelRatio || 1
  this.screenBox       = (options.screenBox ||
    [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]).slice()
  this.dataBox         = (options.dataBox || [-10,-10,10,10]).slice()
  this.viewBox         = (options.viewBox ||
    [0.125*(this.screenBox[2]-this.screenBox[0]),
     0.125*(this.screenBox[3]-this.screenBox[1]),
     0.875*(this.screenBox[2]-this.screenBox[0]),
     0.875*(this.screenBox[3]-this.screenBox[1])]).slice()
  this.borderColor     = (options.borderColor     || [0,0,0,0]).slice()
  this.backgroundColor = (options.backgroundColor || [0,0,0,0]).slice()
  this.gridLineWidth   = (options.gridLineWidth || [1,1]).slice()
  this.tickPad         = (options.tickPad || [15, 15]).slice()
  this.tickEnable      = (options.tickEnable || [true,true]).slice()
  this.tickMirror      = (options.tickMirror || [false,false]).slice()
  this.axesBorder      = (options.axesBorder ||
    [true, true, true, true]).slice()
  this.axesBorderWidth = options.axesBorderWidth || 4

  var ticks = options.ticks || [ [], [] ]

  //Compute bounds on ticks
  var bounds = this._tickBounds
  bounds[0] = bounds[1] =  Infinity
  bounds[2] = bounds[3] = -Infinity
  for(var i=0; i<2; ++i) {
    var axisTicks = ticks[i]
    for(var j=0; j<axisTicks.length; ++j) {
      var x = axisTicks[j].x
      bounds[i]   = Math.min(bounds[i],   x)
      bounds[i+2] = Math.max(bounds[i+2], x)
    }
  }

  //Update grid
  this.grid.update({
    bounds: bounds,
    ticks:  ticks
  })

  //Update text
  this.text.update({
    bounds:     bounds,
    ticks:      ticks,
    labels:     options.labels    || ['x', 'y'],
    labelSize:  options.labelSize || [12,12],
    labelFont:  options.labelFont || ['sans-serif', 'sans-serif'],
    title:      options.title     || '',
    titleSize:  options.titleSize || 18,
    titleFont:  options.titleFont || 'sans-serif'
  })
}

proto.dispose = function() {
  this.grid.dispose()
  this.text.dispose()
  this.line.dispose()
  for(var i=this.objects.length-1; i>=0; --i) {
    this.objects[i].dispose()
  }
  this.objects.length = 0
}

proto.addObject = function(object) {
  this.objects.push(object)
  this.setDirty()
}

proto.removeObject = function(object) {
  this.objects.push(object)
  this.setDirty()
}

function createGLPlot2D(options) {
  var gl = options.gl
  var plot = new GLPlot2D(gl, null)
  plot.grid = createGrid(plot)
  plot.text = createText(plot)
  plot.line = createLine(plot)
  plot.update(options)
  return plot
}

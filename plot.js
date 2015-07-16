'use strict'

module.exports = createGLPlot2D

var createGrid = require('./lib/grid')
var createText = require('./lib/text')

function GLPlot2D(gl, grid) {
  this.gl             = gl
  this.screenBox      = [0,0,gl.drawingBufferWidth,gl.drawingBufferHeight]
  this.viewBox        = [-0.75,-0.75, 0.75, 0.75]
  this.viewPixels     = [0,0,0,0]
  this.dataBox        = [-10, -10, 10, 10]
  this._tickBounds    = [Infinity, Infinity, -Infinity, -Infinity]
  this.gridLineWidth  = [1,1]
  this.grid           = grid
  this.pixelRatio     = 1
  this.objects        = []

  this.borderColor     = [0,0,0,0]
  this.backgroundColor = [0,0,0,0]

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
  var viewBox    = this.viewBox
  var viewPixels = this.viewPixels

  //Recalculate view pixels
  viewPixels[0] = lerp(screenBox[0], screenBox[2], viewBox[0])
  viewPixels[1] = lerp(screenBox[1], screenBox[3], viewBox[1])
  viewPixels[2] = lerp(screenBox[0], screenBox[2], viewBox[2])
  viewPixels[3] = lerp(screenBox[1], screenBox[3], viewBox[3])

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

  //Draw border lines

  //Draw tick marks


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

  //Draw grid
  this.grid.draw()

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

  //Draw text elements
  var text = this.text
  text.bind()
  for(var i=0; i<2; ++i) {
    text.drawTicks(i)
    text.drawLabel(i)
  }
  text.drawTitle()

  //Draw overlay elements

  //Turn off scissor test
  gl.disable(gl.SCISSOR_TEST)
}

proto.drawPick = function() {
}

proto.getPick = function(x, y) {
}

proto.update = function(options) {
  options = options || {}

  var gl = this.gl
  this.pixelRatio      = options.pixelRatio || 1
  this.screenBox       = (options.viewport ||
    [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]).slice()
  this.dataBox         = (options.dataBox || [-10,-10,10,10]).slice()
  this.viewBox         = (options.viewBox || [-0.75,-0.75,0.75,0.75]).slice()
  this.borderColor     = (options.borderColor     || [0,0,0,0]).slice()
  this.backgroundColor = (options.backgroundColor || [0,0,0,0]).slice()
  this.gridLineWidth   = (options.gridLineWidth || [1,1]).slice()
  this.tickPad         = (options.tickPad || [15, 15]).slice()
  this.tickEnable      = (options.tickEnable || [true,true]).slice()
  this.tickMirror      = (options.tickMirror || [false,false]).slice()

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
  plot.update(options)
  return plot
}

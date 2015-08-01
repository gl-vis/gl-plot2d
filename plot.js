'use strict'

module.exports = createGLPlot2D

var createPick = require('gl-select-static')

var createGrid = require('./lib/grid')
var createText = require('./lib/text')
var createLine = require('./lib/line')

function GLPlot2D(gl, pickBuffer) {
  this.gl               = gl
  this.pickBuffer       = pickBuffer

  this.screenBox        = [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]
  this.viewBox          = [0, 0, 0, 0]
  this.dataBox          = [-10, -10, 10, 10]

  this.gridLineEnable   = [true,true]
  this.gridLineWidth    = [1,1]
  this.gridLineColor    = [[0,0,0,1],
                           [0,0,0,1]]

  this.pixelRatio       = 1

  this.tickMarkLength   = [0,0,0,0]
  this.tickMarkWidth    = [0,0,0,0]
  this.tickMarkColor    = [[0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1]]

  this.tickPad          = [15,15,15,15]
  this.tickAngle        = [0,0,0,0]
  this.tickEnable       = [true,true,true,true]
  this.tickColor        = [[0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1]]

  this.labelPad         = [15,15,15,15]
  this.labelAngle       = [0,Math.PI/2,0,3.0*Math.PI/2]
  this.labelEnable      = [true,true,true,true]
  this.labelColor       = [[0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1]]

  this.titleCenter      = [0,0]
  this.titleEnable      = true
  this.titleAngle       = 0
  this.titleColor       = [0,0,0,1]

  this.borderColor      = [0,0,0,0]
  this.backgroundColor  = [0,0,0,0]

  this.zeroLineEnable   = [true, true]
  this.zeroLineWidth    = [4, 4]
  this.zeroLineColor    = [[0, 0, 0, 1],[0, 0, 0, 1]]

  this.borderLineEnable = [true,true,true,true]
  this.borderLineWidth  = [2,2,2,2]
  this.borderLineColor  = [[0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1]]

  this.spikeEnable      = [true, true, false, false]
  this.spikeWidth       = [1,1,1,1]
  this.spikeColor       = [[0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1]]
  this.spikeCenter      = [0,0]

  //Drawing parameters
  this.grid             = null
  this.text             = null
  this.line             = null
  this.objects          = []
  this.overlays         = []

  this._tickBounds      = [Infinity, Infinity, -Infinity, -Infinity]

  this.dirty        = false
  this.pickDirty    = false
  this.pickDelay    = 120
  this.pickRadius   = 10
  this._pickTimeout = null
  this._drawPick    = this.drawPick.bind(this)
}

var proto = GLPlot2D.prototype

proto.setDirty = function() {
  this.dirty = this.pickDirty = true
}

proto.setSpike = function(x, y) {
  this.spikeCenter[0] = +x
  this.spikeCenter[1] = +y
  this.dirty = true
}

function lerp(a, b, t) {
  var s = 0.5 * (t + 1.0)
  return Math.floor((1.0-s)*a + s*b)|0
}

proto.draw = (function() {
var TICK_MARK_BOX = [0,0,0,0]
return function() {
  var gl         = this.gl
  var screenBox  = this.screenBox
  var viewPixels = this.viewBox
  var dataBox    = this.dataBox
  var pixelRatio = this.pixelRatio
  var grid       = this.grid
  var line       = this.line
  var text       = this.text
  var objects    = this.objects

  if(this.pickDirty) {
    if(this._pickTimeout) {
      clearTimeout(this._pickTimeout)
    }
    this.pickDirty = false
    this._pickTimeout = setTimeout(this._drawPick, this.pickDelay)
  }

  if(!this.dirty) {
    return
  }
  this.dirty = false

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  //Turn on scissor
  gl.enable(gl.SCISSOR_TEST)

  //Turn off depth buffer
  gl.disable(gl.DEPTH_TEST)
  gl.depthMask(false)

  //Configure premultiplied alpha blending
  gl.enable(gl.BLEND)
  gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
  gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ZERO);

  //Draw border
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
  grid.draw()

  //Draw zero lines separately
  var zeroLineEnable = this.zeroLineEnable
  var zeroLineColor  = this.zeroLineColor
  var zeroLineWidth  = this.zeroLineWidth
  if(zeroLineEnable[0] || zeroLineEnable[1]) {
    line.bind()
    for(var i=0; i<2; ++i) {
      if(!zeroLineEnable[i] ||
        !(dataBox[i] <= 0 && dataBox[i+2] >= 0)) {
        continue
      }

      var zeroIntercept = screenBox[i] -
        dataBox[i] * (screenBox[i+2] - screenBox[i]) / (dataBox[i+2] - dataBox[i])

      if(i === 0) {
        line.drawLine(
          zeroIntercept, screenBox[1], zeroIntercept, screenBox[3],
          zeroLineWidth[i],
          zeroLineColor[i])
      } else {
        line.drawLine(
          screenBox[0], zeroIntercept, screenBox[2], zeroIntercept,
          zeroLineWidth[i],
          zeroLineColor[i])
      }
    }
  }

  //Draw traces
  for(var i=0; i<objects.length; ++i) {
    objects[i].draw()
  }

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

  //TODO: Draw tick marks

  //Draw line elements
  line.bind()

  //Draw spikes
  var spikeEnable = this.spikeEnable
  var spikeWidth  = this.spikeWidth
  var spikeColor  = this.spikeColor
  var spikeCenter = this.spikeCenter
  if(dataBox[0] <= spikeCenter[0] && spikeCenter[0] <= dataBox[2] &&
     dataBox[1] <= spikeCenter[1] && spikeCenter[1] <= dataBox[3]) {

    var centerX = viewPixels[0] + (spikeCenter[0] - dataBox[0]) / (dataBox[2] - dataBox[0]) * (viewPixels[2] - viewPixels[0])
    var centerY = viewPixels[1] + (spikeCenter[1] - dataBox[1]) / (dataBox[3] - dataBox[1]) * (viewPixels[3] - viewPixels[1])

    if(spikeEnable[0]) {
     line.drawLine(
       centerX, centerY,
       viewPixels[0], centerY,
       spikeWidth[0], spikeColor[0])
    }
    if(spikeEnable[1]) {
     line.drawLine(
       centerX, centerY,
       centerX, viewPixels[1],
       spikeWidth[1], spikeColor[1])
    }
    if(spikeEnable[2]) {
      line.drawLine(
        centerX, centerY,
        viewPixels[2], centerY,
        spikeWidth[2], spikeColor[2])
    }
    if(spikeEnable[3]) {
      line.drawLine(
        centerX, centerY,
        centerX, viewPixels[3],
        spikeWidth[3], spikeColor[3])
    }
  }

  //Draw border lines
  var borderLineEnable = this.borderLineEnable
  var borderLineWidth  = this.borderLineWidth
  var borderLineColor  = this.borderLineColor
  if(borderLineEnable[0]) {
    line.drawLine(
      viewPixels[0], viewPixels[1] - 0.5*borderLineWidth[1]*pixelRatio,
      viewPixels[0], viewPixels[3] + 0.5*borderLineWidth[3]*pixelRatio,
      borderLineWidth[0], borderLineColor[0])
  }
  if(borderLineEnable[1]) {
    line.drawLine(
      viewPixels[0] - 0.5*borderLineWidth[0]*pixelRatio, viewPixels[1],
      viewPixels[2] + 0.5*borderLineWidth[2]*pixelRatio, viewPixels[1],
      borderLineWidth[1], borderLineColor[1])
  }
  if(borderLineEnable[2]) {
    line.drawLine(
      viewPixels[2], viewPixels[1] - 0.5*borderLineWidth[1]*pixelRatio,
      viewPixels[2], viewPixels[3] + 0.5*borderLineWidth[3]*pixelRatio,
      borderLineWidth[2], borderLineColor[2])
  }
  if(borderLineEnable[3]) {
    line.drawLine(
      viewPixels[0] - 0.5*borderLineWidth[0]*pixelRatio, viewPixels[3],
      viewPixels[2] + 0.5*borderLineWidth[2]*pixelRatio, viewPixels[3],
      borderLineWidth[3], borderLineColor[3])
  }

  //Draw text elements
  text.bind()
  for(var i=0; i<2; ++i) {
    text.drawTicks(i)
  }
  if(this.titleEnable) {
    text.drawTitle()
  }

  //TODO: Draw other overlay elements (select boxes, etc.)

  //Turn off scissor test
  gl.disable(gl.SCISSOR_TEST)
  gl.disable(gl.BLEND)
  gl.depthMask(true)
}
})()

proto.drawPick = (function() {

return function() {
  var pickBuffer = this.pickBuffer
  var gl = this.gl

  this._pickTimeout = null
  pickBuffer.begin()

  var pickOffset = 1
  var objects = this.objects
  for(var i=0; i<objects.length; ++i) {
    pickOffset += objects[i].drawPick(pickOffset)
  }

  pickBuffer.end()
}
})()

proto.pick = (function() {
return function(x, y) {
  var pixelRatio     = this.pixelRatio
  var pickPixelRatio = this.pickPixelRatio
  var viewBox        = this.viewBox

  var scrX = Math.round((x - viewBox[0] / pixelRatio) * pickPixelRatio)|0
  var scrY = Math.round((y - viewBox[1] / pixelRatio) * pickPixelRatio)|0

  var pickResult = this.pickBuffer.query(scrX, scrY, this.pickRadius)
  if(!pickResult) {
    return null
  }

  var pickValue = pickResult.id +
    (pickResult.value[0]<<8)  +
    (pickResult.value[1]<<16) +
    (pickResult.value[2]<<24)

  var objects = this.objects
  for(var i=0; i<objects.length; ++i) {
    var result = objects[i].pick(scrX, scrY, pickValue)
    if(result) {
      return result
    }
  }

  return null
}
})()

function deepClone(array) {
  var result = array.slice()
  for(var i=0; i<result.length; ++i) {
    result[i] = result[i].slice()
  }
  return result
}

function compareTicks(a, b) {
  return a.x - b.x
}

proto.setScreenBox = function(nbox) {
  this.setDirty()
}

proto.setDataBox = function(nbox) {
  var dataBox = this.dataBox

  dataBox[0] = nbox[0]
  dataBox[1] = nbox[1]
  dataBox[2] = nbox[2]
  dataBox[3] = nbox[3]

  this.setDirty()
}

proto.setViewBox = function(nbox) {
  var pixelRatio = this.pixelRatio
  var viewBox = this.viewBox
  viewBox[0] = Math.round(nbox[0] * pixelRatio)|0
  viewBox[1] = Math.round(nbox[1] * pixelRatio)|0
  viewBox[2] = Math.round(nbox[2] * pixelRatio)|0
  viewBox[3] = Math.round(nbox[3] * pixelRatio)|0

  var pickPixelRatio = this.pickPixelRatio
  this.pickBuffer.shape = [
    Math.round((nbox[2] - nbox[0]) * pickPixelRatio)|0,
    Math.round((nbox[3] - nbox[1]) * pickPixelRatio)|0 ]

  this.setDirty()
}

proto.update = function(options) {
  options = options || {}

  var gl = this.gl
  this.pixelRatio      = options.pixelRatio || 1
  var pixelRatio       = this.pixelRatio
  this.pickPixelRatio  = Math.max(pixelRatio, 1)
  this.screenBox       = (options.screenBox ||
    [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]).slice()
  this.dataBox         = (options.dataBox || [-10,-10,10,10]).slice()
  var screenBox = this.screenBox
  this.setViewBox(options.viewBox ||
    [0.125*(this.screenBox[2]-this.screenBox[0])/pixelRatio,
     0.125*(this.screenBox[3]-this.screenBox[1])/pixelRatio,
     0.875*(this.screenBox[2]-this.screenBox[0])/pixelRatio,
     0.875*(this.screenBox[3]-this.screenBox[1])/pixelRatio])

  this.borderColor     = (options.borderColor     || [0,0,0,0]).slice()
  this.backgroundColor = (options.backgroundColor || [0,0,0,0]).slice()

  this.gridLineEnable  = (options.gridLineEnable || [true,true]).slice()
  this.gridLineWidth   = (options.gridLineWidth || [1,1]).slice()
  this.gridLineColor   = deepClone(options.gridLine ||
    [[0.5,0.5,0.5,1],[0.5,0.5,0.5,1]])

  this.zeroLineEnable   = (options.zeroLineEnable || [true, true]).slice()
  this.zeroLineWidth    = (options.zeroLineWidth || [4, 4]).slice()
  this.zeroLineColor    = deepClone(options.zeroLineColor ||
    [[0, 0, 0, 1],[0, 0, 0, 1]])

  this.tickMarkLength   = (options.tickMarkLength || [0,0,0,0]).slice()
  this.tickMarkWidth    = (options.tickMarkWidth || [0,0,0,0]).slice()

  this.titleCenter      = (options.titleCenter || [
    0.5*(screenBox[0]+screenBox[2])/pixelRatio,(screenBox[3]-40)/pixelRatio]).slice()
  this.titleEnable      = !('titleEnable' in options) || !!options.titleEnable
  this.titleAngle       = options.titleAngle || 0
  this.titleColor       = (options.titleColor || [0,0,0,1]).slice()

  this.labelPad         = (options.labelPad || [15,15,15,15]).slice()
  this.labelAngle       = (options.labelAngle ||
    [0,Math.PI/2,0,3.0*Math.PI/2]).slice()
  this.labelEnable      = (options.labelEnable || [true,true,true,true]).slice()
  this.labelColor       = deepClone(options.labelColor ||
    [[0,0,0,1],[0,0,0,1],[0,0,0,1],[0,0,0,1]])

  this.tickPad         = (options.tickPad || [15,15,15,15]).slice()
  this.tickAngle       = (options.tickAngle || [0,0,0,0]).slice()
  this.tickEnable      = (options.tickEnable || [true,true,true,true]).slice()
  this.tickColor       = deepClone(options.tickColor ||
    [[0,0,0,1],[0,0,0,1],[0,0,0,1],[0,0,0,1]])

  this.borderLineEnable = (options.borderLineEnable ||
                            [true,true,true,true]).slice()
  this.borderLineWidth  = (options.borderLineWidth || [2,2,2,2]).slice()
  this.borderLineColor  = deepClone(options.borderLineColor ||
                          [[0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1],
                           [0,0,0,1]])

  var ticks = options.ticks || [ [], [] ]

  //Compute bounds on ticks
  var bounds = this._tickBounds
  bounds[0] = bounds[1] =  Infinity
  bounds[2] = bounds[3] = -Infinity
  for(var i=0; i<2; ++i) {
    var axisTicks = ticks[i].slice(0)
    if(axisTicks.length === 0) {
      continue
    }
    axisTicks.sort(compareTicks)
    bounds[i]   = axisTicks[0].x
    bounds[i+2] = axisTicks[axisTicks.length-1].x
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

  this.setDirty()
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
  var pickBuffer = createPick(gl, [gl.drawingBufferWidth, gl.drawingBufferHeight])
  var plot = new GLPlot2D(gl, pickBuffer)
  plot.grid = createGrid(plot)
  plot.text = createText(plot)
  plot.line = createLine(plot)
  plot.update(options)
  return plot
}

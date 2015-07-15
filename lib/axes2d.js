'use strict'

var createLines = require('./lines')
var createText  = require('./text')

module.exports = createAxes

function Axes2D(plot, text, lines) {
  this.plot        = plot
  this.text        = text
  this.lines       = lines
  this.dataBox     = [-Infinity,-Infinity,Infinity,Infinity]
}

var proto = Axes2D.prototype

proto.draw = function() {
  /*
  this.lines.drawAxesLine(camera, [0,0], [0, 10])
  this.lines.drawAxesLine(camera, [0,0], [10, 0])
  this.text.bind(camera)
  this.text.drawTicks(0, [0,-1])
  this.text.drawTicks(1, [-1,0])
  this.text.drawLabel(0, [5,-2])
  this.text.drawLabel(1, [-2,5])
  */
}

proto.update = function(options) {
  options = options || {}
  var ticks   = options.ticks       || [ [], [] ]
  var labels  = options.labels      || [ 'x', 'y' ]
  var labelFont = options.labelFont || [ 'sans-serif', 'sans-serif' ]
  var labelSize = options.labelSize || [ 12, 12 ]

  var bounds = this.dataBox
  bounds[0] = bounds[1] = Infinity
  bounds[2] = bounds[3] = -Infinity

  //Compute bounds from ticks
  for(var i=0; i<2; ++i) {
    var tick = ticks[i]
    var x = tick.t
    bounds[i]   = Math.min(bounds[i], x)
    bounds[i+2] = Math.max(bounds[i+2], x)
  }

  this.text.update({
    ticks:     ticks,
    labels:    labels,
    labelSize: labelSize,
    labelFont: labelFont,
    bounds:    bounds
  })
  this.lines.update({
  })
}

proto.dispose = function() {
  this.text.dispose()
  this.lines.dispose()
}

function createAxes(plot) {
  var lines = createLines(plot.gl)
  var text  = createText(plot.gl)
  var axes  = new Axes2D(plot, text, lines)
  return axes
}

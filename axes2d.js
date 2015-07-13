'use strict'

var createLines = require('./lib/lines')
var createText  = require('./lib/text')

module.exports = createAxes

function Axes2D(gl, text, lines) {
  this.gl     = gl
  this.text   = text
  this.lines  = lines
}

var proto = Axes2D.prototype

proto.draw = function(camera) {
  this.lines.drawAxesLine(camera, [0,0], [0, 10])
  this.lines.drawAxesLine(camera, [0,0], [10, 0])
  this.text.bind(camera)
  this.text.drawTicks(0, [0,-1])
  this.text.drawTicks(1, [-1,0])
  this.text.drawLabel(0, [5,-2])
  this.text.drawLabel(1, [-2,5])
}

proto.update = function(options) {
  options = options || {}
  var bounds = options.bounds || [
    [-Infinity,-Infinity],
    [ Infinity, Infinity] ]
  var ticks   = options.ticks       || [ [], [] ]
  var labels  = options.labels      || [ 'x', 'y' ]
  var labelFont = options.labelFont || [ 'sans-serif', 'sans-serif' ]
  var labelSize = options.labelSize || [ 12, 12 ]
  this.text.update({
    ticks:     ticks,
    labels:    labels,
    labelSize: labelSize,
    labelFont: labelFont
  })
  this.lines.update({
  })
}

proto.dispose = function() {
  this.text.dispose()
  this.lines.dispose()
}

function createAxes(gl, options) {
  var lines = createLines(gl)
  var text  = createText(gl)
  var axes  = new Axes2D(gl, text, lines)
  axes.update(options)
  return axes
}

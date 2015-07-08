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
  this.lines.drawAxisLine(camera, [0,0], [0, 100])
  this.lines.drawAxisLine(camera, [0,0], [100, 0])
}

proto.update = function(options) {
  options = options || {}
  var bounds = options.bounds || [
    [-Infinity,-Infinity],
    [ Infinity, Infinity] ]
  var ticks   = options.ticks
  var labels  = options.labels || [ 'x', 'y' ]
  this.text.update({
    ticks:  ticks,
    labels: labels
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

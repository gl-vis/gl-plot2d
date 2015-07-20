var fit = require('canvas-fit')
var mouseWheel = require('mouse-wheel')
var mouseChange = require('mouse-change')
var createPlot = require('../plot')

var canvas = document.createElement('canvas')
document.body.appendChild(canvas)
window.addEventListener('resize', fit(canvas), false)

var gl = canvas.getContext('webgl')

var dataBox = [-10,-10,10,10]

function makeTicks(lo, hi) {
  var result = []
  for(var i=lo; i<=hi; ++i) {
    result.push({
      x: i,
      text: i + ''
    })
  }
  return result
}

var options = {
  gl:      gl,
  dataBox:         [-10, -10,  10,  10],
  title:           'chart title',
  ticks:  [ makeTicks(-20,20), makeTicks(-20,20) ],
  labels: ['x', 'y']
}

var plot = createPlot(options)

var lastX = 0, lastY = 0
mouseChange(function(buttons, x, y) {
  if(buttons & 1) {
    var dx = (lastX - x) * (dataBox[2] - dataBox[0]) / (plot.viewPixels[2]-plot.viewPixels[0])
    var dy = (y - lastY) * (dataBox[3] - dataBox[1]) / (plot.viewPixels[3] - plot.viewPixels[1])

    dataBox[0] += dx
    dataBox[1] += dy
    dataBox[2] += dx
    dataBox[3] += dy
  }
  lastX = x
  lastY = y
})

function render() {
  requestAnimationFrame(render)
  plot.screenBox[2] = gl.drawingBufferWidth
  plot.screenBox[3] = gl.drawingBufferHeight
  plot.setDataBox(dataBox)
  plot.draw()
}

render()

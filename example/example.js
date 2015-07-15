var fit = require('canvas-fit')
var mouseWheel = require('mouse-wheel')
var mouseChange = require('mouse-change')
var createPlot = require('../plot')

var canvas = document.createElement('canvas')
document.body.appendChild(canvas)
window.addEventListener('resize', fit(canvas), false)

var gl = canvas.getContext('webgl')

function makeTicks(count) {
  var result = []
  for(var i=0; i<count; ++i) {
    result.push({
      x: i,
      text: i + ''
    })
  }
  return result
}

var options = {
  gl:      gl,
  borderColor:     [0, 1, 0, 1],
  backgroundColor: [1, 0, 0, 1],
  dataBox:         [-10, -10,  10,  10],
  title:           'chart title',
  axes:{
    ticks:  [ makeTicks(10), makeTicks(10) ],
    labels: ['x', 'y']
  }
}

var plot = createPlot(options)

function render() {
  requestAnimationFrame(render)
  plot.screenBox[2] = gl.drawingBufferWidth
  plot.screenBox[3] = gl.drawingBufferHeight
  plot.draw()
}

render()

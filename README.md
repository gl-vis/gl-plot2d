# gl-plot2d

A WebGL based 2D rendering for large plots.

## Example

## Install

With [npm](http://github.com/gl-vis/gl-plot2d),

```
npm i gl-plot2d
```

## API

### Constructor

#### `var plot = require('gl-plot2d')(options)`
Constructs a new `gl-plot2d` object.

* `options` is an object containing parameters for constructing the plot

Options can contain the following parameters,

##### Required properties

| Property | Description |
|----------|-------------|
| `gl`     | A `WebGLRenderingContext` object, into which the plot is drawn |

##### Coordinate bounds

| Property | Description | Default |
|----------|-------------|---------|
| `pixelRatio` | A scale factor which is applied to pixel coordinates | `1` |
| `screenBox` | Bounds on the plot within the WebGL context |
```javascript
[0, 0,
gl.drawingBufferWidth/pixelRatio,
gl.drawingBufferHeight/pixelRatio]
```
|
| `viewBox` | Pixel coordinates where the plot is drawn  | `[0,0,0,0]` |
| `dataBox` | Data coordinates for the view of the plot | `[0,0,0,0]` |

##### Border and background colors

| Property | Description | Default |
|----------|-------------|---------|
| `borderColor` | | `` |
| `backgroundColor` | | `` |
| `borderLineEnable` | | `[true,true,true,true]` |
| `borderLineWidth` | | `[2,2,2,2]` |
| `borderLineColor` | | `[[0,0,0,1], [0,0,0,1], [0,0,0,1], [0,0,0,1]]` |

##### Ticks

The ticks for each

| Property | Description | Default |
|----------|-------------|---------|
| `ticks` | See note above | `[[], []]` |
| `tickEnable` |  | `[true, true, true, true]` |
| `tickPad` |   |  `[15,15,15,15]` |
| `tickAngle` |   | `[0,0,0,0]` |
| `tickColor` |   | `[[0,0,0,1], [0,0,0,1], [0,0,0,1], [0,0,0,1]]`
| `tickMarkWidth` |    | `[0,0,0,0]` |
| `tickMarkLength` |    | `[0,0,0,0]` |

##### Labels

| Property | Description | Default |
|----------|-------------|---------|
| `labels` |   | `['x', 'y']` |
| `labelEnable` | | `[true, true, true, true]` |
| `labelAngle` |  | `[0,Math.PI/2,0,3.0*Math.PI/2]` |
| `labelPad` | | `[15,15,15,15]` |
| `labelSize` |  | `[12, 12]` |
| `labelFont` |   | `['sans-serif', 'sans-serif']` |
| `labelColor` |  | `[[0,0,0,1],[0,0,0,1],[0,0,0,1],[0,0,0,1]]` |

##### Title

| Property | Description | Default |
|----------|-------------|---------|
| `title` |   | `''` |
| `titleEnable` | | `true` |
| `titleCenter` |  | `[0.5*(viewBox[0]+viewBox[2]), viewBox[3] - 40]` |
| `titleAngle` | | `0` |
| `titleColor` | | `[0,0,0,1]` |
| `titleFont` |   | `'sans-serif'` |
| `titleFont` |   | `'sans-serif'` |
| `titleSize` |   | `18` |

##### Grid lines

| Property | Description | Default |
|----------|-------------|---------|
| `gridLineEnable` |   | `[true, true]` |
| `gridLineColor` |  | `[[0,0,0,0.5], [0,0,0,0.5]]` |
| `gridLineWidth` |  | `[1, 1]` |
| `zeroLineEnable` |  | `[true, true]` |
| `zeroLineWidth` |  | `[2, 2]` |
| `zeroLineColor` |  | `[[0,0,0,1], [0,0,0,1]]` |

##### Spikes

| Property | Description | Default |
|----------|-------------|---------|
|

### Methods

#### `plot.update(options)`

#### `plot.setScreenBox(box)`

#### `plot.setViewBox(box)`

#### `plot.setDataBox(box)`

#### `plot.setSpike(x, y)`

#### `plot.draw()`

#### `plot.dispose()`


# License
(c) Mikola Lysenko.  MIT License

Supported by [plot.ly](http://plot.ly)

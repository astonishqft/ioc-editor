import * as zrender from 'zrender'
import { getBoundingBox } from '../utils'

import type { IAnchor } from './index'

class Rect extends zrender.Rect {
  anchors: IAnchor[] = []

  constructor(data: zrender.RectProps) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    const box = getBoundingBox([this])

    this.anchors = [
      { x: box.x + box.width / 2, y: box.y, index: 1, direct: 'top' },
      { x: box.x + box.width, y: box.y + box.height / 2, index: 2, direct: 'right' },
      { x: box.x + box.width / 2, y: box.y + box.height, index: 3, direct: 'bottom' },
      { x: box.x, y: box.y + box.height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Rect }

import * as zrender from 'zrender'
import { NodeType } from './index'
import type { IShape, IAnchor } from './index'
import type { Anchor } from '../anchor'

class Rect extends zrender.Rect implements IShape {
  selected = false
  nodeType = NodeType.Shape
  anchors: IAnchor[] = []
  anchor?: Anchor
  constructor(data: zrender.RectProps) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    this.anchors = []
    const g = new zrender.Group()
    const box = g.getBoundingRect([this])
    const t = {
      x: box.x + box.width / 2,
      y: box.y,
      index: 1,
      node: this,
      direct: 'top'
    }
    const r = {
      x: box.x + box.width,
      y: box.y + box.height / 2,
      index: 2,
      node: this,
      direct: 'right'
    }
    const b = {
      x: box.x + box.width / 2,
      y: box.y + box.height,
      index: 3,
      node: this,
      direct: 'bottom'
    }
    const l = {
      x: box.x,
      y: box.y + box.height / 2,
      index: 4,
      node: this,
      direct: 'left'
    }
    this.anchors.push(t, r, b, l)
  }
}

export { Rect }

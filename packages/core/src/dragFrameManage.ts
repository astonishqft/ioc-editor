import * as zrender from 'zrender'
import { injectable, inject } from 'inversify'
import { Disposable } from './disposable'
import IDENTIFIER from './constants/identifiers'
import type { IDisposable } from './disposable'
import type { IViewPortManage } from './viewPortManage'

export interface IDragFrameManage extends IDisposable {
  addSelfToViewPort(viewPort: zrender.Group): void
  show(): void
  hide(): void
  updatePosition(x: number, y: number): void
  initSize(width: number, height: number): void
  getFrame(): zrender.Rect
  getBoundingBox(): zrender.BoundingRect
  isIntersect(shapesBoundingBox: zrender.BoundingRect): boolean
}

@injectable()
class DragFrameManage extends Disposable {
  private _frame: zrender.Rect
  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortManage: IViewPortManage
  ) {
    super()
    this._frame = new zrender.Rect({
      shape: {
        x: 0,
        y: 0,
        width: 100,
        height: 100
      },
      style: {
        fill: '#1971c2',
        stroke: '#1971c2',
        opacity: 0.3,
        lineWidth: 0,
        lineDash: [4, 4]
      },
      silent: true,
      z: 100000
    })

    this._viewPortManage.getViewPort().add(this._frame)

    this._frame.hide()
  }

  addSelfToViewPort(viewPort: zrender.Group) {
    viewPort.add(this._frame) 
  }

  show() {
    this._frame.show()
  }

  hide() {
    this._frame.hide()
  }

  initSize(width: number, height: number) {
    this._frame.setShape({
      width,
      height
    })
    this._frame.show()
  }

  updatePosition(x: number, y: number) {
    this._frame.attr('x', x)
    this._frame.attr('y', y)
  }

  getFrame() {
    return this._frame
  }

  getBoundingBox() {
    const g = new zrender.Group()
    const boundingBox: zrender.BoundingRect = g.getBoundingRect([this._frame])
    boundingBox.x = this._frame.x
    boundingBox.y = this._frame.y

    return boundingBox
  }

  // 判断是否相交
  isIntersect(shapesBoundingBox: zrender.BoundingRect) {
    return shapesBoundingBox.intersect(this.getBoundingBox())
  }
}

export { DragFrameManage }

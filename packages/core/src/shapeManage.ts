
import { injectable, inject } from 'inversify'
import * as zrender from 'zrender'
// import { Subject, Observable } from 'rxjs'
import { getShape } from './shapes'
import IDENTIFIER from './constants/identifiers'
import { Anchor } from './anchor'
import { Disposable, IDisposable } from './disposable'

import type { IShape } from './shapes'
import type { IAnchorPoint } from './shapes'
import type { IViewPortManage } from './viewPortManage'
import type { IZoomManage } from './zoomManage'

export interface IShapeManage extends IDisposable {
  // updateAddShape$: Observable<IShape>
  createShape(type: string, options: { x: number, y: number }): IShape
  clear(): void
  unActive(): void
  getShapes(): IShape[]
  getActiveShapes(): IShape[]
  isInActiveShape(shape: IShape): boolean
  getShapesBoundingBox(shapes: IShape[]): zrender.BoundingRect
  getMinPosition(shapes: IShape[]): number[]
}

@injectable()
class ShapeManage extends Disposable {
  _shapes: IShape[] = []
  // updateAddShape$ = new Subject<IShape>()
  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPort: IViewPortManage,
    @inject(IDENTIFIER.ZOOM_MANAGE) private _zoomManage: IZoomManage
  ) {
    super()
    // this._disposables.push(this.updateAddShape$)
  }

  createShape(type: string, { x, y }: { x: number, y: number }): IShape {
    const viewPortX = this._viewPort.getPositionX()
    const viewPortY = this._viewPort.getPositionY()
    const zoom = this._zoomManage.getZoom()

    const shape = getShape(type, { x: (x  - viewPortX) /zoom, y: (y - viewPortY) / zoom })

    const anchor = new Anchor(shape)
    shape.anchor = anchor

    // this.updateAddShape$.next(shape)

    shape.createAnchors()
    shape.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPort.addAnchorToViewPort(bar)
    })
    shape.anchor.refresh()
    this.initShapeEvent(shape)
    this._viewPort.addShapeToViewPort(shape)

    this._shapes.push(shape)
    return shape
  }

  clear() {
    this._shapes.forEach((shape: IShape) => {
      this._viewPort.getViewPort().remove(shape)
      shape.anchor?.bars.forEach((bar: IAnchorPoint) => {
        this._viewPort.getViewPort().remove(bar)
      })
    })
    this._shapes = []
  }

  getShapes(): IShape[] {
    return this._shapes
  }

  initShapeEvent(shape: IShape) {
    shape.on('click', () => {
      shape.active()
    })

    shape.on('mousemove', () => {
      shape.anchor?.show();
      (shape as unknown as zrender.Displayable).attr('cursor', 'move')
    })

    shape.on('mouseout', () => {
      shape.anchor?.hide()
    })
  }
  
  unActive() {
    this._shapes.forEach((shape: IShape) => {
      shape.unActive()
    })
  }

  getActiveShapes(): IShape[] {
    return this._shapes.filter((shape: IShape) => {
      return shape.selected
    })
  }

  isInActiveShape(shape: IShape) {
    for(const sh of this.getActiveShapes()) {
      if (sh === shape) {
        return true
      }
    }
    return false
  }

  getShapesBoundingBox(shapes: IShape[]): zrender.BoundingRect {
    const g = new zrender.Group()
    return g.getBoundingRect(shapes)
  }

  getMinPosition(shapes: IShape[]): number[] {
    let minX = Infinity
    let minY = Infinity
    shapes.forEach(shape => {
      if (shape.oldX! < minX) {
        minX = shape.oldX!
      }
      if (shape.oldY! < minY) {
        minY = shape.oldY!
      }
    })

    return [minX, minY]
  }
}

export { ShapeManage } 

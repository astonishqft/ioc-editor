import * as zrender from 'zrender'
import { injectable, inject } from 'inversify'
import IDENTIFIER from './constants/identifiers'
import { Disposable } from './disposable'
import type { IDisposable } from './disposable'
import type { IShape } from './shapes'
import type { IDragFrameManage  } from './dragFrameManage'
import type { IGridManage } from './gridManage'
import type { IViewPortManage } from './viewPortManage'
import type { IShapeManage } from './shapeManage'
import type { IZoomManage } from './zoomManage'

export interface ISceneManage extends IDisposable {
  _zr: zrender.ZRenderType | null
  init(zr: zrender.ZRenderType): void
  addShape(type: string, options: { x: number, y: number }): void
}

export type IMouseEvent = zrender.Element & { nodeType?: string }

@injectable()
class SceneManage extends Disposable {
  _zr: zrender.ZRenderType | null = null
  shapes: IShape[] = []

  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortManage: IViewPortManage,
    @inject(IDENTIFIER.DRAG_FRAME_MANAGE) private _dragFrameManage: IDragFrameManage,
    @inject(IDENTIFIER.GRID_MANAGE) private _gridManage: IGridManage,
    @inject(IDENTIFIER.SHAPE_MANAGE) private _shapeManage: IShapeManage,
    @inject(IDENTIFIER.ZOOM_MANAGE) private _zoomManage: IZoomManage
  )
  {
    super()
  }

  addShape(type: string, options: { x: number, y: number }) {
    const shape = this._shapeManage.createShape(type, options)
    this.shapes.push(shape)
  }

  init(zr: zrender.ZRenderType) {
    this._zr = zr
    this._viewPortManage.addSelfToZr(this._zr)
    this._dragFrameManage.addSelfToViewPort(this._viewPortManage.getViewPort())
    this._gridManage.initGrid(this._zr)
    this.initEvent()
  }

  unActiveShapes() {
    this.shapes.forEach((shape: IShape) => {
      shape.unActive()
    })
  }

  getActiveShapes() {
    return this.shapes.filter((shape: IShape) => {
      return shape.selected
    })
  }

  setCursorStyle(cursor: string) {
    this._zr?.setCursorStyle(cursor)
  }

  initEvent() {
    let selectShape: IShape | null = null
    let startX = 0
    let startY = 0
    let offsetX = 0
    let offsetY = 0
    let drag = false
    let oldViewPortX = this._viewPortManage.getPositionX()
    let oldViewPortY = this._viewPortManage.getPositionY()
    this._zr?.on('mousedown', (e: zrender.ElementEvent) => {
      const zoom = this._zoomManage.getZoom()
      drag = true
      startX = e.offsetX
      startY = e.offsetY
      oldViewPortX = this._viewPortManage.getPositionX()
      oldViewPortY = this._viewPortManage.getPositionY()
      const target = e.target as IShape || null

      if (target && (target as IShape).nodeType === 'node') {
        // 当选中的是 shape 节点
        selectShape = target
      } else if (target && target.parent && target.parent.__hostTarget && (target.parent.__hostTarget as IShape).nodeType  === 'node') {
        // 当选中的是 shape 中的文本
        selectShape = target.parent.__hostTarget as IShape
      }

      if (selectShape) {
        selectShape.oldX = selectShape.x
        selectShape.oldY = selectShape.y
      }

      if (!e.target) {
        // 如果什么都没选中的话
        this.unActiveShapes()
      }
    })

    this._zr?.on('mousemove', (e) => {
      const zoom = this._zoomManage.getZoom()
      offsetX = e.offsetX - startX
      offsetY = e.offsetY - startY
      // 拖拽节点
      if (selectShape) {
        // this.setCursorStyle('move')
        selectShape.anchor?.show()
        // 设置一个阈值，避免鼠标发生轻微位移时出现拖动浮层
        if (Math.abs(offsetX / zoom) > 2 || Math.abs(offsetY / zoom) > 2) {
          const group = new zrender.Group()
          const boundingBox = group.getBoundingRect([selectShape])
          this._dragFrameManage.initSize(boundingBox.width, boundingBox.height)
          this._dragFrameManage.updatePosition(
            selectShape.oldX! + offsetX / zoom,
            selectShape.oldY! + offsetY / zoom
          )
        }
      }

      // 拖拽画布(利用的原理是改变Group的 position 坐标)
      if (drag && !selectShape) { // TODO: 排除没有点击到节点的情况，后续需要继续排除点击到连线等情况
        this.setCursorStyle('grabbing')
        this._viewPortManage.setPosition(oldViewPortX + offsetX, oldViewPortY + offsetY)
        this._gridManage.updateGrid(-this._viewPortManage.getPositionX(), -this._viewPortManage.getPositionY())
      }
    })

    this._zr?.on('mouseup', (e) => {
      const zoom = this._zoomManage.getZoom()
      drag = false
      if (selectShape) {
        selectShape?.attr('x', selectShape.oldX! + (e.offsetX - startX) / zoom)
        selectShape?.attr('y', selectShape.oldY! + (e.offsetY - startY) / zoom)
        this._dragFrameManage.hide()
        // 更新锚点位置
        selectShape.createAnchors()
        selectShape.anchor!.refresh()
        selectShape = null
      }
    })
  }
}

export { SceneManage }

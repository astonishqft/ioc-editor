import * as zrender from 'zrender'
import { injectable, inject } from 'inversify'
import IDENTIFIER from './constants/identifiers'
import { Disposable } from './disposable'

import type { IDisposable } from './disposable'
import type { IShape, IAnchorPoint } from './shapes'
import type { IGridManage } from './gridManage'
import type { IViewPortManage } from './viewPortManage'
import type { IShapeManage } from './shapeManage'
import type { IConnectionManage } from './connectionManage'
import type { IConnection, IControlPoint } from './connection'
import type { ISelectFrameManage } from './selectFrameManage'
import type { IGroupManage } from './groupManage'
import type { IStorageManage } from './storageManage'

export interface ISceneManage extends IDisposable {
  _zr: zrender.ZRenderType | null
  init(zr: zrender.ZRenderType): void
  addShape(type: string, options: { x: number, y: number }): void
  clear(): void
}

export type IMouseEvent = zrender.Element & { nodeType?: string }

@injectable()
class SceneManage extends Disposable {
  _zr: zrender.ZRenderType | null = null
  constructor(
    @inject(IDENTIFIER.VIEW_PORT_MANAGE) private _viewPortManage: IViewPortManage,
    @inject(IDENTIFIER.GRID_MANAGE) private _gridManage: IGridManage,
    @inject(IDENTIFIER.SHAPE_MANAGE) private _shapeManage: IShapeManage,
    @inject(IDENTIFIER.CONNECTION_MANAGE) private _connectionManage: IConnectionManage,
    @inject(IDENTIFIER.SELECT_FRAME_MANAGE) private _selectFrameManage: ISelectFrameManage,
    @inject(IDENTIFIER.GROUP_MANAGE) private _groupManage: IGroupManage,
    @inject(IDENTIFIER.STORAGE_MANAGE) private _storageMgr: IStorageManage
  ) {
    super()
  }

  addShape(type: string, options: { x: number, y: number }) {
    this._shapeManage.createShape(type, options)
  }

  clear() {
    this._connectionManage.clear()
    this._shapeManage.clear()
  }

  init(zr: zrender.ZRenderType) {
    this._zr = zr
    this._viewPortManage.addSelfToZr(this._zr)
    this._gridManage.addSelfToZr(this._zr)
    this.initEvent()
  }

  getActiveShapes() {
    return this._storageMgr.getShapes().filter((shape: IShape) => {
      return shape.selected
    })
  }

  setCursorStyle(cursor: string) {
    this._zr?.setCursorStyle(cursor)
  }

  initEvent() {
    let startX = 0
    let startY = 0
    let offsetX = 0
    let offsetY = 0
    let drag = false
    let oldViewPortX = this._viewPortManage.getPositionX()
    let oldViewPortY = this._viewPortManage.getPositionY()
    let dragModel = 'canvas'
    let connection: IConnection | null = null
    let selectFrameStatus = false
    let zoom = 1

    this._zr?.on('mousedown', (e: zrender.ElementEvent) => {
      drag = true
      startX = e.offsetX
      startY = e.offsetY
      if (e.target) {
        drag = false
      }
      oldViewPortX = this._viewPortManage.getPositionX()
      oldViewPortY = this._viewPortManage.getPositionY()
      zoom = this._storageMgr.getZoom()
      selectFrameStatus = this._selectFrameManage.getSelectFrameStatus() // 是否是选中框
      if (selectFrameStatus) {
        this._selectFrameManage.setPosition((startX - oldViewPortX) / zoom, (startY - oldViewPortY) / zoom)
        this._selectFrameManage.resize(0, 0)
        this._selectFrameManage.show()
      }

      // 选中锚点
      if (e.target && (e.target as IAnchorPoint).mark === 'anch') {
        dragModel = 'anchor'
        connection = this._connectionManage.createConnection((e.target as IAnchorPoint).node)
        connection.setFromPoint((e.target as IAnchorPoint).point)
        connection.addSelfToViewPort(this._viewPortManage.getViewPort())
      }

      if (e.target && (e.target as IControlPoint).mark === 'controlPoint') {
        dragModel = 'controlPoint'
      }

      if (!e.target) {
        // 如果什么都没选中的话
        this._shapeManage.unActive()
        this._groupManage.unActive()
        dragModel = 'scene'
      }
    })

    this._zr?.on('mousemove', (e) => {
      offsetX = e.offsetX - startX
      offsetY = e.offsetY - startY

      if (dragModel === 'anchor') {
        connection?.move((e.offsetX - oldViewPortX) / zoom, (e.offsetY - oldViewPortY) / zoom)
        this.setCursorStyle('crosshair')
      }

      // 拖拽画布(利用的原理是改变Group的 position 坐标)
      if (drag && dragModel === 'scene' && !selectFrameStatus) { // TODO: 排除没有点击到节点的情况，后续需要继续排除点击到连线等情况
        this.setCursorStyle('grabbing')
        this._viewPortManage.setPosition(oldViewPortX + offsetX, oldViewPortY + offsetY)
        this._gridManage.setPosition(oldViewPortX + offsetX, oldViewPortY + offsetY)
        this._gridManage.drawGrid()
      }

      if (selectFrameStatus) {
        // 框选
        this._selectFrameManage.resize(offsetX / zoom, offsetY / zoom)
      }
    })

    this._zr?.on('mouseup', (e) => {
      drag = false

      if (e.target && (e.target as IAnchorPoint).mark === 'anch' && connection && ((e.target as IAnchorPoint).node !== connection.fromNode)) { // 禁止和自身相连
        // 创建连线
        connection.setToPoint((e.target as IAnchorPoint).point)
        connection.connect((e.target as IAnchorPoint).node)
        this._connectionManage.addConnection(connection)
      }

      if (connection) {
        connection.cancel()
      }

      if (selectFrameStatus) {
        this._selectFrameManage.multiSelect()
        this._selectFrameManage.setSelectFrameStatus(false)
        this._selectFrameManage.hide()
      }

      dragModel = 'scene'
    })
  }
}

export { SceneManage }

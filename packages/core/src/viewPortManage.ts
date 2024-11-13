import * as zrender from 'zrender'
import { IocEditor } from './iocEditor'
import { Disposable } from './disposable'

import type { IDisposable } from './disposable'

export interface IViewPortManage extends IDisposable {
  setPosition(x: number, y: number): void
  getPositionX(): number
  getPositionY(): number
  addSelfToZr(zr: zrender.ZRenderType): void
  removeElementFromViewPort(element: zrender.Element): void
  addElementToViewPort(element: zrender.Element): void
  getViewPort(): zrender.Group
  setScale(x: number, y: number): void
  getScaleX(): number
  getScaleY(): number
  getSceneWidth(): number
  getSceneHeight(): number
}

class ViewPortManage extends Disposable {
  private _viewPort: zrender.Group = new zrender.Group()
  private _iocEditor: IocEditor

  constructor(iocEditor: IocEditor) {
    super()
    this._iocEditor = iocEditor
  }

  getViewPort(): zrender.Group {
    return this._viewPort
  }

  setScale(x: number, y: number) {
    this._viewPort.attr('scaleX', x)
    this._viewPort.attr('scaleY', y)
  }

  getScaleX() {
    return this._viewPort.scaleX
  }

  getScaleY() {
    return this._viewPort.scaleY
  }

  setPosition(x: number, y: number) {
    this._viewPort.attr('x', x)
    this._viewPort.attr('y', y)
  }

  getPositionX(): number {
    return this._viewPort.x
  }

  getPositionY(): number {
    return this._viewPort.y
  }

  addSelfToZr(zr: zrender.ZRenderType) {
    zr.add(this._viewPort)
  }

  removeElementFromViewPort(element: zrender.Element) {
    this._viewPort.remove(element)
  }

  addElementToViewPort(element: zrender.Element) {
    this._viewPort.add(element)
  }

  getSceneWidth() {
    return this._iocEditor._zr.getWidth()
  }

  getSceneHeight() {
    return this._iocEditor._zr.getHeight()
  }
}

export { ViewPortManage }

import { Rect, BoundingRect } from './'

import type { IViewPortManage } from './viewPortManage'
import type { ISettingManage } from './settingManage'
import type { IStorageManage } from './storageManage'
import type { IIocEditor } from './iocEditor'

export interface ISelectFrameManage {
  getSelectFrame(): Rect
  getSelectFrameStatus(): boolean
  setSelectFrameStatus(status: boolean): void
  setPosition(x: number, y: number): void
  resize(width: number, height: number): void
  multiSelect(): void
  show(): void
  hide(): void
}

class SelectFrameManage implements ISelectFrameManage {
  private _selectFrame: Rect
  private _selectFrameStatus: boolean = false
  private _settingMgr: ISettingManage
  private _viewPortMgr: IViewPortManage
  private _storageMgr: IStorageManage

  constructor(iocEditor: IIocEditor) {
    this._viewPortMgr = iocEditor._viewPortMgr
    this._settingMgr = iocEditor._settingMgr
    this._storageMgr = iocEditor._storageMgr
    this._selectFrame = new Rect({
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      style: {
        fill: this._settingMgr.get('selectFrameColor'),
        opacity: 0.2,
        lineDash: [4, 4]
      },
      silent: true,
      z: 100000
    })

    this._viewPortMgr.addElementToViewPort(this._selectFrame)
    this.hide()
  }

  setPosition(x: number, y: number) {
    this._selectFrame.attr({ x, y })
  }

  resize(width: number, height: number) {
    this._selectFrame.attr({
      shape: {
        width,
        height: height - 1
      }
    })
  }

  multiSelect() {
    const selectFrameBoundingBox = this._selectFrame.getBoundingRect()
    this._storageMgr.getNodes().forEach(shape => {
      const { x, y, width, height } = shape.getBoundingRect()
      if (selectFrameBoundingBox.intersect(new BoundingRect(x, y, width, height))) {
        shape.active()
      } else {
        shape.unActive()
      }
    })
  }

  show() {
    this._selectFrame.show()
  }

  hide() {
    this._selectFrame.hide()
  }

  getSelectFrame() {
    return this._selectFrame
  }

  setSelectFrameStatus(status: boolean) {
    this._selectFrameStatus = status
  }

  getSelectFrameStatus(): boolean {
    return this._selectFrameStatus
  }
}

export { SelectFrameManage }

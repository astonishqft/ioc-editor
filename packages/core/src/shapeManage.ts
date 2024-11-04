import * as zrender from 'zrender'
import { getShape } from './shapes'
import { Anchor } from './anchor'
import { getBoundingRect } from './utils'
import { Disposable, IDisposable } from './disposable'
import { Subject } from 'rxjs'

import type { IExportShape, IShape } from './shapes'
import type { IAnchorPoint } from './shapes'
import type { IViewPortManage } from './viewPortManage'
import type { IDragFrameManage } from './dragFrameManage'
import type { IConnectionManage } from './connectionManage'
import type { IRefLineManage } from './refLineManage'
import type { IStorageManage } from './storageManage'
import type { INodeGroup } from 'shapes/nodeGroup'
import type { IocEditor } from './iocEditor'
import type { IAnchor } from './shapes'

export interface IShapeManage extends IDisposable {
  updateSelectShape$: Subject<IShape>
  createShape(type: string, options: { x: number; y: number }): IShape
  clear(): void
  unActive(): void
}

class ShapeManage extends Disposable {
  private _viewPortMgr: IViewPortManage
  private _dragFrameMgr: IDragFrameManage
  private _storageMgr: IStorageManage
  private _connectionMgr: IConnectionManage
  private _refLineMgr: IRefLineManage

  updateSelectShape$ = new Subject<IShape>()
  constructor(iocEditor: IocEditor) {
    super()
    this._viewPortMgr = iocEditor._viewPortMgr
    this._dragFrameMgr = iocEditor._dragFrameMgr
    this._storageMgr = iocEditor._storageMgr
    this._connectionMgr = iocEditor._connectionMgr
    this._refLineMgr = iocEditor._refLineMgr
    this._disposables.push(this.updateSelectShape$)
  }

  createShape(type: string, { x, y }: { x: number; y: number }): IShape {
    const viewPortX = this._viewPortMgr.getPositionX()
    const viewPortY = this._viewPortMgr.getPositionY()
    const zoom = this._storageMgr.getZoom()

    const shape = getShape(type, {
      x: (x - viewPortX) / zoom,
      y: (y - viewPortY) / zoom
    })

    shape.getExportData = () => {
      const exportData: IExportShape = {
        x: shape.x,
        y: shape.y,
        id: shape.id,
        type,
        z: shape.z,
        style: {
          fill: shape.style.fill,
          stroke: shape.style.stroke,
          lineWidth: shape.style.lineWidth,
          lineDash: shape.style.lineDash,
          fontColor: shape.getTextContent().style.fill,
          text: shape.getTextContent().style.text,
          fontSize: shape.getTextContent().style.fontSize,
          fontWeight: shape.getTextContent().style.fontWeight,
          fontStyle: shape.getTextContent().style.fontStyle,
          textPosition: shape.textConfig.position
        }
      }

      if (shape.parentGroup) {
        exportData.parent = shape.parentGroup.id
      }

      return exportData
    }

    // 给每个shape增加公共方法
    shape.getBoundingBox = () => {
      const { width, height } = getBoundingRect([shape])
      return new zrender.BoundingRect(shape.x, shape.y, width, height)
    }

    shape.active = () => {
      shape.selected = true
      shape.attr({
        style: {
          shadowColor: '#1971c2',
          stroke: '#1971c2',
          shadowBlur: 1
        }
      })
      shape.anchor?.show()
    }

    shape.unActive = () => {
      shape.selected = false
      shape.attr({
        style: {
          shadowColor: '',
          shadowBlur: 0,
          stroke: '#333'
        }
      })
      shape.anchor?.hide()
    }

    shape.getAnchors = () => {
      return shape.anchors.slice()
    }

    shape.getAnchorByIndex = (index: number) => {
      return shape.anchors.filter((item: IAnchor) => item.index == index)[0]
    }

    const anchor = new Anchor(shape)
    shape.anchor = anchor

    shape.createAnchors()
    shape.anchor.bars.forEach((bar: IAnchorPoint) => {
      this._viewPortMgr.addElementToViewPort(bar)
    })
    shape.anchor.refresh()
    this.initShapeEvent(shape)
    this._viewPortMgr.addElementToViewPort(shape)

    this._storageMgr.addShape(shape)

    return shape
  }

  clear() {
    this._storageMgr.getShapes().forEach((shape: IShape) => {
      this._viewPortMgr.removeElementFromViewPort(shape)
      shape.anchor?.bars.forEach((bar: IAnchorPoint) => {
        this._viewPortMgr.removeElementFromViewPort(bar)
      })
    })
    this._storageMgr.clearShapes()
  }

  dragLeave(isDragLeave: boolean, shape: IShape) {
    console.log('isDragLeave', isDragLeave)
    if (isDragLeave) {
      shape.parentGroup!.setAlertStyle()
    } else {
      shape.parentGroup!.setCommonStyle()
    }
  }

  dragEnter(isDragEnter: boolean, targetGroup: INodeGroup) {
    console.log('isDragEnter', isDragEnter)
    if (isDragEnter) {
      targetGroup.setAlertStyle()
      this._storageMgr
        .getGroups()
        .filter(g => g.id !== targetGroup.id)
        .forEach(g => g.setCommonStyle())
    } else {
      this._storageMgr.getGroups().forEach(g => g.setCommonStyle())
    }
  }

  removeShapeFromGroup(shape: IShape) {
    if (shape.parentGroup) {
      if (shape.parentGroup!.shapes.length === 1) return // 确保组内至少有一个元素
      shape.parentGroup!.shapes = shape.parentGroup!.shapes.filter(item => item.id !== shape.id)
      shape.parentGroup!.resizeNodeGroup()
      this._connectionMgr.refreshConnection(shape.parentGroup)
      delete shape.parentGroup
    }
  }

  addShapeToGroup(shape: IShape, targetGroup: INodeGroup) {
    ;(shape as unknown as zrender.Displayable).attr('z', targetGroup.z + 1)

    shape.parentGroup = targetGroup
    targetGroup.shapes.push(shape)
    targetGroup.resizeNodeGroup()
  }

  initShapeEvent(shape: IShape) {
    let startX = 0
    let startY = 0
    let zoom = 1
    let magneticOffsetX = 0
    let magneticOffsetY = 0
    let dragTargetGroup: null | INodeGroup = null
    let isDragOutFromGroup = false
    let isRemoveFromGroup = false
    let isDragEnterToGroup = false
    const mouseMove = (e: MouseEvent) => {
      const nodeName = (e.target as HTMLElement).nodeName
      if (nodeName !== 'CANVAS') return
      const { offsetX, offsetY } = e
      const stepX = offsetX - startX
      const stepY = offsetY - startY
      // 设置一个阈值，避免鼠标发生轻微位移时出现拖动浮层
      if (Math.abs(offsetX / zoom) > 2 || Math.abs(offsetY / zoom) > 2) {
        this._dragFrameMgr.updatePosition(shape.x + stepX / zoom, shape.y + stepY / zoom)
        const result = this._dragFrameMgr.intersectWidthGroups(shape)
        isDragOutFromGroup = result.isDragOutFromGroup
        dragTargetGroup = result.dragTargetGroup
        isRemoveFromGroup = result.isRemoveFromGroup
        isDragEnterToGroup = result.isDragEnterToGroup
      }
      // 拖拽浮层的时候同时更新对其参考线
      const magneticOffset = this._refLineMgr.updateRefLines()
      magneticOffsetX = magneticOffset.magneticOffsetX
      magneticOffsetY = magneticOffset.magneticOffsetY
    }

    const mouseUp = (e: MouseEvent) => {
      this._dragFrameMgr.hide()
      shape.attr('x', shape.oldX! + (e.offsetX - startX) / zoom + magneticOffsetX / zoom)
      shape.attr('y', shape.oldY! + (e.offsetY - startY) / zoom + magneticOffsetY / zoom)

      this._connectionMgr.refreshConnection(shape)

      this._refLineMgr.clearRefPointAndRefLines()
      magneticOffsetX = 0
      magneticOffsetY = 0
      // 取消事件监听
      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('mouseup', mouseUp)

      if (isDragOutFromGroup && dragTargetGroup) {
        this.removeShapeFromGroup(shape)
        this.addShapeToGroup(shape, dragTargetGroup)
      }

      if (isRemoveFromGroup) {
        this.removeShapeFromGroup(shape)
      }
      if (isDragEnterToGroup && dragTargetGroup) {
        this.addShapeToGroup(shape, dragTargetGroup)
      }

      this.updateGroupSize(shape)
    }

    shape.on('click', () => {
      console.log('shape click', shape)
      this.unActive()
      this._connectionMgr.unActiveConnections()
      shape.active!()
      this.updateSelectShape$.next(shape)
    })

    shape.on('mousemove', () => {
      shape.anchor?.show()
      ;(shape as unknown as zrender.Displayable).attr('cursor', 'move')
    })

    shape.on('mouseout', () => {
      if (shape.selected) return
      shape.anchor?.hide()
    })

    shape.on('mousedown', e => {
      startX = e.offsetX
      startY = e.offsetY
      shape.oldX = shape.x
      shape.oldY = shape.y
      zoom = this._storageMgr.getZoom()
      this._dragFrameMgr.updatePosition(shape.x, shape.y)
      this._dragFrameMgr.show()
      const { width, height } = shape.getBoundingBox!()
      this._dragFrameMgr.initSize(width, height)

      this._refLineMgr.cacheRefLines()
      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
    })

    shape.on('mouseup', () => {
      console.log('shape mouseup')
    })
  }

  unActive() {
    this._storageMgr.getNodes().forEach(shape => {
      shape.unActive!()
    })
  }

  updateGroupSize(shape: IShape | INodeGroup) {
    if (shape.parentGroup) {
      shape.parentGroup.resizeNodeGroup()
      this._connectionMgr.refreshConnection(shape.parentGroup)
      this.updateGroupSize(shape.parentGroup)
    }
  }
}

export { ShapeManage }

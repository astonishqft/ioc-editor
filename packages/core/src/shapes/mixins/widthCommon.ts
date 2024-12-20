import * as zrender from 'zrender'
import { NodeType } from '../../index'

import type { IExportShape } from '..'
import type { INodeGroup } from '../nodeGroup'
import type { FontStyle, FontWeight } from '../../index'
import type { Constructor, Dictionary, SafeDisplayable } from '../../types'

export type CommonConstructor = Constructor<SafeDisplayable>

export interface IWidthCommon {
  type: string
  oldX: number
  oldY: number
  nodeType: NodeType
  updatePosition(offsetX: number, offsetY: number): void
  setOldPosition(): void
  getBoundingBox(): zrender.BoundingRect
  setType(type: string): void
  getExportData(): IExportShape
  setZ(z: number): void
  setXy(x: number, y: number): void
  setCursor(type: string): void
  setShape(shapeConfig: Dictionary<any>): void
}

function WidthCommon<TBase extends CommonConstructor>(Base: TBase) {
  return class extends Base {
    nodeType = NodeType.Shape
    oldX: number = 0
    oldY: number = 0
    parentGroup?: INodeGroup
    constructor(...args: any[]) {
      super(...args)
    }

    setType(type: string) {
      this.type = type
    }

    setCursor(type: string) {
      this.attr('cursor', type)
    }

    updatePosition(offsetX: number, offsetY: number) {
      this.attr('x', this.oldX + offsetX)
      this.attr('y', this.oldY + offsetY)
    }

    setOldPosition() {
      this.oldX = this.x
      this.oldY = this.y
    }

    getBoundingBox() {
      const g = new zrender.Group()
      const { width, height } = g.getBoundingRect([this as unknown as zrender.Element])

      return new zrender.BoundingRect(this.x, this.y, width, height)
    }

    setZ(z: number) {
      this.attr('z', z)
    }

    setXy(x: number, y: number) {
      this.attr('x', x)
      this.attr('y', y)
    }

    getExportData() {
      const exportData: IExportShape = {
        x: this.x,
        y: this.y,
        id: this.id,
        type: this.type,
        z: this.z,
        style: {
          fill: this.style.fill,
          stroke: this.style.stroke,
          lineWidth: this.style.lineWidth,
          lineDash: this.style.lineDash,
          fontColor: this.getTextContent().style.fill as string,
          text: this.getTextContent().style.text as string,
          fontSize: this.getTextContent().style.fontSize as number,
          fontWeight: this.getTextContent().style.fontWeight as FontWeight,
          fontStyle: this.getTextContent().style.fontStyle as FontStyle,
          textPosition: this.textConfig!.position
        },
        shape: this.shape
      }

      if (this.type === 'image') {
        exportData.style.image = this.style.image
        exportData.style.width = this.style.width
        exportData.style.height = this.style.height
      }

      if (this.parentGroup) {
        exportData.parent = this.parentGroup.id
      }

      return exportData
    }
  }
}

export { WidthCommon }

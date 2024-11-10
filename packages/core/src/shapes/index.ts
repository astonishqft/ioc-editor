import * as zrender from 'zrender'

import { Rect } from './rect'
import { Circle } from './circle'
import type { Anchor } from '../anchor'
import type { INodeGroup } from './nodeGroup'
import type {
  PatternObject,
  LinearGradientObject,
  RadialGradientObject,
  FontStyle,
  FontWeight,
  BuiltinTextPosition
} from '../index'

export type FillStyle =
  | string
  | PatternObject
  | LinearGradientObject
  | RadialGradientObject
  | undefined
export type StrokeStyle =
  | string
  | PatternObject
  | LinearGradientObject
  | RadialGradientObject
  | undefined
export type LineDashStyle = false | number[] | 'solid' | 'dashed' | 'dotted' | undefined

export type Dictionary<T> = {
  [key: string]: T
}

export interface IExportConnectionStyle {
  stroke: StrokeStyle
  lineWidth: number | undefined
  lineDash: LineDashStyle
  fontColor: string | undefined
  text: string | undefined
  fontSize: number | string | undefined
  fontWeight: FontWeight | undefined
  fontStyle: FontStyle | undefined
  textPosition: number[]
}

export interface IExportConnection {
  type: ConnectionType
  id: number
  fromPoint: number
  toPoint: number
  fromNode: number
  toNode: number
  controlPoint1?: (number | undefined)[]
  controlPoint2?: (number | undefined)[]
  controlLine1?: (number | undefined)[]
  controlLine2?: (number | undefined)[]
  style: IExportConnectionStyle
}

export interface IExportData {
  shapes: any[]
  connections: any[]
  groups: any[]
}

export interface IExportShapeStyle {
  fill: FillStyle
  stroke: StrokeStyle
  lineWidth: number
  lineDash: LineDashStyle
  fontColor: string
  text: string
  fontSize: number
  fontWeight: FontWeight
  fontStyle: FontStyle
  textPosition: BuiltinTextPosition | (number | string)[] | undefined
}

export interface IExportShape {
  x: number
  y: number
  style: IExportShapeStyle
  type: string
  id: number
  z: number
  parent?: number
}

export interface IExportGroupStyle {
  fill: FillStyle
  stroke: StrokeStyle
  lineWidth: number | undefined
  lineDash: LineDashStyle
  fontColor: string | undefined
  fontSize: number | string | undefined
  text: string | undefined
  fontWeight: FontWeight | undefined
  fontStyle: FontStyle | undefined
  textPosition: BuiltinTextPosition | (number | string)[] | undefined
}

export interface IExportGroup {
  style: IExportGroupStyle
  id: number
  z: number
  parent?: number
}

export interface IConnection extends zrender.Group {
  fromNode: IShape | INodeGroup
  toNode: IShape | INodeGroup | null
  fromPoint: IAnchor | null
  toPoint: IAnchor | null
  cancelConnect(): void
  move(x: number, y: number): void
  connect(node: IShape | INodeGroup): void
  setFromPoint(point: IAnchor): void
  setToPoint(point: IAnchor): void
  refresh(): void
  active(): void
  unActive(): void
  setLineWidth(lineWidth: number): void
  getLineWidth(): number | undefined
  setLineColor(color: string): void
  getLineColor(): string | undefined
  setLineDash(type: number[]): void
  getLineDash(): number[]
  getLineType(): ConnectionType
  setLineType(type: ConnectionType): void
  setLineTextContent(content: string): void
  getLineTextContent(): string | undefined
  setLineTextFontSize(size: number | undefined): void
  getLineTextFontSize(): number | string | undefined
  setLineFontStyle(style: FontStyle): void
  setLineFontWeight(weight: FontWeight): void
  setLineTextFontColor(color: string | undefined): void
  getLineTextFontColor(): string | undefined
  getLineFontStyle(): FontStyle | undefined
  getLineFontWeight(): FontWeight | undefined
  getId(): number
  getConnectionType(): ConnectionType
  getLineText(): zrender.Text | null
  setStyle(style: IExportConnectionStyle): void
  setConnectionType(type: ConnectionType): void
  setBezierCurve(
    fromPoint: IAnchor,
    toPoint: IAnchor,
    controlPoint1: (number | undefined)[],
    controlPoint2: (number | undefined)[]
  ): void
  getExportData(): IExportConnection
}

export enum ConnectionType {
  Line,
  OrtogonalLine,
  BezierCurve
}

export enum NodeType {
  Group = 'Group',
  Shape = 'Shape'
}

export type IControlPoint = zrender.Circle & {
  mark: string
}

export interface IBaseShape {
  selected: boolean
  nodeType: NodeType
  anchors: IAnchor[]
  parentGroup?: INodeGroup
  anchor?: Anchor
  oldX?: number
  oldY?: number
  z?: number
  createAnchors(): void
}

export interface IShape extends zrender.Element, IBaseShape {
  getExportData?(): IExportShape
  active?(): void
  unActive?(): void
  getBoundingBox?(): zrender.BoundingRect
  getAnchors?(): IAnchor[]
  getAnchorByIndex?(index: number): IAnchor
  updatePosition?(target: IShape | INodeGroup, offsetX: number, offsetY: number): void
  setOldPosition?(target: IShape | INodeGroup): void
}

export interface IShapeConfig {
  [key: string]: zrender.RectProps | zrender.EllipseProps
}

export interface IShapeMap {
  [key: string]: any
}

export interface IShapeTextConfig {
  textContent: zrender.Text
  textConfig: zrender.ElementTextConfig
}

export interface IAnchor {
  x: number
  y: number
  node: IShape | INodeGroup
  direct: string
  index: number
}

export interface IAnchorPoint extends zrender.Circle {
  point: IAnchor
  node: IShape | INodeGroup
  mark: string
  oldFillColor: string
  anch: IAnchorPoint
}

export const shapeConfig: IShapeConfig = {
  rect: {
    style: {
      fill: '#fff',
      stroke: '#333',
      lineWidth: 1,
      opacity: 1
    },
    shape: {
      x: 0,
      y: 0,
      width: 60,
      height: 60
    },
    z: 2
  },
  circle: {
    style: {
      fill: '#fff',
      stroke: '#333',
      lineWidth: 1,
      opacity: 1
    },
    shape: {
      cx: 30,
      cy: 30,
      rx: 30,
      ry: 30
    },
    z: 2
  }
}

const getShapeTextConfig = (): IShapeTextConfig => {
  return {
    textContent: new zrender.Text({
      style: {
        text: 'title',
        fill: '#333',
        fontSize: 12,
        fontFamily: 'Arial'
      },
      z: 11,
      cursor: 'move'
    }),
    textConfig: {
      position: 'inside'
    }
  }
}

export const shapes: IShapeMap = {
  rect: Rect,
  circle: Circle
}

export const getShape = (type: string, option: { x: number; y: number }) => {
  const config = { ...shapeConfig[type], ...getShapeTextConfig() }

  const shape = new shapes[type](config)
  shape.attr('x', option.x)
  shape.attr('y', option.y)

  return shape
}

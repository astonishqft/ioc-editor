import { IocEditor } from './iocEditor'
import * as zrender from 'zrender'
import CanvasPainter from 'zrender/lib/canvas/Painter.js'
import { SelectFrameManage } from './selectFrameManage'
import { GroupManage } from './groupManage'
import { ConnectionType } from './shapes'
import { NodeType } from './shapes'
import { MiniMapManage } from './miniMapManage'

import type { ISceneManage } from './sceneManage'
import type { IZoomManage } from './zoomManage'
import type { IShapeManage } from './shapeManage'
import type { IConnectionManage } from './connectionManage'
import type { ISelectFrameManage } from './selectFrameManage'
import type { IGroupManage } from './groupManage'
import type { ISettingManage } from './settingManage'
import type { IGridManage } from './gridManage'
import type { IConnection, IShape } from './shapes'
import type { INodeGroup } from './shapes/nodeGroup'
import type { IMiniMapManage } from './miniMapManage'
import type { BuiltinTextPosition, FontStyle, FontWeight } from 'zrender/lib/core/types'
import type { LinearGradientObject, PatternObject, RadialGradientObject } from 'zrender/lib/export'

type Displayable = zrender.Displayable

zrender.registerPainter('canvas', CanvasPainter)

export { IocEditor, SelectFrameManage, GroupManage, ConnectionType, NodeType, MiniMapManage }
export type {
  ISceneManage,
  IZoomManage,
  IConnectionManage,
  ISelectFrameManage,
  IGroupManage,
  IMiniMapManage,
  IShapeManage,
  INodeGroup,
  IShape,
  IConnection,
  Displayable,
  FontStyle,
  FontWeight,
  BuiltinTextPosition,
  ISettingManage,
  IGridManage,
  PatternObject,
  LinearGradientObject,
  RadialGradientObject
}

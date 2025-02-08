import { NodeType } from '../../shapes'
import { INodeGroup } from '../../shapes/nodeGroup'
import { IShape, IConnection, INode } from '../../shapes'

import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IDeleteNodeCommandOpts {
  nodes: INode[]
  connections: IConnection[]
}

class DeleteNodeCommand implements Command {
  private node: INode
  private iocEditor: IIocEditor
  private nodeType: NodeType

  constructor(iocEditor: IIocEditor, node: INode) {
    this.iocEditor = iocEditor
    this.node = node
    this.nodeType = node.nodeType
  }

  execute() {
    this.iocEditor._sceneMgr.unActive()
    if (this.nodeType === NodeType.Group) {
      this.iocEditor._groupMgr.removeGroupFromEditor(this.node as INodeGroup)
    } else {
      this.iocEditor._shapeMgr.removeShapeFromEditor(this.node as IShape)
    }
  }

  undo() {
    if (this.nodeType === NodeType.Group) {
      this.iocEditor._groupMgr.addGroupToEditor(this.node as INodeGroup)
    } else {
      this.iocEditor._shapeMgr.addShapeToEditor(this.node as IShape)
    }
  }

  redo() {
    this.execute()
  }
}

export { DeleteNodeCommand }

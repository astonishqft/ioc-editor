import type { INodeGroup } from '../../shapes/nodeGroup'
import type { INode } from '../../shapes'
import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IDragEnterToGroupCommandOpts {
  targetGroup: INodeGroup
  node: INode
  offsetX: number
  offsetY: number
}

class DragEnterToGroupCommand implements Command {
  private iocEditor: IIocEditor
  private targetGroup: INodeGroup
  private node: INode

  constructor(iocEditor: IIocEditor, group: INodeGroup, node: INode) {
    this.iocEditor = iocEditor
    this.targetGroup = group
    this.node = node
  }

  execute() {
    this.iocEditor._groupMgr.addShapeToGroup(this.node, this.targetGroup)
  }

  undo() {
    this.iocEditor._groupMgr.removeShapeFromGroup(this.node)
  }

  redo() {
    this.execute()
  }
}

export { DragEnterToGroupCommand }

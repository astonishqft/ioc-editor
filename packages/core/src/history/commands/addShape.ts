import type { IShape, ICommand, IIocEditor } from '@/index'

export interface IAddShapeCommandOpts {
  shapeType: string
  x: number
  y: number
  url?: string
}

class AddShapeCommand implements ICommand {
  private shape: IShape
  private iocEditor: IIocEditor

  constructor(iocEditor: IIocEditor, shape: IShape) {
    this.iocEditor = iocEditor
    this.shape = shape
  }

  execute() {
    this.iocEditor._shapeMgr.addShapeToEditor(this.shape)
  }

  undo() {
    this.iocEditor._shapeMgr.removeShapeFromEditor(this.shape)
  }

  redo() {
    this.execute()
  }
}

export { AddShapeCommand }

import { ConnectionType } from '../../shapes'

import type { IConnection } from '../../shapes'
import type { ICommand } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IChangeConnectionTypeCommandOpts {
  connection: IConnection
  lineType: ConnectionType
  oldLineType: ConnectionType
}

class ChangeConnectionTypeCommand implements ICommand {
  private iocEditor: IIocEditor
  private connection: IConnection
  private lineType: ConnectionType
  private oldLineType: ConnectionType
  constructor(
    iocEditor: IIocEditor,
    connection: IConnection,
    lineType: ConnectionType,
    oldLineType: ConnectionType
  ) {
    this.iocEditor = iocEditor
    this.connection = connection
    this.lineType = lineType
    this.oldLineType = oldLineType
  }

  execute() {
    this.connection.setConnectionType(this.lineType)
  }

  undo() {
    this.connection.setConnectionType(this.oldLineType)
  }

  redo() {
    this.execute()
  }
}

export { ChangeConnectionTypeCommand }

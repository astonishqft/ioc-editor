import type { IExportData, ICommand, IIocEditor } from '@/index'

export interface IClearCommandOpts {
  exportData: IExportData
}

class ClearCommand implements ICommand {
  private iocEditor: IIocEditor
  private exportData: IExportData
  constructor(iocEditor: IIocEditor, exportData: IExportData) {
    this.iocEditor = iocEditor
    this.exportData = exportData
  }

  execute() {
    this.iocEditor._sceneMgr.clear()
  }

  undo() {
    this.iocEditor.initFlowChart(this.exportData)
  }

  redo() {
    this.execute()
  }
}

export { ClearCommand }

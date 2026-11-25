
import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 暴露给 Vue 前端的自定义接口

const api = {
  // 选择并导入文档
  selectAndImportDocuments: () => {
    return ipcRenderer.invoke('documents:select-and-import')
  },

  // 删除已导入文档
  deleteImportedDocument: (fileId) => {
    return ipcRenderer.invoke('documents:delete', fileId)
  }
}


// 安全桥接
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

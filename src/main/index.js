
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join, extname, basename } from 'path'
import { promises as fs } from 'fs'
import { randomUUID } from 'crypto'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// 创建主窗口
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// 注册文档导入接口
function registerDocumentHandlers() {
  ipcMain.handle('documents:select-and-import', async () => {
    // 弹出系统文件选择窗口
    const result = await dialog.showOpenDialog({
      title: '选择要导入的文档',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: '支持的文档',
          extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt']
        },
        {
          name: '所有文件',
          extensions: ['*']
        }
      ]
    })

    // 用户取消选择
    if (result.canceled || result.filePaths.length === 0) {
      return {
        success: true,
        canceled: true,
        files: []
      }
    }

    // 应用本地文档保存目录
    const documentsDir = join(app.getPath('userData'), 'documents')

    await fs.mkdir(documentsDir, { recursive: true })

    const importedFiles = []

    for (const sourcePath of result.filePaths) {
      const originalName = basename(sourcePath)
      const extension = extname(originalName).toLowerCase()
      const fileId = randomUUID()
      const storedName = `${fileId}${extension}`
      const targetPath = join(documentsDir, storedName)

      // 获取原文件信息
      const fileInfo = await fs.stat(sourcePath)

      // 复制到应用自己的文档目录，不移动或删除原文件
      await fs.copyFile(sourcePath, targetPath)

      importedFiles.push({
        id: fileId,
        name: originalName,
        extension,
        size: fileInfo.size,
        path: targetPath,
        importedAt: new Date().toISOString()
      })
    }

    return {
      success: true,
      canceled: false,
      files: importedFiles
    }
  })

  // 删除已导入的本地文档
  ipcMain.handle('documents:delete', async (_, fileId) => {
    try {
      // 只接受合法 UUID，避免通过 IPC 删除任意文件
      if (
        typeof fileId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(fileId)
      ) {
        throw new Error('无效的文档编号')
      }

      const documentsDir = join(app.getPath('userData'), 'documents')

      const files = await fs.readdir(documentsDir)
      const matchedFile = files.find(file => file.startsWith(fileId + '.'))

      if (!matchedFile) {
        throw new Error('找不到对应的本地文档')
      }

      const targetPath = join(documentsDir, matchedFile)

      await fs.unlink(targetPath)

      return { success: true }
    } catch (error) {
      console.error('删除文档失败：', error)
      return {
        success: false,
        message: error.message
      }
    }
  })

}

// Electron 初始化
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 注册文档导入 IPC 接口
  registerDocumentHandlers()

  // 原有 IPC 测试接口
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

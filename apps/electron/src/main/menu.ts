import { Menu, app, shell, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import type { WindowManager } from './window-manager'
import { mainLog } from './logger'
import { getLanguage } from '@craft-agent/shared/config/storage'

// Store reference for rebuilding menu
let cachedWindowManager: WindowManager | null = null

// Translation dictionaries
const translations = {
  en: {
    appName: 'Craft Agents',
    about: 'About Craft Agents',
    installUpdate: 'Install Update…',
    checkForUpdates: 'Check for Updates…',
    settings: 'Settings...',
    hide: 'Hide Craft Agents',
    hideOthers: 'Hide Others',
    unhide: 'Show All',
    quit: 'Quit Craft Agents',
    file: 'File',
    newChat: 'New Chat',
    newWindow: 'New Window',
    close: 'Close',
    edit: 'Edit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    view: 'View',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Actual Size',
    reload: 'Reload',
    forceReload: 'Force Reload',
    toggleDevTools: 'Toggle Developer Tools',
    window: 'Window',
    minimize: 'Minimize',
    zoom: 'Zoom',
    front: 'Bring All to Front',
    debug: 'Debug',
    resetDefaults: 'Reset to Defaults...',
    resetMessage: 'Reset to Defaults',
    resetDetail: 'To reset Craft Agent to defaults, quit the app and run:\n\nbun run fresh-start\n\nThis will delete all configuration, credentials, workspaces, and sessions.',
    ok: 'OK',
    help: 'Help',
    helpDocumentation: 'Help & Documentation',
    keyboardShortcuts: 'Keyboard Shortcuts',
  },
  'zh-CN': {
    appName: 'Craft Agents',
    about: '关于 Craft Agents',
    installUpdate: '安装更新…',
    checkForUpdates: '检查更新…',
    settings: '设置...',
    hide: '隐藏 Craft Agents',
    hideOthers: '隐藏其他',
    unhide: '显示全部',
    quit: '退出 Craft Agents',
    file: '文件',
    newChat: '新建对话',
    newWindow: '新建窗口',
    close: '关闭',
    edit: '编辑',
    undo: '撤销',
    redo: '重做',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    selectAll: '全选',
    view: '视图',
    zoomIn: '放大',
    zoomOut: '缩小',
    resetZoom: '实际大小',
    reload: '重新加载',
    forceReload: '强制重新加载',
    toggleDevTools: '切换开发者工具',
    window: '窗口',
    minimize: '最小化',
    zoom: '缩放',
    front: '前置全部窗口',
    debug: '调试',
    resetDefaults: '重置为默认值...',
    resetMessage: '重置为默认值',
    resetDetail: '要将 Craft Agent 重置为默认值，请退出应用并运行：\n\nbun run fresh-start\n\n这将删除所有配置、凭证、工作区和会话。',
    ok: '确定',
    help: '帮助',
    helpDocumentation: '帮助与文档',
    keyboardShortcuts: '键盘快捷键',
  },
}

function getTranslations(language: string) {
  return translations[language as keyof typeof translations] || translations.en
}

/**
 * Creates and sets the application menu for macOS.
 * Includes only relevant items for the Craft Agents app.
 *
 * Call rebuildMenu() when update state changes to refresh the menu.
 */
export function createApplicationMenu(windowManager: WindowManager): void {
  cachedWindowManager = windowManager
  rebuildMenu()
}

/**
 * Updates the menu language without rebuilding from scratch.
 * Call this when language changes.
 */
export function updateMenuLanguage(language: string): void {
  rebuildMenu(language)
}

/**
 * Rebuilds the application menu with current update state.
 * Call this when update availability changes.
 *
 * On Windows/Linux: Menu is hidden - all functionality is in the Craft logo menu.
 * On macOS: Native menu is required by Apple guidelines, so we keep it synced.
 */
export async function rebuildMenu(language?: string): Promise<void> {
  if (!cachedWindowManager) return

  const windowManager = cachedWindowManager
  const isMac = process.platform === 'darwin'

  // On Windows/Linux, hide the native menu entirely
  // Users access menu via the Craft logo dropdown in the app
  if (!isMac) {
    Menu.setApplicationMenu(null)
    return
  }

  // Get current language if not provided
  const currentLanguage = language || getLanguage()
  const t = getTranslations(currentLanguage)

  // Get current update state
  const { getUpdateInfo, installUpdate, checkForUpdates } = await import('./auto-update')
  const updateInfo = getUpdateInfo()
  const updateReady = updateInfo.available && updateInfo.downloadState === 'ready'

  // Build the update menu item based on state
  const updateMenuItem: Electron.MenuItemConstructorOptions = updateReady
    ? {
        label: `${t.installUpdate}\t【${updateInfo.latestVersion}】`,
        click: async () => {
          await installUpdate()
        }
      }
    : {
        label: t.checkForUpdates,
        click: async () => {
          await checkForUpdates({ autoDownload: true })
        }
      }

  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac ? [{
      label: t.appName,
      submenu: [
        { role: 'about' as const, label: t.about },
        updateMenuItem,
        { type: 'separator' as const },
        {
          label: t.settings,
          accelerator: 'CmdOrCtrl+,',
          click: () => sendToRenderer(IPC_CHANNELS.MENU_OPEN_SETTINGS)
        },
        { type: 'separator' as const },
        { role: 'hide' as const, label: t.hide },
        { role: 'hideOthers' as const, label: t.hideOthers },
        { role: 'unhide' as const, label: t.unhide },
        { type: 'separator' as const },
        { role: 'quit' as const, label: t.quit }
      ]
    }] : []),

    // File menu
    {
      label: t.file,
      submenu: [
        {
          label: t.newChat,
          accelerator: 'CmdOrCtrl+N',
          click: () => sendToRenderer(IPC_CHANNELS.MENU_NEW_CHAT)
        },
        {
          label: t.newWindow,
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            const focused = BrowserWindow.getFocusedWindow()
            if (focused) {
              const workspaceId = windowManager.getWorkspaceForWindow(focused.webContents.id)
              if (workspaceId) {
                windowManager.createWindow({ workspaceId })
              }
            }
          }
        },
        { type: 'separator' as const },
        isMac ? { role: 'close' as const, label: t.close } : { role: 'quit' as const, label: t.quit }
      ]
    },

    // Edit menu (standard roles for text editing)
    {
      label: t.edit,
      submenu: [
        { role: 'undo' as const, label: t.undo },
        { role: 'redo' as const, label: t.redo },
        { type: 'separator' as const },
        { role: 'cut' as const, label: t.cut },
        { role: 'copy' as const, label: t.copy },
        { role: 'paste' as const, label: t.paste },
        { role: 'selectAll' as const, label: t.selectAll }
      ]
    },

    // View menu
    {
      label: t.view,
      submenu: [
        { role: 'zoomIn' as const, label: t.zoomIn },
        { role: 'zoomOut' as const, label: t.zoomOut },
        { role: 'resetZoom' as const, label: t.resetZoom },
        // Dev tools only in development
        ...(!app.isPackaged ? [
          { type: 'separator' as const },
          { role: 'reload' as const, label: t.reload },
          { role: 'forceReload' as const, label: t.forceReload },
          { type: 'separator' as const },
          { role: 'toggleDevTools' as const, label: t.toggleDevTools }
        ] : [])
      ]
    },

    // Window menu
    {
      label: t.window,
      submenu: [
        { role: 'minimize' as const, label: t.minimize },
        { role: 'zoom' as const, label: t.zoom },
        ...(isMac ? [
          { type: 'separator' as const },
          { role: 'front' as const, label: t.front }
        ] : [])
      ]
    },

    // Debug menu (development only)
    ...(!app.isPackaged ? [{
      label: t.debug,
      submenu: [
        {
          label: t.checkForUpdates,
          click: async () => {
            const { checkForUpdates } = await import('./auto-update')
            const info = await checkForUpdates({ autoDownload: true })
            mainLog.info('[debug-menu] Update check result:', info)
          }
        },
        {
          label: t.installUpdate,
          click: async () => {
            const { installUpdate } = await import('./auto-update')
            try {
              await installUpdate()
            } catch (err) {
              mainLog.error('[debug-menu] Install failed:', err)
            }
          }
        },
        { type: 'separator' as const },
        {
          label: t.resetDefaults,
          click: async () => {
            const { dialog } = await import('electron')
            await dialog.showMessageBox({
              type: 'info',
              message: t.resetMessage,
              detail: t.resetDetail,
              buttons: [t.ok]
            })
          }
        }
      ]
    }] : []),

    // Help menu
    {
      label: t.help,
      submenu: [
        {
          label: t.helpDocumentation,
          click: () => shell.openExternal('https://agents.craft.do/docs')
        },
        {
          label: t.keyboardShortcuts,
          accelerator: 'CmdOrCtrl+/',
          click: () => sendToRenderer(IPC_CHANNELS.MENU_KEYBOARD_SHORTCUTS)
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

/**
 * Sends an IPC message to the focused renderer window.
 */
function sendToRenderer(channel: string): void {
  const win = BrowserWindow.getFocusedWindow()
  if (win && !win.isDestroyed() && !win.webContents.isDestroyed()) {
    win.webContents.send(channel)
  }
}

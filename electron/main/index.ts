/**
 * Electron Main Process Entry Point
 *
 * Creates the BrowserWindow and registers IPC handlers that bridge
 * the existing Node.js audit engine to the React renderer.
 */

import { app, BrowserWindow, Menu, nativeImage, shell } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import { existsSync } from 'fs';
import { join } from 'path';
import { registerAuditHandlers } from './audit-bridge.js';
import { registerDbHandlers } from './db-bridge.js';
import { BRAND_NAME } from '@core/design/brand.js';

let mainWindow: BrowserWindow | null = null;

app.setName(BRAND_NAME);
if (process.platform === 'win32') app.setAppUserModelId('ru.sitemetr.desktop');

/** The application menu in Russian; Electron's default one is English-only */
function buildMenu(): Menu {
  const isMac = process.platform === 'darwin';
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [{
          label: BRAND_NAME,
          submenu: [
            { role: 'about', label: `О программе ${BRAND_NAME}` },
            { type: 'separator' },
            { role: 'hide', label: `Скрыть ${BRAND_NAME}` },
            { role: 'hideOthers', label: 'Скрыть остальные' },
            { role: 'unhide', label: 'Показать все' },
            { type: 'separator' },
            { role: 'quit', label: `Выйти из ${BRAND_NAME}` },
          ],
        } satisfies MenuItemConstructorOptions]
      : []),
    {
      label: 'Файл',
      submenu: [isMac ? { role: 'close', label: 'Закрыть окно' } : { role: 'quit', label: 'Выход' }],
    },
    {
      label: 'Правка',
      submenu: [
        { role: 'undo', label: 'Отменить' },
        { role: 'redo', label: 'Повторить' },
        { type: 'separator' },
        { role: 'cut', label: 'Вырезать' },
        { role: 'copy', label: 'Копировать' },
        { role: 'paste', label: 'Вставить' },
        { role: 'selectAll', label: 'Выделить всё' },
      ],
    },
    {
      label: 'Вид',
      submenu: [
        { role: 'reload', label: 'Обновить' },
        { role: 'toggleDevTools', label: 'Инструменты разработчика' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Обычный масштаб' },
        { role: 'zoomIn', label: 'Увеличить' },
        { role: 'zoomOut', label: 'Уменьшить' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Во весь экран' },
      ],
    },
    {
      label: 'Окно',
      submenu: [
        { role: 'minimize', label: 'Свернуть' },
        ...(isMac ? [{ role: 'zoom', label: 'Масштабировать' } as MenuItemConstructorOptions] : []),
        { role: 'close', label: 'Закрыть' },
      ],
    },
    {
      role: 'help',
      label: 'Справка',
      submenu: [
        {
          label: 'Сайтметр на GitHub',
          click: () => void shell.openExternal('https://github.com/Quroroyr/sitemetr-seo'),
        },
      ],
    },
  ];
  return Menu.buildFromTemplate(template);
}

/**
 * The brand icon, for development runs only.
 *
 * A packaged build takes its icon from the app bundle that electron-builder
 * stamps from `electron/resources/icon.png`, and `electron/**` is excluded
 * from the shipped files — so this path exists only when running from source.
 * Without it `npm run electron:dev` shows the default Electron atom.
 */
function devBrandIcon(): Electron.NativeImage | undefined {
  const iconPath = join(__dirname, '../../electron/resources/icon.png');
  if (!existsSync(iconPath)) return undefined;
  const image = nativeImage.createFromPath(iconPath);
  return image.isEmpty() ? undefined : image;
}

function createWindow(): void {
  const devIcon = devBrandIcon();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: BRAND_NAME,
    // Windows and Linux read the window icon at runtime; macOS uses the bundle.
    ...(devIcon && { icon: devIcon }),
    titleBarStyle: 'hiddenInset',
    // Centres the 12px lights in the 52px toolbar: 52/2 - 12/2 = 20.
    trafficLightPosition: { x: 16, y: 20 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // Required for better-sqlite3 in preload chain
    },
  });

  // In dev, load the Vite dev server; in production, load the built files
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register IPC handlers before window creation
app.whenReady().then(() => {
  // macOS shows the Dock icon from the bundle once packaged; in a source run
  // there is no bundle, so set it explicitly.
  const devIcon = devBrandIcon();
  if (devIcon && app.dock) app.dock.setIcon(devIcon);
  Menu.setApplicationMenu(buildMenu());

  registerAuditHandlers(() => mainWindow);
  registerDbHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

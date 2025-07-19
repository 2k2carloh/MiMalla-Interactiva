const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

const configPath = path.join(app.getPath('userData'), 'config.json');

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    // autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();
});

ipcMain.handle('guardar-archivo', async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Guardar Configuración',
    defaultPath: 'config.json',
    filters: [{ name: 'Archivos JSON', extensions: ['json'] }]
  });

  if (!canceled && filePath) {
    fs.writeFileSync(filePath, data);
  }

  if (mainWindow) {
    setTimeout(() => mainWindow.focus(), 100);
  }
});

ipcMain.handle('leer-archivo', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Importar Configuración',
    filters: [{ name: 'Archivos JSON', extensions: ['json'] }],
    properties: ['openFile']
  });

  if (!canceled && filePaths && filePaths.length > 0) {
    try {
      const contenido = fs.readFileSync(filePaths[0], 'utf-8');
      return contenido;
    } catch {
      return null;
    }
  } else {
    return null;
  }
});

ipcMain.handle('guardar-config', async (event, data) => {
  try {
    fs.writeFileSync(configPath, data, 'utf-8');
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error.message };
  }
});

ipcMain.handle('cargar-config', async () => {
  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    return { ok: true, data };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { ok: true, data: null };
    }
    return { ok: false, error: error.message };
  }
});

const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Srikiran',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Load built files
  win.loadFile(path.join(__dirname, 'dist/index.html'))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

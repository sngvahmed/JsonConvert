const { app, BrowserWindow } = require('electron')

let win
function createWindow() {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		}
	})

	win.loadFile('index.html');
	win.webContents.openDevTools();
	win.on('closed', () => { win = null });
	win.$ = win.jQuery = require('jquery');
	
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (win === null) {
		createWindow()
	}
})
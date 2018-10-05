// main.js
const { app,
	BrowserWindow,
	Notification
} = require('electron');
const ipc = require('electron').ipcMain;
const ipcManager = require('./backend/ipc');
const sqlite = require('./backend/sqlite');

let mainWindow = null
let willQuit = false

//sqlite Initialize
sqlite.connect().then(function(result) {
	ipcManager.start(ipc);
	console.log('res', result);
});


function createWindow () {
	mainWindow = new BrowserWindow({
		width: 1024,
    	height: 768,
    	fullscreenable: false,
    	resizable: true,
    	frame: true,
    	transparent: false
	})
	/* mainWindow.setMenu(null);*/
	mainWindow.setAlwaysOnTop(false);
	mainWindow.loadURL('file://' + __dirname + '/login.html');

	/*let ses = mainWindow.webContents.session;

	console.log(ses.getUserAgent());*/
}

// 모든창이 닫혔을때의 이벤트
app.on('window-all-closed', function() {
	// 맥의경우 창이 안닫힘
	if (process.platform != 'darwin') {
		app.quit();
	}
});

app.on('ready', () => {
	createWindow()

	mainWindow.on('close', (e) => {
		if (willQuit) {
			mainWindow = null
		}
		else {
			e.preventDefault()
			mainWindow.hide()
		}
	})
})

app.on('activate', () => mainWindow.show())
app.on('before-quit', () => willQuit = true)

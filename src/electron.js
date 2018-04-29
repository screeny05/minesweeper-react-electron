// Basic init
const electron = require('electron')
const {app, BrowserWindow} = electron
const path = require('path');
const url = require('url');

let mainWindow;

const onIpc = (e, fn) => {
    electron.ipcMain.on(e, (...arguments) => {
        if(!mainWindow){
            return;
        }
        fn(mainWindow, ...arguments);
    });
};

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        show: false,
        transparent: true,
        resizable: false,
    });

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true
    });

    mainWindow.loadURL(startUrl);
    //mainWindow.webContents.openDevTools();

});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit();
});

onIpc('set-size', (window, e, width, height) => {
    window.setSize(width, height);
});

onIpc('frame-mount', (window, e) => {
    window.show();
    window.on('focus', () => e.sender.send('window-focus'));
    window.on('blur', () => e.sender.send('window-blur'));
    if(window.isFocused()){
        e.sender.send('window-focus');
    } else {
        e.sender.send('window-blur');
    }
});
onIpc('minimize', window => window.minimize());
onIpc('maximize', window => window.maximize());
onIpc('close', window => window.close());

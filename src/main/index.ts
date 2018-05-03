import { app, BrowserWindow, ipcMain } from 'electron';
import { join as pathJoin } from 'path';
import { format as urlFormat, URL } from 'url';
import { IpcCreateParams } from '../render/ipc-create-params';

class BrowserWindowWrapper {
    window: BrowserWindow;

    constructor(url: string, opt: Electron.BrowserWindowConstructorOptions){
        if(app.isReady()){
            this.init(url, opt);
        } else {
            app.once('ready', () => this.init(url, opt));
        }
    }

    init(url: string, opt: Electron.BrowserWindowConstructorOptions): void {
        this.window = new BrowserWindow(opt);
        this.subscribeEvents();
        this.window.webContents.openDevTools();
        this.window.loadURL(url);
    }

    subscribeEvents(): void {
        this.window.on('focus', this.handleWindowFocusToggle.bind(this, true));
        this.window.on('blur', this.handleWindowFocusToggle.bind(this, false));
        this.on('frame-mount', this.handleFrameMount.bind(this));
        this.on('set-size', this.handleWindowCommand.bind(this, 'setSize'));
        this.on('minimize', this.handleWindowCommand.bind(this, 'minimize'));
        this.on('maximize', this.handleWindowCommand.bind(this, 'maximize'));
        this.on('close', this.handleWindowCommand.bind(this, 'close'));
    }

    on(channel: string, cb: (e: Electron.Event, ...args: any[]) => void): void {
        ipcMain.on(channel, (e: Electron.Event, ...args: any[]) => {
            if(!this.window || this.window.webContents !== e.sender){
                return;
            }
            cb(e, ...args);
        });
    }

    send(channel: string, ...data: any[]): void {
        this.window.webContents.send(channel, ...data);
    }

    handleFrameMount(e: Electron.Event){
        this.window.show();
        this.handleWindowFocusToggle(this.window.isFocused());
    }

    handleWindowFocusToggle(isFocused: boolean){
        this.send(isFocused ? 'window-focus' : 'window-blur');
    }

    handleWindowCommand(command: string, e: Electron.Event, ...args: any[]){
        this.window[command](...args);
    }
}

const windows: BrowserWindowWrapper[] = [];

const addWindow = (params: IpcCreateParams) => {
    windows.push(new BrowserWindowWrapper(getStartUrl(params.hash), params.windowParams));
};

const getStartUrl = (hash: string) => {
    if(process.env.ELECTRON_START_URL){
        const url = new URL(process.env.ELECTRON_START_URL);
        url.hash = hash;
        return url.toString();
    }

    return urlFormat({
        pathname: pathJoin(__dirname, '../dist/index.html'),
        protocol: 'file:',
        slashes: true
    }) + hash;
}

ipcMain.on('create-window', (e: Electron.Event, params: IpcCreateParams) => {
    addWindow(params);
});

// startup window
addWindow({
    hash: 'main',
    windowParams: {
        width: 800,
        height: 600,
        //frame: false,
        //show: false,
        //transparent: true,
        //resizable: false,
    }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());

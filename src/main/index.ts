import { app, BrowserWindow, ipcMain } from 'electron';
import { join as pathJoin } from 'path';
import { format as urlFormat, URL } from 'url';

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
        this.on('set-opts', this.handleSetOpts.bind(this));
        this.on('set-size', this.handleWindowCommand.bind(this, 'setSize'));
        this.on('minimize', this.handleWindowCommand.bind(this, 'minimize'));
        this.on('maximize', this.handleWindowCommand.bind(this, 'maximize'));
        this.on('close', this.handleWindowCommand.bind(this, 'close'));
    }

    on(channel: string, cb: (e: Electron.Event, ...args: any[]) => void): void {
        ipcMain.on(channel, (e: Electron.Event, ...args: any[]) => {
            if(!this.window || this.window.isDestroyed() || this.window.webContents !== e.sender){
                return;
            }
            cb(e, ...args);
        });
    }

    send(channel: string, ...data: any[]): void {
        if(this.window.isDestroyed()){
            return;
        }
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

    handleSetOpts(e: Electron.Event, opts: Electron.BrowserWindowConstructorOptions){
        if(typeof opts.resizable !== 'undefined'){
            this.window.setResizable(opts.resizable);
        }
        if(typeof opts.width !== 'undefined' && typeof opts.height !== 'undefined'){
            this.window.setSize(opts.width, opts.height);
        }
        if(typeof opts.closable !== 'undefined'){
            this.window.setClosable(opts.closable);
        }
        if(typeof opts.minimizable !== 'undefined'){
            this.window.setMinimizable(opts.minimizable);
        }
        if(typeof opts.maximizable !== 'undefined'){
            this.window.setMaximizable(opts.maximizable);
        }
    }
}

const windows: BrowserWindowWrapper[] = [];

const addWindow = (hash: string, params: Electron.BrowserWindowConstructorOptions) => {
    windows.push(new BrowserWindowWrapper(getStartUrl(hash), {
        transparent: true,
        frame: false,
        show: false,
        ...params
    }));
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

ipcMain.on('create-window', (e: Electron.Event, hash: string, params: Electron.BrowserWindowConstructorOptions) => {
    addWindow(hash, params);
});

// startup window
addWindow('main', {
    resizable: false
});

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());

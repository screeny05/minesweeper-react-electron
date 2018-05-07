import { app, BrowserWindow, ipcMain } from 'electron';
import { join as pathJoin } from 'path';
import { format as urlFormat, URL } from 'url';
import { type as getOsType } from 'os';

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
        this.window.loadURL(url);
    }

    subscribeEvents(): void {
        this.on('close', () => this.sendParent('closed'));
        this.on('frame-mount', this.handleFrameMount.bind(this));
        this.on('set-opts', this.handleSetOpts.bind(this));
        this.on('set-size', this.handleWindowCommand.bind(this, 'setSize'));
        this.on('minimize', this.handleWindowCommand.bind(this, 'minimize'));
        this.on('maximize', this.handleWindowCommand.bind(this, 'maximize'));
        this.on('close', this.handleWindowCommand.bind(this, 'close'));
        this.on('send-parent', this.handleSendParent.bind(this));
    }

    on(channel: string, cb: (e: Electron.Event, ...args: any[]) => void): void {
        ipcMain.on(channel, (e: Electron.Event, ...args: any[]) => {
            if(!this.window || this.window.isDestroyed() || this.window.webContents !== e.sender){
                return;
            }
            cb(e, ...args);
        });
    }

    send(channel: string, ...args: any[]): void {
        if(this.window.isDestroyed()){
            return;
        }
        this.window.webContents.send(channel, ...args);
    }

    sendParent(channel: string, ...args: any[]): void {
        if(this.window.isDestroyed()){
            return;
        }
        const parent = this.window.getParentWindow();
        if(!parent || parent.isDestroyed()){
            return;
        }

        parent.webContents.send(`from-child-${this.window.id}`, channel, args);
    }

    handleFrameMount(e: Electron.Event){
        this.window.show();
        this.send('initial-focus', this.window.isFocused());
    }

    handleWindowCommand(command: string, e: Electron.Event, ...args: any[]){
        this.window[command](...args);
    }

    handleSetOpts(e: Electron.Event, opts: Electron.BrowserWindowConstructorOptions){
        if(!opts){
            return;
        }
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

    handleSendParent(e: Electron.Event, channel: string, ...args: any[]){
        this.sendParent(channel, ...args);
    }
}

const windows: BrowserWindowWrapper[] = [];

const addWindow = (hash: string, params: Electron.BrowserWindowConstructorOptions, props: any = {}) => {
    const window = new BrowserWindowWrapper(getStartUrl(hash), {
        transparent: true,
        frame: false,
        ...params
    });
    windows.push(window);

    // send props to window
    window.on('get-forwarded-props', (e) => {
        e.returnValue = props;
    });

    return window;
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
    }) + '#' + hash;
}

ipcMain.on('create-window', (e: Electron.Event, hash: string, params: Electron.BrowserWindowConstructorOptions, props: any) => {
    const window = addWindow(hash, {
        parent: windows[0].window,
        modal: true,
        ...params
    }, props);

    // on macOS we move the dialog box, so it won't display somewhere random
    if(getOsType() === 'Darwin'){
        const parentPos = windows[0].window.getPosition();
        window.window.setPosition(parentPos[0], parentPos[1] + 24);
    }

    // send new window id back to parent
    e.sender.send('create-window-result', window.window.id);
});

// startup window
addWindow('main', {
    resizable: false
});

// Quit when all windows are closed.
app.on('window-all-closed', () => app.quit());

const electron = window.require('electron');

const ipcRenderer: Electron.IpcRenderer = electron.ipcRenderer;
const shell: Electron.Shell = electron.shell;

export class IpcBridge {
    static send(channel: string, ...args: any[]): void {
        ipcRenderer.send(channel, ...args);
    }

    static on(channel: string, cb: (e: Electron.Event, ...args: any[]) => void): void {
        ipcRenderer.on(channel, cb);
    }

    static off(channel: string, cb?: Function): void {
        if(cb){
            return void ipcRenderer.removeListener(channel, cb);
        }
        ipcRenderer.removeAllListeners(channel);
    }

    static minimize(): void {
        IpcBridge.send('minimize');
    }

    static maximize(): void {
        IpcBridge.send('maximize');
    }

    static close(): void {
        IpcBridge.send('close');
    }

    static setSize(width: number, height: number): void {
        IpcBridge.send('set-size', width, height);
    }

    static createWindow(hash: string, params: Electron.BrowserWindowConstructorOptions){
        IpcBridge.send('create-window', hash, params);
    }

    static setOpts(params: Electron.BrowserWindowConstructorOptions){
        IpcBridge.send('set-opts', params);
    }

    static open(path: string){
        shell.openExternal(path);
    }
}

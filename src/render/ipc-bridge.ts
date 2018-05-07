const electron = window.require('electron');

const ipcRenderer: Electron.IpcRenderer = electron.ipcRenderer;
const shell: Electron.Shell = electron.shell;

export class IpcBridge {
    static send(channel: string, ...args: any[]): void {
        ipcRenderer.send(channel, ...args);
    }

    static sendSync(channel: string, ...args: any[]): any {
        return ipcRenderer.sendSync(channel, ...args);
    }

    static sendParent(channel: string, ...args: any[]){
        IpcBridge.send('send-parent', channel, ...args);
    }

    static on(channel: string, cb: (e: Electron.Event, ...args: any[]) => void): void {
        ipcRenderer.on(channel, cb);
    }

    static once(channel: string, cb: (e: Electron.Event, ...args: any[]) => void): void {
        ipcRenderer.once(channel, cb);
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

    static async createWindow(hash: string, params: Electron.BrowserWindowConstructorOptions = {}, props: any = {}): Promise<number> {
        return new Promise<number>(resolve => {
            IpcBridge.send('create-window', hash, params, props);
            IpcBridge.once('create-window-result', (e, id) => resolve(id));
        });
    }

    static setOpts(params: Electron.BrowserWindowConstructorOptions){
        IpcBridge.send('set-opts', params);
    }

    static open(path: string){
        shell.openExternal(path);
    }

    static getForwardedProps<T = any>(): T {
        return IpcBridge.sendSync('get-forwarded-props');
    }
}

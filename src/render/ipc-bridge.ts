import { IpcCreateParams } from "./ipc-create-params";

const ipcRenderer: Electron.IpcRenderer = window.require('electron').ipcRenderer;

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

    static createWindow(params: IpcCreateParams){
        IpcBridge.send('create-window', params);
    }
}

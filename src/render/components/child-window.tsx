import * as React from 'react';
import { IpcBridge } from '../ipc-bridge';
import { bind } from 'bind-decorator';

interface IChildWindowProps {
    hash: string;
    forwardProps?: any;
    on?: (channel: string, ...args: any[]) => void;
    onClose?: () => void;
    onSubmit?: (...args: any[]) => void;
}

interface IChildWindowState {
    isOpen: boolean;
    id?: number;
}

export class ChildWindow extends React.Component<IChildWindowProps, IChildWindowState> {
    state: IChildWindowState = {
        isOpen: false
    }

    shouldComponentUpdate(){
        return false;
    }

    async componentDidMount(){
        const id = await IpcBridge.createWindow(this.props.hash, {}, this.props.forwardProps);
        IpcBridge.on(`from-child-${id}`, this.handleMessage);
        this.setState({
            id,
            isOpen: true
        });
    }

    render(){
        return null;
    }

    @bind
    handleMessage(e: Electron.Event, channel: string, args: any[]){
        if(channel === 'closed' && this.props.onClose){
            this.setState({
                isOpen: false
            });
            return this.props.onClose();
        }
        if(channel === 'submit' && this.props.onSubmit){
            return this.props.onSubmit(...args);
        }

        if(!this.props.on){
            return;
        }
        this.props.on(channel, ...args);
    }
}

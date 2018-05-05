import * as React from "react";
import { WindowFrameProps, IWindowFrameState } from "./window-frame";
import { IpcBridge } from "../../ipc-bridge";

interface IChildWindowProps extends WindowFrameProps {
    hash: string;
}

export class ChildWindow extends React.Component<IChildWindowProps, IWindowFrameState> {
    static defaultProps: Partial<WindowFrameProps> = {
        resizable: true,
        width: 800,
        height: 600,
        closable: true,
        minimizable: true,
        maximizable: true
    };

    constructor(props: IChildWindowProps){
        super(props);
    }

    componentDidMount(){
        IpcBridge.createWindow({
            hash: this.props.hash,
            windowParams: this.props
        });
    }

    componentWillUnmount(){
        IpcBridge.close();
    }

    render(){
        return null;
    }
}

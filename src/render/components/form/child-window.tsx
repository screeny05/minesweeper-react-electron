import * as React from "react";
import { WindowFrameProps, WindowFrameState } from "./window-frame";
import { IpcBridge } from "../../ipc-bridge";

interface ChildWindowProps extends WindowFrameProps {
    hash: string;
}

export class ChildWindow extends React.Component<ChildWindowProps, WindowFrameState> {
    static defaultProps: Partial<WindowFrameProps> = {
        resizable: true,
        width: 800,
        height: 600,
        closable: true,
        minimizable: true,
        maximizable: true
    };

    constructor(props: ChildWindowProps){
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

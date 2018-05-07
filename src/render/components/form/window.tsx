import * as React from 'react';
import { ThemeProvider, ColorScheme, injectGlobal } from './theme-interface';

import { IpcBridge } from '../../ipc-bridge';
import { Panel } from './panel';
import { Titlebar } from './titlebar';
import { bind } from 'bind-decorator';

injectGlobal`
    html,
    body {
        margin: 0;
        padding: 0;
    }

    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }
`;

export interface IWindowProps {
    resizable?: boolean;
    width?: number;
    height?: number;
    closable?: boolean;
    minimizable?: boolean;
    maximizable?: boolean;
    shrinkSizeToContent?: boolean;
    title: string;
    icon?: string;
}

export interface IWindowState {
    isFocused: boolean;
}

export class Window extends React.Component<IWindowProps, IWindowState> {
    static defaultProps: Partial<IWindowProps> = {
        width: 800,
        height: 600,
        resizable: true,
        closable: true,
        maximizable: true,
        minimizable: true,
        shrinkSizeToContent: false
    };

    frameRef: any;

    constructor(props: IWindowProps){
        super(props);
        this.frameRef = React.createRef();
        this.state = {
            isFocused: false
        };

        this.componentWillReceiveProps();
    }

    componentDidMount(){
        this.setWindowSizeToContent();
        window.addEventListener('focus', this.onWindowFocus);
        window.addEventListener('blur', this.onWindowBlur);
        IpcBridge.once('initial-focus', (e, isFocused: boolean) => this.setState({ isFocused }));
        IpcBridge.send('frame-mount');
    }

    componentWillUnmount(){
        window.removeEventListener('focus', this.onWindowFocus);
        window.removeEventListener('blur', this.onWindowBlur);
    }

    componentWillReceiveProps(){
        document.title = this.props.title;

        IpcBridge.setOpts({
            width: this.props.width,
            height: this.props.height,
            resizable: this.props.resizable,
            closable: this.props.closable,
            maximizable: this.props.maximizable,
            minimizable: this.props.minimizable
        });
    }

    render(){
        let extendedChildren = this.props.children;
        if(this.props.shrinkSizeToContent){
            extendedChildren = React.Children.map<React.ReactNode>(this.props.children, child => React.cloneElement(child as any, {
                onResize: this.setWindowSizeToContent
            }));
        }

        return (
            <ThemeProvider theme={ColorScheme}>
                <div
                    style={{
                        padding: 2,
                        display: this.props.shrinkSizeToContent ? 'inline-block' : 'block',
                        height: this.props.shrinkSizeToContent ? undefined : '100%'
                    }}
                    ref={this.frameRef}
                >
                    <Panel
                        hasBorder
                        borderSize={2}
                        padding={2}
                        background={ColorScheme.Window}
                        isBlock={!this.props.shrinkSizeToContent}
                        style={{
                            height: this.props.shrinkSizeToContent ? undefined : '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Titlebar
                            title={this.props.title}
                            icon={this.props.icon}
                            maximizeEnabled={this.props.maximizable}
                            minimizeEnabled={this.props.minimizable}
                            closeEnabled={this.props.closable}
                            onMinimizeClick={IpcBridge.minimize}
                            onMaximizeClick={IpcBridge.maximize}
                            onCloseClick={IpcBridge.close}
                            onDoubleClick={this.props.maximizable ? IpcBridge.maximize : undefined}
                            onDoubleClickIcon={IpcBridge.close}
                            isFocused={this.state.isFocused}
                        />
                        <div
                            style={{
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {extendedChildren}
                        </div>
                    </Panel>
                </div>
            </ThemeProvider>
        );
    }

    @bind
    setWindowSizeToContent(){
        if(!this.props.shrinkSizeToContent){
            return;
        }
        IpcBridge.setSize(this.frameRef.current.offsetWidth, this.frameRef.current.offsetHeight);
    }

    @bind
    onWindowFocus(){
        this.setState({
            isFocused: true
        });
    }

    @bind
    onWindowBlur(){
        this.setState({
            isFocused: false
        });
    }
}

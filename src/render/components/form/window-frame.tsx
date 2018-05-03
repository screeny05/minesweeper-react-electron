import * as React from 'react';
import { injectGlobal } from 'styled-components';
import { themeRedmond } from './theme-redmond';
import { ThemeProvider } from './theme-interface';

import { IpcBridge } from '../../ipc-bridge';
import { Panel } from '../panel';
import { WindowTitlebar } from './titlebar';
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

export interface WindowFrameProps {
    resizable?: boolean;
    width?: number;
    height?: number;
    closable?: boolean;
    minimizable?: boolean;
    maximizable?: boolean;
    shrinkSizeToContent?: boolean;
}

export interface WindowFrameState {
    isFocused: boolean;
}

export class WindowFrame extends React.Component<WindowFrameProps, WindowFrameState> {
    static defaultProps: Partial<WindowFrameProps> = {
        resizable: true,
        width: 800,
        height: 600,
        closable: true,
        minimizable: true,
        maximizable: true,
        shrinkSizeToContent: false,
    };

    frameRef: any;

    constructor(props: WindowFrameProps){
        super(props);
        this.frameRef = React.createRef();
        this.state = {
            isFocused: false
        };
    }

    componentDidMount(){
        this.setWindowSizeToContent();
        IpcBridge.send('frame-mount');
        IpcBridge.on('window-focus', this.onWindowFocus);
        IpcBridge.on('window-blur', this.onWindowBlur);
    }

    componentWillUnmount(){
        IpcBridge.off('window-focus', this.onWindowFocus);
        IpcBridge.off('window-blur', this.onWindowBlur);
    }

    render(){
        return (
            <ThemeProvider theme={themeRedmond}>
                <div
                    style={{
                        padding: 2,
                        display: this.props.shrinkSizeToContent ? 'inline-block' : 'block',
                        fontFamily: 'tahoma'
                    }}
                    ref={this.frameRef}
                >
                    <Panel hasBorder borderSize={2} padding={2} background={'#d4d0c9'}>
                        <WindowTitlebar
                            title='Minesweeper'
                            maximizeEnabled={false}
                            onMinimizeClick={IpcBridge.minimize}
                            onMaximizeClick={IpcBridge.maximize}
                            onCloseClick={IpcBridge.close}
                            isFocused={this.state.isFocused}
                        />
                        {this.props.children}
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

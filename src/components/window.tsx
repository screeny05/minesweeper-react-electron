import * as React from 'react';
import { Game, GameLogic } from './game';
import { Panel } from './panel';
import { WindowsButton } from './cell';
import styled, { injectGlobal } from 'styled-components';
const { ipcRenderer } = window.require('electron');
//window.require('devtron').install();

import tahoma from '../assets/fonts/tahoma.woff2';
import pressstart2p from '../assets/fonts/pressstart2p.woff2';
import windowMinimize from '../assets/images/window-minimize.png';
import windowMaximize from '../assets/images/window-maximize.png';
import windowClose from '../assets/images/window-close.png';
import { bind } from 'bind-decorator';

injectGlobal`
    @font-face {
        font-family: 'tahoma';
        src: url('${tahoma}') format('woff2');
    }

    @font-face {
        font-family: 'pressstart2p';
        src: url('${pressstart2p}') format('woff2');
    }
`;

interface WindowState {
    game: GameLogic;
    titlebarVisible: boolean;
    isFocused: boolean;
}

interface WindowTitlebarContainerProps {
    isFocused: boolean;
}

const WindowTitlebarContainer = styled.div.attrs<WindowTitlebarContainerProps>({})`
    background: ${props => props.isFocused ? 'linear-gradient(to right, #0a2569, #a6caf0)' : 'linear-gradient(to right, #808080, #c7c7c7)'};
    color: #fff;
    font-family: 'tahoma';
    font-size: 11px;
    height: 18px;
    line-height: 14px;
    padding: 2px;
    -webkit-app-region: drag;
    user-select: none;
    display: flex;
`;

const WindowTitlebarTitle = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
`;

interface WindowTitlebarProps {
    title: string;
    isFocused?: boolean;
    maximizeEnabled?: boolean;
    minimizeEnabled?: boolean;
    closeEnabled?: boolean;
    onMinimizeClick?: () => void;
    onMaximizeClick?: () => void;
    onCloseClick?: () => void;
}

export class WindowTitlebar extends React.Component<WindowTitlebarProps, any> {
    render(){
        const minimizeEnabled = this.props.minimizeEnabled !== false;
        const maximizeEnabled = this.props.maximizeEnabled !== false;
        const closeEnabled = this.props.closeEnabled !== false;
        const isFocused = this.props.isFocused !== false;
        const hasSecondaryControls = minimizeEnabled || maximizeEnabled;

        return (
            <WindowTitlebarContainer isFocused={isFocused}>
                <WindowTitlebarTitle style={{ marginRight: 'auto' }}>
                    {this.props.title}
                </WindowTitlebarTitle>
                {hasSecondaryControls ? (
                    <React.Fragment>
                        <WindowsButton style={{ width: 16, height: 14 }} disabled={!minimizeEnabled} clickable={minimizeEnabled} onClick={this.onMinimizeClick}>
                            <img src={windowMinimize} style={{ imageRendering: 'pixelated', width: 9, height: 9 }}/>
                        </WindowsButton>
                        <WindowsButton style={{ width: 16, height: 14 }} disabled={!maximizeEnabled} clickable={maximizeEnabled} onClick={this.onMaximizeClick}>
                            <img src={windowMaximize} style={{ imageRendering: 'pixelated', width: 9, height: 9 }}/>
                        </WindowsButton>
                    </React.Fragment>
                ) : null}
                <WindowsButton style={{ width: 16, height: 14, marginLeft: 2 }} disabled={!closeEnabled} clickable={closeEnabled} onClick={this.onCloseClick}>
                    <img src={windowClose} style={{ imageRendering: 'pixelated', width: 9, height: 9 }}/>
                </WindowsButton>
            </WindowTitlebarContainer>
        );
    }

    @bind
    onMinimizeClick(){
        if(this.props.onMinimizeClick){
            this.props.onMinimizeClick();
        }
    }

    @bind
    onMaximizeClick(){
        if(this.props.onMaximizeClick){
            this.props.onMaximizeClick();
        }
    }

    @bind
    onCloseClick(){
        if(this.props.onCloseClick){
            this.props.onCloseClick();
        }
    }
}

export class Window extends React.Component<any, WindowState> {
    frameRef: any;

    constructor(props: any){
        super(props);
        this.frameRef = React.createRef();
        this.state = {
            game: new GameLogic(),
            titlebarVisible: true,
            isFocused: false
        };
    }

    componentDidMount(){
        this.setWindowSize();
        ipcRenderer.send('frame-mount');
        ipcRenderer.on('window-focus', this.onWindowFocus);
        ipcRenderer.on('window-blur', this.onWindowBlur);
    }

    componentWillUnmount(){
        ipcRenderer.removeListener('window-focus', this.onWindowFocus);
        ipcRenderer.removeListener('window-blur', this.onWindowBlur);
    }

    render(){
        return (
            <div style={{ padding: 2, display: 'inline-block', fontFamily: 'tahoma' }} ref={this.frameRef}>
                <Panel hasBorder borderSize={2} padding={2} background={'#d4d0c9'}>
                    <WindowTitlebar title='Minesweeper' maximizeEnabled={false} onMinimizeClick={this.onMinimizeClick} onMaximizeClick={this.onMaximizeClick} onCloseClick={this.onCloseClick} isFocused={this.state.isFocused}/>
                    <Game state={this.state.game} onResize={this.setWindowSize}/>
                </Panel>
            </div>
        );
    }

    @bind
    setWindowSize(){
        ipcRenderer.send('set-size', this.frameRef.current.offsetWidth, this.frameRef.current.offsetHeight);
    }

    @bind
    onMinimizeClick(){
        ipcRenderer.send('minimize');
    }

    @bind
    onMaximizeClick(){
        ipcRenderer.send('maximize');
    }

    @bind
    onCloseClick(){
        ipcRenderer.send('close');
    }

    @bind
    onWindowFocus(){
        this.setState({ isFocused: true });
    }

    @bind
    onWindowBlur(){
        this.setState({ isFocused: false });
    }
}

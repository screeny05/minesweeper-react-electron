import * as React from 'react';
import styled from './theme-interface';
import { WindowsButton } from '../cell';

import windowMinimize from '../../../assets/images/window-minimize.png';
import windowMaximize from '../../../assets/images/window-maximize.png';
import windowClose from '../../../assets/images/window-close.png';
import { bind } from 'bind-decorator';

interface WindowTitlebarContainerProps {
    isFocused: boolean;
}

const WindowTitlebarContainer = styled.div.attrs<WindowTitlebarContainerProps>({})`
    background: ${props => props.isFocused ? props.theme.titlebarGradientFocus : props.theme.titlebarGradientBlur};
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

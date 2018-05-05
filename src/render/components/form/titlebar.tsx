import * as React from 'react';
import styled from './theme-interface';
import { bind } from 'bind-decorator';
import { Button } from './button';

import imgWindowMinimize from '../../../assets/images/window-minimize.png';
import imgWindowMaximize from '../../../assets/images/window-maximize.png';
import imgWindowClose from '../../../assets/images/window-close.png';


interface ITitlebarBackgroundProps {
    isFocused: boolean;
}

const TitlebarBackground = styled.div.attrs<ITitlebarBackgroundProps>({})`
    background: ${props => props.isFocused ?
        `linear-gradient(to right, ${props.theme.ActiveCaption}, ${props.theme.GradientActiveCaption})` :
        `linear-gradient(to right, ${props.theme.InactiveCaption}, ${props.theme.GradientInactiveCaption})`
    };
    color: ${props => props.isFocused ? props.theme.ActiveCaptionText : props.theme.InactiveCaptionText};
    font-size: 11px;
    height: 18px;
    line-height: 14px;
    padding: 2px;
    -webkit-app-region: drag;
    user-select: none;
    display: flex;
`;

const TitlebarTitle = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
`;

const TitlebarIconContainer = styled.div`
    width: 16px;
    height: 16px;
    padding: 0 4px 0 1px;
    box-sizing: content-box;
    image-rendering: pixelated;

    & > img {
        max-width: 100%;
        max-height: 100%;
    }
`;

interface ITitlebarProps {
    title: string;
    icon?: string;
    isFocused?: boolean;
    maximizeEnabled?: boolean;
    minimizeEnabled?: boolean;
    closeEnabled?: boolean;
    onMinimizeClick?: () => void;
    onMaximizeClick?: () => void;
    onCloseClick?: () => void;
    onDoubleClick?: () => void;
    onDoubleClickIcon?: () => void;
}

export class Titlebar extends React.PureComponent<ITitlebarProps, any> {
    render(){
        const minimizeEnabled = this.props.minimizeEnabled !== false;
        const maximizeEnabled = this.props.maximizeEnabled !== false;
        const closeEnabled = this.props.closeEnabled !== false;
        const isFocused = this.props.isFocused !== false;
        const hasSecondaryControls = minimizeEnabled || maximizeEnabled;

        return (
            <TitlebarBackground isFocused={isFocused} onDoubleClick={this.onDoubleClick}>
                {this.props.icon ? (
                    <TitlebarIconContainer onDoubleClick={this.onDoubleClickIcon}>
                        <img src={this.props.icon}/>
                    </TitlebarIconContainer>
                ) : null}
                <TitlebarTitle style={{ marginRight: 'auto' }}>
                    {this.props.title}
                </TitlebarTitle>
                {hasSecondaryControls ? (<React.Fragment>
                    <Button style={{ width: 16, height: 14 }} disabled={!minimizeEnabled} clickable={minimizeEnabled} onClick={this.onMinimizeClick}>
                        <img src={imgWindowMinimize} style={{ imageRendering: 'pixelated', width: 9, height: 9 }}/>
                    </Button>
                    <Button style={{ width: 16, height: 14 }} disabled={!maximizeEnabled} clickable={maximizeEnabled} onClick={this.onMaximizeClick}>
                        <img src={imgWindowMaximize} style={{ imageRendering: 'pixelated', width: 9, height: 9 }}/>
                    </Button>
                </React.Fragment>) : null}
                <Button style={{ width: 16, height: 14, marginLeft: 2 }} disabled={!closeEnabled} clickable={closeEnabled} onClick={this.onCloseClick}>
                    <img src={imgWindowClose} style={{ imageRendering: 'pixelated', width: 9, height: 9 }}/>
                </Button>
            </TitlebarBackground>
        );
    }

    callbackGuard(fn?: Function){
        if(fn){
            fn();
        }
    }

    @bind
    onMinimizeClick(){
        this.callbackGuard(this.props.onMinimizeClick);
    }

    @bind
    onMaximizeClick(){
        this.callbackGuard(this.props.onMaximizeClick);
    }

    @bind
    onCloseClick(){
        this.callbackGuard(this.props.onCloseClick);
    }

    @bind
    onDoubleClick(){
        this.callbackGuard(this.props.onDoubleClick);
    }

    @bind
    onDoubleClickIcon(){
        this.callbackGuard(this.props.onDoubleClickIcon);
    }
}

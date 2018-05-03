import * as React from 'react';
import styled from 'styled-components';
import { bind } from 'bind-decorator';
import { Panel } from './panel';
const { ipcRenderer } = window.require('electron');

interface MenuStripProps {
    children: React.ReactElement<MenuStripItem>[];
}

export class MenuStrip extends React.Component<MenuStripProps, any> {
    render(){
        return (
            <div style={{ padding: '1px 0 2px 0' }}>
                {this.props.children}
            </div>
        );
    }
}

interface MenuStripItemContainerProps {
    isActive: boolean;
}

const MenuStripItemContainer = styled.div.attrs<MenuStripItemContainerProps>({})`
    user-select: none;
    background: transparent;
    border: none;
    padding: 4px 6px;
    line-height: 9px;
    position: relative;
    font-size: 11px;
    display: inline-block;
    cursor: default;

    &:focus {
        outline: none;
    }

    &:active {
        box-shadow:
            inset 1px 1px 0 0 #404040,
            inset -1px -1px 0 0 #fff;
    }

    ${props => props.isActive === true && `
        box-shadow:
            inset 1px 1px 0 0 #404040,
            inset -1px -1px 0 0 #fff;
    `}
`;

const MenuStripItemListContainer = styled.div`
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 0;
    margin-top: 1px;
    background: tomato;
`;

interface MenuStripItemProps {
    title: string;
}

interface MenuStripItemState {
    isOpen: boolean;
}

export class MenuStripItem extends React.Component<MenuStripItemProps, MenuStripItemState> {
    containerRef: any;

    constructor(props: MenuStripItemProps){
        super(props);

        this.containerRef = React.createRef();

        this.state = {
            isOpen: false
        };
    }

    componentDidMount(){
        document.addEventListener('mouseup', this.handleMouseupOutside, true);
        ipcRenderer.on('window-blur', this.onWindowBlur);
    }

    componentWillUnmount(){
        document.removeEventListener('mouseup', this.handleMouseupOutside);
        ipcRenderer.removeListener('window-blur', this.onWindowBlur);
    }

    render(){
        return (
            <MenuStripItemContainer onClick={this.handleClick} isActive={this.state.isOpen} innerRef={this.containerRef}>
                {this.props.title}
                {this.state.isOpen ? (
                    <MenuStripItemListContainer>
                        <Panel hasBorder background='#d4d0c9' style={{ padding: '0 1px' }}>
                            {this.props.children}
                        </Panel>
                    </MenuStripItemListContainer>
                ) : null}
            </MenuStripItemContainer>
        );
    }

    @bind
    handleClick(){
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    @bind
    handleMouseupOutside(e: MouseEvent){
        const button = this.containerRef.current;
        const target = e.target;

        if(!this.state.isOpen || button === target || button.contains(target)){
            return;
        }

        this.setState({
            isOpen: false
        });
    }

    @bind
    onWindowBlur(){
        this.setState({
            isOpen: false
        });
    }
}

const MenuStripSubItemContainer = styled.div`
    padding: 3px 16px;
    margin: 1px 0;
    line-height: 11px;
    text-align: left;

    &:hover {
        background: #000087;
        color: #fff;
    }
`;

interface MenuStripSubItemProps {
    title: string;
    onClick?: () => void;
}

export class MenuStripSubItem extends React.Component<MenuStripSubItemProps, any> {
    render(){
        return (
            <MenuStripSubItemContainer onClick={this.props.onClick}>
                {this.props.title}
            </MenuStripSubItemContainer>
        );
    }
}

export class MenuStripSubSeparator extends React.Component {
    render(){
        return (
            <div style={{ padding: '1px 2px' }}>
                <Panel hasBorder isBorderInset style={{ width: '100%' }}/>
            </div>
        );
    }
}

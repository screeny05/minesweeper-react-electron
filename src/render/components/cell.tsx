import { BoardLogic } from "./board";
import { computed, action, observable } from "mobx";
import * as React from 'react';
import styled, { injectGlobal } from "styled-components";
import { observer } from "mobx-react";
import bind from 'bind-decorator';
import { GameLogicState } from './game';
import imgFlag from '../../assets/images/flag.png';
import imgMine from '../../assets/images/mine.png';
import imgCross from '../../assets/images/cross.png';
import pressstart2p from '../../assets/fonts/pressstart2p.woff2';

injectGlobal`
    @font-face {
        font-family: 'pressstart2p';
        src: url('${pressstart2p}') format('woff2');
    }
`;

export enum CellFlag {
    NONE,
    BOMB,
    CHECK_LATER
}

export class CellLogic {
    public id: number;
    public x: number;
    public y: number;

    @observable
    public isMine: boolean = false;

    @observable
    public isKillingBomb: boolean = false;

    @observable
    public isRevealed: boolean = false;

    @observable
    public flag: CellFlag = CellFlag.NONE;

    public board: BoardLogic;

    constructor(board: BoardLogic, id: number, x: number, y: number){
        this.id = id;
        this.x = x;
        this.y = y;
        this.board = board;
    }

    @computed
    public get nearbyBombsCount(): number {
        return this.board.getNeighborCells(this).reduce((acc, Cell) => Cell.isMine ? acc + 1 : acc, 0);
    }

    @action
    public cycleFlag(): void {
        if(this.board.game.state !== GameLogicState.Running){
            return;
        }

        let flag = CellFlag.NONE;

        if(this.flag === CellFlag.NONE){
            flag = CellFlag.BOMB;
        }

        // disable checklater
        /*if(this.flag === CellFlag.BOMB){
            flag = CellFlag.CHECK_LATER;
        }*/
        this.flag = flag;

        this.board.checkWin();
    }

    public reveal(): void {
        if(this.board.game.state !== GameLogicState.Running || this.flag !== CellFlag.NONE){
            return;
        }

        this.isRevealed = true;

        if(this.isMine){
            this.isKillingBomb = true;
            this.board.revealAllBombs();
            this.board.game.fail();
        }

        // flood reveal
        if(this.nearbyBombsCount === 0){
            this.board.getNeighborCells(this)
                .filter(cell => !cell.isMine && !cell.isRevealed && cell.flag === CellFlag.NONE)
                .forEach(cell => cell.reveal());
        }

        this.board.checkWin();
    }
}

interface CellProps {
    state: CellLogic;
    onActiveCellMouseDown?: () => void;
}

interface WindowsButtonProps {
    active?: boolean;
    disabled?: boolean;
    clickable?: boolean;
}

export const WindowsButton = styled.button.attrs<WindowsButtonProps>({})`
    text-align: center;
    user-select: none;
    background: #d6d3cd;
    border: none;
    padding: 2px 4px 3px 3px;
    -webkit-app-region: no-drag;
    -webkit-user-drag: none;
    -webkit-appearance: none;
    box-shadow:
        inset -1px -1px 0 0 #404040,
        inset -2px -2px 0 0 #808080,
        inset 1px 1px 0 0 #fff;

    ${props => props.clickable !== false && `
        &:active {
            padding: 3px 4px 3px 4px;
            box-shadow:
                inset 1px 1px 0 0 #404040,
                inset -1px -1px 0 0 #fff;
        }
    `}

    &:focus {
        outline: none;
    }

    ${props => props.active === false && `
        box-shadow: none;
        &:active { box-shadow: none; }
    `}

    ${props => props.disabled === true && `
        & > img {
            filter: drop-shadow(1px 1px 0px #fff);
            opacity: .3;
        }
    `}
`;

const CellContainer = WindowsButton.extend`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    font-family: 'pressstart2p', sans-serif;
`;

@observer
export class Cell extends React.Component<CellProps, any> {
    static size: number = 16;

    render(){
        const { state } = this.props;
        return (
            <CellContainer
                style={{
                    background: state.isKillingBomb ? 'red' : '',
                    color: this.getCountColor(),
                    left: state.x * Cell.size,
                    top: state.y * Cell.size,
                    width: Cell.size,
                    height: Cell.size,
                    lineHeight: Cell.size + 'px'
                }}
                onClick={this.handleClick}
                onMouseDown={this.handleMouseDown}
                onContextMenu={this.handleContextMenu}
                active={!state.isRevealed}
                clickable={state.board.game.state === GameLogicState.Running}>
                {this.getCellContent()}
            </CellContainer>
        );
    }

    getCellContent(): string | JSX.Element {
        const { state } = this.props;
        if(state.isRevealed && state.isMine){
            return <img src={imgMine} style={{ imageRendering: 'pixelated' }}/>;
        }
        if(state.isRevealed && state.nearbyBombsCount > 0){
            return state.nearbyBombsCount + '';
        }
        if(state.isRevealed){
            return '';
        }
        if(state.flag === CellFlag.BOMB && !state.isMine && state.board.game.state === GameLogicState.Failed){
            return (
                <div>
                    <img src={imgMine} style={{ imageRendering: 'pixelated', position: 'absolute', top: 1, left: 1 }}/>
                    <img src={imgCross} style={{ imageRendering: 'pixelated', position: 'absolute', top: 2, left: 1 }}/>
                </div>
            );
        }
        if(state.flag === CellFlag.BOMB){
            return <img src={imgFlag} style={{ imageRendering: 'pixelated' }}/>;
        }
        if(state.flag === CellFlag.CHECK_LATER){
            return '❓';
        }
        return '';
    }

    getCountColor(): string {
        const { nearbyBombsCount } = this.props.state;
        return [
            '#000',
            'blue',
            '#007c00',
            'red',
            '#00007d',
            '#7c0000',
            '#007c7c',
            'black',
            '#7b7b7b',
        ][nearbyBombsCount];
    }

    @bind
    handleClick(): void {
        this.props.state.reveal();
    }

    @bind
    handleContextMenu(e: React.MouseEvent<HTMLButtonElement>): void {
        e.preventDefault();
        this.props.state.cycleFlag();
    }

    @bind
    handleMouseDown(): void {
        if(this.props.state.isRevealed || this.props.state.flag !== CellFlag.NONE || typeof this.props.onActiveCellMouseDown !== 'function'){
            return;
        }
        this.props.onActiveCellMouseDown();
    }
}

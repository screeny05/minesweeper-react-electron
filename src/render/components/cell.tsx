import * as React from 'react';
import { injectGlobal } from './form/theme-interface';
import { observer } from 'mobx-react';
import bind from 'bind-decorator';

import { Cell as CellState, CellFlag } from '../state/cell';

import { Button } from './form/button';

import imgFlag from '../../assets/images/flag.png';
import imgMine from '../../assets/images/mine.png';
import imgCross from '../../assets/images/cross.png';
import pressstart2p from '../../assets/fonts/pressstart2p.woff2';
import { GameRunningState } from '../state/game';

injectGlobal`
    @font-face {
        font-family: 'pressstart2p';
        src: url('${pressstart2p}') format('woff2');
    }
`;

interface ICellProps {
    state: CellState;
    onActiveCellMouseDown?: () => void;
}

const CellButton = Button.extend`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    font-family: 'pressstart2p', sans-serif;
`;

@observer
export class Cell extends React.Component<ICellProps, any> {
    static size: number = 16;

    render(){
        const { state } = this.props;
        return (
            <CellButton
                style={{
                    background: state.isKillingMine ? 'red' : '',
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
                clickable={state.board.game.state === GameRunningState.Running}>
                {this.getCellContent()}
            </CellButton>
        );
    }

    getCellContent(): string | JSX.Element {
        const { state } = this.props;
        if(state.isRevealed && state.isMine){
            return <img src={imgMine} style={{ imageRendering: 'pixelated' }}/>;
        }
        if(state.isRevealed && state.nearbyMineCount > 0){
            return state.nearbyMineCount + '';
        }
        if(state.isRevealed){
            return '';
        }
        if(state.flag === CellFlag.Mine && !state.isMine && state.board.game.state === GameRunningState.Failed){
            return (
                <div>
                    <img src={imgMine} style={{ imageRendering: 'pixelated', position: 'absolute', top: 1, left: 1 }}/>
                    <img src={imgCross} style={{ imageRendering: 'pixelated', position: 'absolute', top: 2, left: 1 }}/>
                </div>
            );
        }
        if(state.flag === CellFlag.Mine){
            return <img src={imgFlag} style={{ imageRendering: 'pixelated' }}/>;
        }
        if(state.flag === CellFlag.QuestionMark){
            return '❓';
        }
        return '';
    }

    getCountColor(): string {
        const { nearbyMineCount } = this.props.state;
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
        ][nearbyMineCount];
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
        if(this.props.state.isRevealed || this.props.state.flag !== CellFlag.None || typeof this.props.onActiveCellMouseDown !== 'function'){
            return;
        }
        this.props.onActiveCellMouseDown();
    }
}

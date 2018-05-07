import * as React from 'react';
import { observer } from 'mobx-react';
import { bind } from 'bind-decorator';
import { IpcBridge } from '../ipc-bridge';

import { SevenSegmentDisplayArray, formatNumberForDisplayArray } from './seven-segment-display';
import { Panel } from './form/panel';
import { Button } from './form/button';
import { MenuStrip, MenuStripSubItem, MenuStripSubSeparator, MenuStripItem } from './form/menu-strip';
import { Window } from './form/window';
import { Board } from './board';

import { Game as GameState, BoardLevels, GameRunningState, IBoardLevel } from '../state/game';

import imgIcon from '../../assets/images/icon.png';
import imgFaceCool from '../../assets/images/face-cool.png';
import imgFaceDead from '../../assets/images/face-dead.png';
import imgFaceFrown from '../../assets/images/face-frown.png';
import imgFaceSmile from '../../assets/images/face-smile.png';
import imgFaceSurprise from '../../assets/images/face-surprise.png';
import { ChildWindow } from './child-window';

interface IGameProps {
    state: GameState;
    onResize?: () => void;
}

interface IGameState {
    resetButtonDown: boolean;
    cellDown: boolean;
    levelModalOpen: boolean;
}

@observer
export class Game extends React.Component<IGameProps, IGameState> {
    state: IGameState = {
        resetButtonDown: false,
        cellDown: false,
        levelModalOpen: false
    }

    componentDidMount(){
        document.addEventListener('mouseup', this.handleDocumentMouseUp);
    }

    componentWillUnmount(){
        document.removeEventListener('mouseup', this.handleDocumentMouseUp);
    }

    public render() {
        const isBoardLevelBeginner = this.props.state.isLevel(BoardLevels.beginner);
        const isBoardLevelIntermediate = this.props.state.isLevel(BoardLevels.intermediate);
        const isBoardLevelExpert = this.props.state.isLevel(BoardLevels.expert);
        const isBoardLevelCustom = !isBoardLevelBeginner && !isBoardLevelIntermediate && !isBoardLevelExpert;

        return (
            <React.Fragment>
                <MenuStrip>
                    <MenuStripItem key='menu-game' title='Game'>
                        <MenuStripSubItem key='menu-new' title='New' onClick={this.commandNewGame}/>
                        <MenuStripSubSeparator/>
                        <MenuStripSubItem key='menu-beginner' title='Beginner' onClick={() => this.commandSetLevel(BoardLevels.beginner)} hasCheckmark={isBoardLevelBeginner}/>
                        <MenuStripSubItem key='menu-intermediate' title='Intermediate' onClick={() => this.commandSetLevel(BoardLevels.intermediate)} hasCheckmark={isBoardLevelIntermediate}/>
                        <MenuStripSubItem key='menu-expert' title='Expert' onClick={() => this.commandSetLevel(BoardLevels.expert)} hasCheckmark={isBoardLevelExpert}/>
                        <MenuStripSubItem key='menu-custom' title='Custom&hellip;' onClick={this.commandLevelModal} hasCheckmark={isBoardLevelCustom}/>
                        <MenuStripSubSeparator/>
                        <MenuStripSubItem key='menu-exit' title='Exit' onClick={this.commandClose}/>
                    </MenuStripItem>
                    <MenuStripItem key='menu-help' title='Help'>
                        <MenuStripSubItem key='menu-about' title='About' onClick={this.commandAbout}/>
                    </MenuStripItem>
                </MenuStrip>
                <Panel hasBorder borderSize={3} padding={6} style={{ display: 'inline-flex', flexDirection: 'column' }}>
                    <Panel hasBorder isBorderInset borderSize={2} isBlock padding={4} style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <Panel hasBorder isBorderInset>
                            <SevenSegmentDisplayArray string={formatNumberForDisplayArray(this.props.state.board.remainingUncheckedCount)}/>
                        </Panel>
                        <Button onClick={this.handleReset} onMouseDown={this.handleResetDown} style={{ width: 24, height: 24 }}>
                            {this.getResetButtonContent()}
                        </Button>
                        <Panel hasBorder isBorderInset>
                            <SevenSegmentDisplayArray string={formatNumberForDisplayArray(this.props.state.elapsedSeconds)}/>
                        </Panel>
                    </Panel>
                    <Panel hasBorder isBorderInset borderSize={3}>
                        <Board state={this.props.state.board} onActiveCellMouseDown={this.handleCellDown}/>
                    </Panel>
                </Panel>
                {this.state.levelModalOpen && <ChildWindow hash='customize' onClose={this.handleCloseCustomizeModal} onSubmit={this.commandSetLevel} forwardProps={this.props.state.level}/>}
            </React.Fragment>
        );
    }

    getResetButtonContent(): JSX.Element {
        const { state } = this.props;
        let src = imgFaceSmile;

        if(state.state === GameRunningState.Won){
            src = imgFaceCool;
        } else if(state.state === GameRunningState.Failed){
            src = imgFaceDead;
        } else if(this.state.cellDown){
            src = imgFaceSurprise;
        } else if(state.state !== GameRunningState.Running || this.state.resetButtonDown){
            src = imgFaceFrown;
        }

        return <img src={src} style={{ imageRendering: 'pixelated' }}/>;
    }

    @bind
    handleReset(){
        this.props.state.restart();
    }

    @bind
    handleResetDown(){
        this.setState({
            resetButtonDown: true,
        });
    }

    @bind
    handleCellDown(){
        if(!this.props.state.isTimerRunning){
            this.props.state.startTimer();
        }

        this.setState({
            cellDown: true
        });
    }

    @bind
    handleDocumentMouseUp(){
        this.setState({
            resetButtonDown: false,
            cellDown: false
        });
    }

    @bind
    handleCloseCustomizeModal(){
        this.setState({
            levelModalOpen: false
        });
    }

    @bind
    commandNewGame(){
        this.props.state.restart();
    }

    @bind
    commandSetLevel(level: IBoardLevel){
        this.props.state.setLevel(level);
        this.forceUpdate(() => this.props.onResize ? this.props.onResize() : null);
    }

    @bind
    commandLevelModal(){
        this.setState({
            levelModalOpen: true
        });
    }

    @bind
    commandClose(){
        IpcBridge.close();
    }

    @bind
    commandAbout(){
        IpcBridge.open('https://github.com/screeny05/minesweeper-react-electron');
    }
}

export class GameWindow extends React.Component<any, any> {
    constructor(props: any){
        super(props);
        this.state = {
            state: new GameState(),
            contentWidth: 400,
            contentHeight: 400
        }
    }

    render(){
        return (
            <Window shrinkSizeToContent title='Minesweeper' icon={imgIcon} maximizable={false} resizable={false}>
                <Game state={this.state.state}/>
            </Window>
        );
    }
}

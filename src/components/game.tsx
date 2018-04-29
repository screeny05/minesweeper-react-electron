import * as React from 'react';
import { Board, BoardLogic } from './board';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';
import { SevenSegmentDisplayArray } from './seven-segment-display';
import { Panel } from './panel';
import { WindowsButton } from './cell';
import { MenuStrip, MenuStripSubItem, MenuStripSubSeparator, MenuStripItem } from './menu-strip';
import { bind } from 'bind-decorator';
const { ipcRenderer, shell } = window.require('electron');

import faceCool from '../assets/images/face-cool.png';
import faceDead from '../assets/images/face-dead.png';
import faceFrown from '../assets/images/face-frown.png';
import faceSmile from '../assets/images/face-smile.png';
import faceSurprise from '../assets/images/face-surprise.png';

export enum GameLogicState {
    Running,
    Won,
    Failed,
    Stopped,
}

interface BoardLevel {
    title: string;
    width: number;
    height: number;
    mines: number;
}

const boardLevels = {
    beginner: {
        title: 'Beginner',
        width: 9,
        height: 9,
        mines: 12
    },
    intermediate: {
        title: 'Intermediate',
        width: 16,
        height: 16,
        mines: 40
    },
    expert: {
        title: 'Expert',
        width: 30,
        height: 16,
        mines: 99
    }
}

export class GameLogic {
    board: BoardLogic;

    @observable
    state: GameLogicState = GameLogicState.Stopped;

    @observable
    elapsedSeconds: number = 0;

    @observable
    isTimerRunning: boolean = false;

    startTime: Date;
    timerId: NodeJS.Timer;
    level: BoardLevel;

    constructor(){
        this.level = boardLevels.beginner;
        this.start();
    }

    restart(){
        this.stop();
        this.start();
    }

    stop(){
        clearInterval(this.timerId);
        this.isTimerRunning = false;
        this.state = GameLogicState.Stopped;
    }

    start(){
        if(this.state === GameLogicState.Running){
            return;
        }

        this.state = GameLogicState.Running;
        this.elapsedSeconds = 0;
        this.board = new BoardLogic(this, this.level.width, this.level.height, this.level.mines);
    }

    startTimer(){
        this.startTime = new Date();
        this.isTimerRunning = true;
        this.timerId = setInterval(this.updateTimer, 1000);
    }

    fail(){
        this.stop();
        this.state = GameLogicState.Failed;
    }

    win(){
        this.stop();
        this.state = GameLogicState.Won;
    }

    @action.bound
    updateTimer(){
        this.elapsedSeconds = Math.round((new Date().getTime() - this.startTime.getTime()) / 1000);
    }
}

interface GameProps {
    state: GameLogic;
    onResize: () => void;
}

interface GameState {
    resetButtonDown: boolean;
    cellDown: boolean;
}

@observer
export class Game extends React.Component<GameProps, GameState> {
    constructor(props: GameProps){
        super(props);
        this.state = {
            resetButtonDown: false,
            cellDown: false
        };
    }

    componentDidMount(){
        document.addEventListener('mouseup', this.handleDocumentMouseUp);
    }

    componentWillUnmount(){
        document.removeEventListener('mouseup', this.handleDocumentMouseUp);
    }

    public render() {
        return (
            <React.Fragment>
                <MenuStrip>
                    <MenuStripItem key='menu-game' title='Game'>
                        <MenuStripSubItem key='menu-new' title='New' onClick={this.commandNewGame}/>
                        <MenuStripSubSeparator/>
                        <MenuStripSubItem key='menu-beginner' title='Beginner' onClick={() => this.commandSetLevel(boardLevels.beginner)}/>
                        <MenuStripSubItem key='menu-intermediate' title='Intermediate' onClick={() => this.commandSetLevel(boardLevels.intermediate)}/>
                        <MenuStripSubItem key='menu-expert' title='Expert' onClick={() => this.commandSetLevel(boardLevels.expert)}/>
                        <MenuStripSubItem key='menu-custom' title='Custom&hellip;'/>
                        <MenuStripSubSeparator/>
                        <MenuStripSubItem key='menu-exit' title='Exit' onClick={this.commandClose}/>
                    </MenuStripItem>
                    <MenuStripItem key='menu-help' title='Help'>
                        <MenuStripSubItem key='menu-about' title='About'/>
                        <MenuStripSubItem key='menu-github' title='GitHub' onClick={this.commandGithub}/>
                    </MenuStripItem>
                </MenuStrip>
                <Panel hasBorder borderSize={3} padding={6} style={{ display: 'inline-flex', flexDirection: 'column' }}>
                    <Panel hasBorder isBorderInset borderSize={2} isBlock padding={4} style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                        <Panel hasBorder isBorderInset>
                            <SevenSegmentDisplayArray string={this.props.state.board.remainingUncheckedCount.toString().padStart(3, '0')}/>
                        </Panel>
                        <WindowsButton onClick={this.handleReset} onMouseDown={this.handleResetDown} style={{ width: 24, height: 24 }}>
                            {this.getResetButtonContent()}
                        </WindowsButton>
                        <Panel hasBorder isBorderInset>
                            <SevenSegmentDisplayArray string={this.props.state.elapsedSeconds.toString().padStart(3, '0')}/>
                        </Panel>
                    </Panel>
                    <Panel hasBorder isBorderInset borderSize={3}>
                        <Board state={this.props.state.board} onActiveCellMouseDown={this.handleCellDown}/>
                    </Panel>
                </Panel>
            </React.Fragment>
        );
    }

    getResetButtonContent(): JSX.Element {
        const { state } = this.props;
        let src = faceSmile;

        if(state.state === GameLogicState.Won){
            src = faceCool;
        } else if(state.state === GameLogicState.Failed){
            src = faceDead;
        } else if(this.state.cellDown){
            src = faceSurprise;
        } else if(state.state !== GameLogicState.Running || this.state.resetButtonDown){
            src = faceFrown;
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
    commandNewGame(){
        this.props.state.restart();
    }

    @bind
    commandSetLevel(level: BoardLevel){
        this.props.state.level = level;
        this.props.state.restart();
        this.forceUpdate(() => this.props.onResize());
    }

    @bind
    commandLevelModal(){

    }

    @bind
    commandClose(){
        ipcRenderer.send('close');
    }

    @bind
    commandAbout(){

    }

    @bind
    commandGithub(){
        shell.openExternal('https://github.com/screeny05');
    }
}

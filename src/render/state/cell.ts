import { observable, action, computed } from 'mobx';
import { Board } from './board';
import { GameRunningState } from './game';

export enum CellFlag {
    None,
    Mine,
    QuestionMark
}

export class Cell {
    public id: number;
    public x: number;
    public y: number;

    @observable
    public isMine: boolean = false;

    @observable
    public isKillingMine: boolean = false;

    @observable
    public isRevealed: boolean = false;

    @observable
    public flag: CellFlag = CellFlag.None;

    public board: Board;

    constructor(board: Board, id: number, x: number, y: number){
        this.id = id;
        this.x = x;
        this.y = y;
        this.board = board;
    }

    @computed
    public get nearbyMineCount(): number {
        return this.board.getNeighborCells(this).reduce((acc, Cell) => Cell.isMine ? acc + 1 : acc, 0);
    }

    @action
    public cycleFlag(): void {
        if(this.board.game.state !== GameRunningState.Running){
            return;
        }

        let flag = CellFlag.None;

        if(this.flag === CellFlag.None){
            flag = CellFlag.Mine;
        }

        // disable ?
        /*if(this.flag === CellFlag.Mine){
            flag = CellFlag.QuestionMark;
        }*/
        this.flag = flag;

        this.board.checkWin();
    }

    public reveal(): void {
        if(this.board.game.state !== GameRunningState.Running || this.flag !== CellFlag.None){
            return;
        }

        this.isRevealed = true;

        if(this.isMine){
            this.isKillingMine = true;
            this.board.revealAllMines();
            this.board.game.fail();
        }

        // flood reveal
        if(this.nearbyMineCount === 0){
            this.board.getNeighborCells(this)
                .filter(cell => !cell.isMine && !cell.isRevealed && cell.flag === CellFlag.None)
                .forEach(cell => cell.reveal());
        }

        this.board.checkWin();
    }
}

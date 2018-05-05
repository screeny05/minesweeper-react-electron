import { observable, computed } from 'mobx';
import { Game, GameRunningState } from './game';
import { Cell, CellFlag } from './cell';

export class Board {
    @observable
    public cells: Cell[] = [];

    public mineCount: number = 0;

    public width: number;
    public height: number;

    public game: Game;

    constructor(game: Game, width: number, height: number, mineCount: number){
        this.width = width;
        this.height = height;
        this.mineCount = mineCount;
        this.game = game;

        this.generateBoard();
        this.populateBoard();
    }

    public generateBoard(){
        this.cells = new Array(this.width * this.height).fill(null).map((_, i) => {
            const x = i % this.width;
            const y = Math.floor(i / this.width);

            return new Cell(this, i, x, y);
        });
    }

    public populateBoard(){
        this.getRandomEmptyCells(this.mineCount).forEach(cell => cell.isMine = true);
    }

    public getRandomEmptyCells(count: number): Cell[] {
        const randomCells: Cell[] = [];
        const emptyCells = this.cells.filter(cell => !cell.isMine);

        while(randomCells.length < count){
            const index = Math.floor(Math.random() * emptyCells.length);
            randomCells.push(emptyCells.splice(index, 1)[0]);
        }

        return randomCells;
    }

    public get(x: number, y: number): Cell | null {
        // cells-array is filled x->y
        const index = y * this.width + x;
        if(index >= this.cells.length){
            return null;
        }

        const tile = this.cells[y * this.width + x];

        if(!tile || tile.x !== x || tile.y !== y){
            return null;
        }
        return tile;
    }

    public getNeighborCells(src: Cell): Cell[] {
        return [
            this.get(src.x - 1, src.y - 1),
            this.get(src.x - 1, src.y + 1),
            this.get(src.x + 1, src.y - 1),
            this.get(src.x + 1, src.y + 1),
            this.get(src.x - 1, src.y),
            this.get(src.x, src.y - 1),
            this.get(src.x, src.y + 1),
            this.get(src.x + 1, src.y),
        ].filter((cell: Cell): cell is Cell => !!cell);
    }

    public revealAllMines(){
        this.cells.filter(cell => cell.isMine).forEach(cell => cell.isRevealed = true);
    }

    public flagUnflaggedMines(){
        this.cells.filter(cell => cell.isMine).forEach(cell => cell.flag = CellFlag.Mine);
    }

    public isWon(): boolean {
        // All cells have to be correctly flagged or revealed
        // return !this.cells.some(cell => !(cell.isMine && cell.flag === CellFlag.BOMB || cell.isRevealed && !cell.isMine));

        // All non-bomb cells have to be revealed
        return this.cells.filter(cell => !cell.isRevealed && !cell.isMine).length === 0;
    }

    public checkWin(){
        if(this.game.state === GameRunningState.Running && this.isWon()){
            this.flagUnflaggedMines();
            this.game.win();
        }
    }

    @computed
    public get remainingUncheckedCount(): number {
        return this.mineCount - this.cells.filter(cell => cell.flag === CellFlag.Mine).length;
    }
}

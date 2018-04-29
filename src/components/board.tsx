import * as React from 'react';
import { observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import { Cell, CellLogic, CellFlag } from './cell';
import styled from 'styled-components';
import { GameLogic } from './game';

export class BoardLogic {
    @observable
    public cells: CellLogic[] = [];

    @observable
    public mineCount: number = 0;

    public width: number;
    public height: number;

    public game: GameLogic;

    constructor(game: GameLogic, width: number, height: number, mineCount: number){
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

            return new CellLogic(this, i, x, y);
        });
    }

    public populateBoard(){
        this.getRandomEmptyCells(this.mineCount).forEach(cell => cell.isMine = true);
    }

    public getRandomEmptyCells(count: number): CellLogic[] {
        const randomCells: CellLogic[] = [];
        const emptyCells = this.cells.filter(cell => !cell.isMine);

        while(randomCells.length < count){
            const index = Math.floor(Math.random() * emptyCells.length);
            randomCells.push(emptyCells.splice(index, 1)[0]);
        }

        return randomCells;
    }

    public get(x: number, y: number): CellLogic | null {
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

    public getNeighborCells(src: CellLogic): CellLogic[] {
        return [
            this.get(src.x - 1, src.y - 1),
            this.get(src.x - 1, src.y + 1),
            this.get(src.x + 1, src.y - 1),
            this.get(src.x + 1, src.y + 1),
            this.get(src.x - 1, src.y),
            this.get(src.x, src.y - 1),
            this.get(src.x, src.y + 1),
            this.get(src.x + 1, src.y),
        ].filter((cell: CellLogic): cell is CellLogic => !!cell);
    }

    public revealAllBombs(){
        this.cells.filter(cell => cell.isMine).forEach(cell => cell.isRevealed = true);
    }

    public isWon(): boolean {
        // all cells have to be either correctly flagged as bombs or revealed
        return !this.cells.some(cell => !(cell.isMine && cell.flag === CellFlag.BOMB || cell.isRevealed && !cell.isMine))
    }

    public checkWin(){
        if(this.isWon()){
            this.game.win();
        }
    }

    @computed
    public get remainingUncheckedCount(): number {
        return Math.max(this.mineCount - this.cells.filter(cell => cell.flag === CellFlag.BOMB).length, 0);
    }
}

interface BoardProps {
    state: BoardLogic;
    onActiveCellMouseDown?: () => void;
}

const BoardContainer = styled.div`
    position: relative;
`;

@observer
export class Board extends React.Component<BoardProps, any> {
    render(){
        const { state } = this.props;

        return (
            <BoardContainer style={{
                width: Cell.size * state.width,
                height: Cell.size * state.height
            }}>
                {state.cells.map((cell: any) =>
                    <Cell key={cell.id} state={cell} onActiveCellMouseDown={this.props.onActiveCellMouseDown}/>
                )}
            </BoardContainer>
        )
    }
}

import * as React from 'react';
import { observer } from 'mobx-react';
import styled from './form/theme-interface';

import { Cell } from './cell';

import { Board as BoardState } from '../state/board';

interface IBoardProps {
    state: BoardState;
    onActiveCellMouseDown?: () => void;
}

const BoardContainer = styled.div`
    position: relative;
`;

@observer
export class Board extends React.PureComponent<IBoardProps> {
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

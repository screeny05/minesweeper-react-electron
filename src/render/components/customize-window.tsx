import * as React from 'react';
import { bind } from 'bind-decorator';
import { Window } from './form/window';
import { IpcBridge } from '../ipc-bridge';
import { Button } from './form/button';
import styled from './form/theme-interface';
import { IBoardLevel } from '../state/game';
import { Input } from './form/input';

const InputGroup = styled.div`
    margin-bottom: 5px;

    & > label {
        display: inline-block;
        width: 50px;
    }
    & > input {
        width: 40px;
    }
`;

const ButtonGroup = styled.div`
    & > button {
        display: block;
        width: 60px;
        height: 24px;
        margin-bottom: 10px;
        &:last-child {
            margin-bottom: 0;
        }
    }
`;

export class CustomizeWindow extends React.Component<IBoardLevel, IBoardLevel> {
    constructor(props: IBoardLevel){
        super(props);
        this.state = props;
    }

    render(){
        return (
            <Window title='Custom Field' width={195} height={117} minimizable={false} maximizable={false} resizable={false}>
                <form
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px'
                    }}
                    onSubmit={this.handleSubmit}
                >
                    <div>
                        <InputGroup>
                            <label htmlFor='height'>Height:</label>
                            <Input type='text' id='height' value={this.state.height} onChange={this.handleChangeHeight} autoFocus/>
                        </InputGroup>
                        <InputGroup>
                            <label htmlFor='width'>Width:</label>
                            <Input type='text' id='width' value={this.state.width} onChange={this.handleChangeWidth}/>
                        </InputGroup>
                        <InputGroup>
                            <label htmlFor='mines'>Mines:</label>
                            <Input type='text' id='mines' value={this.state.mines} onChange={this.handleChangeMines}/>
                        </InputGroup>
                    </div>
                    <ButtonGroup>
                        <Button type='submit'>OK</Button>
                        <Button onClick={IpcBridge.close}>Cancel</Button>
                    </ButtonGroup>
                </form>
            </Window>
        );
    }

    @bind
    handleSubmit(){
        IpcBridge.sendParent('submit', this.state);
        IpcBridge.close();
    }

    @bind
    handleChangeWidth(e: React.ChangeEvent<HTMLInputElement>){
        const value = e.target.value || '0';
        this.setState({ width: Number.parseInt(value) });
    }

    @bind
    handleChangeHeight(e: React.ChangeEvent<HTMLInputElement>){
        const value = e.target.value || '0';
        this.setState({ height: Number.parseInt(value) });
    }

    @bind
    handleChangeMines(e: React.ChangeEvent<HTMLInputElement>){
        const value = e.target.value || '0';
        this.setState({ mines: Number.parseInt(value)});
    }
}

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Alert } from './components/alert';
import { GameWindow } from './components/game';
import { CustomizeWindow } from './components/customize-window';
import { IpcBridge } from './ipc-bridge';

// Disable resource drag
window.ondragstart = () => false;

const hash = window.location.hash.slice(1);
let rootElement;

const props = IpcBridge.getForwardedProps();

// Render frame
if(hash === 'main'){
    rootElement = <GameWindow {...props}/>
} else if(hash === 'customize'){
    rootElement = <CustomizeWindow {...props}/>
}

ReactDOM.render(rootElement || <Alert message={`Couldn't match route '${hash}'.`}/>, document.getElementById('app') as HTMLElement);

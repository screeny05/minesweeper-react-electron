import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Alert } from './components/alert';
import { GameWindow } from './components/game';

// Disable resource drag
window.ondragstart = () => false;

const hash = window.location.hash.slice(1);
let rootElement;

// Render frame
if(hash === 'main'){
    rootElement = <GameWindow/>
} else if(hash === 'customize-board'){

}

ReactDOM.render(rootElement || <Alert message={`Couldn't match route '${hash}'.`}/>, document.getElementById('app') as HTMLElement);

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Window } from './components/window';

// Disable resource drag
window.ondragstart = () => false;

// Render frame
ReactDOM.render(<Window/>, document.getElementById('app') as HTMLElement);

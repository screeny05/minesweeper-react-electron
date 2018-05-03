import tahoma from '../../../assets/fonts/tahoma.woff2';
import { Theme, injectGlobal } from './theme-interface';

export const themeRedmond: Theme = {
    backgroundColor: '#c0c0c0',
    selectionBackgroundColor: '#000087',
    selectionForegroundColor: '#fff',
    titlebarGradientBlur: 'linear-gradient(to right, #808080, #c7c7c7)',
    titlebarGradientFocus: 'linear-gradient(to right, #0a2569, #a6caf0)',
};

injectGlobal`
    @font-face {
        font-family: 'tahoma';
        src: url('${tahoma}') format('woff2');
    }

    html,
    body {
        font-family: 'tahoma';
        font-size: 11px;
        background: ${themeRedmond.backgroundColor};
    }
`;

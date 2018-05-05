import * as styledComponents from 'styled-components';
import { ThemedStyledComponentsModule } from 'styled-components';
import { Win2000 } from './color-schemes.json';
import tahoma from '../../../assets/fonts/tahoma.woff2';

export interface IColorScheme {
    ActiveBorder: string;
    ActiveCaption: string;
    ActiveCaptionText: string;
    AppWorkspace: string;
    Control: string;
    ControlDark: string;
    ControlDarkDark: string;
    ControlLight: string;
    ControlLightLight: string;
    ControlText: string;
    Desktop: string;
    GradientActiveCaption: string;
    GradientInactiveCaption: string;
    GrayText: string;
    Highlight: string;
    HighlightText: string;
    HotTrack: string;
    InactiveBorder: string;
    InactiveCaption: string;
    InactiveCaptionText: string;
    Info: string;
    InfoText: string;
    Menu: string;
    MenuBar: string;
    MenuHighlight: string;
    MenuText: string;
    ScrollBar: string;
    Window: string;
    WindowFrame: string;
    WindowText: string;
}

const {
    default: styled,
    css,
    injectGlobal,
    keyframes,
    ThemeProvider
} = styledComponents as ThemedStyledComponentsModule<IColorScheme>;

export { css, injectGlobal, keyframes, ThemeProvider };
export default styled;

export const ColorScheme: IColorScheme = Win2000;

injectGlobal`
    @font-face {
        font-family: 'tahoma';
        src: url('${tahoma}') format('woff2');
    }

    html,
    body {
        font-family: 'tahoma';
        font-size: 11px;
        color: ${ColorScheme.WindowText};
    }
`;

/*export const themeRedmond: ClassicTheme = {
    ...ColorScheme,
    threedface: ColorScheme.Control,
    threedhighlight: ColorScheme.ControlLightLight,
    threedlightshadow: '#b5b5b5',
    threedshadow: '#808080',
    titlebarGradientBlur: 'linear-gradient(to right, #808080, #c7c7c7)',
    titlebarGradientFocus: 'linear-gradient(to right, #0a2569, #a6caf0)',
};*/

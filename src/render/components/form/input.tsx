import styled from './theme-interface';

export const Input = styled.input`
    text-align: center;
    user-select: none;
    background: #fff;
    border: none;
    padding: 2px 4px 3px 3px;
    -webkit-app-region: no-drag;
    -webkit-user-drag: none;
    -webkit-appearance: none;
    box-shadow:
        inset -1px -1px 0 0 ${props => props.theme.ControlLightLight},
        inset 1px 1px 0 0 ${props => props.theme.ControlDark},
        inset 2px 2px 0 0 ${props => props.theme.ControlDarkDark},
        inset -2px -2px 0 0 ${props => props.theme.ControlLight};

    &:focus {
        outline: none;
    }
`;

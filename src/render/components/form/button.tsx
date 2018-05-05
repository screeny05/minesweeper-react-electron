import styled from './theme-interface';

interface IButtonProps {
    active?: boolean;
    disabled?: boolean;
    clickable?: boolean;
}

export const Button = styled.button.attrs<IButtonProps>({})`
    text-align: center;
    user-select: none;
    background: #d6d3cd;
    border: none;
    padding: 2px 4px 3px 3px;
    -webkit-app-region: no-drag;
    -webkit-user-drag: none;
    -webkit-appearance: none;
    box-shadow:
        inset -1px -1px 0 0 #404040,
        inset -2px -2px 0 0 #808080,
        inset 1px 1px 0 0 #fff;

    ${props => props.clickable !== false && `
        &:active {
            padding: 3px 4px 3px 4px;
            box-shadow:
                inset 1px 1px 0 0 #404040,
                inset -1px -1px 0 0 #fff;
        }
    `}

    &:focus {
        outline: none;
    }

    ${props => props.active === false && `
        box-shadow: none;
        &:active { box-shadow: none; }
    `}

    ${props => props.disabled === true && `
        & > * {
            filter: drop-shadow(1px 1px 0px #fff);
            opacity: .3;
        }
    `}
`;

import styled from 'styled-components';

interface PanelProps {
    hasBorder?: boolean;
    isBorderInset?: boolean;
    padding?: number;
    borderSize?: number;
    isBlock?: boolean;
    background?: string;
}

export const Panel = styled.div.attrs<PanelProps>({})`
    background: ${props => props.background ? props.background : '#c0c0c0'};
    display: ${props => props.isBlock ? 'block' : 'inline-block'};

    ${props => props.padding && `
        padding: ${props.padding}px;
    `}

    ${props => props.hasBorder && `
        border: ${props.borderSize || 1}px solid #fcffff;
        border-bottom-color: #7a8389;
        border-right-color: #7a8389;
    `}

    ${props => props.hasBorder && props.isBorderInset && `
        border: ${props.borderSize || 1}px solid #7a8389;
        border-bottom-color: #fcffff;
        border-right-color: #fcffff;
    `}
`;

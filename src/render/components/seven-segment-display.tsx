import * as React from "react";
import styled from './form/theme-interface';

interface ISegmentContainerProps {
    size: number;
    length: number;
    padding: number;
}

interface ISegmentProps {
    active?: boolean;
    isHorizontal?: boolean;
    size: number;
    length: number;
    padding: number;
}

const SegmentContainer = styled.div.attrs<ISegmentContainerProps>({})`
    position: relative;
    display: inline-block;
    width: ${props => props.length + props.padding}px;
    height: ${props => 2 * props.length + props.padding}px;
`;

const Segment = styled.div.attrs<ISegmentProps>({})`
    position: absolute;
    background: red;
    opacity: ${props => props.active ? 1 : 0.3};
    width: ${props => props.isHorizontal ? props.length : props.size}px;
    height: ${props => props.isHorizontal ? props.size : props.length}px;
`;

const SegmentTop = Segment.extend`
    top: 0;
    left: ${props => props.padding / 2}px;
    clip-path: polygon(0 0, 100% 0, calc(100% - ${props => props.size}px) 100%, ${props => props.size}px 100%);
`;

const SegmentTopLeft = Segment.extend`
    top: ${props => props.padding / 2}px;
    left: 0;
    clip-path: polygon(0 0, 100% ${props => props.size}px, 100% calc(100% - ${props => props.size}px), 0 100%);
`;

const SegmentTopRight = Segment.extend`
    top: ${props => props.padding / 2}px;
    right: 0;
    clip-path: polygon(0 ${props => props.size}px, 100% 0, 100% 100%, 0 calc(100% - ${props => props.size}px));
`;

const SegmentCenter = Segment.extend`
    top: ${props => props.length + props.padding / 2 - props.size / 2}px;
    left: ${props => props.size / 4}px;
    width: ${props => props.length - props.size / 3}px;
    clip-path: polygon(
        ${props => props.size / 2}px 0%,
        calc(100% - ${props => props.size / 2}px) 0%,
        100% ${props => props.size / 2}px,
        100% calc(100% - ${props => props.size / 2}px),
        calc(100% - ${props => props.size / 2}px) 100%,
        ${props => props.size / 2}px 100%,
        0% calc(100% - ${props => props.size / 2}px),
        0% ${props => props.size / 2}px
    );
`;

const SegmentBottomLeft = SegmentTopLeft.extend`
    top: auto;
    bottom: ${props => props.padding / 2}px;
`;

const SegmentBottomRight = SegmentTopRight.extend`
    top: auto;
    bottom: ${props => props.padding / 2}px;
`;

const SegmentBottom = SegmentTop.extend`
    top: auto;
    bottom: 0;
    clip-path: polygon(${props => props.size}px 0%, calc(100% - ${props => props.size}px) 0%, 100% 100%, 0% 100%);
`;

interface ISevenSegmentDisplayProps {
    char: string;
    size?: number;
    length?: number;
    padding?: number;
    key?: any;
}

export const renderMap = {
    0: 0b01110111,
    1: 0b00100100,
    2: 0b01011101,
    3: 0b01101101,
    4: 0b00101110,
    5: 0b01101011,
    6: 0b01111011,
    7: 0b00100101,
    8: 0b01111111,
    9: 0b01101111,
    A: 0b00111111,
    B: '8',
    C: 0b01010011,
    D: '0',
    E: 0b01011011,
    F: 0b00011011,
    G: '6',
    H: 0b00111110,
    I: '1',
    J: '7',
    K: 'H',
    L: 0b01010010,
    M: 0b00110111,
    N: 'M',
    O: '0',
    P: 0b00011111,
    Q: '0',
    R: 'A',
    S: '5',
    T: 0b00010011,
    U: 0b01110110,
    V: 'U',
    W: 'U',
    X: 'H',
    Y: 0b00011110,
    Z: '2',
    ' ': 0b00000000,
    '-': 0b00001000
};

const getRenderMask = (char: string): number => {
    let mapped = renderMap[char];
    if(!mapped){
        return 0;
    }
    while(typeof mapped === 'string'){
        mapped = renderMap[mapped];
    }
    return mapped;
}

export const SevenSegmentDisplay: React.StatelessComponent<ISevenSegmentDisplayProps> = ({ char, size = 3, length = 9, padding = 1 }) => {
    const styleProps = { size, length, padding };

    const renderMask = getRenderMask(char);

    return (
        <SegmentContainer {...styleProps}>
            <SegmentTop active={(renderMask & 0b00000001) > 0} isHorizontal {...styleProps}/>
            <SegmentTopLeft active={(renderMask & 0b00000010) > 0} {...styleProps}/>
            <SegmentTopRight active={(renderMask & 0b00000100) > 0} {...styleProps}/>
            <SegmentCenter active={(renderMask & 0b00001000) > 0} isHorizontal {...styleProps}/>
            <SegmentBottomLeft active={(renderMask & 0b00010000) > 0} {...styleProps}/>
            <SegmentBottomRight active={(renderMask & 0b00100000) > 0} {...styleProps}/>
            <SegmentBottom active={(renderMask & 0b01000000) > 0} isHorizontal {...styleProps}/>
        </SegmentContainer>
    );
}

const SevenSegmentDisplayArrayContainer = styled.div`
    background: #000;
    display: inline-block;

    ${SegmentContainer} {
        margin: 1px;
    }
`;

export const SevenSegmentDisplayArray: React.StatelessComponent<any> = ({ string = '000', displayCount = 3 }) => {
    const segments = string.slice(string.length - displayCount).split('');

    return (
        <SevenSegmentDisplayArrayContainer>
            {new Array(displayCount).fill(null).map((_, i) =>
                <SevenSegmentDisplay key={i} char={segments[i]}/>
            )}
        </SevenSegmentDisplayArrayContainer>
    );
}

export const formatNumberForDisplayArray = (number: number, displayCount: number = 3): string => {
    let text = number.toString().padStart(displayCount, '0');
    if(number < 0){
        text = '-' + text.slice(1);
    }
    return text;
};

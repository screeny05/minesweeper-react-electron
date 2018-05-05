import * as React from 'react';

interface IAlertProps {
    message: string;
}

export class Alert extends React.PureComponent<IAlertProps> {
    render(){
        return (
            <div style={{ background: '#f00', color: '#fff', padding: '6px 4px' }}>
                {this.props.message}
            </div>
        );
    }
}

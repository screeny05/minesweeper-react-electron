import * as React from 'react';

interface AlertProps {
    message: string;
}

export class Alert extends React.Component<AlertProps, any> {
    render(){
        return (
            <div style={{ background: '#f00', color: '#fff', padding: '6px 4px' }}>
                {this.props.message}
            </div>
        );
    }
}

import React, { Component } from 'react';
import ReceiveEmoDt from '../components/ReceiveEmoDt';

class ReceiveEmoList extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Received Equipment Movement Order List</p></h3>
                </div>

                <div className="card-body">
                    <ReceiveEmoDt />
                </div>
            </div>

        );
    }
}

export default ReceiveEmoList;
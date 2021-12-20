import React, { Component } from 'react';
import EmoDt from '../components/EmoDt';

class EmoList extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Emo List</p></h3>
                </div>

                <div className="card-body">
                    <EmoDt />
                </div>
            </div>

        );
    }
}

export default EmoList;
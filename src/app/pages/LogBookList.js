import React, { Component } from 'react';
import LogBookDt from '../components/LogBookDt';

class LogBookList extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Log Book List</p></h3>
                </div>

                <div className="card-body">
                    <LogBookDt />
                </div>
            </div>
        );
    }
}

export default LogBookList;
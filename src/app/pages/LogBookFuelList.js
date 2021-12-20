import React, { Component } from 'react';
import LogBookFuelDt from '../components/LogBookFuelDt';

class LogBookFuelList extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Log Book Fuel List</p></h3>
                </div>

                <div className="card-body">
                    <LogBookFuelDt />
                </div>
            </div>
        );
    }
}

export default LogBookFuelList;
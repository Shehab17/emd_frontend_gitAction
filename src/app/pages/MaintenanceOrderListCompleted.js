import React, { Component } from 'react';
import MaintenanceOrderCompletedDt from '../components/MaintenanceOrderCompletedDt';

class MaintenanceOrderListCompleted extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Completed Maintenance Order List</p></h3>
                </div>

                <div className="card-body">
                    <MaintenanceOrderCompletedDt />
                </div>
            </div>
        );
    }
}

export default MaintenanceOrderListCompleted;
import React, { Component } from 'react';
import MaintenanceOrderOngoingDt from '../components/MaintenanceOrderOngoingDt';

class MaintenanceOrderListOngoing extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Ongoing Maintenance Order List</p></h3>
                </div>

                <div className="card-body">
                    <MaintenanceOrderOngoingDt />
                </div>
            </div>
        );
    }
}

export default MaintenanceOrderListOngoing;
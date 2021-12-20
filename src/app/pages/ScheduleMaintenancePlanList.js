import React, { Component } from 'react';
import ScheduleMaintenancePlanDt from '../components/ScheduleMaintenancePlanDt';

class ScheduleMaintenancePlanList extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Schedule Maintenance Plan List</p></h3>
                </div>

                <div className="card-body">
                    <ScheduleMaintenancePlanDt />
                </div>
            </div>
        );
    }
}

export default ScheduleMaintenancePlanList;
import React, { Component } from 'react';
import EquipmentEmiSetupDt from '../components/EquipmentEmiSetupDt';

class EquipmentEmiSetupList extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Equipment EMI Setup List</p></h3>
                </div>

                <div className="card-body">
                    <EquipmentEmiSetupDt />
                </div>
            </div>

        );
    }
}

export default EquipmentEmiSetupList;
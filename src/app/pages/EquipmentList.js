import React, { Component } from 'react';
import EquipmentDt from '../components/EquipmentDt';

class EquipmentList extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Equipment List</p></h3>
                </div>

                <div className="card-body">
                    <EquipmentDt />
                </div>
            </div>

        );
    }
}

export default EquipmentList;
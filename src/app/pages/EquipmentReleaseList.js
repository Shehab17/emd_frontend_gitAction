import React, { Component } from 'react';
import EquipmentReleaseDt from '../components/EquipmentReleaseDt';

class EquipmentReleaseList extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Equipment Release Order List</p></h3>
                </div>

                <div className="card-body">
                    <EquipmentReleaseDt />
                </div>
            </div>

        );
    }
}

export default EquipmentReleaseList;
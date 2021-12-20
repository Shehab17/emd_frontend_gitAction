import React, { Component } from 'react';
import BillingPolicyDt from '../components/BillingPolicyDt';

class BillingPolicyList extends Component {
    state = {}
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Billing Policy List</p></h3>
                </div>

                <div className="card-body">
                    <BillingPolicyDt />
                </div>
            </div>

        );
    }
}

export default BillingPolicyList;
import React, { Component } from 'react';
import BillingPolicyCreate from '../components/BillingPolicyCreate';

class BillingPolicy extends Component {

    constructor(props) {
        super(props);
        this.state = {
            policyName: "",
            policyDescription: "",
            items: [{ entityName: "", type: "percentage", percent: "", idBillingParameter: "", value: "" }],
        };
    }

    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Billing Policy Setup</p></h3>
                </div>

                <div className="card-body">
                    <BillingPolicyCreate />
                </div>
            </div>

        );
    }
}

export default BillingPolicy;
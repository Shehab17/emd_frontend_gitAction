import React, { Component } from 'react';
import { getGetRequestOptions } from "../components/GetToken";

class BillingPolicyDetails extends Component {
    state = {
        idBillingPolicy: "",
        details: {
            policyName: "",
            policyDescription: "",
            billing_policy_details: [],
        },
    }

    componentDidMount() {
        const {
            params: { id }
        } = this.props.match;

        this.setState({ idBillingPolicy: this.props.match.params.id });
        this.getBillingPolicyDetails(id);
    }

    getBillingPolicyDetails(idBillingPolicy) {
        fetch(process.env.REACT_APP_API_URL + "billing_policy/policy_details/" + idBillingPolicy,         
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ details: resp });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }
    render() {
        return (
            <div className="card card-custom">
                <div className="card-header">
                    <div className="card-title">
                        <h3 className="card-label">
                            Billing Policy Name #{this.state.details.policyName}
                        </h3>
                    </div>
                </div>

                <div className="card-body">
                    <div className="col-10">
                        <table className="table table-bordered table-hover">

                            <tbody>
                                <tr>
                                    <th>Policy Name</th>
                                    <td>{this.state.details.policyName}</td>
                                </tr>
                                <tr>
                                    <th>Policy Description</th>
                                    <td>{this.state.details.policyDesc}</td>
                                </tr>
                                <tr>
                                    <th>Status</th>
                                    <td><span className={this.state.details.status === 'active' ? 'kt-badge kt-badge--inline kt-badge--primary' : 'kt-badge kt-badge--inline kt-badge--success'}>{this.state.details.status}</span></td>
                                </tr>
                                <tr>
                                    <th>Create Date</th>
                                    <td>{this.state.details.createDate}</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                    <div className="col-12">
                        <table className="table table-bordered table-checkable" id="kt_datatable">
                            <thead>
                                <tr>
                                    <th>SL</th>
                                    <th>Entity Name</th>
                                    <th>Type</th>
                                    <th>Percent</th>
                                    <th>Parameter Name</th>
                                    <th>Value</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    this.state.details.billing_policy_details.map((item, index) =>
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.entityName}</td>
                                            <td>{item.type}</td>
                                            <td>{item.percentage} </td>
                                            <td>{item.parameterName}</td>
                                            <td>{item.value}</td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        );
    }
}

export default BillingPolicyDetails;
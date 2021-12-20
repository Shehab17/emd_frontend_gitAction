import React, { Component } from 'react';
import BillingParameterDt from "../components/BillingParameterDt";

class BillingParameter extends Component {
    state = { id: "", name: "", value: "" }

    constructor(props) {
        super(props);
        this.state = { newBillingParameter: "", id: "", name: "" }
    }
    onCreate = (newBillingParameter) => {
        console.log(newBillingParameter);
        this.setState({ newBillingParameter: newBillingParameter });
    }
    onAction = (id, name) => {
        console.log(name);
        this.setState({ id: id, name: name });
    }


    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Billing Parameter</p></h3>
                </div>

                <div className="card-body">
                    <BillingParameterDt addnewBillingParameter={this.state.newBillingParameter} onAction={this.onAction} />
                </div>

            </div >
        );
    }
}

export default BillingParameter;
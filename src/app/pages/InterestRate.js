import React, { Component } from 'react';
import InterestRateCreate from '../components/InterestRateCreate';
import InterestRateDt from '../components/InterestRateDt';
class InterestRate extends Component {

    constructor(props) {
        super(props);
        this.state = { newInterestRate: "", rate: "", effectiveDate: "", wacc: "", }
    }
    onCreate = (newInterestRate) => {
        this.setState({ newInterestRate: newInterestRate });
    }
    onAction = (id, rate, effectiveDate, wacc) => {
        this.setState({ id: id, rate: rate, effectiveDate: effectiveDate, wacc: wacc });
    }
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary"> Interest Rate Setup</p></h3>
                </div>

                <div className="card-body">
                    <InterestRateCreate onCreate={this.onCreate} id={this.state.id} rate={this.state.rate} effectiveDate={this.state.effectiveDate} wacc={this.state.wacc} />
                </div>

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Interest Rate List</p></h3>
                </div>
                <div className="card-body">
                    <InterestRateDt addnewInterestRate={this.state.newInterestRate} onAction={this.onAction} />
                </div>

            </div >

        );
    }
}

export default InterestRate;
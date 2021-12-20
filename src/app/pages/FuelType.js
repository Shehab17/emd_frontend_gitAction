import React, { Component } from 'react';
import FuelTypeDt from '../components/FuelTypeDt';
import FuelTypeCreate from '../components/FuelTypeCreate';

class FuelType extends Component {

    constructor(props) {
        super(props);
        this.state = { newFuelType: "", type: "" }
    }
    onCreate = (newFuelType) => {
        console.log(newFuelType);
        this.setState({ newFuelType: newFuelType });
    }
    onAction = (id, type) => {
        console.log(type);
        this.setState({ id: id, type: type });
    }
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary"> Fuel Type</p></h3>
                </div>
                <div className="card-body">
                    <FuelTypeCreate onCreate={this.onCreate} id={this.state.id} type={this.state.type} />
                </div>
                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary"> Fuel Type List</p></h3>
                </div>
                <div className="card-body">
                    <FuelTypeDt addnewFuelType={this.state.newFuelType} onAction={this.onAction} />
                </div>
            </div >

        );
    }
}

export default FuelType;
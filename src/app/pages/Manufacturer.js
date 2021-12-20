import React, { Component } from 'react';
import ManufacturerCreate from '../components/ManufacturerCreate';
import ManufacturerDt from '../components/ManufacturerDt';

class Manufacturer extends Component {

    constructor(props) {
        super(props);
        this.state = { newManufacturer: "", id: "", name: "" }
    }
    onCreate = (newManufacturer) => {
        console.log(newManufacturer);
        this.setState({ newManufacturer: newManufacturer });
    }
    onAction = (id, name) => {
        console.log(name);
        this.setState({ id: id, name: name });
    }
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary"> Manufacturer Manage</p></h3>
                </div>

                <div className="card-body">
                    <ManufacturerCreate onCreate={this.onCreate} id={this.state.id} name={this.state.name} />
                </div>

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary"> Manufacturer List</p></h3>
                </div>
                <div className="card-body">
                    <ManufacturerDt addnewManufacturer={this.state.newManufacturer} onAction={this.onAction} />
                </div>

            </div >

        );
    }
}

export default Manufacturer;
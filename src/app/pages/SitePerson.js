import React, { Component } from 'react';
import SitePersonCreate from '../components/SitePersonCreate';
import SitePersonDt from '../components/SitePersonDt';

class SitePerson extends Component {

    constructor(props) {
        super(props);
        this.state = { newSitePerson: "", id: "", name: "" }
    }
    onCreate = (newSitePerson) => {
        console.log(newSitePerson);
        this.setState({ newSitePerson: newSitePerson });
    }
    onAction = (id, name) => {
       
        this.setState({ id: id, name: name });
    }
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary"> Site Person Manage</p></h3>
                </div>

                <div className="card-body">
                    <SitePersonCreate onCreate={this.onCreate} id={this.state.id} name={this.state.name} />
                </div>

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary"> Site Person List</p></h3>
                </div>
                <div className="card-body">
                    <SitePersonDt addnewSitePerson={this.state.newSitePerson} onAction={this.onAction} />
                </div>

            </div >

        );
    }
}

export default SitePerson;
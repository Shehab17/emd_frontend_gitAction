import React, { Component } from 'react';
import ProjectLocationCreate from '../components/ProjectLocationCreate';
import ProjectLocationDt from '../components/ProjectLocationDt';
class ProjectLocation extends Component {

    constructor(props) {
        super(props);
        this.state = { newProjectLocation: "", businessUnit: "", name: "", details: "", status: "" }
    }
    onCreate = (newProjectLocation) => {
        this.setState({ newProjectLocation: newProjectLocation });
    }
    onAction = (id, name, businessUnit, details, status) => {
        this.setState({ id: id, name: name, businessUnit: businessUnit, details: details, status: status });
    }
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Project Location Setup</p></h3>
                </div>

                <div className="card-body">
                    <ProjectLocationCreate onCreate={this.onCreate} id={this.state.id} name={this.state.name} businessUnit={this.state.businessUnit} details={this.state.details} status={this.state.status} />
                </div>

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Project Location List</p></h3>
                </div>
                <div className="card-body">
                    <ProjectLocationDt addnewProjectLocation={this.state.newProjectLocation} onAction={this.onAction} />
                </div>

            </div >

        );
    }
}

export default ProjectLocation;
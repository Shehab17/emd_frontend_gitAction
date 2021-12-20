import React, { Component } from 'react';
import ProjectBillingPolicyCreate from '../components/ProjectBillingPolicyCreate';
import ProjectBillingPolicyDt from '../components/ProjectBillingPolicyDt';

class ProjectBillingPolicy extends Component {

    constructor(props) {
        super(props);
        this.state = { newProjectBillingPolicy: "", id: "", policy: "" }
    }
    onCreate = (newProjectBillingPolicy) => {
        console.log(newProjectBillingPolicy);
        this.setState({ newProjectBillingPolicy: newProjectBillingPolicy });
    }
    onAction = (id, policy) => {
       
        this.setState({ id: id, policy: policy });
    }
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Project Billing Policy Setup</p></h3>
                </div>

                <div className="card-body">
                    <ProjectBillingPolicyCreate onCreate={this.onCreate} id={this.state.id} policy={this.state.policy} />
                </div>

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Project Billing Policy List</p></h3>
                </div>
                <div className="card-body">
                    <ProjectBillingPolicyDt addnewProjectBillingPolicy={this.state.newProjectBillingPolicy} onAction={this.onAction} />
                </div>

            </div >

        );
    }
}

export default ProjectBillingPolicy;
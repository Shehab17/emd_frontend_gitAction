import React, { Component } from 'react';
import { Tab, Tabs } from "react-bootstrap";
import PageAssign from '../components/PageAssign';
import RoleManagementCreate from '../components/RoleManagementCreate';
import RoleManagementDt from '../components/RoleManagementDt';
class RoleManagement extends Component {

    constructor(props) {
        super(props);
        this.state = { newRoleManagement: "", roleName: "", details: "", activeStatus: "", }
    }
    onCreate = (newRoleManagement) => {
        this.setState({ newRoleManagement: newRoleManagement });
    }
    onAction = (id, roleName, details, activeStatus) => {
        this.setState({ id: id, roleName: roleName, details: details, activeStatus: activeStatus });
    }
    render() {
        return (
            <div className="card card-custom">
                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Role Management</p></h3>
                </div>
                <div className="card-body">
                    <Tabs defaultActiveKey="create-role" id="uncontrolled-tab-example">
                        <Tab eventKey="create-role" title="Create Role">

                            <RoleManagementCreate onCreate={this.onCreate} id={this.state.id} roleName={this.state.roleName} details={this.state.details} activeStatus={this.state.activeStatus} />

                            <div className="card-header">
                                <h3 className="card-title"><p className="text-primary">Role Management List</p></h3>
                            </div>
                            <div className="card-body">
                                <RoleManagementDt addNewRoleManagement={this.state.newRoleManagement} onAction={this.onAction} />
                            </div>
                        </Tab>
                        <Tab eventKey="page-assign" title="Page Assign">
                            <PageAssign />
                        </Tab>
                    </Tabs>
                </div>
            </div >

        );
    }
}

export default RoleManagement;
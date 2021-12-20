import React, { Component } from 'react';
import MaintenanceTeamCreate from '../components/MaintenanceTeamCreate';
import MaintenanceTeamDt from '../components/MaintenanceTeamDt';
class MaintenanceTeam extends Component {

    constructor(props) {
        super(props);
        this.state = { newMaintenanceTeam: "", teamId: "", teamName: "", teamMembers: "" }
    }
    onCreate = (newMaintenanceTeam) => {
        this.setState({ newMaintenanceTeam: newMaintenanceTeam });
    }
    onAction = (teamId, teamName, teamMembers) => {
        this.setState({ teamId: teamId, teamName: teamName, teamMembers: teamMembers });
    }
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary"> Maintenance Team</p></h3>
                </div>

                <div className="card-body">
                    <MaintenanceTeamCreate onCreate={this.onCreate} teamId={this.state.teamId} teamName={this.state.teamName} teamMembers={this.state.teamMembers} />
                </div>

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Maintenance Team List</p></h3>
                </div>
                <div className="card-body">
                    <MaintenanceTeamDt addnewMaintenanceTeam={this.state.newMaintenanceTeam} onAction={this.onAction} />
                </div>

            </div >

        );
    }
}

export default MaintenanceTeam;
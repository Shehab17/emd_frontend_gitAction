import React, { Component } from 'react';
import { Tab, Tabs } from "react-bootstrap";
import { getGetRequestOptions } from "../components/GetToken";

class ScheduleMaintenancePlanDetails extends Component {
    state = {
        schedulePlanId: "",
        equipment: {},
        planName:"",
        triggerBy:"",
        scheduleType:"",
        intervalType:"",
        startingIndicator:"",
        endingMark:"",
        periodInterval:"",
        multipliedBy:"",
        triggerType:"",
        equipmentScheduleMaint:{
            parts:{},
            operations:{},
        },

    }

    componentDidMount() {
        const {
            params: { schedulePlanId }
        } = this.props.match;

        this.setState({ schedulePlanId: this.props.match.params.schedulePlanId });
        this.getEquipmentScheduleMaintenanceDetails(schedulePlanId);
    }

    getEquipmentScheduleMaintenanceDetails(schedulePlanId) {
        fetch(process.env.REACT_APP_API_URL + "equipment_schedule_maint/details/" + schedulePlanId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ 
            
                equipment: resp.equipment,
                planName:resp.planName,
                triggerBy:resp.triggerBy,
                scheduleType:resp.scheduleType,
                intervalType:resp.intervalType,
                startingIndicator:resp.startingIndicator,
                endingMark:resp.endingMark,
                periodInterval:resp.periodInterval,
                multipliedBy:resp.multipliedBy,
                triggerType:resp.triggerType,
                equipmentScheduleMaint: resp.equipment_schedule_maint,         
            });
            if(this.state.scheduleType === "periodic_schedule"){
                this.setState({tab:resp.equipment_schedule_maint[0].triggerAt});
            }
            
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    setTab = (tabName) => {
		this.setState({ tab: tabName });
	}

    render() {

        return (
            <div className="card card-custom">
                <div className="card-header">
                    <div className="card-title">
                        <h3 className="card-label">
                            Schedule Maintenance for Equipment  #{this.state.equipment.equipmentName}
                        </h3>
                    </div>
                </div>

                <div className="card-body">
                    <div className="row">
                        <div className="col-6">
                                <table className="table table-bordered table-hover">

                                <tbody>
                                    <tr>
                                        <th>Equipment</th>
                                        <td>{this.state.equipment.equipmentName}</td>
                                    </tr>
                                    <tr>
                                        <th>Plan Name</th>
                                        <td>{this.state.planName}</td>
                                    </tr>
                                    <tr>
                                        <th>Trigger By</th>
                                        <td>{this.state.triggerBy === "running_hour" ? "Running Hour" : "Total Distance"}</td>
                                    </tr>
                                    <tr>
                                        <th>Schedule type</th>
                                        <td>{this.state.scheduleType === "fixed_schedule" ? "Fixed Schedule" : "Periodic Schedule"}</td>
                                    </tr>
                                    {this.state.scheduleType === "fixed_schedule" &&
                                        <tr>
                                            <th>Trigger At</th>
                                            <td>{this.state.equipmentScheduleMaint[0].triggerAt} {this.state.triggerType}</td>
                                        </tr>
                                    }
                                    {this.state.scheduleType === "periodic_schedule" && 
                                        <>
                                        <tr>
                                            <th>Interval Type</th>
                                            <td>{this.state.intervalType}</td>
                                        </tr>
                                        {this.state.intervalType === "interval" &&
                                            <tr>
                                                <th>Period Interval</th>
                                                <td>{this.state.periodInterval} {this.state.triggerType}</td>
                                            </tr>
                                        }
                                        {this.state.intervalType === "multiply" &&
                                            <tr>
                                                <th>Multiplied By</th>
                                                <td>{this.state.multipliedBy}</td>
                                            </tr>
                                        }
                                        <tr>
                                            <th>Starting Indicator</th>
                                            <td>{this.state.startingIndicator} {this.state.triggerType}</td>
                                        </tr>
                                        
                                        <tr>
                                            <th>Ending Mark</th>
                                            <td>{this.state.endingMark} {this.state.triggerType}</td>
                                        </tr>
                                        </>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {this.state.scheduleType === "fixed_schedule" && 
                    <div className="col-12 mt-10">
                        <Tabs defaultActiveKey="parts" id="uncontrolled-tab-example">
                            <Tab eventKey="parts" title="Parts">

                                <table className="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th>SL</th>
                                            <th style={{ 'width': '30%' }}>Item</th>
                                            <th>Unit</th>
                                            <th>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.equipmentScheduleMaint[0].parts.map((item, index) =>
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.item.itemName}</td>
                                                    <td>{item.item.unitName}</td>
                                                    <td>{item.quantity}</td>
                                                </tr>
                                            )
                                        }

                                    </tbody>
                                </table>
                            </Tab>

                            <Tab eventKey="operations" title="Operations" >

                                <table className="table table-bordered table-hover">
                                    <thead>
                                        <tr>
                                            <th>SL</th>
                                            <th>Operation Name</th>
                                            <th>Operation Short Desc</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.equipmentScheduleMaint[0].operations.map((operation, index) =>

                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{operation.operationName}</td>
                                                    <td>{operation.operationShortDesc}</td>
                                                </tr>

                                            )
                                        }

                                    </tbody>
                                </table>
                            </Tab>
                        </Tabs>
                    </div>
                    }
                    {this.state.scheduleType ==="periodic_schedule" && this.state.equipmentScheduleMaint !== [] &&
                                
                        <ul className="nav nav-tabs nav-tabs-line nav-bold mt-5 ml-4">
                            {this.state.equipmentScheduleMaint.map((item, index) =>
                                <li key={index} className="nav-item" onClick={() => this.setTab(item.triggerAt)}>
                                    <a style={{'borderBottomWidth':'3px'}} className={`nav-link ${this.state.tab === item.triggerAt && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === `${item.triggerAt}`).toString()} href={() => false}>{`${item.triggerAt} ${this.state.triggerType}`}</a>
                                </li>
                            )}
                        </ul>
                                
                    }

                    {
                    this.state.scheduleType ==="periodic_schedule" && this.state.equipmentScheduleMaint.map((item, index) =>{                                        
                        return ( this.state.tab === item.triggerAt &&
                            <>
                            <div className="ml-6 mt-6">
                                <Tabs defaultActiveKey="parts" id="uncontrolled-tab-example">
                                    <Tab eventKey="parts" title="Parts">
                                        <div className="table-responsive-lg">
                                            <table className="table table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>SL</th>
                                                        <th style={{ 'width': '30%' }}>Item</th>
                                                        <th>Unit</th>
                                                        <th>Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        item.parts.map((j, k) =>
                                                            <tr key={k}>
                                                                <td>{k + 1}</td>
                                                                <td>{j.item.itemName}</td>
                                                                <td>{j.item.unitName}</td>
                                                                <td>{j.quantity}</td>
                                                            </tr>

                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </Tab>

                                    <Tab eventKey="operations" title="Operations" >
                                        <div className="table-responsive-lg">
                                            <table className="table table-bordered table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>SL</th>
                                                        <th>Operation Name</th>
                                                        <th>Operation Short Desc</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        item.operations.map((j, k) =>
                                                            <tr key={k}>
                                                                <td>{k + 1}</td>
                                                                <td>{j.operationName}</td>
                                                                <td>{j.operationShortDesc}</td>
                                                            </tr>
                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </div>
                            </>
                        )}            
                    )}
                </div>
                {/* <pre>
                    {JSON.stringify(this.state, null, 2)}
                </pre> */}
            </div>

        );
    }
}
export default ScheduleMaintenancePlanDetails;
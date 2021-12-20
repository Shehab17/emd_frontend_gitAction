import React, { Component } from 'react';
import { Link } from "react-router-dom";
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const customStylesSelect = {
    control: (provided) => ({
        ...provided,
        height: 'calc(1.35em + 1.1rem + 2px)',
        minHeight: '35px'
    }),
    valueContainer: (provided) => ({
        ...provided,
    })
};

class EquipmentScheduleList extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        equipment:"",
        schedueleList:[],
    }


    componentDidMount() {
        const {...baseState } = this.state;
        this.baseState = baseState;
    }

    getEquipment = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        }
        const projectId = this.state.businessUnit;
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        var url = process.env.REACT_APP_API_URL + "equipment/equipment_search/" + projectId + "?q=" + inputValue;
        setTimeout(() => {
            fetch(url, {
                method: "GET",
                headers: {
                    'content-type': 'application/json',
                    'Authorization': 'Bearer ' + jwt().token
                },
            })
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    const tempArray = resp.data.map(function (element) {
                        element.label = `${element.equipmentName} (${element.equipmentCode})`;
                        element.value = element.equipmentId;
                        return element;
                    });
                    callback(tempArray);
                })
                .catch((error) => {
                    console.log(error, "catch the hoop")
                });
        });
    }

    handleEquipmentChange = equipment => {
        this.setState({ equipment: equipment},()=>this.getScheduleMaintenanceList(this.state.equipment.equipmentId));
    }

    getScheduleMaintenanceList(equipmentId) {
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        fetch(process.env.REACT_APP_API_URL + "schedule_maint_list/" + equipmentId, {
            method: "GET",
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + jwt().token
            },
        })
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                this.setState({ schedueleList: resp });
            })
            .catch((error) => {
                console.log(error, "catch the hoop")
            });

    }

    render() {


        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                                Equipment Schedule List
                            </p>
                        </h3>
                    </div>
                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">
                                <div className="form-group row">
									<label htmlFor="example-text-input" className="col-md-3 col-form-label text-right">Equipment<span className="required text-danger"> *</span></label>
									<div className="col-md-6">
										<AsyncSelect
											value={this.state.equipment}
											defaultOptions
											loadOptions={this.getEquipment}
											placeholder="Select Equipment"
											onChange={this.handleEquipmentChange}
											styles={customStylesSelect}
										/>
									</div>
								</div>
                            </div>
                            {this.state.schedueleList.length > 0 && 
                            <div className="mt-5">
								<div className="table-responsive-lg">
									<table className="table table-bordered table-hover">
										<thead>
											<tr>
												<th>Sl.</th>
												<th>Schedule Name</th>
												<th>Trigger At</th>
												<th>Total Distance</th>
                                                <th>Total Running Hour</th>
                                                <th>Status</th>
                                                <th>Mo No</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{
												this.state.schedueleList.map((item, index) =>
													<tr key={index}>
														<td>{index + 1}</td>
														<td>
															{item.scheduleName}
														</td>
														<td>
															{item.triggerAt}{item.triggerBy === "total_distance" ? " KM": " Hour"}
														</td>
														<td>
                                                            {item.triggerBy === "total_distance" ? item.totalDistance + " KM": ""}

														</td>
														<td>
                                                            {item.triggerBy === "running_hour" && item.totalRunningHour != null ? item.totalRunningHour.split(":")[0] + " Hour" : ""}
                                                        </td>
                                                        <td>
                                                            {item.moNo == null ?
                                                            <button type="button" className="btn btn-primary btn-sm mr-2">Hold</button>    
                                                            :
                                                            <button type="button" className="btn btn-success btn-sm mr-2">Called</button>
                                                            }
                                                        </td>
                                                        <td>{item.moNo}</td>
                                                        <td>
                                                            {item.moNo == null ? 
                                                            <Link to={`/schedule-maintenance-order-create/${item.scheduleMaintId}`}>
                                                                <button className="btn btn-outline-primary btn-sm float-right"><i className="flaticon2-plus"></i>Generate Mo</button>
                                                            </Link>
                                                            : ""
                                                            }
                                                        </td>
													</tr>
												)
											}
										</tbody>
									</table>
								</div>
							</div>
                            }
                        </div>
                        {/* <pre>
							{JSON.stringify(this.state, null, 2)}
						</pre> */}
                    </form>

                </div>



                <ToastContainer />
            </>
        );
    }
}

export default EquipmentScheduleList;
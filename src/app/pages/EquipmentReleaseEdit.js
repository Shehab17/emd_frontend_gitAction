import React, { Component } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";


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

class EquipmentReleaseEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            equipmentReleaseId:"",
            businessUnit: process.env.REACT_APP_EMD_BU_ID,
            fromBu: "",
            emoType: "",
            customer: "",
            remarks: "",
            items: [{ equipment: ""}],
            allBusinessUnits: [],
            releasingDepartmentOption: [],
        }
    }

	componentDidMount() {
        const {
            params: { id }
        } = this.props.match;
        this.setState({equipmentReleaseId: this.props.match.params.id });
		this.getAllBu();
		this.getAllReleasingDepartment();
        this.getEquipmentReleaseEditInfo(id);
	}

    getEquipmentReleaseEditInfo(equipmentReleaseId) {
        fetch(process.env.REACT_APP_API_URL + "equipment/release_edit/" + equipmentReleaseId, 
        getGetRequestOptions())

        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({
                fromBu: {
                    label: resp.projectName,
                    value:resp.projectId
                },
                customer:{
                    label:resp.customer_id != null ? resp.customer.customerName:"",
                    value:resp.customer_id != null ? resp.customer.id_customer:""
                },
                emoType:resp.projectId != null ? "in-house" : "third-party",
                items:resp.equipment_release_details,
				remarks:resp.remarks
            });
            
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

	getAllBu() {
		fetch(process.env.REACT_APP_API_URL + "get_business_units",
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			let tempResp = resp.data.map(function (element) {
				return { ...element, label: element.projectName, value: element.projectId, isdisabled: element.projectName === 'EMD' ? false : true }
			}).filter(e => e.projectId !== process.env.REACT_APP_EMD_BU_ID);
			this.setState({ allBusinessUnits: tempResp });
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});
	}

	getAllReleasingDepartment() {
		fetch(process.env.REACT_APP_API_URL + "releasing_department", 
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			this.setState({ releasingDepartmentOption: resp.data });
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});
	}

	getCustomer = (inputValue, callback) => {

		if (!inputValue) {
			callback([]);

		}
		else {
			var url = process.env.REACT_APP_API_URL + "customer/customer_search?q=" + inputValue;
			setTimeout(() => {
				fetch(url, getGetRequestOptions())
				.then((resp) => {
					return resp.json()
				})
				.then((resp) => {
					const tempArray = resp.data.map(function (element) {
						element.label = `${element.fullName} (${element.mobileNo})`;
						element.value = element.customerId;
						return element;
					});
					callback(tempArray);
				})
				.catch((error) => {
					console.log(error, "catch the hoop")
				});
			});

		}
	}

	getEquipment = (inputValue, callback) => {

		if (!inputValue) {
			callback([]);

		} else {
			var projectId = this.state.fromBu.projectId
			var customerId = this.state.customer.customerId
			if (this.state.emoType === "in-house") {
				var url = process.env.REACT_APP_API_URL + "equipment/received_equipment_search/" + projectId + "?q=" + inputValue;
			}
			else if (this.state.emoType === "third-party") {
				url = process.env.REACT_APP_API_URL + "equipment/received_third_party_equipment_search/" + customerId + "?q=" + inputValue;
			}
			setTimeout(() => {
				fetch(url,getGetRequestOptions())
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
	}

	getProjectLocation = (inputValue, callback) => {
		if (!inputValue) {
			callback([]);

		} else {
			var projectId = this.state.fromBu.value
			var api = process.env.REACT_APP_API_URL + "project_location/"+ projectId +"?q=" + inputValue;
			setTimeout(() => {
				fetch(api, getGetRequestOptions())
				.then((resp) => {
					return resp.json()
				})
				.then((resp) => {
					const tempArray = resp.data.map(function (element) {
						return {
							...element, id: element.locationId, label: `${element.locationName} ( ${element.projectName} )`, value: element.locationId
						}
					});
	
					callback(tempArray);
				})
				.catch((error) => {
					console.log(error, "catch the hoop")
				});
			});
		}
	}

    handleInputOnChange = evt => {
		this.setState({ [evt.target.name]: evt.target.value });
	};

	onReleasingDepartmentChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.idReleasingDepartment = evt.target.value;
			}
			return row;
		})

		this.setState({ items: newItems });
	}

	onReasonChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.reason = evt.target.value;
			}
			return row;
		})

		this.setState({ items: newItems });
	}

	onProjectLocationChange = index => item => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index !== rindex) return row;
			return { ...row, location: item }
		})

		this.setState({ items: newItems });
	}

	onChangeReleaseDate = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.releaseDate = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	handleSubmit = evt => {
		evt.preventDefault();
		Swal.fire({
			title: 'Are you sure?',
			text: "You want to update Equipment Release Order!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
				const formData = {
					businessUnit:this.state.businessUnit,
					fromBu:this.state.fromBu,
					emoType:this.state.emoType,
					customer:this.state.customer,
					items:this.state.items,
					remarks:this.state.remarks,
				};
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
					body: JSON.stringify(formData)
				};

				var apiEnd = "equipment/release_update/"+this.state.equipmentReleaseId;

				fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
					.then((resp) => {
						return resp.json()
					})
					.then((resp) => {
						console.log(resp);

						if (resp.success === true) {

							Swal.fire({
								icon: 'success',
								title: 'Success',
								text: 'Equipment Release Order updated successfully.',
							})
							this.setState(this.baseState);
							this.props.history.push(`/release-equipment-details/${resp.data.idEquipmentRelease}`);
						}
						else {
							//var errorsMessage = "";
							var errorsMessage = [];

							if (resp.errorMessage !== undefined && typeof resp.errorMessage === 'object') {
								var errorsObj = resp.errorMessage;
								Object.keys(errorsObj).forEach(function (value) {
									errorsObj[value].forEach(function (v) {
										errorsMessage.push(v)
										//errorsMessage += '<div>' + v + '</div>';
									});

								});

							} else if (resp.errorMessage !== undefined && (typeof resp.errorMessage === 'string' || resp.errorMessage instanceof String)) {
								//errorsMessage = resp.errorMessage;
								errorsMessage.push(resp.errorMessage);
							} else {
								//errorsMessage = "Something went wrong";
								errorsMessage.push("Something went wrong");
							}
							//console.log(errorsMessage);
							Swal.fire({
								icon: 'error',
								title: resp.heading,
								html: errorsMessage.join('<br>'),
							})
						}


					})
					.catch((error) => {
						console.log(error, "catch the hoop")
					});

			}
		})
	}


	render() {
		const emoType = [
			{ label: 'In House', value: 'in-house' },
			{ label: 'Third party', value: 'third-party' }
		]
		return (
			<>
				<div className="card card-custom">
					<div className="card-header">
						<h3 className="card-title"><p className="text-primary">Equipment Release Order</p></h3>
					</div>

					<form onSubmit={this.handleSubmit}>
						<div className="card-body">
							<div className="col ml-12">

								<div className="form-group row">
									<label htmlFor="example-text-input" className="col-lg-2 col-form-label">Emo Type<span className="required text-danger"> *</span></label>
									<div className="col-lg-6">
										<select className="form-control form-control-sm" id="emoType" name="emoType" value={this.state.emoType} disabled >
											{emoType.map(function (item, id) {
												return <option key={id} value={item.value}>{item.label}</option>
											})
											}
										</select>
									</div>
								</div>
								{this.state.emoType === 'in-house' &&
									<div className="form-group row">
										<label htmlFor="example-text-input" className="col-lg-2 col-form-label">From Business Unit <span className="required text-danger"> *</span></label>
										<div className="col-lg-6">
											<Select
												value={this.state.fromBu}
												options={this.state.allBusinessUnits}
                                                isDisabled={true}
											/>
										</div>
									</div>
								}
								{this.state.emoType === 'third-party' &&
									<div className="form-group row">
										<label htmlFor="example-text-input" className="col-lg-2 col-form-label">Customer <span className="required text-danger"> *</span></label>
										<div className="col-lg-6">
											<AsyncSelect
												value={this.state.customer}
												defaultOptions
												loadOptions={this.getCustomer}
												placeholder="Select Customer"
                                                isDisabled={true}
												styles={customStylesSelect}
											/>
										</div>
									</div>
								}
							</div>
							<div className="mt-5">
								<div className="table-responsive">
									<table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
										<thead>
											<tr>
												<th>Sl. No</th>
												<th>Equipment</th>
												<th>Equipment Code</th>
												<th>Model</th>
												<th>Capitalization Code</th>
												<th>Emo Date</th>
												<th>Receive Date</th>
												<th>Release Date</th>
												<th>Location</th>
												<th>Releasing Department</th>
												<th>Reason</th>
											</tr>
										</thead>
										<tbody>
											{
												this.state.items.map((item, index) =>
													<tr key={index}>
														<td>{index + 1}</td>
														<td style={{ 'minWidth': '250px' }}>
															<AsyncSelect
																key={index}
																value={item.equipment}
																defaultOptions
																loadOptions={this.getEquipment}
																placeholder="Select Equipment"
                                                                isDisabled={true}
															/>
														</td>
														<td>
															{item.equipment.equipmentCode}
														</td>
														<td>
															{item.equipment.model}
														</td>
														<td>
															{item.equipment.capCode}
														</td>
														<td>
															{item.emoDate}
														</td>
														<td>
															{item.receiveDate}
														</td>
														<td>
															<div className="form-group row">
																<div className="col-lg-12">
																	<input className="form-control" type="date" name="releaseDate" id="releaseDate" value={item.releaseDate||""} onChange={this.onChangeReleaseDate(index)} />
																</div>
															</div>
														</td>
														<td style={{ 'minWidth': '250px' }}>
															<AsyncSelect
																value={item.location}
																defaultOptions
																loadOptions={this.getProjectLocation}
																placeholder="Select"
																onChange={this.onProjectLocationChange(index)}
																styles={customStylesSelect}
															/>
														</td>
														<td style={{ 'minWidth': '250px' }}>
															<div className="col-lg-12">
																<select className="form-control" onChange={this.onReleasingDepartmentChange(index)} value={item.idReleasingDepartment || ''}>
																	<option value="">Select Releasing Department</option>
																	{this.state.releasingDepartmentOption.map(item =>
																		<option key={item.idReleasingDepartment} value={item.idReleasingDepartment}>{item.releasingDepartmentName}</option>
																	)}
																</select>
															</div>
														</td>
                                                        <td>
															<div className="col-lg-12" style={{width:"max-content"}}>
																<textarea className="form-control" name="reason" id="reason" value={item.reason ||""} onChange={this.onReasonChange(index)} />
															</div>
														</td>											
													</tr>
												)
											}
										</tbody>
									</table>
								</div>
							</div>
							<div className="ml-12">
								<div className="form-group row">
									<label htmlFor="remarks" className="col-lg-2 col-form-label">Remarks</label>
									<div className="col-lg-6">
										<textarea className="form-control" name="remarks" id="remarks" value={this.state.remarks||""} onChange={this.handleInputOnChange} />
									</div>
								</div>
							</div>

							<div className="card-footer">
								<div className="row">
									<div className="col-4">
									</div>
									<div className="col-6">
										<button type="submit" className="btn btn-success mr-2">Submit</button>
										<button type="reset" className="btn btn-secondary">Cancel</button>
									</div>
								</div>
							</div>
							{/* <pre>
								{JSON.stringify(this.state, null, 2)}
							</pre> */}
						</div>
					</form>
				</div>

				<ToastContainer />
			</>
		);
	}
}

export default EquipmentReleaseEdit;

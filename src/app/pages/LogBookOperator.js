import React, { Component } from 'react';
import SVG from "react-inlinesvg";
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";
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


class LogBookOperator extends Component {
	state = {
		businessUnit: process.env.REACT_APP_EMD_BU_ID,
		logBookBusinessUnit: "",
		equipment: "",
		entryDate: "",
		operatorName: "",
		items: [{ equipmentStatus: "", startingTime: "", endingTime: "", openingOdoReading: "", closingOdoReading: "", workSiteName: "", usedInWork: "" }],
		statusOption: [{ label: 'Running', value: 'running', }, { label: 'Break Down', value: 'break_down' }],
		errors: {
			entryDate: "",
		},
		touched: {
			entryDate: false,
		}
	}

	componentDidMount() {
		const { allBusinessUnits, ...baseState } = this.state;
		this.baseState = baseState;
		this.getAllBu();
	}

	getEquipment = (inputValue, callback) => {

		if (!inputValue) {
			callback([]);

		} else {
			const projectId = this.state.businessUnit;
			var url = process.env.REACT_APP_API_URL + "equipment/equipment_search/" + projectId + "?q=" + inputValue;
						
			setTimeout(() => {
				fetch(url, getGetRequestOptions())
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

	handleEquipmentChange = equipment => {
		this.setState({ equipment: equipment });
	}

	getOperatorName = (inputValue, callback) => {
		if (!inputValue) {
			callback([]);

		}
		else {

			var url = process.env.REACT_APP_API_URL + "search_operator?q=" + inputValue;
			setTimeout(() => {
				fetch(url, getGetRequestOptions())
					.then((resp) => {
						return resp.json()
					})
					.then((resp) => {
						const tempArray = resp.data.map(function (element) {
							element.label = `${element.name} (${element.phone})`;
							element.value = element.id;
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

	getAllBu() {
		fetch(process.env.REACT_APP_API_URL + "get_business_units",
		getGetRequestOptions())
			.then((resp) => {
				return resp.json()
			})
			.then((resp) => {
				let tempResp = resp.data.map(function (element) {
					return { ...element, label: element.projectName, value: element.projectId, isdisabled: element.projectName === 'EMD' ? false : true }
				});
				this.setState({ allBusinessUnits: tempResp });
			})
			.catch((error) => {
				console.log(error, "catch the hoop")
			});

	}

	handleBuChange = logBookBusinessUnit => {
		this.setState({ logBookBusinessUnit: logBookBusinessUnit }, () => {
		});
	}

	handleOperatorNameChange = operatorName => {
		this.setState({ operatorName: operatorName });
	}

	handleInputOnChange = evt => {
		this.setState({ [evt.target.name]: evt.target.value });
		let errors = this.state.errors;
		let touched = this.state.touched;

		if (evt.target.name === "entryDate") {
			touched.entryDate = true;
			if (evt.target.value === "") {
				errors.entryDate = "Date is required!";
			}
			else {
				errors.entryDate = "";
			}
		}
		this.setState({ errors, touched: touched });
	};

	onEquipmentStatusChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.equipmentStatus = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	addItem = () => {
		this.setState({
			items: this.state.items.concat([{ equipmentStatus: "", startingTime: "", endingTime: "", openingOdoReading: "", closingOdoReading: "", workSiteName: "", usedInWork: "" }])
		});
	}

	removeItem = (index) => () => {
		this.setState({
			items: this.state.items.filter((row, rindex) => index !== rindex)
		});
	}

	onOpeningOdoReadingChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.openingOdoReading = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	onClosingOdoReadingChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.closingOdoReading = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	onUsedInWorkChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.usedInWork = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	onWorkSiteNameChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.workSiteName = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	onStartingTimeChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.startingTime = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	onEndingTimeChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.endingTime = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	validateForm = () => {
		let errors = this.state.errors;
		let touched = this.state.touched;
		for (var input in errors) {

			touched[input] = true;

			if (input === "entryDate") {
				if (this.state.entryDate === "") {
					errors.entryDate = "Date is required!";
				}
				else {
					errors.entryDate = "";
				}
			}
		}
		this.setState({ errors, touched: touched });

		if (this.state.errors.entryDate !== "") {
			return false;
		}
		else {
			return true;
		}
	}

	handleSubmit = evt => {
		evt.preventDefault();
		const isValid = this.validateForm();
		if (isValid) {
			Swal.fire({
				title: 'Are you sure?',
				text: "You want to entry this on log book!",
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes',
				cancelButtonText: 'No'
			}).then((result) => {
				if (result.value) {
					const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
					const formData = {
                        businessUnit: process.env.REACT_APP_EMD_BU_ID,
                        logBookBusinessUnit: this.state.logBookBusinessUnit,
                        equipment: this.state.equipment,
                        entryDate: this.state.entryDate,
                        operatorName: this.state.operatorName,
                        items: this.state.items,
                    };
					const requestOptions = {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
						body: JSON.stringify(formData)
					};

					var apiEnd = "log_book/operator_entry";

					fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
					.then((resp) => {
						return resp.json()
					})
					.then((resp) => {
						console.log(resp);

						if (resp.success === true) {
							let successMsg = resp.successMessage;
							Swal.fire({
								icon: 'success',
								title: 'Success',
								text: successMsg,
							})

							this.setState(this.baseState);
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
								text: errorsMessage,
							})
						}
					})
					.catch((error) => {
						console.log(error, "catch the hoop")
					});

				}
			})
		}
	}

	render() {
		const { errors, touched } = this.state;
		return (
			<>
				<div className="card card-custom">
					<div className="card-header">
						<h3 className="card-title">
							<p className="text-primary">
								Log Book Entry (Operator)
							</p>
						</h3>
					</div>

					<form onSubmit={this.handleSubmit}>
						<div className="card-body">
							<div className="ml-12">
								<div className="form-group row">
									<label htmlFor="example-text-input" className="col-lg-2 col-form-label">Business Unit<span className="required text-danger"> *</span></label>
									<div className="col-lg-6">
										<Select
											value={this.state.logBookBusinessUnit}
											onChange={this.handleBuChange}
											options={this.state.allBusinessUnits}
											styles={customStylesSelect}
										/>
									</div>
								</div>
								<div className="form-group row">
									<label htmlFor="example-text-input" className="col-lg-2 col-form-label">Equipment<span className="required text-danger"> *</span></label>
									<div className="col-lg-6">
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
								<div className="form-group row">
									<label htmlFor="entryDate" className="col-lg-2 col-form-label">Date<span className="required text-danger"> *</span></label>
									<div className="col-lg-6">
										<input type="date" name="entryDate" id="entryDate" value={this.state.entryDate} onChange={this.handleInputOnChange} className={`form-control form-control-md ${touched.entryDate === true ? (errors.entryDate === "" ? 'is-valid' : 'is-invalid') : ''}`} />
										<div className="invalid-feedback">{errors.entryDate}</div>
									</div>
								</div>
								<div className="form-group row">
									<label htmlFor="example-text-input" className="col-lg-2 col-form-label">Operator Name<span className="required text-danger"> *</span></label>
									<div className="col-lg-6">
										<AsyncSelect
											value={this.state.operatorName}
											defaultOptions
											loadOptions={this.getOperatorName}
											placeholder="Select Operator Name"
											onChange={this.handleOperatorNameChange}
											styles={customStylesSelect}
										/>
									</div>
								</div>
							</div>
							<div className="mt-5">
								<div className="table-responsive">
									<table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
										<thead>
											<tr>
												<th>Sl.</th>
												<th>Equipment Status</th>
												<th>Starting Time</th>
												<th>Ending Time</th>
												<th>Opening Odometer Reading (Km/hr)</th>
												<th>Closing Odometer Reading (Km/hr)</th>
												<th>Work Site Name</th>
												<th>Used In Work</th>
												<th>Action</th>
											</tr>
										</thead>
										<tbody>
											{
												this.state.items.map((item, index) =>
													<tr key={index}>
														<td>{index + 1}</td>
														<td style={{ minWidth: '150px' }}>
															<select className="form-control form-control-sm" id="equipmentStatus" name="equipmentStatus" value={item.equipmentStatus} onChange={this.onEquipmentStatusChange(index)} >
																<option value="">Select Equipment Status</option>
																{this.state.statusOption.map((item, key) =>
																	<option key={key} value={item.value}>{item.label}</option>
																)}
															</select>
														</td>
														<td>
															<input className="form-control" type="time" name="startingTime" id="startingTime" value={item.startingTime} onChange={this.onStartingTimeChange(index)} />
														</td>
														<td>
															<input className="form-control" type="time" name="endingTime" id="endingTime" value={item.endingTime} onChange={this.onEndingTimeChange(index)} />
														</td>
														<td>
															<input className="form-control" type="number" value={item.openingOdoReading} onChange={this.onOpeningOdoReadingChange(index)} readOnly={item.equipmentStatus === "break_down"}/>

														</td>
														<td>
															<input className="form-control" type="number" value={item.closingOdoReading} onChange={this.onClosingOdoReadingChange(index)} readOnly={item.equipmentStatus === "break_down"}/>
														</td>
														<td>
															<input className="form-control" type="text" value={item.workSiteName} onChange={this.onWorkSiteNameChange(index)} />
														</td>
														<td>
															<input className="form-control" type="text" value={item.usedInWork} onChange={this.onUsedInWorkChange(index)} />
														</td>
														<td>
															<div className="row">
																<div className="col-2">
																	{this.state.items.length > 1 ? <button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removeItem(index)}> <span className="svg-icon svg-icon-md svg-icon-danger">
																		<SVG src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")} />
																	</span></button> : ''}
																</div>
															</div>
														</td>

													</tr>
												)
											}

											<tr>
												<td colSpan="9">
													<div className="form-group row">
														<div className="col-lg-2">
															<button type="button" className="btn btn-outline-primary btn-sm" onClick={this.addItem}>Add New</button>
														</div>
													</div>
												</td>
											</tr>
										</tbody>
									</table>
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
					</form>

				</div>

				<ToastContainer />
			</>
		);
	}
}

export default LogBookOperator;
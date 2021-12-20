import React, { Component } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class EmoReceive extends Component {
	state = {
		receivingBu: "",
		emoDetails: [],
		items: [],
		allBusinessUnits: [],
	}

	componentDidMount() {
		const { allBusinessUnits, ...baseState } = this.state;
		this.baseState = baseState;
		this.getAllBu();
		if(this.props.location.info !== undefined){
			var details = JSON.parse(this.props.location.info.details);
			this.setState({ receivingBu:{projectId:details.receivingBuId,label:details.receivingBu,value:details.receivingBuId},emoDetails:{emoId:details.idEmo,label:details.emoNo,value:details.idEmo, emoNo:details.emoNo}}, () => this.getEquipmentByEmo(details.idEmo));
		}
	}

	handleInputOnChange = evt => {
		this.setState({ [evt.target.name]: evt.target.value });
	};


	handleReceivingBuChange = businessUnit => {
		this.setState({ receivingBu: businessUnit });
		this.setState({ items: [] });
		this.setState({ emoDetails: [] });
	}

	handleEmoChange = emoDetails => {
		this.setState({ emoDetails: emoDetails }, () => this.getEquipmentByEmo(this.state.emoDetails.emoId));
		this.setState({ items: [] });
	}

	getAllBu() {
		fetch(process.env.REACT_APP_API_URL + "get_business_units",
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			let tempResp = resp.data.map(function (element) {
				return { ...element, label: element.projectName, value: element.projectId }
			})
			this.setState({ allBusinessUnits: tempResp });
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});

	}

	getEmo = (inputValue, callback) => {

		if (!inputValue) {
			callback([]);

		} else {
			var projectId = this.state.receivingBu.projectId
			var url = process.env.REACT_APP_API_URL + "emo_receive/emo_search/" + projectId + "?q=" + inputValue;
			setTimeout(() => {
				fetch(url, 
				getGetRequestOptions())
				.then((resp) => {
					return resp.json()
				})
				.then((resp) => {
					const tempArray = resp.data.map(function (element) {
						element.label = `${element.emoNo}`;
						element.value = element.emoId;
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

	getEquipmentByEmo(emoId) {
		fetch(process.env.REACT_APP_API_URL + "emo_receive/equipment/" + emoId, 
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {

			this.setState({ items: resp.data });
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});
	}

	onActionChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.action = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	onChangeReceivingDate = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.receivingDate = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	onChangeRemarks = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.remarks = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

	handleSubmit = evt => {
		evt.preventDefault();
		Swal.fire({
			title: 'Are you sure?',
			text: "You want to Receive this Equipment Movement Order!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
				const formData = {
					receivingBu: this.state.receivingBu,
					emoDetails:this.state.emoDetails,
					items: this.state.items,
				};
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
					body: JSON.stringify(formData)
				};

				var apiEnd = "emo_receive/save";

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
								text: 'Equipment Movement Order received successfully.',
							})
							this.setState(this.baseState);
							this.props.history.push(`/emo-details/${resp.data.id}`);
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

		const actionType = [
			{ label: 'Receive', value: 'received' },
			{ label: 'Deny', value: 'denied' },
		]
		return (
			<>
				<div className="card card-custom">
					<div className="card-header">
						<h3 className="card-title"><p className="text-primary">Emo Received Receipt</p></h3>
					</div>

					<form onSubmit={this.handleSubmit}>
						<div className="card-body">
							<div className="ml-12">
								<div className="form-group row">
									<label htmlFor="example-text-input" className="col-lg-2 col-form-label">Receiving Business Unit<span className="required text-danger">*</span></label>
									<div className="col-lg-6">
										<Select
											value={this.state.receivingBu}
											onChange={this.handleReceivingBuChange}
											options={this.state.allBusinessUnits}
										/>
									</div>
								</div>
								<div className="form-group row">
									<label htmlFor="example-text-input" className="col-lg-2 col-form-label">Emo Select <span className="required text-danger"> *</span></label>
									<div className="col-lg-6">
										<AsyncSelect
											value={this.state.emoDetails}
											defaultOptions
											loadOptions={this.getEmo}
											placeholder="Select Emo"
											onChange={this.handleEmoChange}
										/>
									</div>
								</div>
							</div>
							<div className="mt-5">
								<div className="table-responsive">
									<table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
										<thead>
											<tr>
												<th>Sl. No</th>
												<th>Equipment Code</th>
												<th>Equipment Name</th>
												<th>Model</th>
												<th>Capitalization Code</th>
												<th>Action</th>
												<th>Receiving Date</th>
												<th>Remarks</th>
											</tr>
										</thead>
										{this.state.items.length > 0 ?
											<tbody>
												{
													this.state.items.map((item, index) =>
														<tr key={index}>
															<td>{index + 1}</td>
															<td>
																{item.equipmentCode}
															</td>
															<td>
																{item.equipmentName}
															</td>
															<td>
																{item.model}
															</td>
															<td>
																{item.capCode}
															</td>
															<td>
																<div className="form-group row">
																	<div className="col-12">
																		<select className="form-control" onChange={this.onActionChange(index)} >
																			{actionType.map(function (item, id) {
																				return <option key={id} value={item.value}>{item.label}</option>
																			})
																			}
																		</select>
																	</div>
																</div>
															</td>
															<td>
																<div className="form-group row">
																	<div className="col-lg-12">
																		<input className="form-control" type="date" name="receivingDate" id="receivingDate" value={item.receivingDate} onChange={this.onChangeReceivingDate(index)} />
																	</div>
																</div>

															</td>
															<td>
																<div className="col-lg-12">
																	<textarea className="form-control" name="remarks" id="remarks" value={item.remarks} onChange={this.onChangeRemarks(index)} />
																</div>
															</td>
														</tr>
													)
												}
											</tbody>
											:
											<tbody>
												<tr>
													<td colSpan="8"><p style={{ "textAlign": "center" }}><strong>No Equipment Found</strong></p></td>
												</tr>
											</tbody>
										}
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

export default EmoReceive;
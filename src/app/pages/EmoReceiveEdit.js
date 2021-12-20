import React, { Component } from 'react';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class EmoReceiveEdit extends Component {
	constructor(props) {
        super(props);
		this.state = {
			emoId:"",
			receivingBu: "",
			emoNo:"",
			items: [],
			allBusinessUnits: [],
		}
	}

	componentDidMount() {
		const {
            params: { emoId }
        } = this.props.match;
        this.setState({ emoId: this.props.match.params.emoId });
		this.getAllBu();
		this.getEmoReceiveEditInfo(emoId);
	}

	getEmoReceiveEditInfo(emoId) {
        fetch(process.env.REACT_APP_API_URL + "emo_receive/edit/" + emoId, 
        getGetRequestOptions())

        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({
                receivingBu: resp.receiving_businessunit,
				emoNo: resp.emoNo,
                items: resp.emo_item,
            });

            let items = this.state.items.map(function (element) {
                return { ...element, equipmentCode: element.equipment.equipmentCode, model:element.equipment.model,capCode:element.equipment.capCode}
            });
            this.setState({items:items});
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }


	handleInputOnChange = evt => {
		this.setState({ [evt.target.name]: evt.target.value });
	};


	handleReceivingBuChange = businessUnit => {
		this.setState({ receivingBu: businessUnit });
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
			text: "You want to edit this Equipment Movement Order Receive Receipt!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }            
				const formData = {
					emoId: this.state.emoId,
					receivingBu: this.state.receivingBu,
					emoNo: this.state.emoNo,
					items: this.state.items,
				};
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
					body: JSON.stringify(formData)
				};

				var apiEnd = "emo_receive/update/"+this.state.emoId;

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
								text: 'Equipment Movement Order received updated successfully.',
							})
							this.setState(this.baseState);
							this.props.history.push(`/emo-details/${resp.data.id}`);
						}
						else {
							var errorsMessage = [];

							if (resp.errorMessage !== undefined && typeof resp.errorMessage === 'object') {
								var errorsObj = resp.errorMessage;
								Object.keys(errorsObj).forEach(function (value) {
									errorsObj[value].forEach(function (v) {
										errorsMessage.push(v)
									});

								});

							} else if (resp.errorMessage !== undefined && (typeof resp.errorMessage === 'string' || resp.errorMessage instanceof String)) {
								errorsMessage.push(resp.errorMessage);
							} else {
								errorsMessage.push("Something went wrong");
							}
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
						<h3 className="card-title"><p className="text-primary">Emo Received Receipt Edit</p></h3>
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
											isDisabled={true}
										/>
									</div>
								</div>
								<div className="form-group row">
									<label htmlFor="emoNo" className="col-lg-2 col-form-label" >Emo No<span className="required text-danger"> *</span></label>
									<div className="col-lg-6">
										<input type="text" name="emoNo" id="emoNo" value={this.state.emoNo} className="form-control form-control-sm" readOnly />
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
																{item.equipment.equipmentName}
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
																		<select className="form-control" onChange={this.onActionChange(index)} value={item.action} disabled >
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

export default EmoReceiveEdit;
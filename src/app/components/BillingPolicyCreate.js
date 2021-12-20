import React, { Component } from 'react';
import SVG from "react-inlinesvg";
import { withRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";
import { getGetRequestOptions } from "../components/GetToken";

class BillingPolicyCreate extends Component {

	state = {
		policyName: "",
		policyDescription: "",
		items: [{ entityName: "", type: "percentage", percent: "", idBillingParameter: "", value: "" }],
		allParameters: [],
		errors: {
			policyName: "",
		},
		touched: {
			policyName: false,
		},

	};


	componentDidMount() {
		this.baseState = this.state;
		this.getAllParameter();
	}

	getAllParameter() {
		fetch(process.env.REACT_APP_API_URL + "billing_parameter/parameter_search",
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			this.setState({ allParameters: resp.data });
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});
	}

	handleInputOnChange = evt => {
		this.setState({ [evt.target.name]: evt.target.value });
		let errors = this.state.errors;
		let touched = this.state.touched;
		if (evt.target.name === "policyName") {
			touched.policyName = true;
			if (evt.target.value === "") {
				errors.policyName = "Policy Name is required!";
			}
			else {
				errors.policyName = "";
			}
		}

		this.setState({ errors, touched: touched });
	};


	addPolicyItem = () => {
		this.setState({
			items: this.state.items.concat([{ entityName: "", type: "percentage", percent: "", idBillingParameter: "", value: "" }])
		});
	}

	removePolicyItem = (index) => () => {
		this.setState({
			items: this.state.items.filter((row, rindex) => index !== rindex)
		});
	}


	onItemsNameChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.entityName = evt.target.value;
			}
			return row;
		})

		this.setState({ items: newItems });
	}

	onItemsTypeChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.type = evt.target.value;

				if (row.type === 'percentage') {
					row.value = '';
				}
				if (row.type === 'value') {

					row.percent = '';
					row.idBillingParameter = '';
				}
			}
			return row;
		})

		this.setState({ items: newItems });
	}

	onItemsPercentChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.percent = evt.target.value;
			}
			return row;
		})

		this.setState({ items: newItems });
	}

	onItemsParameterChange = (index) => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index !== rindex) return row;
			return { ...row, idBillingParameter: evt.target.value }
		});
		this.setState({ items: newItems });
	}


	onItemsValueChange = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.value = evt.target.value;
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

			if (input === "policyName") {
				if (this.state.policyName === "") {
					errors.policyName = "Policy Name is required!";
				}
				else {
					errors.policyName = "";
				}
			}
		}
		this.setState({ errors, touched: touched });

		if (this.state.errors.policyName !== "") {
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
				text: "You want to create Billing Policy!",
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes',
				cancelButtonText: 'No'
			}).then((result) => {
				if (result.value) {
					const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
					const formData = {
                        policyName: this.state.policyName,
                        policyDescription: this.state.policyDescription,
                        items: this.state.items,
                    };
					const requestOptions = {
						method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
						body: JSON.stringify(formData)
					};

					fetch(process.env.REACT_APP_API_URL + "billing_policy_create", requestOptions)
						.then((resp) => {
							return resp.json()
						})
						.then((resp) => {
							console.log(resp);

							if (resp.success === true) {

								Swal.fire({
									icon: 'success',
									title: 'Success',
									text: 'Billing Policy Created Successfully.',
								})

								this.setState(this.baseState);
								this.props.history.push(`/billing-policy-details/${resp.data.idBillingPolicy}`);
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
		const { errors, touched, items } = this.state;
		const entityType = [
			{ label: 'Percentage', value: 'percentage' },
			{ label: 'Value', value: 'value' },
		]
		return (
			<>
				<form onSubmit={this.handleSubmit}>
					<div className="ml-12">

						<div className="form-group row">
							<label htmlFor="example-text-input" className="col-lg-2 col-form-label">Policy Name <span className="required text-danger"> *</span></label>
							<div className="col-lg-6">
								<input name="policyName" value={this.state.policyName} type="text" onChange={this.handleInputOnChange} className={`form-control form-control-md ${touched.policyName === true ? (errors.policyName === "" ? 'is-valid' : 'is-invalid') : ''}`} />
								<div className="invalid-feedback">{errors.policyName}</div>
							</div>
						</div>
						<div className="form-group row">
							<label htmlFor="example-textarea-input" className="col-2 col-form-label">Policy Description</label>
							<div className="col-6">
								<textarea className="form-control" name="policyDescription" value={this.state.policyDescription} onChange={this.handleInputOnChange} ></textarea>
							</div>
						</div>
					</div>
					<div className="mt-5"></div>
					<div className="table-responsive-lg">
						<table className="table table-bordered table-hover">
							<thead>
								<tr>
									<th>SL</th>
									<th>Entity Name</th>
									<th style={{ 'width': '20%' }}>Type</th>
									<th>Percent</th>
									<th>Parameter</th>
									<th>Value</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{
									items.map((item, index) =>
										<tr key={index}>
											<td>{index + 1}</td>
											<td><input className="form-control" type="text" value={item.entityName} onChange={this.onItemsNameChange(index)} /></td>
											<td>
												<div className="form-group row">
													<div className="col-10">
														<select className="form-control" onChange={this.onItemsTypeChange(index)} >
															{entityType.map(function (item, id) {
																return <option key={id} value={item.value}>{item.label}</option>
															})
															}
														</select>
													</div>
												</div>
											</td>
											<td>
												<div className="input-group">
													<input className="form-control" readOnly={item.type === "value"} type="number" value={item.percent} onChange={this.onItemsPercentChange(index)} />
													<div className="input-group-append"><span className="input-group-text">%</span></div>

												</div>
											</td>
											<td>
												<div className="form-group row">
													<div className="col-lg-10">
														<select className="form-control" onChange={this.onItemsParameterChange(index)} disabled={item.type === 'value'}>
															<option value="">Select Parameter </option>
															{
																this.state.allParameters.map(function (item, id) {
																	return <option key={id} value={item.idBillingParameter}>{item.parameterName}</option>
																})
															}
														</select>
													</div>
												</div>
											</td>
											<td>
												<textarea className="form-control" readOnly={item.type === "percentage"} value={item.value} onChange={this.onItemsValueChange(index)} ></textarea>
											</td>
											<td>
												<div className="row">
													<div className="col-2">
														{items.length > 1 ? <button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removePolicyItem(index)}> <span className="svg-icon svg-icon-md svg-icon-danger">
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
												<button type="button" className="btn btn-outline-primary btn-sm" onClick={this.addPolicyItem}>Add Item</button>
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
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
				<ToastContainer />
			</>
		);
	}
}
export default withRouter(BillingPolicyCreate);
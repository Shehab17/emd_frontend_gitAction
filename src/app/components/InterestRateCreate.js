import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class InterestRateCreate extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: "",
			rate: "",
			effectiveDate: "",
			wacc: "",
			errors: {
				rate: "",
				effectiveDate: "",
				wacc: "",
			},
			touched: {
				rate: false,
				effectiveDate: false,
				wacc: false,
			}
		};
	}

	componentDidMount() {
		this.baseState = this.state;
	}

	componentDidUpdate(prevProps) {
		if (this.props.id !== prevProps.id) {
			this.getInterestRateDetails(this.props.id);
		}

	}

	getInterestRateDetails(id) {
		fetch(process.env.REACT_APP_API_URL + "interest_rate_details/" + id,
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			this.setState({ id: resp.id, rate: resp.rate, effectiveDate: resp.effective_date, wacc: resp.wacc, errors: { rate: "", effectiveDate: "", wacc: "", } });
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});

	}

	handleInputOnChange = evt => {
		evt.preventDefault();
		this.setState({ [evt.target.name]: evt.target.value });

		let errors = this.state.errors;
		let touched = this.state.touched;
		touched[evt.target.name] = true;

		if (evt.target.name === "rate") {
			if (evt.target.value === "") {
				errors.rate = "Rate is required!";
			}
			else {
				errors.rate = "";
			}
		}
		else if (evt.target.name === "effectiveDate") {
			if (evt.target.value === "") {
				errors.effectiveDate = "Effective Date is required!";
			}
			else {
				errors.effectiveDate = "";
			}
		}
		else if (evt.target.name === "wacc") {
			if (evt.target.value === "") {
				errors.wacc = "Wacc is required!";
			}
			else {
				errors.wacc = "";
			}
		}
		this.setState({ errors, touched: touched });
	};

	validateForm = () => {

		let errors = this.state.errors;
		let touched = this.state.touched;

		for (var input in errors) {

			touched[input] = true;

			if (input === "rate") {
				if (this.state.rate === "") {
					errors.rate = "Rate is required!";
				}
				else {
					errors.rate = "";
				}
			}
			else if (input === "effectiveDate") {
				if (this.state.effectiveDate === "") {
					errors.effectiveDate = "Effective Date is required!";
				}
				else {
					errors.effectiveDate = "";
				}
			}

			else if (input === "wacc") {
				if (this.state.wacc === "") {
					errors.wacc = "Wacc is required!";
				}
				else {
					errors.wacc = "";
				}
			}
		}

		this.setState({ errors, touched: touched });

		if (this.state.errors.rate === "" && this.state.errors.effectiveDate === "" && this.state.errors.wacc === "") {
			return true;
		}
		else {
			return false;
		}
	}

	handleSubmit = evt => {
		evt.preventDefault();
		const isValid = this.validateForm();
		if (isValid) {
			if (this.state.id !== "") {
				var text = 'You want to update this Interest Rate';
			}
			else {
				text = 'You want to create this Interest Rate';
			}
			Swal.fire({
				title: 'Are you sure?',
				text: text,
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes',
				cancelButtonText: 'No'
			}).then((result) => {
				if (result.value) {
					const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
					const formData = {
						id: this.state.id,
						rate: this.state.rate,
						effectiveDate: this.state.effectiveDate,
						wacc: this.state.wacc,
                    };
					const requestOptions = {
						method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
						body: JSON.stringify(formData)
					};
					if (this.state.id !== "") {
						var apiEnd = "interest_rate_update";
					}
					else {
						apiEnd = "interest_rate_create";
					}

					fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
						.then((resp) => {
							return resp.json()
						})
						.then((resp) => {
							console.log(resp);

							if (resp.success === true) {
								if (this.state.id !== "") {
									var successMsg = 'Interest Rate has been updated successfully';
								}
								else {
									successMsg = 'Interest Rate has been created successfully';
								}

								Swal.fire({
									icon: 'success',
									title: 'Success',
									text: successMsg,
								})
								this.setState(this.baseState);
								this.props.onCreate({ id: resp.data.id, rate: resp.data.rate, effectiveDate: resp.data.effectiveDate, wacc: resp.data.wacc });
							}
							else {
								//var errorsMessage = "";
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
				<form onSubmit={this.handleSubmit}>
					<div className="ml-12">
						<div className="form-group row">
							<label className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Rate(%)<span className="required text-danger"> *</span></label>
							<div className="col-lg-6">
								<input type="number" name="rate" value={this.state.rate} onChange={this.handleInputOnChange} placeholder="rate" className={`form-control form-control-sm ${touched.rate === true ? (errors.rate === "" ? 'is-valid' : 'is-invalid') : ''}`} />
								<div className="invalid-feedback">{errors.rate}</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Effective Date<span className="required text-danger"> *</span></label>
							<div className="col-lg-6">
								<input type="date" name="effectiveDate" id="effectiveDate" value={this.state.effectiveDate} onChange={this.handleInputOnChange} className={`form-control form-control-sm ${touched.effectiveDate === true ? (errors.effectiveDate === "" ? 'is-valid' : 'is-invalid') : ''}`} />
								<div className="invalid-feedback">{errors.effectiveDate}</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Wacc<span className="required text-danger"> *</span></label>
							<div className="col-lg-6">
								<input type="number" name="wacc" value={this.state.wacc} onChange={this.handleInputOnChange} placeholder="wacc" className={`form-control form-control-sm ${touched.wacc === true ? (errors.wacc === "" ? 'is-valid' : 'is-invalid') : ''}`} />
								<div className="invalid-feedback">{errors.wacc}</div>
							</div>
						</div>
						<div className="form-group row">
							<div className="col-2"></div>
							<div className="form-group col-3">
								<input type="submit" value={this.state.id !== "" ? 'Update' : 'Save'} className="btn btn-outline-primary btn-sm float-left" data-loading-text="Loading..." />
							</div>
						</div>
					</div>
				</form>
				<ToastContainer />
			</>
		);
	}
}

export default InterestRateCreate;
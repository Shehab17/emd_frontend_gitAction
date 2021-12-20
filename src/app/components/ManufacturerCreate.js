import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class ManufacturerCreate extends Component {
	constructor(props) {
		super(props);
		this.state = {
			id: "",
			name: "",
			errors: {
				name: "",
			},
			touched: {
				name: false
			}
		};
	}

	componentDidMount() {
		this.baseState = this.state;
	}

	componentDidUpdate(prevProps) {
		if (this.props.id !== prevProps.id || this.props.name !== prevProps.name) // Check if it's a new user, you can also use some unique property, like the ID  (this.props.user.id !== prevProps.user.id)
		{

			this.getManufacturerDetails(this.props.id);
		}

	}

	getManufacturerDetails(id) {
		fetch(process.env.REACT_APP_API_URL + "manufacturer_details/" + id,

        getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			this.setState({ id: resp.id, name: resp.name, errors: { name: "" } });
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

		if (evt.target.value === "") {
			errors[evt.target.name] = "Manufacturer Name is required!";
		}
		else {
			errors[evt.target.name] = "";
		}
		this.setState({ errors: errors, touched: touched });


	};

	validateForm = () => {

		let errors = this.state.errors;
		let touched = this.state.touched;
		for (var input in errors) {

			touched[input] = true;

			if (input === "name") {
				if (this.state.name === "") {
					errors.name = "Manufacturer Name is required!";
				}
				else {
					errors.name = "";
				}
			}
		}
		this.setState({ errors, touched: touched });

		if (this.state.errors.name !== "") {
			return false;
		}
		else {
			return true;
		}
	}

	handleSubmit = evt => {
		evt.preventDefault();
		const isValid = this.validateForm();
		var text = "";
		if (isValid) {
			if (this.state.id !== "") {
				text = 'You want to update this Manufacturer';
			}
			else {
				text = 'You want to create this Manufacturer';
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
						name: this.state.name,
                    };
					const requestOptions = {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
						body: JSON.stringify(formData)
					};
					if (this.state.id !== "") {
						var apiEnd = "manufacturer_update";
					}
					else {
						apiEnd = "manufacturer_create";
					}

					fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
						.then((resp) => {
							return resp.json()
						})
						.then((resp) => {
							console.log(resp);

							if (resp.success === true) {
								if (this.state.id !== "") {
									var successMsg = 'Manufacturer has been updated successfully';
								}
								else {
									successMsg = 'Manufacturer has been created successfully';
								}

								Swal.fire({
									icon: 'success',
									title: 'Success',
									text: successMsg,
								})
								this.setState(this.baseState);
								this.props.onCreate({ id: resp.data.id, name: resp.data.name });
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
					<div className="col ml-12">
						<div className="form-group row">
							<label className="col-2 col-form-label" style={{ "textAlign": "center" }}>Manufacturer name<span className="required text-danger"> *</span></label>
							<div className="col-6">
								<input type="text" name="name" value={this.state.name} onChange={this.handleInputOnChange} placeholder="Name" className={`form-control form-control-sm ${touched.name === true ? (errors.name === "" ? 'is-valid' : 'is-invalid') : ''}`} />
								<div className="invalid-feedback">{errors.name}</div>
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

export default ManufacturerCreate;
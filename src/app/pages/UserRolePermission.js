import React, { Component } from 'react';
import SVG from "react-inlinesvg";
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

class UserRolePermission extends Component {
	state = {
		idUsers: "",
		idRoles: "",
		user: "",
		roleInfo: [],

	}

	componentDidMount() {
		const { ...baseState } = this.state;
		this.baseState = baseState;
	}

	getUser = (inputValue, callback) => {

		if (!inputValue) {
			callback([]);

		}
		else {
			var url = process.env.REACT_APP_API_URL + "user_search?q=" + inputValue;
			setTimeout(() => {
				fetch(url,getGetRequestOptions())

				.then((resp) => {
					return resp.json()
				})
				.then((resp) => {
					const tempArray = resp.data.map(function (element) {
						element.label = `${element.fullName} (${element.email})`;
						element.value = element.idUsers;
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

	handleUserChange = user => {
		this.setState({ user: user, idUsers: user.idUsers }, () => this.getRole(this.state.idUsers));
	}

	getRole(idUsers) {
		fetch(process.env.REACT_APP_API_URL + "get_user_roles/" + idUsers,
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			this.setState({ roleInfo: resp.data });
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});

	}

	onRoleChange = (index, idRoles) => {
		const newItems = this.state.roleInfo.map(function (row, rindex) {
			if (index === rindex) {
				if (row.isPermission === 0) {
					row.isPermission = 1;
				}
				else {
					row.isPermission = 0;
				}

			}
			return row;

		});
		this.setState({ roleInfo: newItems, idRoles: idRoles }, () => this.assignRole());
	}

	assignRole() {
		const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
		const formData = {
			idUsers: this.state.idUsers,
			idRoles: this.state.idRoles,
			user: this.state.user,
		};
		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
			body: JSON.stringify(formData)
		};
		fetch(process.env.REACT_APP_API_URL + "set_user_role_permission", requestOptions)
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			console.log(resp);

			if (resp.success === true) {

				Swal.fire({
					position: "top-right",
					icon: "success",
					title: "Role Permission Changed",
					showConfirmButton: false,
					timer: 1500
				});

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
					text: errorsMessage,
				})
			}
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
								User Role Permission
                            </p>
						</h3>
					</div>

					<form onSubmit={this.handleSubmit}>
						<div className="card-body">
							{this.state.user.length !== 0 &&
								<>
									<div>
										<label className="col-lg-12 ml-5" >
											<span className="svg-icon svg-icon-primary menu-icon">
												<SVG src={toAbsoluteUrl("/media/svg/icons/General/User.svg")} /> User : {this.state.user.fullName}
											</span>
										</label>
									</div>
									<div>
										<label className="col-lg-12 ml-5" >
											<span className="svg-icon svg-icon-primary menu-icon">
												<SVG src={toAbsoluteUrl("/media/svg/icons/Clothes/Briefcase.svg")} /> Designation : {this.state.user.designation}
											</span>
										</label>
									</div>
									<div>
										<label className="col-lg-12 ml-5" >
											<span className="svg-icon svg-icon-primary menu-icon">
												<SVG src={toAbsoluteUrl("/media/svg/icons/Devices/Phone.svg")} /> Phone : {this.state.user.phoneNumber}
											</span>
										</label>
									</div>
									<div>
										<label className="col-lg-12 ml-5" >
											<span className="svg-icon svg-icon-primary menu-icon">
												<SVG src={toAbsoluteUrl("/media/svg/icons/Communication/Mail.svg")} /> Email : {this.state.user.email}
											</span>
										</label>
									</div>
								</>
							}
							<div className="form-group row">
								<div className="col-lg-12 mt-5">
									<AsyncSelect
										value={this.state.user}
										defaultOptions
										loadOptions={this.getUser}
										placeholder="Select User"
										onChange={this.handleUserChange}
										styles={customStylesSelect}
									/>
								</div>
							</div>
							{this.state.idUsers !== "" &&
								<div className="mt-10">

									<table className="table table-sm table-hover table-bordered table-condensed">
										<thead>
											<tr className="text-primary" style={{ "textAlign": "center" }}>
												<th>Role</th>
												<th>Permission</th>
											</tr>
										</thead>
										<tbody>
											{
												this.state.roleInfo.map((value, index) =>
													<tr key={index} >
														<td className="text-center">{value.roleName}</td>
														<td style={{ "padding": "0.75rem", "textAlign": "center" }} onClick={() => this.onRoleChange(index, value.idRoles)}>
															{value.isPermission === 1 &&
																<span className="svg-icon svg-icon-3x svg-icon-success">
																	<SVG
																		src={toAbsoluteUrl("/media/svg/icons/Navigation/Check.svg")}
																	/>
																</span>}

															{value.isPermission === 0 &&
																<span className="svg-icon svg-icon-3x svg-icon-danger">
																	<SVG
																		src={toAbsoluteUrl("/media/svg/icons/Navigation/Close.svg")}
																	/>
																</span>
															}
														</td>
													</tr>
												)
											}
										</tbody>
									</table>
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

export default UserRolePermission;
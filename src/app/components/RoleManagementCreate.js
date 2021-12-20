import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class RoleManagementCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            roleName: "",
            details: "",
            activeStatus: "1",
            errors: {
                roleName: "",
            },
            touched: {
                roleName: false,
            }
        };
    }

    componentDidMount() {
        this.baseState = this.state;
    }

    componentDidUpdate(prevProps) {
        if (this.props.id !== prevProps.id) {
            this.getRoleManagementDetails(this.props.id);
        }

    }

    getRoleManagementDetails(id) {
        fetch(process.env.REACT_APP_API_URL + "role_management_details/" + id,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ id: resp.id, roleName: resp.roleName, details: resp.details, activeStatus: resp.activeStatus, errors: { roleName: "" } });
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

        if (evt.target.name === "roleName") {
            if (evt.target.value === "") {
                errors.roleName = "Role Name is required!";
            }
            else {
                errors.roleName = "";
            }
        }
        this.setState({ errors, touched: touched });
    };

    validateForm = () => {
        let errors = this.state.errors;
        let touched = this.state.touched;
        for (var input in errors) {

            touched[input] = true;

            if (input === "roleName") {
                if (this.state.roleName === "") {
                    errors.roleName = "Role Name is required!";
                }
                else {
                    errors.roleName = "";
                }
            }
        }

        this.setState({ errors, touched: touched });
        if (this.state.errors.roleName === "") {
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
                var text = 'You want to update this Role';
            }
            else {
                text = 'You want to create this Role';
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
                        roleName: this.state.roleName,
                        details: this.state.details,
                        activeStatus: this.state.activeStatus,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };
                    if (this.state.id !== "") {
                        var apiEnd = "role_management_update";
                    }
                    else {
                        apiEnd = "role_management_create";
                    }

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {
                                var successMsg = "";
                                if (this.state.id !== "") {
                                    successMsg = 'Role has been updated successfully';
                                }
                                else {
                                    successMsg = 'Role has been created successfully';
                                }

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: successMsg,
                                })
                                this.setState(this.baseState);
                                this.props.onCreate({ id: resp.data.id, roleName: resp.data.roleName, details: resp.data.details, activeStatus: resp.data.activeStatus });
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
        const statusType = [
            { label: 'Inactive', value: 0 },
            { label: 'Active', value: 1 },
        ]
        return (
            <>
                <form onSubmit={this.handleSubmit}>
                    <div className="col ml-12 mt-5">
                        <div className="form-group row">
                            <label className="col-lg-2 col-form-label">Role Name<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <input type="text" name="roleName" value={this.state.roleName} onChange={this.handleInputOnChange} placeholder="Role Name" className={`form-control form-control-sm ${touched.roleName === true ? (errors.roleName === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                <div className="invalid-feedback">{errors.roleName}</div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-lg-2 col-form-label">details</label>
                            <div className="col-lg-6">
                                <input type="text" name="details" id="details" value={this.state.details} onChange={this.handleInputOnChange} className="form-control form-control-sm" />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-lg-2 col-form-label">Active Status<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <select className="form-control" id="activeStatus" name="activeStatus" value={this.state.activeStatus} onChange={this.handleInputOnChange} >
                                    {statusType.map(function (item, id) {
                                        return <option key={id} value={item.value}>{item.label}</option>
                                    })
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-2"></div>
                            <div className="form-group col-3">
                                <input type="submit" value={this.state.id !== "" ? 'Update' : 'Save'} className="btn btn-outline-primary btn-sm float-left" data-loading-text="Loading..." />
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

export default RoleManagementCreate;
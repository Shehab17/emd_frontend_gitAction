import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class FuelTypeCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            type: "",
            errors: {
                type: "",
            },
            touched: {
                type: false
            }
        };
    }

    componentDidMount() {
        this.baseState = this.state;
    }

    componentDidUpdate(prevProps) {
        if (this.props.id !== prevProps.id || this.props.type !== prevProps.type) // Check if it's a new user, you can also use some unique property, like the ID  (this.props.user.id !== prevProps.user.id)
        {

            this.getFuelTypeDetails(this.props.id);
        }

    }

    getFuelTypeDetails(id) {
        fetch(process.env.REACT_APP_API_URL + "fuel_type_details/" + id, 
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ id: resp.id, type: resp.type, errors: { type: "" } });
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
            errors[evt.target.name] = "Fuel Type is required!";
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

            if (input === "type") {
                if (this.state.type === "") {
                    errors.type = "Fuel Type is required!";
                }
                else {
                    errors.type = "";
                }
            }
        }
        this.setState({ errors, touched: touched });

        if (this.state.errors.type !== "") {
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
            if (this.state.id !== "") {
                var text = 'You want to update this Fuel Type';
            }
            else {
                text = 'You want to create this Fuel Type';
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
                        type: this.state.type,
                    };
                    
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };
                    var apiEnd = "";
                    if (this.state.id !== "") {
                        apiEnd = "fuel_type_update";
                    }
                    else {
                        apiEnd = "fuel_type_create";
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
                                    successMsg = 'Fuel Type has been updated successfully';
                                }
                                else {
                                    successMsg = 'Fuel Type has been created successfully';
                                }

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: successMsg,
                                })
                                this.setState(this.baseState);
                                this.props.onCreate({ id: resp.data.id, type: resp.data.type });
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
                            <label className="col-2 col-form-label" style={{ "textAlign": "center" }}> Fuel Type <span className="required text-danger"> *</span></label>
                            <div className="col-6">
                                <input type="text" name="type" value={this.state.type} onChange={this.handleInputOnChange} placeholder="Type" className={`form-control form-control-sm ${touched.type === true ? (errors.type === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                <div className="invalid-feedback">{errors.type}</div>
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

export default FuelTypeCreate;
import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class SitePersonCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            type:"",
            name: "",
            address:"",
            contactNo:"",
            email: "",
            typeOption:[{'label': 'Fuel Officer', value:'fuel_officer'},
            {'label': 'Operator', value:'operator'},
            {'label': 'Site Engineer', value:'site_engineer'},
            ],
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

            this.getSitePersonDetails(this.props.id);
        }

    }

    getSitePersonDetails(id) {
        fetch(process.env.REACT_APP_API_URL + "site_person_details/" + id, 
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ id: resp.id_site_person, name: resp.name, contactNo: resp.phone,email:resp.email, address:resp.address,type: resp.type,errors: { name: "" } });
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
            errors[evt.target.name] = "Site Person Name is required!";
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
                    errors.name = "Site Person Name is required!";
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
        if (isValid) {
            if (this.state.id !== "") {
                var text = 'You want to update this Site Person';
            }
            else {
                text = 'You want to create this Site Person';
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
                        name: this.state.name,
                        address: this.state.address,
                        contactNo: this.state.contactNo,
                        email: this.state.email,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };
                    if (this.state.id !== "") {
                        var apiEnd = "site_person_update";
                    }
                    else {
                        apiEnd = "site_person_create";
                    }

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {
                                if (this.state.id !== "") {
                                    var successMsg = 'Site Person has been updated successfully';
                                }
                                else {
                                    successMsg = 'Site Person has been created successfully';
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
                            <label htmlFor="type" className="col-lg-2 col-form-label"  style={{ "textAlign": "center" }}>Type</label>
                            <div className="col-lg-6">
                                <select className="form-control form-control-sm" id="type" name="type" value={this.state.type} onChange={this.handleInputOnChange} >
                                    <option value="">Select Type</option>
                                    {this.state.typeOption.map((item, key) =>
                                        <option key={key} value={item.value}>{item.label}</option>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label" style={{ "textAlign": "center" }}>Name<span className="required text-danger"> *</span></label>
                            <div className="col-6">
                                <input type="text" name="name" value={this.state.name} onChange={this.handleInputOnChange} placeholder="Name" className={`form-control form-control-sm ${touched.name === true ? (errors.name === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                <div className="invalid-feedback">{errors.name}</div>
                            </div>
                        </div>

                    
                        <div className="form-group row">
                            <label htmlFor="address" className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Address</label>
                            <div className="col-lg-6">
                                <textarea className="form-control form-control-sm" name="address" id="address" value={this.state.address} onChange={this.handleInputOnChange} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="contactNo" className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Contact No</label>
                            <div className="col-lg-6">
                                <input className="form-control form-control-sm" type="number" name="contactNo" id="contactNo" value={this.state.contactNo} onChange={this.handleInputOnChange} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="email" className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Email</label>
                            <div className="col-lg-6">
                                <input className="form-control form-control-sm" type="text" name="email" id="email" value={this.state.email} onChange={this.handleInputOnChange} />
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

export default SitePersonCreate;
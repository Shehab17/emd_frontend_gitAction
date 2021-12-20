import React, { Component } from 'react';
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
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

class ProjectLocationCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            businessUnit: "",
            name: "",
            details: "",
            status: "active",
            errors: {
                name: "",
            },
            touched: {
                name: false
            }
        };
    }

    componentDidMount() {
        const { allBusinessUnits, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllBu();
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

    handleBuChange = businessUnit => {
        this.setState({ businessUnit: businessUnit }, () => {
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.id !== prevProps.id || this.props.name !== prevProps.name) {

            this.getProjectLocationDetails(this.props.id);
        }

    }

    getProjectLocationDetails(id) {
        fetch(process.env.REACT_APP_API_URL + "project_location_details/" + id, 
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ id: resp.id, businessUnit: resp.business_unit, name: resp.name, details: resp.details, status: resp.status, errors: { name: "" } });
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

        if ([evt.target.name] === 'name') {
            if (evt.target.value === "") {
                errors[evt.target.name] = "Location Name is required!";
            }
            else {
                errors[evt.target.name] = "";
            }
            this.setState({ errors: errors, touched: touched });

        }
    };

    validateForm = () => {
        let errors = this.state.errors;
        let touched = this.state.touched;
        for (var input in errors) {

            touched[input] = true;

            if (input === "name") {
                if (this.state.name === "") {
                    errors.name = "Location Name is required!";
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
                var text = 'You want to update this Project Location';
            }
            else {
                text = 'You want to create this project Lcoation';
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
                        businessUnit: this.state.businessUnit,
                        name: this.state.name,
                        details: this.state.details,
                        status: this.state.status,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };
                    if (this.state.id !== "") {
                        var apiEnd = "project_location_update";
                    }
                    else {
                        apiEnd = "project_location_create";
                    }

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {
                                if (this.state.id !== "") {
                                    var successMsg = 'Project Lcoation has been updated successfully';
                                }
                                else {
                                    successMsg = 'Project Lcoation has been created successfully';
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
        const statusType = [
            { label: 'Inactive', value: 'inactive' },
            { label: 'Active', value: 'active' },
        ]
        return (
            <>
                <form onSubmit={this.handleSubmit}>
                    <div className="col ml-12">
                        <div className="form-group row">
                            <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Business Unit<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <Select
                                    value={this.state.businessUnit}
                                    onChange={this.handleBuChange}
                                    options={this.state.allBusinessUnits}
                                    styles={customStylesSelect}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-lg-2 col-form-label" >Location Name<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <input type="text" name="name" value={this.state.name} onChange={this.handleInputOnChange} placeholder="Name" className={`form-control form-control-sm ${touched.name === true ? (errors.name === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                <div className="invalid-feedback">{errors.name}</div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="remarks" className="col-lg-2 col-form-label">Details</label>
                            <div className="col-lg-6">
                                <textarea className="form-control" name="details" id="details" value={this.state.details} onChange={this.handleInputOnChange} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-lg-2 col-form-label">Status<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <select className="form-control" id="status" name="status" value={this.state.status} onChange={this.handleInputOnChange} >
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

export default ProjectLocationCreate;
import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class PageCreate extends Component {
    state = {
        pagesTitle: "",
        pagesLink: "",
        iconPath: "",
        pagesType: "menu",
        isShow: "yes",
        activeStatus: "1",
        sequence: "",
        parentId: "",
        errors: {
            pagesTitle: "",
            pagesLink: "",
            iconPath: "",
            sequence: "",
        },
        touched: {
            pagesTitle: false,
            pagesLink: false,
            iconPath: false,
            sequence: false,
        },
        menuOption: [],
    }

    componentDidMount() {

        const { menuOption, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllMenu();
    }

    handleInputOnChange = evt => {

        this.setState({ [evt.target.name]: evt.target.value });
        let errors = this.state.errors;
        let touched = this.state.touched;
        touched[evt.target.name] = true;

        if (evt.target.name === "pagesTitle") {
            if (evt.target.value === "") {
                errors.pagesTitle = "Page Title is required!";
            }
            else {
                errors.pagesTitle = "";
            }
        }
        else if (evt.target.name === "pagesLink") {
            if (evt.target.value === "") {
                errors.pagesLink = "Page Link is required!";
            }
            else {
                errors.pagesLink = "";
            }
        }
        else if (evt.target.name === "iconPath") {
            if (evt.target.value === "") {
                errors.iconPath = "Icon Path is required!";
            }
            else {
                errors.iconPath = "";
            }
        }
        else if (evt.target.name === "sequence") {
            if (evt.target.value === "") {
                errors.sequence = "Sequence is required!";
            }
            else {
                errors.sequence = "";
            }
        }
        this.setState({ errors, touched: touched });
    };

    getAllMenu() {
        fetch(process.env.REACT_APP_API_URL + "menu",
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ menuOption: resp.data });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    handleSelectParent = parent => {
        this.setState({ parent: parent });
    }

    validateForm = () => {

        let errors = this.state.errors;
        let touched = this.state.touched;

        for (var input in errors) {

            touched[input] = true;

            if (input === "pagesTitle") {
                if (this.state.pagesTitle === "") {
                    errors.pagesTitle = "Page Title is required!";
                }
                else {
                    errors.pagesTitle = "";
                }
            }
            else if (input === "pagesLink") {
                if (this.state.pagesLink === "") {
                    errors.pagesLink = "Page Title is required!";
                }
                else {
                    errors.pagesLink = "";
                }
            }

            else if (input === "iconPath") {
                if (this.state.iconPath === "") {
                    errors.iconPath = "Icon Path is required!";
                }
                else {
                    errors.iconPath = "";
                }
            }

            else if (input === "sequence") {
                if (this.state.sequence === "") {
                    errors.sequence = "Sequence is required!";
                }
                else {
                    errors.sequence = "";
                }
            }
        }

        this.setState({ errors, touched: touched });

        if (this.state.errors.pagesTitle === "" && this.state.errors.pagesLink === "" && this.state.errors.iconPath === "" && this.state.errors.sequence === "") {
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
            Swal.fire({
                title: 'Are you sure?',
                text: 'You want to create this page',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        pagesTitle: this.state.pagesTitle,
                        pagesLink: this.state.pagesLink,
                        iconPath: this.state.iconPath,
                        pagesType: this.state.pagesType,
                        isShow: this.state.isShow,
                        activeStatus: this.state.activeStatus,
                        sequence: this.state.sequence,
                        parentId: this.state.parentId,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };
                    var apiEnd = "page_create";

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
                                text: 'Page created successfully',
                            })
                            this.setState(this.baseState);
                            this.props.history.push('/accesscontrol-pagemanagement');
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
        const pagetype = [
            { label: 'Menu', value: 'menu' },
            { label: 'Sub Menu', value: 'sub-menu' },
        ]
        const show = [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
        ]
        const status = [
            { label: 'Active', value: '1' },
            { label: 'Inactive', value: '0' },
        ]
        return (<>
            <div className="card card-custom">
                <div className="card-header">
                    <h3 className="card-title">
                        <p className="text-primary">
                            Create New Page
						</p>
                    </h3>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <div className="card-body" style={{ "textAlign": "center" }}>
                        <div className="ml-12">
                            <div className="form-group row">
                                <label htmlFor="pagesTitle" className="col-lg-2 col-form-label" >Page Title<span className="required text-danger"> *</span></label>
                                <div className="col-lg-6">
                                    <input type="text" name="pagesTitle" id="pagesTitle" value={this.state.pagesTitle} onChange={this.handleInputOnChange} className={`form-control form-control-sm ${touched.pagesTitle === true ? (errors.pagesTitle === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                    <div className="invalid-feedback">{errors.pagesTitle}</div>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="pagesLink" className="col-lg-2 col-form-label" >Page Link<span className="required text-danger"> *</span></label>
                                <div className="col-lg-6">
                                    <input type="text" name="pagesLink" id="pagesLink" value={this.state.pagesLink} onChange={this.handleInputOnChange} className={`form-control form-control-sm ${touched.pagesLink === true ? (errors.pagesLink === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                    <div className="invalid-feedback">{errors.pagesLink}</div>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="iconPath" className="col-lg-2 col-form-label" >Icon Path<span className="required text-danger"> *</span></label>
                                <div className="col-lg-6">
                                    <input type="text" name="iconPath" id="pageLink" value={this.state.iconPath} onChange={this.handleInputOnChange} className={`form-control form-control-sm ${touched.iconPath === true ? (errors.iconPath === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                    <div className="invalid-feedback">{errors.iconPath}</div>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="pagesType" className="col-lg-2 col-form-label" >Page Type</label>
                                <div className="col-lg-6">
                                    <select className="form-control form-control-sm" id="pagesType" name="pagesType" value={this.state.pagesType} onChange={this.handleInputOnChange} >
                                        {pagetype.map(function (item, id) {
                                            return <option key={id} value={item.value}>{item.label}</option>
                                        })
                                        }
                                    </select>
                                </div>
                            </div>
                            {this.state.pagesType === 'sub-menu' &&
                                <div className="form-group row">
                                    <label htmlFor="parentId" className="col-lg-2 col-form-label" >Parent Title<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <select className="form-control form-control-sm" id="parentId" name="parentId" value={this.state.parentId} onChange={this.handleInputOnChange} >
                                            <option value="">Select Parent</option>
                                            {this.state.menuOption.map(item =>
                                                <option key={item.idPages} value={item.idPages}>{item.pagesTitle}</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            }
                            <div className="form-group row">
                                <label htmlFor="isShow" className="col-lg-2 col-form-label">Show</label>
                                <div className="col-lg-6">
                                    <select className="form-control form-control-sm" id="isShow" name="isShow" value={this.state.isShow} onChange={this.handleInputOnChange} >
                                        {show.map(function (item, id) {
                                            return <option key={id} value={item.value}>{item.label}</option>
                                        })
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="activeStatus" className="col-lg-2 col-form-label" >Active Status</label>
                                <div className="col-lg-6">
                                    <select className="form-control form-control-sm" id="activeStatus" name="activeStatus" value={this.state.activeStatus} onChange={this.handleInputOnChange} >
                                        {status.map(function (item, id) {
                                            return <option key={id} value={item.value}>{item.label}</option>
                                        })
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="sequence" className="col-lg-2 col-form-label" >Sequence<span className="required text-danger"> *</span></label>
                                <div className="col-lg-6">
                                    <input type="number" name="sequence" id="sequence" value={this.state.sequence} onChange={this.handleInputOnChange} className={`form-control form-control-sm ${touched.sequence === true ? (errors.sequence === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                    <div className="invalid-feedback">{errors.sequence}</div>
                                </div>
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
        </>);
    }
}

export default PageCreate;
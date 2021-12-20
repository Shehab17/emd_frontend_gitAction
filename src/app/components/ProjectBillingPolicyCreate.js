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

class ProjectBillingPolicyCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            businessUnit: "",
            policy: "manual",
            status: "active",
        };
    }

    componentDidMount() {
        this.baseState = this.state;
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
                return { ...element, label: element.projectName, value: element.projectId }
            });
            this.setState({ allBusinessUnits: tempResp });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    handleBuChange = businessUnit => {
        this.setState({ businessUnit: businessUnit }, () => { });
    }

    componentDidUpdate(prevProps) {
        if (this.props.id !== prevProps.id || this.props.policy !== prevProps.policy) {

            this.getProjectBillingPolicyDetails(this.props.id);
        }

    }

    getProjectBillingPolicyDetails(id) {
        fetch(process.env.REACT_APP_API_URL + "project_billing_policy_details/" + id,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ id: resp.id, policy: resp.policy, status: resp.status, businessUnit: resp.business_unit });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    handleInputOnChange = evt => {
        evt.preventDefault();
        this.setState({ [evt.target.name]: evt.target.value });
    };

    handleSubmit = evt => {
        evt.preventDefault();
        if (this.state.id !== "") {
            var text = 'You want to update this Project Billing Policy';
        }
        else {
            text = 'You want to create this Project Billing Policy';
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
                    policy: this.state.policy,
                    status: this.state.status,
                };
                
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(formData)
                };

                if (this.state.id !== "") {
                    var apiEnd = "project_billing_policy_update";
                }
                else {
                    apiEnd = "project_billing_policy_create";
                }

                fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                    .then((resp) => {
                        return resp.json()
                    })
                    .then((resp) => {
                        console.log(resp);

                        if (resp.success === true) {
                            if (this.state.id !== "") {
                                var successMsg = 'Project Billing Policy has been updated successfully';
                            }
                            else {
                                successMsg = 'Project Billing Policy has been created successfully';
                            }

                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: successMsg,
                            })
                            this.setState(this.baseState);
                            this.props.onCreate({ id: resp.data.id, policy: resp.data.policy });
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

    render() {
        const statusType = [
            { label: 'Inactive', value: 'inactive' },
            { label: 'Active', value: 'active' },
        ];
        const policyType = [
            { label: 'Manual', value: 'manual' },
            { label: 'Auto', value: 'auto' },
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
                                    isDisabled={this.state.id !== "" }
                                />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-lg-2 col-form-label">Billing Policy<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <select className="form-control" id="policy" name="policy" value={this.state.policy} onChange={this.handleInputOnChange} >
                                    {policyType.map(function (item, id) {
                                        return <option key={id} value={item.value}>{item.label}</option>
                                    })
                                    }
                                </select>
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

export default ProjectBillingPolicyCreate;
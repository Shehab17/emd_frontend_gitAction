import React, { Component } from 'react';
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";


class MaintenanceTeamCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teamId: "",
            teamName: "",
            teamMembers: "",
            errors: {
                teamName: "",
            },
            touched: {
                teamName: false,
            }
        };
    }

    componentDidMount() {
        this.baseState = this.state;
    }

    componentDidUpdate(prevProps) {
        if (this.props.teamId !== prevProps.teamId) {
            this.getTeamDetails(this.props.teamId);
        }

    }

    handleInputOnChange = evt => {
        evt.preventDefault();
        this.setState({ [evt.target.name]: evt.target.value });

        let errors = this.state.errors;
        let touched = this.state.touched;
        touched[evt.target.name] = true;

        if (evt.target.value === "") {
            errors[evt.target.name] = "Team name is required!";
        }
        else {
            errors[evt.target.name] = "";
        }
        this.setState({ errors: errors, touched: touched });


    };

    handleTeamMemberChange = (teamMembers) => {
        this.setState({ teamMembers: teamMembers });
    };

    getTeamDetails(teamId) {
        fetch(process.env.REACT_APP_API_URL + "maintenance_team/details/" + teamId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            let tempResp = resp.members.map(function (element) {
                return { ...element, label: element.employeeName, value: element.employeeId }
            });
            this.setState({
                teamId: resp.teamId,
                teamName: resp.teamName,
                teamMembers: tempResp
            });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }


    fetchData = (inputValue, callback) => {
        if (!inputValue) {
            //callback([]);
            var api = process.env.REACT_APP_API_URL + "get_employee";
        } else {
            api = process.env.REACT_APP_API_URL + "get_employee?q=" + inputValue;
        }

        setTimeout(() => {
            fetch(api,getGetRequestOptions())
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                const tempArray = resp.data.map(function (element) {
                    return { ...element, id: element.employeeId, label: `${element.employeeName} ${element.employeeCode}`, value: element.employeeId }
                });

                callback(tempArray);
            })
            .catch((error) => {
                console.log(error, "catch the hoop")
            });
        });
    }

    onSearchChange = (selectedOption) => {
        if (selectedOption) {

            this.setState({
                selectedOption
            });
        }
    };

    validateForm = () => {
        let errors = this.state.errors;
        let touched = this.state.touched;
        for (var input in errors) {

            touched[input] = true;

            if (input === "teamName") {
                if (this.state.teamName === "") {
                    errors.teamName = "Team Name is required!";
                }
                else {
                    errors.name = "";
                }
            }
        }
        this.setState({ errors, touched: touched });

        if (this.state.errors.teamName !== "") {
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
            if (this.state.teamId !== "") {
                var text = 'You want to update this Team';
            }
            else {
                text = 'You want to create this Team';
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
                        receivteamIdingBu: this.state.teamId,
                        teamName: this.state.teamName,
                        teamMembers: this.state.teamMembers,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };
                    if (this.state.teamId !== "") {
                        var apiEnd = "maintenance_team/update";
                    }
                    else {
                        apiEnd = "maintenance_team/create";
                    }

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {
                                if (this.state.teamId !== "") {
                                    var successMsg = 'Maintenance Team has been updated successfully';
                                }
                                else {
                                    successMsg = 'Maintenance Team has been created successfully';
                                }

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: successMsg,
                                })
                                this.setState(this.baseState);
                                this.props.onCreate({ teamId: resp.data.teamId, teamName: resp.data.teamName });
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
                    <div className="ml-12">
                        <div className="form-group row">
                            <label className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Team Name<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <input type="text" name="teamName" value={this.state.teamName} onChange={this.handleInputOnChange} placeholder="teamName" className={`form-control form-control-sm ${touched.teamName === true ? (errors.teamName === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                <div className="invalid-feedback">{errors.teamName}</div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-lg-2 col-form-label" style={{ "textAlign": "center" }} >Team Members</label>
                            <div className="col-lg-6">
                                <AsyncSelect
                                    value={this.state.teamMembers}
                                    isMulti
                                    defaultOptions
                                    loadOptions={this.fetchData}
                                    placeholder="Select Team Members"
                                    onChange={this.handleTeamMemberChange}

                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-2"></div>
                            <div className="form-group col-3">
                                <input type="submit" value={this.state.teamId !== "" ? 'Update' : 'Save'} className="btn btn-outline-primary btn-sm float-left" data-loading-text="Loading..." />
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

export default MaintenanceTeamCreate;
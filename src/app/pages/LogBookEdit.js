import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";


class LogBookEdit extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        equipmentName: "",
        maxCode: "",
        startingTime: "",
        endingTime: "",
        openingOdoReading: "",
        closingOdoReading: "",
        equipmentStatus: "",
        workSiteName: "",
        usedInWork: "",
        errors: {
            logDate: "",
            fuelQty: "",
        },
        touched: {
            logDate: false,
            fuelQty: false
        }
    }


    componentDidMount() {
        const { allBusinessUnits, ...baseState } = this.state;
        this.baseState = baseState;
        if (this.props.logId !== undefined) {
            this.getLogDetails(this.props.logId);
            this.setState({ logId: this.props.logId });
        }

    }

    getLogDetails(logId) {
        fetch(process.env.REACT_APP_API_URL + "log_book/log_details/" + logId,
        getGetRequestOptions())
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                this.setState({
                    equipmentName: resp.equipmentName,
                    maxCode: resp.maxCode,
                    startingTime: resp.startTime,
                    endingTime: resp.endTime,
                    openingOdoReading: resp.openingOdo,
                    closingOdoReading: resp.closingOdo,
                    equipmentStatus: resp.status,
                    workSiteName: resp.workSiteName,
                    usedInWork: resp.usedInWork
                });
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

        if (evt.target.name === "fuelQty") {
            touched.fuelQty = true
            if (evt.target.value === "") {
                errors.fuelQty = "Fuel quantity is required!";
            }
            else {
                errors.fuelQty = "";
            }
        }
        this.setState({ errors, touched: touched });
    };

    getEquipment = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        }
        const projectId = this.state.businessUnit;
        var url = process.env.REACT_APP_API_URL + "equipment/equipment_search/" + projectId + "?q=" + inputValue;
        setTimeout(() => {
            fetch(url, getGetRequestOptions())
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    const tempArray = resp.data.map(function (element) {
                        element.label = `${element.equipmentName} (${element.equipmentCode})`;
                        element.value = element.equipmentId;
                        return element;
                    });
                    callback(tempArray);
                })
                .catch((error) => {
                    console.log(error, "catch the hoop")
                });
        });
    }

    getFuelOfficer = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        }
        var url = process.env.REACT_APP_API_URL + "search_fuel_officer?q=" + inputValue;
        setTimeout(() => {
            fetch(url, getGetRequestOptions())
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    const tempArray = resp.data.map(function (element) {
                        element.label = `${element.name} (${element.phone})`;
                        element.value = element.id;
                        return element;
                    });
                    callback(tempArray);
                })
                .catch((error) => {
                    console.log(error, "catch the hoop")
                });
        });
    }

    checkValidation() {

        let errors = this.state.errors;
        let touched = this.state.touched;

        for (var input in errors) {

            touched[input] = true;

            if (input === "fuelQty") {
                if (this.state.fuelQty === "") {
                    errors.fuelQty = "Fuel quantity is required!";
                }
                else {
                    errors.fuelQty = "";
                }
            }
            else if (input === "logDate") {
                if (this.state.logDate === "") {
                    errors.logDate = "Log Date is required!";
                }
                else {
                    errors.logDate = "";
                }
            }

        }

        this.setState({ errors, touched: touched });
    }



    handleSubmit = evt => {
        evt.preventDefault();
        const isValid = true;
        if (isValid) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You want to updat this log entry!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        businessUnit: process.env.REACT_APP_EMD_BU_ID,
                        equipmentName: this.state.equipmentName,
                        maxCode: this.state.maxCode,
                        startingTime: this.state.startingTime,
                        endingTime: this.state.endingTime,
                        openingOdoReading: this.state.openingOdoReading,
                        closingOdoReading: this.state.closingOdoReading,
                        equipmentStatus: this.state.equipmentStatus,
                        workSiteName: this.state.workSiteName,
                        usedInWork: this.state.usedInWork,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "log_book/log_entry_update";

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {
                                let successMsg = [resp.successMessage];

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: successMsg,
                                })
                                this.setState(this.baseState);
                                this.props.onUpdateLog({ id: resp.data.id, rid: Math.random() });
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
                                //console.log(errorsMessage);
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
        const statusOption = [{ label: 'Running', value: 'running', }, { label: 'Break Down', value: 'break_down' }]
        return (
            <>

                <h3 className="card-title">
                    <p className="text-primary">
                        Log Book Entry Edit for {this.state.equipmentName} ({this.state.maxCode})
                            </p>
                </h3>


                <form onSubmit={this.handleSubmit}>
                    <div className="card-body">
                        <div className="ml-12">

                            <div className="form-group row">
                                <label htmlFor="startingTime" className="col-lg-3 col-form-label">Starting Time<span className="required text-danger">*</span></label>
                                <div className="col-lg-4">
                                    <input type="time" name="startingTime" id="startingTime" value={this.state.startingTime} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="endingTime" className="col-lg-3 col-form-label">Closing Time<span className="required text-danger">*</span></label>
                                <div className="col-lg-4">
                                    <input type="time" name="endingTime" id="endingTime" value={this.state.endingTime} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="openingOdoReading" className="col-lg-3 col-form-label">Opening Odometer Reading <span className="required text-danger">*</span></label>
                                <div className="col-lg-6">
                                    <div className="input-group input-group-sm">
                                        <input type="number" name="openingOdoReading" id="openingOdoReading" value={this.state.openingOdoReading} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                        <div className="input-group-append"><span className="input-group-text">Km/hr</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="endingTime" className="col-lg-3 col-form-label">Closing Odometer Reading <span className="required text-danger">*</span></label>
                                <div className="col-lg-6">
                                    <div className="input-group input-group-sm">
                                        <input type="number" name="closingOdoReading" id="closingOdoReading" value={this.state.closingOdoReading} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                        <div className="input-group-append"><span className="input-group-text">Km/hr</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="endingTime" className="col-lg-3 col-form-label">Status<span className="required text-danger">*</span></label>
                                <div className="col-lg-6">
                                    <select className="form-control form-control-sm" id="equipmentStatus" name="equipmentStatus" value={this.state.equipmentStatus} onChange={this.handleInputOnChange} >
                                        <option value="">Select Equipment Status</option>
                                        {statusOption.map((item, key) =>
                                            <option key={key} value={item.value}>{item.label}</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="workSiteName" className="col-lg-3 col-form-label">Work Site Name<span className="required text-danger">*</span></label>
                                <div className="col-lg-6">
                                    <input type="text" name="workSiteName" id="workSiteName" value={this.state.workSiteName} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="workSiteName" className="col-lg-3 col-form-label">Used in Work<span className="required text-danger">*</span></label>
                                <div className="col-lg-6">
                                    <input type="text" name="usedInWork" id="usedInWork" value={this.state.usedInWork} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>


                        </div>
                    </div>

                    <div className="card-footer">
                        <div className="row">
                            <div className="col-4">
                            </div>
                            <div className="col-6">
                                <button type="submit" className="btn btn-success mr-2">Save</button>

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

export default LogBookEdit;
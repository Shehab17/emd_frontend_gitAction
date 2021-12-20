import React, { Component } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
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


class LogBookCreate extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        logBookBusinessUnit: "",
        equipment: "",
        entryDate: "",
        equipmentStatus: "",
        startingTime: "",
        endingTime: "",
        openingOdoReading: "",
        closingOdoReading: "",
        workSiteName: "",
        usedInWork: "",
        statusOption: [{ label: 'Running', value: 'running', }, { label: 'Break Down', value: 'break_down' }],
        errors: {
            entryDate: "",
        },
        touched: {
            entryDate: false,
        }
    }

    componentDidMount() {
        const { allBusinessUnits, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllBu();

        if (this.props.logDate  !== undefined) {

            this.setState({ entryDate: this.props.logDate });
        }

        if (this.props.project !== undefined) {

            this.setState({ logBookBusinessUnit: this.props.project });
        }

    }

    getEquipment = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        } else {
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
    }

    handleEquipmentChange = equipment => {
        this.setState({ equipment: equipment });
    }

    getOperatorName = (inputValue, callback) => {
        if (!inputValue) {
            callback([]);

        }
        else {
            var url = process.env.REACT_APP_API_URL + "search_operator?q=" + inputValue;
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

    handleBuChange = logBookBusinessUnit => {
        this.setState({ logBookBusinessUnit: logBookBusinessUnit }, () => {
        });
    }

    handleOperatorNameChange = operatorName => {
        this.setState({ operatorName: operatorName });
    }

    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
        let errors = this.state.errors;
        let touched = this.state.touched;

        if (evt.target.name === "entryDate") {
            touched.entryDate = true;
            if (evt.target.value === "") {
                errors.entryDate = "Date is required!";
            }
            else {
                errors.entryDate = "";
            }
        }
        this.setState({ errors, touched: touched });
    };

    validateForm = () => {
        let errors = this.state.errors;
        let touched = this.state.touched;
        for (var input in errors) {

            touched[input] = true;

            if (input === "entryDate") {
                if (this.state.entryDate === "") {
                    errors.entryDate = "Date is required!";
                }
                else {
                    errors.entryDate = "";
                }
            }
        }
        this.setState({ errors, touched: touched });

        if (this.state.errors.entryDate !== "") {
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
            Swal.fire({
                title: 'Are you sure?',
                text: "You want to entry this on log book!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        businessUnit: process.env.REACT_APP_EMD_BU_ID,
                        logBookBusinessUnit: this.state.logBookBusinessUnit,
                        equipment: this.state.equipment,
                        entryDate: this.state.entryDate,
                        equipmentStatus: this.state.equipmentStatus,
                        startingTime: this.state.startingTime,
                        endingTime: this.state.endingTime,
                        openingOdoReading: this.state.openingOdoReading,
                        closingOdoReading: this.state.closingOdoReading,
                        workSiteName: this.state.workSiteName,
                        usedInWork: this.state.usedInWork,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "log_book/log_entry_create";

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                    .then((resp) => {
                        return resp.json()
                    })
                    .then((resp) => {
                        console.log(resp);

                        if (resp.success === true) {
                            let successMsg = resp.successMessage;
                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: successMsg,
                            })

                            this.setState(this.baseState);
                            this.props.onCreateLog({ id: resp.data.id, rid: Math.random() });
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
        const { errors, touched } = this.state;
        return (
            <>
                <h3 className="card-title">
                    <p className="text-primary">
                        Log Book Entry
                    </p>
                </h3>

                <form onSubmit={this.handleSubmit}>
                    <div className="ml-6">
                        <div className="form-group row">
                            <label htmlFor="example-text-input" className="col-lg-4 col-form-label">Business Unit<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <Select
                                    value={this.state.logBookBusinessUnit}
                                    onChange={this.handleBuChange}
                                    options={this.state.allBusinessUnits}
                                    styles={customStylesSelect}
                                    isDisabled
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="entryDate" className="col-lg-4 col-form-label">Date<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <input type="date" name="entryDate" id="entryDate" value={this.state.entryDate} onChange={this.handleInputOnChange} className={`form-control form-control-md ${touched.entryDate === true ? (errors.entryDate === "" ? 'is-valid' : 'is-invalid') : ''}`} readOnly />
                                <div className="invalid-feedback">{errors.entryDate}</div>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="example-text-input" className="col-lg-4 col-form-label">Equipment<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <AsyncSelect
                                    value={this.state.equipment}
                                    defaultOptions
                                    loadOptions={this.getEquipment}
                                    placeholder="Select Equipment"
                                    onChange={this.handleEquipmentChange}
                                    styles={customStylesSelect}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="example-text-input" className="col-lg-4 col-form-label">Operator Name<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <AsyncSelect
                                    value={this.state.operatorName}
                                    defaultOptions
                                    loadOptions={this.getOperatorName}
                                    placeholder="Select Operator Name"
                                    onChange={this.handleOperatorNameChange}
                                    styles={customStylesSelect}
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="equipmentStatus" className="col-lg-4 col-form-label">Equipment Status<span className="required text-danger"> *</span></label>
                            <div className="col-lg-6">
                                <select className="form-control form-control-sm" id="equipmentStatus" name="equipmentStatus" value={this.state.equipmentStatus} onChange={this.handleInputOnChange} >
                                    <option value="">Select Equipment Status</option>
                                    {this.state.statusOption.map((item, key) =>
                                        <option key={key} value={item.value}>{item.label}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="startingTime" className="col-lg-4 col-form-label">Starting Time<span className="required text-danger">*</span></label>
                            <div className="col-lg-6">
                                <input type="time" name="startingTime" id="startingTime" value={this.state.startingTime} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="endingTime" className="col-lg-4 col-form-label">Ending Time<span className="required text-danger">*</span></label>
                            <div className="col-lg-6">
                                <input type="time" name="endingTime" id="endingTime" value={this.state.endingTime} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="openingOdoReading" className="col-lg-4 col-form-label">Opening Odometer Reading <span className="required text-danger">*</span></label>
                            <div className="col-lg-6">
                                <div className="input-group input-group-sm">
                                    <input type="number" name="openingOdoReading" id="openingOdoReading" value={this.state.openingOdoReading} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                    <div className="input-group-append"><span className="input-group-text">Km/hr</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="endingTime" className="col-lg-4 col-form-label">Closing Odometer Reading <span className="required text-danger">*</span></label>
                            <div className="col-lg-6">
                                <div className="input-group input-group-sm">
                                    <input type="number" name="closingOdoReading" id="closingOdoReading" value={this.state.closingOdoReading} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                    <div className="input-group-append"><span className="input-group-text">Km/hr</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="workSiteName" className="col-lg-4 col-form-label">Work Site Name</label>
                            <div className="col-lg-6">
                                <input type="text" name="workSiteName" id="workSiteName" value={this.state.workSiteName} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="workSiteName" className="col-lg-4 col-form-label">Used in Work</label>
                            <div className="col-lg-6">
                                <input type="text" name="usedInWork" id="usedInWork" value={this.state.usedInWork} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                            </div>
                        </div>
                        <div className="card-footer">
                            <div className="row">
                                <div className="col-4">
                                </div>
                                <div className="col-6">
                                    <button type="submit" className="btn btn-success mr-3">Submit</button>
                                </div>
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

export default LogBookCreate;
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

class LogBookFuel extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        project:"",
        equipment: "",
        logDate: "",
        fuelOfficer: "",
        fuelQty: "",
        fuelType:"",
        allBusinessUnits: [],
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
				}).filter(e => e.projectId !== process.env.REACT_APP_EMD_BU_ID);
				this.setState({ allBusinessUnits: tempResp });
			})
			.catch((error) => {
				console.log(error, "catch the hoop")
			});

	}

    handleEquipmentChange = equipment => {
        this.setState({ equipment: equipment,fuelType:equipment.fuelTypeName});
    }

    handleFuelOfficerChange = fuelOfficer => {
        this.setState({ fuelOfficer: fuelOfficer});
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

  


    onChangeLogDate = evt => {
		this.setState({ logDate: evt.target.value });

		let errors = this.state.errors;
		let touched = this.state.touched;
		touched.logDate = true;
		if (evt.target.value === "") {
			errors.logDate = "Log Date is required!";
		}
		else {
			errors.logDate = "";
		}
		this.setState({ errors, touched: touched });
	}

    handleProjectChange = project => {
        this.setState({ project: project });
    }

   
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
            fetch(url,getGetRequestOptions() )
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

    validateForm = () => {

        this.checkValidation();

        if (this.state.errors.fuelQty === "" && this.state.errors.logDate === "") {
            return true;
        }
        else {
            return false;
        }
    }

    handleSubmit = evt => {
        evt.preventDefault();
        const isValid = this.validateForm()
        if (isValid) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You want to entry this fuel disbursment!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        businessUnit: process.env.REACT_APP_EMD_BU_ID,
                        project: this.state.project,
                        equipment: this.state.equipment,
                        logDate: this.state.logDate,
                        fuelOfficer: this.state.fuelOfficer,
                        fuelQty: this.state.fuelQty,
                        fuelType: this.state.fuelType,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "log_book/fuel_entry";

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
                            //this.props.history.push('/');
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
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                               Fuel Disbursment
                            </p>
                        </h3>
                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">

                            <div className="form-group row">
                                <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Project<span className="required text-danger"> *</span></label>
                                <div className="col-lg-6">
                                    <Select
                                        value={this.state.project}
                                        placeholder="Select Project"
                                        onChange={this.handleProjectChange}
                                        options={this.state.allBusinessUnits}
                                    />
                                </div>
							</div>

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Equipment <span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <AsyncSelect
                                            value={this.state.equipment}
                                            defaultOptions
                                            loadOptions={this.getEquipment}
                                            //loadOptions={promiseOptions}
                                            placeholder="Select Equipment"
                                            onChange={this.handleEquipmentChange}
                                            styles={customStylesSelect}
                                        // onChange={(e) => {
                                        //this.onSearchChange(e);
                                        //  }}
                                        />
                                    </div>
                                </div>

                             
                                <div className="form-group row">
									<label htmlFor="logDate" className="col-lg-2 col-form-label">Date<span className="required text-danger"> *</span></label>
									<div className="col-lg-6">
										<input  type="date" name="logDate" id="logDate" value={this.state.logDate} onChange={this.onChangeLogDate} className={`form-control form-control-md ${touched.logDate === true ? (errors.logDate === "" ? 'is-valid' : 'is-invalid') : ''}`} />
										<div className="invalid-feedback">{errors.logDate}</div>
									</div>
								</div>

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Fuel Officer</label>
                                    <div className="col-lg-6">
                                        <AsyncSelect
                                            value={this.state.fuelOfficer}
                                            defaultOptions
                                            loadOptions={this.getFuelOfficer}
                                            placeholder="Select Fuel Officer"
                                            onChange={this.handleFuelOfficerChange}
                                            styles={customStylesSelect}
                                        />
                                    </div>
                                </div>

                              
                                <div className="form-group row">
                                    <label htmlFor="fuelQty" className="col-lg-2 col-form-label">Fuel Qty<span className="required text-danger">*</span></label>
                                    <div className="col-lg-3">
                                        <div className="input-group input-group-sm">
                                            <input type="number" name="fuelQty" id="fuelQty" value={this.state.fuelQty} onChange={this.handleInputOnChange} className={`form-control form-control-sm form-control form-control-sm-md ${touched.fuelQty === true ? (errors.fuelQty === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                            <div className="input-group-append"><span className="input-group-text">Ltr.</span></div>
                                            <div className="invalid-feedback">{errors.fuelQty}</div>
                                        </div>
                                    </div>
                                </div>

                               
                                <div className="form-group row">
                                <label htmlFor="fuelType" className="col-lg-2 col-form-label" >Fuel Type</label>
                                <div className="col-lg-3">
                                    <input type="text" name="fuelType" id="fuelType" value={this.state.fuelType} className="form-control form-control-sm"  readOnly />
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
            </>
        );
    }
}

export default LogBookFuel;
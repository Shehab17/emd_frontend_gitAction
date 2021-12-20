import React, { Component } from 'react';
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

class EquipmentEmi extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        equipment: "",
        landedCost: "",
        accumulatedDepreciation: "",
        equipmentValue: "",
        usefulLife: "",
        emiDate: "",
        interestRate: "",
        interestPeriod: "monthly",
        emiAmount: "",
        periodOption: [{ label: 'Monthly', value: 'monthly', code: 12 },
        { label: 'Quarterly', value: 'quarterly', code: 4 },
        { label: 'Semi Annually', value: 'semiannually', code: 2 },
        { label: 'Annually', value: 'annually', code: 1 }
        ],
        errors: {
            emiDate: "",
            emiAmount: "",
        },
        touched: {
            emiDate: false,
            emiAmount: false,
        }
    }


    componentDidMount() {
        const { periodOption, ...baseState } = this.state;
        this.baseState = baseState;
    }

    handleEquipmentChange = equipment => {
        this.setState({ equipment: equipment, landedCost: equipment.landedCost, accumulatedDepreciation: Number(equipment.accumulatedDepreciation), equipmentValue: ( Number(equipment.landedCost) - Number(equipment.accumulatedDepreciation) ).toFixed(4), usefulLife: equipment.usefulLife, emiDate: equipment.purchaseDate, errors: { emiAmount: "", emiDate: "" }, touched: { emiAmount: false, emiDate: false } }, () => { this.getInterestRate(this.state.emiDate) });
    }

    handleInputOnChange = evt => {
        evt.preventDefault();
        this.setState({ [evt.target.name]: evt.target.value });

        let errors = this.state.errors;
        let touched = this.state.touched;

        if (evt.target.name === "emiAmount") {
            touched.emiAmount = true
            if (evt.target.value === "") {
                errors.emiAmount = "Emi Amount is required!";
            }
            else {
                errors.emiAmount = "";
            }
        }
        this.setState({ errors, touched: touched });
    };

    onChangeEmiDate = evt => {
        this.setState({ emiDate: evt.target.value }, () => {
            this.getInterestRate(this.state.emiDate);
        });

        let errors = this.state.errors;
        let touched = this.state.touched;
        touched.emiDate = true;
        if (evt.target.value === "") {
            errors.emiDate = "Emi Date is required!";
        }
        else {
            errors.emiDate = "";
        }
        this.setState({ errors, touched: touched });

    }

    onChangeInterestPeriod = evt => {
        this.setState({ interestPeriod: evt.target.value, emiAmount: "" }, () => {

            if (this.state.interestPeriod !== "") {
                this.setEmiAmount(this.state.emiDate);
            }
            else {
                this.checkValidation();
            }
        });
    }


    onChangeEquipmentValue = evt => {
        this.setState({ equipmentValue: evt.target.value }, () => {
            this.setEmiAmount();

        });
    }

    onChangeUsefulLife = evt => {
        this.setState({ usefulLife: evt.target.value }, () => {
            this.setEmiAmount();
        });
    }


    pmt(rate_per_period, number_of_payments, present_value, future_value, type) {
        future_value = typeof future_value !== 'undefined' ? future_value : 0;
        type = typeof type !== 'undefined' ? type : 0;

        if (rate_per_period !== 0.0) {
            // Interest rate exists
            var q = Math.pow(1 + rate_per_period, number_of_payments);
            return -(rate_per_period * (future_value + (q * present_value))) / ((-1 + q) * (1 + rate_per_period * (type)));

        } else if (number_of_payments !== 0.0) {
            // No interest rate, but number of payments exists
            return -(future_value + present_value) / number_of_payments;
        }

        return 0;
    }

    getEquipment = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        }
        const projectId = this.state.businessUnit;
        var url = process.env.REACT_APP_API_URL + "equipment/equipment_search/" + projectId + "?q=" + inputValue;
        setTimeout(() => {
            fetch(url,
            getGetRequestOptions())
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

    getInterestRate(date) {

        fetch(process.env.REACT_APP_API_URL + "get_interest_rate/" + date,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ interestRate: resp.data.rate }, () => {
                this.setEmiAmount();
            });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    setEmiAmount() {
        const sellectPeriodOption = this.state.periodOption.filter(option => option.value === this.state.interestPeriod);
        const pmtValue = this.pmt((this.state.interestRate / 100) / sellectPeriodOption[0].code, this.state.usefulLife, this.state.equipmentValue);
        this.setState({ emiAmount: Math.abs(Math.round(pmtValue)) }, () => {
            this.checkValidation();
        });


    }

    checkValidation() {

        let errors = this.state.errors;
        let touched = this.state.touched;

        for (var input in errors) {

            touched[input] = true;

            if (input === "emiAmount") {
                if (this.state.emiAmount === "") {
                    errors.emiAmount = "Emi Amount is required!";
                }
                else {
                    errors.emiAmount = "";
                }
            }
            else if (input === "emiDate") {
                if (this.state.emiDate === "") {
                    errors.emiDate = "Emi Date is required!";
                }
                else {
                    errors.emiDate = "";
                }
            }

        }

        this.setState({ errors, touched: touched });
    }

    validateForm = () => {

        this.checkValidation();

        if (this.state.errors.emiAmount === "" && this.state.errors.emiDate === "") {
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
                text: "You want to create this EMI!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        businessUnit: process.env.REACT_APP_EMD_BU_ID,
                        equipment: this.state.equipment,
                        landedCost: this.state.landedCost,
                        accumulatedDepreciation: this.state.accumulatedDepreciation,
                        equipmentValue: this.state.equipmentValue,
                        usefulLife: this.state.usefulLife,
                        emiDate: this.state.emiDate,
                        interestRate: this.state.interestRate,
                        interestPeriod: this.state.interestPeriod,
                        emiAmount: this.state.emiAmount,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "equipment/equipment_emi_setup";

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {
                                let successMsg = [`EMI Setup ID# ${resp.data.id}`];

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: successMsg,
                                })
                                this.setState(this.baseState);
                                this.props.history.push('/equipment-emi-list');
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
                                Equipment EMI Setup
                            </p>
                        </h3>
                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Equipment</label>
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
                                    <label htmlFor="landedCost" className="col-lg-2 col-form-label">Landed Cost</label>
                                    <div className="col-lg-6">
                                        <div className="row">
                                            <div className="col-lg-4">
                                                <input className="form-control form-control-sm" type="number" name="landedCost" id="landedCost" value={this.state.landedCost} readOnly />
                                            </div>
                                            <div className="col-lg-8">
                                                <div className="form-group row">
                                                    <label htmlFor="accumulatedDepreciation" className="col-lg-4 col-form-label">Acc Dep</label>
                                                    <div className="col-lg-8">
                                                        <input className="form-control form-control-sm" type="text" name="accumulatedDepreciation" id="accumulatedDepreciation" value={this.state.accumulatedDepreciation} readOnly />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="equipmentValue" className="col-lg-2 col-form-label">Equipment  Value</label>
                                    <div className="col-lg-6">
                                        <div className="row">
                                            <div className="col-lg-4">
                                                <input className="form-control form-control-sm" type="text" name="equipmentValue" id="equipmentValue" value={this.state.equipmentValue} onChange={this.onChangeEquipmentValue} readOnly />
                                            </div>
                                            <div className="col-lg-8">
                                                <div className="form-group row">
                                                    <label htmlFor="usefulLife" className="col-lg-4 col-form-label">Useful Life</label>
                                                    <div className="col-lg-8">
                                                        <input className="form-control form-control-sm" type="text" name="usefulLife" id="usefulLife" value={this.state.usefulLife} onChange={this.onChangeUsefulLife} readOnly />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="emiDate" className="col-lg-2 col-form-label">Interest Effective Date<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <input type="date" name="emiDate" id="emiDate" value={this.state.emiDate} onChange={this.onChangeEmiDate} className={`form-control form-control-sm form-control form-control-sm-md ${touched.emiDate === true ? (errors.emiDate === "" ? 'is-valid' : 'is-invalid') : ''}`} readOnly />
                                        <div className="invalid-feedback">{errors.emiDate}</div>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="interestPeriod" className="col-lg-2 col-form-label">Interest Period<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-2">
                                        <select className="form-control form-control-sm" id="interestPeriod" name="interestPeriod" value={this.state.interestPeriod} onChange={this.onChangeInterestPeriod} >
                                            <option value="">Select Period</option>
                                            {this.state.periodOption.map((item, key) =>
                                                <option key={key} value={item.value}>{item.label}</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="interestRate" className="col-lg-2 col-form-label">Interest Rate</label>
                                    <div className="col-lg-2">
                                        <input className="form-control form-control-sm" type="text" name="interestRate" id="interestRate" value={this.state.interestRate} readOnly />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="equipmentValue" className="col-lg-2 col-form-label">EMI  Amount<span className="required text-danger">*</span></label>
                                    <div className="col-lg-3">
                                        <div className="input-group input-group-sm">
                                            <input type="number" name="emiAmount" id="emiAmount" value={this.state.emiAmount} onChange={this.handleInputOnChange} className={`form-control form-control-sm form-control form-control-sm-md ${touched.emiAmount === true ? (errors.emiAmount === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                            <div className="input-group-append"><span className="input-group-text">{this.state.interestPeriod}</span></div>
                                            <div className="invalid-feedback">{errors.emiAmount}</div>
                                        </div>
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

export default EquipmentEmi;
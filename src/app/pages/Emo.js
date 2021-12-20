import React, { Component } from 'react';
import SVG from "react-inlinesvg";
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";
import { getGetRequestOptions } from "../components/GetToken";

class Emo extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        sendingBu: "",
        emoDate: "",
        receivingBu: {
            policy: "auto"
        },
        items: [{ equipment: "", itemName: "", model: "", capCode: "", billingPolicy: "", monthlyRent: "" }],
        remarks: "",
        billingPolicyOption: [],
        allBusinessUnits: [],
        receivingBusinessUnit: [],
        errors: {
            emoDate: "",
        },
        touched: {
            emoDate: false,
        }
    }


    componentDidMount() {
        const { allBusinessUnits, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllBu();
        this.getAllReceivingBu();
        this.getBillingPolicy();
    }

    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
        let errors = this.state.errors;
        let touched = this.state.touched;

        if (evt.target.name === "emoDate") {
            touched.emoDate = true;
            if (evt.target.value === "") {
                errors.emoDate = "Emo Date is required!";
            }
            else {
                errors.emoDate = "";
            }
        }
        this.setState({ errors, touched: touched });
    };

    handleReceivingBuChange = businessUnit => {
        this.setState({ receivingBu: businessUnit }, );
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

    getAllReceivingBu() {
        fetch(process.env.REACT_APP_API_URL + "get_receiving_business_unit",     
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            let tempResp = resp.data.map(function (element) {
                return { ...element, label: element.projectName, value: element.projectId }
            });
            this.setState({ receivingBusinessUnit: tempResp});
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }

    getBillingPolicy() {
        fetch(process.env.REACT_APP_API_URL + "billing_policy",   
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ billingPolicyOption: resp.data });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    getEquipment = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        } else {
            const projectId = this.state.businessUnit;
            var url = process.env.REACT_APP_API_URL + "equipment/emo_equipment_search/" + projectId + "?q=" + inputValue;
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

    onEquipmentChange = index => item => {
        const newItems = this.state.items.map(function (row, rindex) {
            if (index !== rindex) return row;
            return { ...row, equipment: item, itemName: `${item.equipmentName}  (${item.equipmentCode})`, model: item.model, capCode: item.capCode, billingPolicy: item.yearManufacture < 2000 ? 1 : 26, monthlyRent: "" }
        });
        this.setState({ items: newItems }, () => this.getEquipmentRent(this.state.items[index].billingPolicy, this.state.items[index].equipment.capDetailsId, index));
    }

    getEquipmentRent = (billingPolicyId, capDetailsId, index) => {

        const newItems = this.state.items.map(function (row, rindex) {
            if (index !== rindex) return row;
            return { ...row, monthlyRent: "" }
        });
        this.setState({ items: newItems });
        
        fetch(process.env.REACT_APP_API_URL + "equipment_monthly_rent/" + billingPolicyId + "/" + capDetailsId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            const newItems = this.state.items.map(function (row, rindex) {
                if (index !== rindex) return row;
                return { ...row, monthlyRent: resp }
            });
            this.setState({ items: newItems });

        })
        .catch((error) => {        
            console.log(error, "catch the hoop")
        });

    }

    onChangeBillingPolicy = index => evt => {

        const newItems = this.state.items.map(function (row, rindex) {
            if (index === rindex) {
                row.billingPolicy = evt.target.value;
            }
            return row;
        })
        this.setState({ items: newItems }, () => this.getEquipmentRent(this.state.items[index].billingPolicy, this.state.items[index].equipment.capDetailsId, index));
    }

    
    onChangeMonthlyRent = index => evt => {

        const newItems = this.state.items.map(function (row, rindex) {
            if (index === rindex) {
                row.monthlyRent = evt.target.value;
            }
            return row;
        })
        this.setState({ items: newItems });
    }

    addItem = () => {
        this.setState({
            items: this.state.items.concat([{ equipment: "", itemName: "", model: "", capCode: "", billingPolicy: "", monthlyRent: "" }])
        });
    }

    removeItem = (index) => () => {
        this.setState({
            items: this.state.items.filter((row, rindex) => index !== rindex)
        });
    }

    validateForm = () => {
        let errors = this.state.errors;
        let touched = this.state.touched;
        for (var input in errors) {

            touched[input] = true;

            if (input === "emoDate") {
                if (this.state.emoDate === "") {
                    errors.emoDate = "Emo Date is required!";
                }
                else {
                    errors.emoDate = "";
                }
            }
        }
        this.setState({ errors, touched: touched });

        if (this.state.errors.emoDate !== "") {
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
                text: "You want to create Equipment Movement Order!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        businessUnit: process.env.REACT_APP_EMD_BU_ID,
                        emoDate: this.state.emoDate,
                        receivingBu: this.state.receivingBu,
                        items: this.state.items,
                        remarks: this.state.remarks,
                    };
                    
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "emo/save_emo";

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {
                                let successMsg = [`EMO NO# ${resp.data.emoNo}`];
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: successMsg,
                                })

                                this.setState(this.baseState);
                                this.props.history.push(`/emo-details/${resp.data.id}`);
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
                                Equipment Movement Order
                            </p>
                        </h3>
                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Business Unit</label>
                                    <div className="col-lg-6">

                                        <select className="form-control" id="businessUnit" name="businessUnit" value={this.state.businessUnit} onChange={this.handleInputOnChange} disabled>
                                            <option value="">Select </option>
                                            {this.state.allBusinessUnits.map(item =>
                                                <option key={item.projectId} value={item.projectId}>{item.projectName}</option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="emoDate" className="col-lg-2 col-form-label">EMO Date<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <input type="date" name="emoDate" id="emoDate" value={this.state.emoDate} onChange={this.handleInputOnChange} className={`form-control form-control-md ${touched.emoDate === true ? (errors.emoDate === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                        <div className="invalid-feedback">{errors.emoDate}</div>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Receiving Business Unit<span className="required text-danger">*</span></label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.receivingBu}
                                            onChange={this.handleReceivingBuChange}
                                            options={this.state.receivingBusinessUnit}
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="mt-5">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                        <thead>
                                            <tr>
                                                <th>Sl. No</th>
                                                <th>Equipment Code</th>
                                                <th>Equipment Name</th>
                                                <th>Model</th>
                                                <th>Capitalization Code</th>
                                                <th>Billing Policy</th>
                                                <th>Monthly Rent</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.items.map((item, index) =>
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td style={{ width: '25%' }}>
                                                            <AsyncSelect
                                                                key={index}
                                                                value={item.equipment}
                                                                defaultOptions
                                                                loadOptions={this.getEquipment}
                                                                placeholder="Select Equipment"
                                                                onChange={this.onEquipmentChange(index)}
                                                            />
                                                        </td>
                                                        <td>
                                                            {item.itemName}
                                                        </td>
                                                        <td>
                                                            {item.model}
                                                        </td>
                                                        <td>
                                                            {item.capCode}
                                                        </td>
                                                        <td>
                                                            <select className="form-control" value={item.billingPolicy} onChange={this.onChangeBillingPolicy(index)} style={{width:"auto"}} disabled>
                                                                <option value="">Select Billing Policy</option>
                                                                {this.state.billingPolicyOption.map(item =>
                                                                    <option key={item.billingPolicyId} value={item.billingPolicyId}>{item.billingPolicyName}</option>
                                                                )}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input className="form-control" type="text" value={item.monthlyRent} readOnly={this.state.receivingBu.policy === "auto"} onChange={this.onChangeMonthlyRent(index)} />
                                                        </td>
                                                        <td>
                                                            <div className="row">
                                                                <div className="col-2">
                                                                    {this.state.items.length > 1 ? <button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removeItem(index)}> <span className="svg-icon svg-icon-md svg-icon-danger">
                                                                        <SVG src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")} />
                                                                    </span></button> : ''}
                                                                </div>
                                                            </div>
                                                        </td>

                                                    </tr>
                                                )
                                            }

                                            <tr>
                                                <td colSpan="8">
                                                    <div className="form-group row">
                                                        <div className="col-lg-2">
                                                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={this.addItem}>Add New</button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="ml-12 mt-5">
                                <div className="form-group row">
                                    <label htmlFor="remarks" className="col-lg-2 col-form-label">Remarks</label>
                                    <div className="col-lg-6">
                                        <textarea className="form-control" name="remarks" id="remarks" value={this.state.remarks} onChange={this.handleInputOnChange} />
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

export default Emo;
import React, { Component } from 'react';
import SVG from "react-inlinesvg";
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";
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

class ThirdPartyEmo extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        customer: "",
        emoDate: "",
        items: [{ equipment: "", itemName: "", model: "", capCode: "", regularBillingAmount: "", monthlyRent: "", receivingDate: "" }],
        remarks: "",
        allBusinessUnits: [],
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

    getCustomer = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        }
        else {
            var url = process.env.REACT_APP_API_URL + "customer/customer_search?q=" + inputValue;
            setTimeout(() => {
                fetch(url, getGetRequestOptions())
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    const tempArray = resp.data.map(function (element) {
                        element.label = `${element.fullName} (${element.mobileNo})`;
                        element.value = element.customerId;
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

    handleCustomerChange = customer => {
        this.setState({ customer: customer });
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
            return { ...row, equipment: item, itemName: `${item.equipmentName}  (${item.equipmentCode})`,  model: item.model, capCode: item.capCode, regularBillingAmount: "", receivingDate: "", monthlyRent: "" }
        });
        this.setState({ items: newItems }, () => this.getEquipmentRegularBilling(this.state.items[index].equipment.equipmentId, this.state.items[index].equipment.capDetailsId, index));
    }

    getEquipmentRegularBilling = (equipmentId, capDetailsId, index) => {
        fetch(process.env.REACT_APP_API_URL + "equipment_regular_billing/" + equipmentId + "/" + capDetailsId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            const newItems = this.state.items.map(function (row, rindex) {
                if (index !== rindex) return row;
                return { ...row, regularBillingAmount: resp }
            });
            this.setState({ items: newItems });

        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    addItem = () => {
        this.setState({
            items: this.state.items.concat([{ equipment: "", itemName: "", model: "", capCode: "", regularBillingAmount: "", monthlyRent: "", receivingDate: "" }])
        });
    }

    removeItem = (index) => () => {
        this.setState({
            items: this.state.items.filter((row, rindex) => index !== rindex)
        });
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

    onChangeReceivingDate = index => evt => {
        const newItems = this.state.items.map(function (row, rindex) {
            if (index === rindex) {
                row.receivingDate = evt.target.value;
            }
            return row;
        })
        this.setState({ items: newItems });
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
                text: "You want to create Equpment Movement Order!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        businessUnit: process.env.REACT_APP_EMD_BU_ID,
                        customer: this.state.customer,
                        emoDate: this.state.emoDate,
                        items: this.state.items,
                        remarks: this.state.remarks,
                    };
                    
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "emo/save_third_party_emo";

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
                                Third Party Equipment Movement Order
                            </p>
                        </h3>
                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Business Unit</label>
                                    <div className="col-lg-6">

                                        <select className="form-control" id="businessUnit" name="businessUnit" value={this.state.businessUnit} disabled>
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
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Customer <span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <AsyncSelect
                                            value={this.state.customer}
                                            defaultOptions
                                            loadOptions={this.getCustomer}
                                            placeholder="Select Customer"
                                            onChange={this.handleCustomerChange}
                                            styles={customStylesSelect}
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
                                                <th>Regular Billing Amount</th>
                                                <th>Monthly Rent</th>
                                                <th>Receiving Date</th>
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
                                                                //loadOptions={promiseOptions}
                                                                placeholder="Select Equipment"
                                                                onChange={this.onEquipmentChange(index)}
                                                            // onChange={(e) => {
                                                            //this.onSearchChange(e);
                                                            //  }}
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
                                                            {item.regularBillingAmount}
                                                        </td>
                                                        <td>
                                                            <input className="form-control" type="number" value={item.monthlyRent} onChange={this.onChangeMonthlyRent(index)} />
                                                        </td>
                                                        <td>
                                                            <div className="form-group row">
                                                                <div className="col-lg-12">
                                                                    <input className="form-control" type="date" name="receivingDate" id="receivingDate" value={item.receivingDate} onChange={this.onChangeReceivingDate(index)} />
                                                                </div>
                                                            </div>
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
                                                <td colSpan="9">
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
                            <div className="ml-12">
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

export default ThirdPartyEmo;
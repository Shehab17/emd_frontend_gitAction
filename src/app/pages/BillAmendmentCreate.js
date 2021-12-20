import React, { Component } from 'react';
import { Spinner } from "react-bootstrap";
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";
import ToastMsg from '../components/ToastMsg';

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

class BillAmendmentCreate extends Component {

    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        billingBusinessUnit: "",
        billMonth: "",
        billYear: "",
        billNo:"",
        billId:"",
        remarks:"",
        billItems: [],
        projectAccountant: "",
        allBusinessUnits: []
    }

    componentDidMount() {
        const { allBusinessUnits, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllBu();
    }

    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };

    handleMonthChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value }, () => {
            if (this.state.billingBusinessUnit !== "") {
                this.getBillAmendment();
                this.getBillNo();
            }
        });
    };


    handleYearChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value }, () => {
            if (this.state.billingBusinessUnit !== "") {
                this.getBillAmendment();
                this.getBillNo();
            }
        });
    };

    handleBuChange = businessUnit => {
        this.setState({ billingBusinessUnit: businessUnit }, () => {
            this.getBillAmendment();
            this.getBillNo();
        });
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

    getBillNo() {
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const formData = {
            businessUnit: process.env.REACT_APP_EMD_BU_ID,
            billingBusinessUnit: this.state.billingBusinessUnit,
            billMonth: this.state.billMonth,
            billYear: this.state.billYear
        };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(formData)
        };
        fetch(process.env.REACT_APP_API_URL + "get_bill_no", requestOptions)
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ billNo: resp.billNo ,billId: resp.billId});
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    getBillAmendment() {
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const formData = {
            businessUnit: process.env.REACT_APP_EMD_BU_ID,
            billingBusinessUnit: this.state.billingBusinessUnit,
            billMonth: this.state.billMonth,
            billYear: this.state.billYear,
            billItems: this.state.billItems
        };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(formData)
        };
        fetch(process.env.REACT_APP_API_URL + "amendment_bill_generate", requestOptions)
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                this.setState({ loading: false });
                const newBillItems = resp.data.filter(function (fobj) {
                    return Number(fobj.billAmount.split("-")[0]) > 0;
                }).map(function (row) {
                    return { ...row, regularBillingAmount: Number(row.billAmount.split("-")[0]), deductionAmount: row.deductionAmount, billingAmount: (Number(row.billAmount.split("-")[0]) - Number(row.deductionAmount)).toFixed(2), billPeriod: row.billAmount.split("-")[1] > 0 ? '1 Month' : row.billAmount.split("-")[2] + 'Days' }
                });
                this.setState({
                    billItems: newBillItems
                }, () => this.calcTotal());
            })
            .catch((error) => {
                this.setState({ loading: false });
                console.log(error, "catch the hoop")
            });

    }

    onDeductionAmountChange = index => evt => {
        const newItems = this.state.billItems.map(function (row, rindex) {
            if (index === rindex) {
                row.deductionAmount = evt.target.value;
                row.billingAmount = (Number(row.regularBillingAmount) - Number(row.deductionAmount)).toFixed(2);
            }
            return row;
        })
        this.setState({ billItems: newItems });
        this.calcTotal();
    }

    onRegularBillingAmountChange = index => evt => {
        const newItems = this.state.billItems.map(function (row, rindex) {
            if (index === rindex) {
                row.regularBillingAmount = evt.target.value;
                row.billingAmount = (Number(row.regularBillingAmount) - Number(row.deductionAmount)).toFixed(2);
            }
            return row;
        })

        this.setState({ billItems: newItems });
        this.calcTotal();
    }

    objPsum = (items, prop) => {
        return items.reduce(function (a, b) {
            return Number(a) + Number(b[prop]);
        }, 0);
    }
    calcTotal = () => {
        this.setState({
            totalRegularBillingAmount: (this.objPsum(this.state.billItems, 'regularBillingAmount')).toFixed(2),
            totalDeduction: (this.objPsum(this.state.billItems, 'deductionAmount')).toFixed(2),
            totalBillingAmount: (this.objPsum(this.state.billItems, 'billingAmount')).toFixed(2)
        })
    }

    handleSubmit = evt => {
        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to create this bill!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                const formData = {
                    businessUnit: process.env.REACT_APP_EMD_BU_ID,
                    billingBusinessUnit: this.state.billingBusinessUnit,
                    billMonth: this.state.billMonth,
                    billYear: this.state.billYear,
                    billItems: this.state.billItems,
                    billNo:this.state.billNo,
                    billId:this.state.billId,
                    remarks:this.state.remarks
                };
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(formData)
                };

                var apiEnd = "amendment_bill_create";

                fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    console.log(resp);

                    if (resp.success === true) {
                        let successMsg = [`Bill NO# ${resp.data.billNo}`];

                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: successMsg,
                        })

                        this.setState(this.baseState);
                        this.props.history.push(`/generate-bill-details/${resp.data.id}`);
                    }
                    else {
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
                        toast.error(<ToastMsg toastMessage={errorsMessage} heading={resp.heading} />, {
                            position: toast.POSITION.TOP_RIGHT
                        });

                    }


                })
                .catch((error) => {
                    console.log(error, "catch the hoop")
                });

            }
        })
    }


    render() {

        const yearEndRange = new Date().getFullYear();
        const yearStartRange = yearEndRange - 1;

        const monthOption = [{ label: 'January', value: '1', },
        { label: 'February', value: '2' },
        { label: 'March', value: '3' },
        { label: 'April', value: '4' },
        { label: 'May', value: '5' },
        { label: 'June', value: '6' },
        { label: 'July', value: '7' },
        { label: 'August', value: '8' },
        { label: 'September', value: '9' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' },
        ];


        const yearOption = [];
        for (let i = yearStartRange; i <= yearEndRange; i++) {
            yearOption.push(i);
        }
        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <div className="card-title">
                            <h3 className="card-label"><p className="text-primary">Bill Amendment </p></h3>
                        </div>
                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label" style={{ "textAlign": "right" }}>Business Unit</label>
                                    <div className="col-lg-6">

                                        <select className="form-control form-control-sm" id="businessUnit" name="businessUnit" value={this.state.businessUnit} onChange={this.handleInputOnChange} disabled>
                                            <option value="">Select </option>
                                            {this.state.allBusinessUnits.map(item =>
                                                <option key={item.projectId} value={item.projectId}>{item.projectName}</option>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="billMonth" className="col-lg-2 col-form-label" style={{ "textAlign": "right" }}>Bill  Month</label>
                                    <div className="col-lg-6">
                                        <div className="row">
                                            <div className="col-lg-4">
                                                <select className="form-control form-control-sm" id="billMonth" name="billMonth" value={this.state.billMonth} onChange={this.handleMonthChange} >
                                                    <option value="">Select Month</option>
                                                    {monthOption.map((item, key) =>
                                                        <option key={key} value={item.value}>{item.label}</option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="col-lg-8">
                                                <div className="form-group row">
                                                    <label htmlFor="billYear" className="col-lg-4 col-form-label" style={{ "textAlign": "right" }}>Year</label>
                                                    <div className="col-lg-8">
                                                        <select className="form-control form-control-sm" id="billYear" name="billYear" value={this.state.billYear} onChange={this.handleYearChange} >
                                                            <option value="">Select Year</option>
                                                            {yearOption.map((item, key) =>
                                                                <option key={key} value={item}>{item}</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label" style={{ "textAlign": "right" }}>Bill To<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.billingBusinessUnit}
                                            onChange={this.handleBuChange}
                                            options={this.state.allBusinessUnits}
                                            styles={customStylesSelect}
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="billNo" className="col-lg-2 col-form-label" style={{ "textAlign": "right" }}>Bill No</label>
                                    <div className="col-lg-6">
                                        <input type="text" name="billNo" id="billNo" value={this.state.billNo} readOnly className='form-control form-control-sm' />
                                    </div>
                                </div>
                                <div className="form-group row">
									<label htmlFor="remarks" className="col-lg-2 col-form-label" style={{ "textAlign": "right" }} >Remarks<span className="required text-danger"> *</span></label>
									<div className="col-lg-6">
										<textarea className="form-control" name="remarks" id="remarks" value={this.state.remarks} onChange={this.handleInputOnChange} />
									</div>
								</div>
                            </div>

                        </div>

                        {this.state.billingBusinessUnit !== "" &&
                            <div className="card-body">
                                <div className="table-responsive">
									<table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                        <thead>
                                            <tr>
                                                <th>SL</th>
                                                <th>Equipment Code</th>
                                                <th>Equipment </th>
                                                <th>Capacity</th>
                                                <th>Manufacturer</th>
                                                <th>EMO No</th>
                                                <th>Log Data </th>
                                                <th>Bill periods</th>
                                                <th>Monthly Rent</th>
                                                <th>Regular Billing Amount</th>
                                                <th>Deduction Amount</th>
                                                <th>Bill Amount</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {this.state.loading ? <tr><td colSpan="12" className="text-center"> <Spinner animation="grow" /><Spinner animation="grow" /><Spinner animation="grow" /></td></tr> :

                                                this.state.billItems.map((item, index) =>
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.equipmentCode}</td>
                                                        <td>{item.equipmentName}</td>
                                                        <td>{item.capacity} </td>
                                                        <td>{item.manufacturerName}</td>
                                                        <td>{item.emoNo}</td>
                                                        <td>
                                                            {(item.logData !== "" && item.logData != null) &&
                                                                <ul>
                                                                    <li>Running: {item.logData.rHour}</li>
                                                                    <li>Breakdown:{item.logData.bHour}</li>
                                                                    <li>Idle: {item.logData.iHour}</li>
                                                                </ul>
                                                            }
                                                        </td>
                                                        <td>{item.billPeriod}<br />{item.releaseDate !== undefined && <small> Release Date <br /> {item.releaseDate} </small>}</td>
                                                        <td><input className="form-control form-control-sm" type="text" value={item.monthlyRent} readOnly /></td>
                                                        <td><input className="form-control form-control-sm" type="text" value={item.regularBillingAmount} readOnly /></td>
                                                        <td><input className="form-control form-control-sm" type="text" value={item.deductionAmount} onChange={this.onDeductionAmountChange(index)} /></td>
                                                        <td><input className="form-control form-control-sm" type="text" value={item.billingAmount} readOnly /></td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                        {this.state.loading ? "" :
                                        <tfoot>
                                            <tr>
                                                <td colSpan="9" className="text-right">
                                                    Total
                                                </td>
                                                <td>{this.state.totalRegularBillingAmount}</td>
                                                <td>{this.state.totalDeduction}</td>
                                                <td>{this.state.totalBillingAmount}</td>
                                            </tr>
                                        </tfoot>
                                        }
                                    </table>
                                </div>
                            </div>
                        }
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


                </div >
                <ToastContainer />
            </>

        );
    }
}

export default BillAmendmentCreate;
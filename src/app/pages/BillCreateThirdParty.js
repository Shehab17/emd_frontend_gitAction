import React, { Component } from 'react';
import AsyncSelect from 'react-select/async';
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

class BillCreateThirtParty extends Component {

    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        customer: "",
        billMonth: "",
        billYear: "",
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
            if (this.state.customer !== "") {
                this.getBill();
            }
        });
    };

    handleYearChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value }, () => {
            if (this.state.customer !== "") {
                this.getBill();
            }
        });
    };

    handleBuChange = businessUnit => {
        this.setState({ billingBusinessUnit: businessUnit }, () => {
            this.getBill();
        });
    }

    handleProjectAccChange = projectAccountant => {
        this.setState({ projectAccountant: projectAccountant });
    }

    handleCustomerChange = customer => {
        this.setState({ customer: customer }, () => {
            this.getBill();
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

    getBill() {
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const formData = {
            businessUnit: process.env.REACT_APP_EMD_BU_ID,
            customer: this.state.customer,
            billMonth: this.state.billMonth,
            billYear: this.state.billYear,
            billItems: this.state.billItems,
            projectAccountant: this.state.projectAccountant,
        };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(formData)
        };
        fetch(process.env.REACT_APP_API_URL + "bill_generate_thirdparty", requestOptions)
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                const newBillItems = resp.data.filter(function (fobj) {
                    return Number(fobj.billAmount.split("-")[0]) > 0;
                }).map(function (row) {
                    return { ...row, regularBillingAmount: Number(row.billAmount.split("-")[0]), deductionAmount: 0, billingAmount: Number(row.billAmount.split("-")[0]) - 0, billPeriod: row.billAmount.split("-")[1] > 0 ? '1 Month' : row.billAmount.split("-")[2] + 'Days' }
                });
                this.setState({
                    billItems: newBillItems
                }, () => this.calcTotal());
            })
            .catch((error) => {
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

    getCustomer = (inputValue, callback) => {
        if (!inputValue) {
            callback([]);
        } else {
            var api = process.env.REACT_APP_API_URL + "customer/customer_search?q=" + inputValue;
            setTimeout(() => {
                fetch(api,getGetRequestOptions())
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    const tempArray = resp.data.map(function (element) {
                        return { ...element, id: element.customerId, label: `${element.fullName} ${element.mobileNo}`, value: element.customerId }
                    });

                    callback(tempArray);
                })
                .catch((error) => {
                    console.log(error, "catch the hoop")
                });
            });
        }
    }


    handleSubmit = evt => {
        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to create bill!",
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
                    billMonth: this.state.billMonth,
                    billYear: this.state.billYear,
                    billItems: this.state.billItems,
                    projectAccountant: this.state.projectAccountant,
                };
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(formData)
                };

                var apiEnd = "bill_create_thirdparty";

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
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Bill Create Third Party</p></h3>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <div className="card-body">
                        <div className="ml-12">
                            <div className="form-group row">
                                <label htmlFor="example-text-input" className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Business Unit</label>
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
                                <label htmlFor="billMonth" className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Bill  Month</label>
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
                                                <label htmlFor="billYear" className="col-lg-4 col-form-label" style={{ "textAlign": "center" }}>Year</label>
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
                                <label htmlFor="example-text-input" className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Bill To</label>
                                <div className="col-lg-6">
                                    <AsyncSelect
                                        value={this.state.customer}
                                        defaultOptions
                                        loadOptions={this.getCustomer}
                                        placeholder="Select"
                                        onChange={this.handleCustomerChange}
                                        styles={customStylesSelect}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {this.state.customer !== "" ?
                        <div className="card-body">
                            <table className="table table-bordered table-checkable" id="kt_datatable">
                                <thead>
                                    <tr>
                                        <th>SL</th>
                                        <th>Equipment Code</th>
                                        <th>Equipment </th>
                                        <th>Capacity</th>
                                        <th>Manufacturer</th>
                                        <th>Bill periods</th>
                                        <th>Monthly Rent</th>
                                        <th>Regular Billing Amount</th>
                                        <th>Deduction Amount</th>
                                        <th>Bill  Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        this.state.billItems.map((item, index) =>
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.equipmentCode}</td>
                                                <td>{item.equipmentName}</td>
                                                <td>{item.capacity} </td>
                                                <td>{item.manufacturerName}</td>
                                                <td>{item.billPeriod}<br />{item.releaseDate !== undefined && <small> Release Date <br /> {item.releaseDate} </small>}</td>
                                                <td><input className="form-control form-control-sm" type="text" value={item.monthlyRent} readOnly /></td>
                                                <td><input className="form-control form-control-sm" type="text" value={item.regularBillingAmount} readOnly /></td>
                                                <td><input className="form-control form-control-sm" type="text" value={item.deductionAmount} onChange={this.onDeductionAmountChange(index)} /></td>
                                                <td><input className="form-control form-control-sm" type="text" value={item.billingAmount} readOnly /></td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="7" className="text-right">
                                            Total
                                        </td>
                                        <td>{this.state.totalRegularBillingAmount}</td>
                                        <td>{this.state.totalDeduction}</td>
                                        <td>{this.state.totalBillingAmount}</td>
                                    </tr>
                                </tfoot>
                            </table>
                            <div className="ml-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Project Accountant</label>
                                    <div className="col-lg-6">
                                        <AsyncSelect
                                            value={this.state.projectAccountant}
                                            defaultOptions
                                            loadOptions={this.fetchData}
                                            placeholder="Select  Project Accountant"
                                            onChange={this.handleProjectAccChange}
                                            styles={customStylesSelect}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div> : ""}


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

                <ToastContainer />
            </div >

        );
    }
}

export default BillCreateThirtParty;
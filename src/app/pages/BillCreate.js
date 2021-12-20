import React, { Component } from 'react';
import { Button, Modal, Spinner } from "react-bootstrap";
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import BillDraftList from '../components/BillDraftList';
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

class BillCreate extends Component {

    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        billingBusinessUnit: "",
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
        if(this.props.location.info !== undefined){
			var details = JSON.parse(this.props.location.info.details);
			this.setState({ billingBusinessUnit:{projectId:details.projectId,label:details.projectName,value:details.projectId},billMonth:details.billMonthNumber, billYear:details.billYear}, () => this.getBill());
		}
    }

    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };

    handleMonthChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value }, () => {
            if (this.state.billingBusinessUnit !== "") {
                this.getBill();
            }
        });
    };

    loadDraft = () => {
        this.setState({ draftListModalShow: true });
    }

    onDraftLoad = (draftData) => {
        //console.log(draftData);
        this.setState({ draftListModalShow: false });
        this.getDraftDetails(draftData.id);
    }

    getDraftDetails(id) {
        fetch(process.env.REACT_APP_API_URL + "bill_draft_details/" + id,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            //console.log(JSON.parse(resp.draftData));
            const draft = JSON.parse(resp.draftData);
            //console.log(myBillDraft);
            this.setState({
                billingBusinessUnit: draft.billingBusinessUnit,
                billMonth: draft.billMonth,
                billYear: draft.billYear,
                billItems: draft.billItems,
                loalDraftId: resp.id_bill_draft,
                loadDraftName: resp.name
            }, () => this.calcTotal());

        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    saveDraft = () => {
        this.setState({ draftSaveModalShow: true });
    }

    handleDraftSubmit = () => {
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const draftData = {
            billingBusinessUnit: this.state.billingBusinessUnit,
            billMonth: this.state.billMonth,
            billYear: this.state.billYear,
            billItems: this.state.billItems,
            totalRegularBillingAmount: this.state.totalRegularBillingAmount,
            totalDeduction: this.state.totalDeduction,
            totalBillingAmount: this.state.totalBillingAmount
        };
        const draftFormData = { name: this.state.draftName, draftData: draftData };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(draftFormData)
        };

        var apiEnd = "bill_draft_save";

        fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            //console.log(resp);
            if (resp.success === true) {
                let successMsg = [`Draft Saved`];
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: successMsg,
                })
                this.setState({ draftName: '' });
                this.setState({ draftSaveModalShow: false });

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

    handleYearChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value }, () => {
            if (this.state.billingBusinessUnit !== "") {
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
        this.setState({ loading: true });
        this.setState({ loalDraftId: "", loadDraftName: "" });
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const formData = {
            businessUnit: process.env.REACT_APP_EMD_BU_ID,
            billingBusinessUnit: this.state.billingBusinessUnit,
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
        fetch(process.env.REACT_APP_API_URL + "bill_generate", requestOptions)
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
                    billingBusinessUnit: this.state.billingBusinessUnit,
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

                var apiEnd = "bill_create";

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

        let draftSaveModalClose = () => {
            this.setState({ draftSaveModalShow: false });
        };

        let draftListModalClose = () => {
            this.setState({ draftListModalShow: false });
        };


        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <div className="card-title">
                            <h3 className="card-label"><p className="text-primary">Bill Create </p></h3>
                        </div>
                        <div className="card-toolbar mr-10 ">
                            <Button className="btn btn-primary btn-sm float-right mb-5 mr-5" onClick={() => this.saveDraft()}>Save Draft </Button>
                            <Button className="btn btn-primary btn-sm float-right mb-5" onClick={() => this.loadDraft()}>Load Draft </Button>
                        </div>
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
                                        <Select
                                            value={this.state.billingBusinessUnit}
                                            onChange={this.handleBuChange}
                                            options={this.state.allBusinessUnits}
                                            styles={customStylesSelect}
                                        />
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

                <Modal show={this.state.draftSaveModalShow} onHide={draftSaveModalClose} aria-labelledby="example-modal-sizes-title-lg">

                    <Modal.Body>

                        <h3 className="card-title">
                            <p className="text-primary">
                                Write the name of the draft</p>
                        </h3>

                        <div className="card-body">
                            <div className="ml-12">

                                <div className="form-group row">
                                    <label htmlFor="draftName" className="col-lg-4 col-form-label">Draft Name<span className="required text-danger">*</span></label>
                                    <div className="col-lg-8">
                                        <input type="text" name="draftName" id="draftName" value={this.state.draftName} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                    </div>
                                </div>


                            </div>
                        </div>


                    </Modal.Body>

                    <Modal.Footer>

                        <Button variant="primary" onClick={this.handleDraftSubmit}>
                            Save Draft
                        </Button>
                        <Button variant="secondary" onClick={draftSaveModalClose}>Cancel</Button>
                    </Modal.Footer>
                </Modal>

                <Modal size="lg" show={this.state.draftListModalShow} onHide={draftListModalClose} aria-labelledby="example-modal-sizes-title-lg">
                    <Modal.Header closeButton>
                        <h3>
                            <p className="text-primary">
                                Bill Draft List
                            </p>
                        </h3>
                    </Modal.Header>
                    <Modal.Body>
                        {/* <LogBookCreate onCreateLog={this.onCreateLog} project={this.state.project} logDate={this.state.logDate} /> */}
                        <BillDraftList onDraftLoad={this.onDraftLoad} />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={draftListModalClose}>Cancel</Button>
                    </Modal.Footer>
                </Modal>
                <ToastContainer />
            </>

        );
    }
}

export default BillCreate;
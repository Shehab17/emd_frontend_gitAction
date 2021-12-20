import React, { Component } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class EmoEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            emoId: "",
            businessUnit: process.env.REACT_APP_EMD_BU_ID,
            emoDate: "",
            receivingBu: {},
            items: [],
            remarks: "",
            billingPolicyOption: [],
            allBusinessUnits: [],
            receivingBusinessUnit: [],
        };
    }

    componentDidMount() {
        const {
            params: { emoId }
        } = this.props.match;
        this.setState({ emoId: this.props.match.params.emoId });
        this.getAllBu();
        this.getAllReceivingBu();
        this.getBillingPolicy();
        this.getEmoEditInfo(emoId);
    }

    getEmoEditInfo(emoId) {
        fetch(process.env.REACT_APP_API_URL + "emo/emo_edit/" + emoId, 
        getGetRequestOptions())

        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({
                emoDate: resp.emoDate,
                receivingBu: resp.receiving_businessunit,
                items: resp.emo_item,
                remarks: resp.remarks
            });

            let items = this.state.items.map(function (element) {
                return { ...element, equipmentCode: element.equipment.equipmentCode, model:element.equipment.model,capCode:element.equipment.capCode}
            });
            this.setState({items:items});
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }


    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };

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
                fetch(url,getGetRequestOptions())
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
    
    onChangeMonthlyRent = index => evt => {

        const newItems = this.state.items.map(function (row, rindex) {
            if (index === rindex) {
                row.monthlyRent = evt.target.value;
            }
            return row;
        })
        this.setState({ items: newItems });
    }

    handleSubmit = evt => {
        evt.preventDefault();

            Swal.fire({
                title: 'Are you sure?',
                text: "You want to update this Equipment Movement Order!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }            
                    const formData = {
                        emoId: this.state.emoId,
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

                    var apiEnd = "emo/emo_update/" + this.state.emoId;

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
                                var errorsMessage = [];

                                if (resp.errorMessage !== undefined && typeof resp.errorMessage === 'object') {
                                    var errorsObj = resp.errorMessage;
                                    Object.keys(errorsObj).forEach(function (value) {
                                        errorsObj[value].forEach(function (v) {
                                            errorsMessage.push(v)
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


    render() {
        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                                Equipment Movement Order Edit
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
                                        <input type="date" name="emoDate" id="emoDate" value={this.state.emoDate} onChange={this.handleInputOnChange} className='form-control form-control-md is-valid' />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Receiving Business Unit<span className="required text-danger">*</span></label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.receivingBu}
                                            onChange={this.handleReceivingBuChange}
                                            options={this.state.receivingBusinessUnit}
                                            isDisabled={true}
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
                                                <th>Equipment Name</th>
                                                <th>Equipment Code</th>
                                                <th>Model</th>
                                                <th>Capitalization Code</th>
                                                <th>Billing Policy</th>
                                                <th>Monthly Rent</th>
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
                                                                isDisabled={true}
                                                            />
                                                        </td>
                                                        <td>
                                                            {item.equipmentCode}
                                                        </td>
                                                        <td>
                                                            {item.model}
                                                        </td>
                                                        <td>
                                                            {item.capCode}
                                                        </td>
                                                        <td>
                                                            <select className="form-control" value={item.billingPolicy || ""} style={{width:"auto"}} disabled>
                                                                <option value="">Select Billing Policy</option>
                                                                {this.state.billingPolicyOption.map(item =>
                                                                    <option key={item.billingPolicyId} value={item.billingPolicyId}>{item.billingPolicyName}</option>
                                                                )}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input className="form-control" type="text" value={item.monthlyRent || ""} readOnly={this.state.receivingBu.policy === "auto"} onChange={this.onChangeMonthlyRent(index)} />
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="ml-12 mt-5">
                                <div className="form-group row">
                                    <label htmlFor="remarks" className="col-lg-2 col-form-label">Remarks</label>
                                    <div className="col-lg-6">
                                        <textarea className="form-control" name="remarks" id="remarks" value={this.state.remarks || ""} onChange={this.handleInputOnChange} />
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

export default EmoEdit;
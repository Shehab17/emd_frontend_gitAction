import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";
import Select from 'react-select';
import InputMask from 'react-input-mask';

class OperationConfirm extends Component {
    state = {
        operationId: "",
		equipmentId:"",
        operation: "",
        operationDetails: "",
        startDate: "",
        endDate: "",
        amount: "",
        time:"",
        serviceOrderReceive:"",
        serviceOrderReceiveList:""
    }


    componentDidMount() {

        if (this.props.operationId !== undefined) {
            this.getOperationDetails(this.props.operationId);
            this.setState({ operationId: this.props.operationId });
            this.setState({equipmentId: this.props.equipmentId},() =>this.getServiceOrderReceiveList(this.props.operationId,this.props.equipmentId));
        }
    }

    getOperationDetails(operationId) {

        fetch(process.env.REACT_APP_API_URL + "operation_details/" + operationId, 
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({
                moId : resp.moId,
                operation: resp.operation,
                operationDetails: resp.operationDetails,
                startDate: resp.startDate,
                endDate: resp.endDate,
                amount: resp.amount,
                time: resp.time,
                serviceOrderReceive: resp.service_order_receive_rows != null ? resp.service_order_receive_rows: ""
            });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }
	
	getServiceOrderReceiveList(operationId,equipmentId) {
        fetch(process.env.REACT_APP_API_URL + "maintenance_order/service_order_receive_list_confirm/" + equipmentId +"/"+operationId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
			let tempResp = resp.map(function (element) {
                return { ...element, label: `${element.srrNo} (${element.categoryName})`, value: element.sorrId }
            });
            this.setState({ serviceOrderReceiveList: tempResp});
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }


    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };

    handleServiceOrderReceiveChange = serviceOrderReceiveList => {
        this.setState({ serviceOrderReceive: serviceOrderReceiveList, amount: serviceOrderReceiveList.totalAmount});
    }

    handleSubmit = evt => {
        evt.preventDefault();
        const isValid = true;  
    
        if (isValid) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You want to confirm this operation !",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        operationId: this.state.operationId,
                        moId:this.state.moId,
                        operation: this.state.operation,
                        operationDetails: this.state.operationDetails,
                        startDate: this.state.startDate,
                        endDate: this.state.endDate,
                        amount: this.state.amount,
                        time:this.state.time,
                        serviceOrderReceive: this.state.serviceOrderReceive
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "maintenance_order/operation_confirm";

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
                                this.props.onOperationConfirm({ id: resp.data.id, rid: Math.random() });
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

        return (
            <>

                <h3 className="card-title">
                    <p className="text-primary">
                        Operation Confirmation
                    </p>
                </h3>


                <form onSubmit={this.handleSubmit}>
                    <div className="card-body">
                        <div className="ml-12">
                            <div className="form-group row">
                                <label htmlFor="operation" className="col-lg-3 col-form-label">Operation</label>
                                <div className="col-lg-6">
                                    <input type="text" name="operation" id="operation" value={this.state.operation} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="operationDetails" className="col-lg-3 col-form-label">Operation Details</label>
                                <div className="col-lg-6">
                                <textarea name="operationDetails" id="operationDetails" value={this.state.operationDetails} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="startDate" className="col-lg-3 col-form-label">Work Start Date</label>
                                <div className="col-lg-4">
                                    <input type="date" name="startDate" id="endingTime" value={this.state.startDate} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="endDate" className="col-lg-3 col-form-label">Work Finish Date</label>
                                <div className="col-lg-4">
                                    <input type="date" name="endDate" id="endDate" value={this.state.endDate} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="time" className="col-lg-3 col-form-label">Duration(h:m)</label>
                                <div className="col-lg-3">
                                    <InputMask mask="99:99" className="form-control" name="time" id="time" onChange={this.handleInputOnChange} value={this.state.time} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="example-text-input" className="col-lg-3 col-form-label">Tag SRR/SR Certification</label>
                                <div className="col-lg-6">
                                    <Select
                                        value={this.state.serviceOrderReceive}
                                        onChange={this.handleServiceOrderReceiveChange}
                                        options={this.state.serviceOrderReceiveList}
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="amount" className="col-lg-3 col-form-label">Amount</label>
                                <div className="col-lg-3">
                                    <input type="number" name="amount" id="amount" value={this.state.amount || ""} className="form-control" readOnly/>
                                </div>
                            </div>
                        </div>
						{this.state.serviceOrderReceive !== "" &&
							<div className="col-12">
								<table className="table table-bordered table-hover">
									<thead>
										<tr>
											<th>Vendor Name</th>
											<th>Service Order Id</th>
											<th>Item Name</th>
											<th>Quantity</th>
											<th>Rate</th>
											<th>Amount</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>{this.state.serviceOrderReceive.vendorName}</td>
											<td>{this.state.serviceOrderReceive.serviceOrderId}</td>
											<td>{this.state.serviceOrderReceive.categoryName}</td>
											<td>{this.state.serviceOrderReceive.quantity}</td>
											<td>{this.state.serviceOrderReceive.rate}</td>
											<td>{this.state.serviceOrderReceive.totalAmount}</td>
										</tr>
									</tbody>
							 	</table>
						 	</div>
						}
                    </div>

                    <div className="card-footer">
                        <div className="row">
                            <div className="col-4">
                            </div>
                            <div className="col-6">
                                <button type="submit" className="btn btn-success mr-2">Confirm</button>
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

export default OperationConfirm;
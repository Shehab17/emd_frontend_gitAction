import axios from 'axios';
import React, { Component } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class BillDetails extends Component {
    state = {
        billId: "",
        billingBu: { id: "", businessunitName: "" },
        customer: {},
        billNo: "",
        billMonth: "",
        billDate: "",
        billYear: "",
        total: "",
        totalDeduction:"",
        type: "",
        status:"",
        category:"",
        refBillNo:"",
        refBillId:"",
        remarks:"",
        tab:"billDetails",
        items: [],
        billStatus: [],
        amendmentDetails:[],
        selectedFile: null,
        file: [],
    }

    componentDidMount() {
        const {
            params: { id }
        } = this.props.match;
        this.setState({ billId: this.props.match.params.id });
        this.getBillDetails(id);
        this.getAllFiles("Bill_Details", id);
    }

    objPsum = (items, prop) => {
        return items.reduce(function (a, b) {
            return Number(a) + Number(b[prop]);
        }, 0);
    }

    getBillDetails(billId) {
        fetch(process.env.REACT_APP_API_URL + "bill_details/" + billId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({
                billNo: resp.data.details.billNo,
                billMonth: resp.data.details.billMonth,
                billYear: resp.data.details.billYear,
                billDate: resp.data.details.billDate,
                total: Number(resp.data.details.total).toFixed(2),
                billingBu: resp.data.details.billing_bu,
                customer: resp.data.details.customer,
                type: resp.data.details.type,
                items: resp.data.details.bill_item,
                billStatus: resp.data.details.bill_status,
                selectedFile: null,
                status:resp.data.details.status,
                category:resp.data.details.category,
                refBillNo:resp.data.details.refBillNo,
                refBillId:resp.data.details.refBillId,
                remarks:resp.data.details.remarks,
                amendmentDetails:resp.data.amendmentDetails
            });

            this.setState({
                totalRegularBillingAmount: (Number(resp.data.details.total) + Number(this.objPsum(resp.data.details.bill_item, 'deductionAmount')) ).toFixed(2), 
                totalDeduction: (this.objPsum(resp.data.details.bill_item, 'deductionAmount')).toFixed(2)
            
            })

        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }

    setTab = (tabName) => {
		this.setState({ tab: tabName });
	}

    getAllFiles(refType, refId) {
        fetch(process.env.REACT_APP_API_URL + "emd/get_all_files/" + refType + "/" + refId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ file: resp });

        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    billPrint = (billId) => {
        var link = process.env.REACT_APP_API_URL.split("api/")[0] + "bill_print/" + billId;
        window.open(link, '_blank');
    }

    onFileChange = event => {
        // Update the state 
        this.setState({ selectedFile: event.target.files[0] });
    };

    // On file upload (click the upload button) 
    onFileUpload = evt => {

        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to upload this file',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {

                const formData = new FormData();

                formData.append(
                    "myFile",
                    this.state.selectedFile,
                    this.state.selectedFile.name,
                );
                formData.append("refType", "Bill_Details");
                formData.append("refId", this.state.billId);
                const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                var authOptions = {
                    method: 'post',
                    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + jwt().token },
                    url: process.env.REACT_APP_API_URL + "emd/file_upload",
                    data: formData,

                };
                axios(authOptions)
                    .then(response => {
                        console.log(response);
                        if (response.data.success === true) {

                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'File uploaded successfully',
                            })

                            this.setState({ selectedFile: null });
                            this.getAllFiles("Bill_Details", this.state.billId);
                        }
                        else {
                            //var errorsMessage = "";
                            var errorsMessage = [];

                            if (response.data.errorMessage !== undefined && typeof response.data.errorMessage === 'object') {
                                var errorsObj = response.data.errorMessage;
                                Object.keys(errorsObj).forEach(function (value) {
                                    errorsObj[value].forEach(function (v) {
                                        errorsMessage.push(v)
                                    });

                                });

                            } else if (response.data.errorMessage !== undefined && (typeof response.data.errorMessage === 'string' || response.data.errorMessage instanceof String)) {

                                errorsMessage.push(response.data.errorMessage);
                            } else {

                                errorsMessage.push("Something went wrong");
                            }
                            Swal.fire({
                                icon: 'error',
                                title: response.heading,
                                text: errorsMessage,
                            })

                        }
                    })
                    .catch((error) => {
                        console.log(error, "catch the hoop");
                    })
            }
        })
    }

    fileData = () => {

        if (this.state.selectedFile) {

            return (
                <>
                    <h3>File Details:</h3>
                    <p>File Name: {this.state.selectedFile.name}</p>
                    <p>File Type: {this.state.selectedFile.type}</p>
                </>
            );
        }
    };

    removeFile = fileId => evt => {
        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this file',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                const { ...formData } = this.state;
                const requestOptions = {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(formData)
                };

                fetch(process.env.REACT_APP_API_URL + "emd/delete_file/" + fileId, requestOptions)
                    .then((resp) => {
                        return resp.json()
                    })
                    .then((resp) => {
                        console.log(resp);

                        if (resp.success === true) {

                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'File deleted successfully',
                            })
                            this.getAllFiles("Bill_Details", this.state.billId);
                        }
                        else {
                            //var errorsMessage = "";
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
        //const filehost = process.env.REACT_APP_API_URL.split("api/")[0];
        const filehost = process.env.REACT_APP_AWS_URL+'emd/';
        const filePath = "Bill_Details";
        const billPrintEndPoint = process.env.REACT_APP_API_URL.split("api/")[0] + "bill_print";
        const excelExportEndPoint = process.env.REACT_APP_API_URL.split("api/")[0]+'bill_details_excel_export';
        const token = JSON.parse(localStorage.getItem('MyToken'));
        

        return (<>
        <div className="card card-custom">
            <div className="ml-12" style={{'height':'60px'}}>
                <ul className="nav nav-tabs nav-tabs-line"  style={{'fontSize':'18px'}}>
                    <li className="nav-item" onClick={() => this.setTab("billDetails")}>
                        <a className={`nav-link ${this.state.tab === "billDetails" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "billDetails").toString()} href={() => false}>Bill Details</a>
                    </li>
                    {this.state.amendmentDetails.length> 0 && 
                        <li className="nav-item" onClick={() => this.setTab("amendmentDetails")}>
                            <a className={`nav-link ${this.state.tab === "amendmentDetails" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "amendmentDetails").toString()} href={() => false}>Amendment Details</a>
                        </li>
                    }
                </ul>
            </div>
            {this.state.tab === "billDetails" && 
                <div className="card card-custom">
                    <form>
                        <div className="card-body" style={{"marginTop":"-25px"}}>
                            <div className="row">
                                <div className="col-8">
                                    <table className="table table-bordered table-condensed">
                                        <tbody>
                                            <tr>
                                                <th style={{ 'width': '30%' }}>Bill No</th>
                                                <td style={{ 'width': '70%' }}>{this.state.billNo}</td>
                                            </tr>
                                            <tr>
                                                <th>Bill Month</th>
                                                <td>{this.state.billMonth + '-' + this.state.billYear}</td>
                                            </tr>

                                            <tr>
                                                <th>Bill Date</th>
                                                <td>{this.state.billDate}</td>
                                            </tr>

                                            <tr>
                                                <th>Bill To</th>
                                                <td>{this.state.type === 'In House' ? this.state.billingBu.businessunitName : this.state.customer.customerName}</td>
                                            </tr>
                                            <tr>
                                                <th>Bill Category</th>
                                                <td>{this.state.category}</td>
                                            </tr>
                                            {this.state.category === "Amendment" &&
                                            <tr>
                                                <th>Reference Bill</th>
                                                <td><a href={`#/generate-bill-details/${this.state.refBillId}`} target="_blank" rel="noopener noreferrer">{this.state.refBillNo}</a></td>
                                            </tr>
                                            }
                                            <tr>
                                                <th>Bill Status</th>
                                                <td>{this.state.status === 'created' && <span className="label label-lg label-info label-inline mr-2">Created</span>}{this.state.status === 'approved' && <span className="label label-lg  label-success label-inline mr-2">Approved</span>}</td>
                                            </tr>
                                            <tr>
                                                <th>Remarks</th>
                                                <td>{this.state.remarks}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-4">
                                    <a href={`${excelExportEndPoint}/${this.state.billId}?token=${token.token}`}  className="btn btn-success btn-sm mr-3 float-center"><i className="flaticon2-download-1"></i>Excel Export</a>
                                    <a href={`${billPrintEndPoint}/${this.state.billId}?token=${token.token}`} target="_blank" rel="noopener noreferrer"  className="btn btn-success btn-sm float-center">Bill Print</a>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                            <tbody>
                                                <tr>
                                                    <th>SL</th>
                                                    <th>Equipment Code</th>
                                                    <th>Equipment </th>
                                                    <th>Capacity</th>
                                                    <th>Manufacturer</th>
                                                    <th>Bill periods</th>
                                                    <th>Regular Billing Amount</th>
                                                    <th>Deduction Amount</th>
                                                    <th>Bill  Amount</th>
                                                </tr>
                                                {this.state.items.map((item, index) =>
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.equipment.equipmentCode}</td>
                                                        <td>{item.equipment.equipmentName}</td>
                                                        <td>{item.equipment.capacity} </td>
                                                        <td>{item.equipment.manufacturerName}</td>
                                                        <td>{item.billPeriodMonth > 0 ? item.billPeriodMonth + ' Month' : item.billPeriodDay + ' Days'}</td>
                                                        <td>{Number(item.amount) + Number(item.deductionAmount)}</td>
                                                        <td>{item.deductionAmount}</td>
                                                        <td>{item.amount}</td>
                                                    </tr>
                                                )}

                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="6" className="text-right"> Total </td>
                                                    <td>{this.state.totalRegularBillingAmount}</td>
                                                    <td>{this.state.totalDeduction}</td>
                                                    <td>{this.state.total}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-6">
                                    <div className="card card-custom">
                                        <div className="card-header">
                                            <div className="card-title">
                                                <h3 className="card-label">
                                                    Billing Timeline
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="timeline timeline-3">
                                                <div className="timeline-items">
                                                    {
                                                        this.state.billStatus.map((item, index) =>
                                                            <div className="timeline-item" key={index}>
                                                                <div className="timeline-media">
                                                                    {item.status === "created" ? <i className="flaticon2-plus text-primary "></i>
                                                                        : <i className="flaticon2-check-mark text-success"></i>
                                                                    }
                                                                </div>
                                                                <div className="timeline-content">
                                                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                                                        <div className="mr-4">
                                                                            <span className="mr-3 font-weight-bolder" style={{ "fontSize": "15px", "color": "#e35b5a" }}>
                                                                                Bill No {this.state.billNo} has been
                                                                                {item.status === "created" ? " Created" : " Approved"}
                                                                                <span className="text-muted ml-2"> at {item.create_date}</span>
                                                                            </span>
                                                                            {this.state.type === 'in-house' &&
                                                                                <p className="mr-3 mt-3">Business Unit : <b style={{color:"#8950FC"}}>{this.state.billingBu.businessunitName}</b></p>
                                                                            }
                                                                            {this.state.type === 'third-party' &&
                                                                                <p className="mr-3 mt-3">Customer : <b style={{color:"#8950FC"}}>{this.state.customer.customerName}</b></p>
                                                                            }
                                                                            {item.status === "created" &&
                                                                                <p className="mr-3">
                                                                                    Created By : <a href="/#"><b>{item.fullName}</b></a>
                                                                                </p>
                                                                            }
                                                                            {item.status === "approved" &&
                                                                                <p className="mr-3">
                                                                                    Approved By : <a href="/#"><b>{item.fullName}</b></a>
                                                                                </p>
                                                                            }

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="card card-custom">
                                        <div className="card-header">
                                            <div className="card-title">
                                                <h3 className="card-label">
                                                    File Upload
                                        </h3>
                                            </div>
                                        </div>

                                        <div className="card-body">
                                            <div className="form-group row">
                                                <label className="col-lg-2 col-form-label">Upload Files:</label>
                                                <div className="col-lg-4  col-form-label">
                                                    <input type="file" onChange={this.onFileChange}
                                                    />
                                                </div>

                                            </div>
                                            <div className="mt-2 mr-2">
                                                {this.fileData()}
                                            </div>
                                            <button type="button" className="btn btn-outline-primary btn-sm btn-square mt-1 mr-2" onClick={this.onFileUpload}> Upload</button>

                                            <table className="table table-bordered table-hover mt-2">
                                                <thead>
                                                    <tr>
                                                        <td>Sl</td>
                                                        <td>Name</td>
                                                        <td>Size</td>
                                                        <td style={{ "textAlign": "center" }}>Action</td>
                                                    </tr>
                                                </thead>
                                                {this.state.file.length > 0 ?
                                                    <tbody>
                                                        {this.state.file.map((item, index) =>
                                                            <tr key={index}>
                                                                <td>{index + 1}</td>
                                                                <td>{item.originalFileName}</td>
                                                                <td>{item.fileSize}</td>
                                                                <td style={{ "textAlign": "center" }}>
                                                                    <a href={`${filehost}uploads/${filePath}/${this.state.billId}/${item.fileName}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary mr-3"><i className="flaticon2-download-1"></i> Download</a>
                                                                    <button type="button" className="btn btn-outline-danger mr-3" onClick={this.removeFile(item.fileId)}> <i className="flaticon-delete"></i>Delete</button>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                    :
                                                    <tbody>
                                                        <tr>
                                                            <td colSpan="4"><p style={{ "textAlign": "center" }}><strong>No File Found</strong></p></td>
                                                        </tr>
                                                    </tbody>
                                                }
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
            }
            {this.state.tab === "amendmentDetails" && 
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                    <tbody>
                                        <tr> 
                                            <th>SL</th>
                                            <th>Bill No</th>
                                            <th>Remarks</th>
                                            <th>Amount</th>
                                            <th>Action </th>
                                        </tr>
                                        {this.state.amendmentDetails.map((item, index) =>
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.refBillNo}</td>
                                                <td>{item.remarks}</td>
                                                <td>{item.amount}</td>
                                                <td>
                                                    <a href={`#/generate-bill-details/${item.refBillId}`} target="_blank" rel="noopener noreferrer" className="btn btn-light-primary btn-sm mr-2"> Details</a>
                                                </td>
                                            </tr>
                                        )}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>    
    </>);
    }
}

export default BillDetails;
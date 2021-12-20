import React, { Component } from 'react';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getGetRequestOptions } from "../../components/GetToken";
import ToastMsg from '../../components/ToastMsg';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import "./../../../style/table.css";

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

class EmoDetailsReport extends Component {

    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        receivingBusinessUnit: "",
        fromDate: "",
        toDate: "",
        reportData: [],
        allBusinessUnits: [],
        showReport: false,
        errors: {
            fromDate: "",
            toDate: "",
        },
        touched: {
            fromDate: false,
            toDate: false
        }

    }

    componentDidMount() {
        const { allBusinessUnits, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllBu();
    }

    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };


    handleBuChange = businessUnit => {
        this.setState({ receivingBusinessUnit: businessUnit });
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
            const tempResp = resp.data.map(function (element) {
                return { ...element, label: element.projectName, value: element.projectId, isdisabled: element.projectName === 'EMD' ? false : true }
            }).filter(row => row.projectId !== process.env.REACT_APP_EMD_BU_ID);
            const newTempResp = tempResp.concat([{
                "projectId": "all",
                "projectName": "All",
                "companyId": "",
                "label": "All",
                "value": "all"
            }]);
            this.setState({ allBusinessUnits: newTempResp });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    excelExport = (buId, fromDate, toDate) => {
        var link = process.env.REACT_APP_API_URL.split("api/")[0] + "report/emo_details_excel_export/" + buId;
        window.open(link, '_blank');
    }

    getReportData() {
        this.setState({ loading: true });

        const { receivingBusinessUnit, fromDate, toDate } = this.state;

        const formData = {
            receivingBusinessUnit: receivingBusinessUnit,
            fromDate: fromDate,
            toDate: toDate
        };

        //console.log(formData);
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(formData)
        };
        fetch(process.env.REACT_APP_API_URL + "reports/emo_details", requestOptions)
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                this.setState({ loading: false });

                if (resp.success === true) {
                    this.setState({
                        reportData: resp.data
                    });
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
                this.setState({ loading: false });
                console.log(error, "catch the hoop")
            });

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
        this.setState({ showReport: true });
        this.getReportData();
    }

    render() {

        const { errors, touched } = this.state;
        const excelExportEndPoint = process.env.REACT_APP_API_URL.split("api/")[0]+'report/emo_details_excel_export';
        const token = JSON.parse(localStorage.getItem('MyToken'));

        const skeletonLenArr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
        return (

            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <div className="card-title">
                            <h3 className="card-label"><p className="text-primary">EMO Details Report</p></h3>
                        </div>

                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">

                                <div className="form-group row">
                                    <label htmlFor="fromDate" className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>From  Date</label>
                                    <div className="col-lg-6">
                                        <div className="row">
                                            <div className="col-lg-5">
                                                <input type="date" name="fromDate" id="fromDate" value={this.state.fromDate} onChange={this.handleInputOnChange} className={`form-control form-control-md ${touched.fromDate === true ? (errors.fromDate === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                            </div>
                                            <div className="col-lg-7">
                                                <div className="form-group row">
                                                    <label htmlFor="toDate" className="col-lg-3 col-form-label" style={{ "textAlign": "center" }}>To Date</label>
                                                    <div className="col-lg-9">
                                                        <input type="date" name="toDate" id="toDate" value={this.state.toDate} onChange={this.handleInputOnChange} className={`form-control form-control-md ${touched.toDate === true ? (errors.toDate === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Receiving  Business Unit</label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.receivingBusinessUnit}
                                            onChange={this.handleBuChange}
                                            options={this.state.allBusinessUnits}
                                            styles={customStylesSelect}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">

                                    <div className="col-lg-2">
                                    </div>
                                    <div className="col-lg-6">
                                        <button type="submit" className="btn btn-success mr-2">Show</button>

                                    </div>

                                </div>
                                {/* <pre>
									{JSON.stringify(this.state, null, 2)}
								</pre> */}
                            </div>
                        </div>
                    </form>

                    {this.state.showReport !== "" ?
                        <div className="card-body" style={{"marginTop": "-60px"}}>
                            <div className="card-toolbar mt-5 mr-10  mb-5 ">
                        	    { this.state.reportData.length > 0 && <a href={`${excelExportEndPoint}/${this.state.receivingBusinessUnit.value}/${this.state.fromDate}/${this.state.toDate}?token=${token.token}`}  className="btn btn-primary btn-sm mr-3"><i className="flaticon2-download-1"></i>Excel Export</a> }
                    	    </div>
                            <div className="tableFixHead">
                                <div className="table-responsive" style={{maxHeight: "500px"}}>
                                    <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                        <thead>
                                            <tr>
                                                <th>SL</th>
                                                <th>EMO No</th>
                                                <th>EMO Create Date</th>
                                                <th>Equipment Name</th>
                                                <th>Equipment Code</th>
                                                <th>Physical Asset Code</th>
                                                <th>Model</th>
                                                <th>Capacity</th>
                                                <th>Manufacturer</th>
                                                <th>Receiving  Business Unit</th>
                                                <th>Billing Amount</th>
                                                <th>Status</th>
                                                <th>EMO Creator</th>
                                                <th>EMO Approver</th>
                                                <th>Remarks</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {this.state.loading &&    
                                                <tr>
                                                    {skeletonLenArr.map((item, index) =>
                                                        <td key={index}> 
                                                            <p>
                                                                <Skeleton count={14} />
                                                            </p>
                                                        </td>
                                                    )}   
                                                </tr>
                                            }
                                            { !this.state.loading && this.state.reportData.map((item, index) =>
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.emoNo}</td>
                                                    <td>{item.emoDate}</td>
                                                    <td>{item.equipmentName}</td>
                                                    <td>{item.equipmentCode}</td>
                                                    <td>{item.physicalAssetCode}</td>
                                                    <td>{item.model}</td>
                                                    <td>{item.capacity} </td>
                                                    <td>{item.manufacturerName}</td>
                                                    <td>{item.receivingBuName}</td>
                                                    <td>{item.billingAmount}</td>
                                                    <td>{item.status}</td>
                                                    <td>{item.emoCreator}</td>
                                                    <td>{item.emoApprover}</td>
                                                    <td>{item.remarks}</td>
                                                </tr>
                                            )
                                            }
                                        </tbody>

                                    </table>
                                </div>
                            </div>     
                        </div> : ""
                    }
                </div>
                <ToastContainer />
            </>

        );
    }
}

export default EmoDetailsReport;
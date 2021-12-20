import React, { Component } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ToastMsg from '../../components/ToastMsg';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import "./../../../style/table.css";

class BillingProjectWiseReport extends Component {
    state = {
        billMonth: "",
        billYear: "",
        isAll: 0,
        reportData: [],
        showReport: false,
        errors: {
            billMonth: "",
            billYear: "",
        },
        touched: {
            billMonth: false,
            billYear: false
        }
    }

    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
        let errors = this.state.errors;
        let touched = this.state.touched;

        if (evt.target.name === "billMonth") {
            touched.billMonth = true;
            if (this.state.isAll !== 1 && evt.target.value === "") {
                errors.billMonth = "Bill Month is required!";
            }
            else {
                errors.billMonth = "";
            }
        }

        else if (evt.target.name === "billYear") {
            touched.billYear = true;
            if (this.state.isAll !== 1 && evt.target.value === "") {
                errors.billYear = "Bill Year is required!";
            }
            else {
                errors.billYear = "";
            }
        }

        this.setState({ errors, touched: touched });
    };

    handleChangeIsAll = evt => {
        if (evt.target.checked === true) {
            this.setState({ [evt.target.name]: 1 });
        }
        else {
            this.setState({ [evt.target.name]: 0 });
        }

    }

    getReportData() {
        this.setState({ loading: true });

        const { billMonth, billYear, isAll } = this.state;

        const formData = {
            billMonth: billMonth,
            billYear: billYear,
            isAll: isAll
        };

        //console.log(formData);
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(formData)
        };
        fetch(process.env.REACT_APP_API_URL + "reports/project_wise_billing", requestOptions)
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

    validateForm = () => {
        let errors = this.state.errors;
        let touched = this.state.touched;
        for (var input in errors) {

            touched[input] = true;

            if (input === "billMonth" ) {
                if (this.state.isAll !==1 && this.state.billMonth === "") {
                    errors.billMonth = "Bill Month is required!";
                }
                else {
                    errors.billMonth = "";
                }
            }

            else if (input === "billYear" ) {
                if (this.state.isAll !==1 && this.state.billYear === "") {
                    errors.billYear = "Bill Year is required!";
                }
                else {
                    errors.billYear = "";
                }
            }
        }
        this.setState({ errors, touched: touched });

        if (this.state.errors.billMonth !== "" || this.state.errors.billYear !== "") {
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
        this.setState({ showReport: true });
        this.getReportData();
        }

    }




    render() {

        const { errors } = this.state;
        let  endPoint = process.env.REACT_APP_API_URL.split("api/")[0] + 'report/project_wise_billing_excel_export';
        if(this.state.isAll === 1){
        endPoint = endPoint+'/'+this.state.isAll+'/0/0';
        }
        else{
         endPoint = endPoint+'/'+this.state.isAll+'/'+this.state.billMonth+ '/'+ this.state.billYear;
        }
        const excelExportEndPoint = endPoint;

        const token = JSON.parse(localStorage.getItem('MyToken'));


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

        const skeletonLenArr = [1,2,3,4,5,6,7,8,9]

        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <div className="card-title">
                            <h3 className="card-label"><p className="text-primary">Project Wise Billing Report</p></h3>
                        </div>

                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">

                                <div className="form-group row">
                                    <div className="row col-lg-2"></div>
                                    <div className="row col-lg-6" style={{ "marginLeft": "30px" }}>
                                        <div className="checkbox-inline">
                                            <label className="checkbox checkbox-lg">
                                                <input type="checkbox"
                                                    name="isAll"
                                                    checked={this.state.isAll === 1}
                                                    onChange={this.handleChangeIsAll}
                                                />
                                                <span></span>
                                                All
                                            </label>

                                        </div>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="billMonth" className="col-lg-2 col-form-label" style={{ "textAlign": "center" }}>Bill  Month</label>
                                    <div className="col-lg-6">
                                        <div className="row">
                                            <div className="col-lg-4">
                                                <select className={`form-control form-control-sm`} id="billMonth" name="billMonth" value={this.state.billMonth} onChange={this.handleInputOnChange} >
                                                    <option value="">Select Month</option>
                                                    {monthOption.map((item, key) =>
                                                        <option key={key} value={item.value}>{item.label}</option>
                                                    )}
                                                </select>
                                                <div className="invalid-feedback" style={{'display':'block'}}>{errors.billMonth}</div>
                                            </div>
                                            <div className="col-lg-8">
                                                <div className="form-group row">
                                                    <label htmlFor="billYear" className="col-lg-4 col-form-label" style={{ "textAlign": "center" }}>Year</label>
                                                    <div className="col-lg-8">
                                                        <select className="form-control form-control-sm" id="billYear" name="billYear" value={this.state.billYear} onChange={this.handleInputOnChange} >
                                                            <option value="">Select Year</option>
                                                            {yearOption.map((item, key) =>
                                                                <option key={key} value={item}>{item}</option>
                                                            )}
                                                        </select>
                                                        <div className="invalid-feedback" style={{'display':'block'}}>{errors.billYear}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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
                                {this.state.reportData.length > 0 && <a href={`${excelExportEndPoint}?token=${token.token}`} className="btn btn-primary btn-sm mr-3"><i className="flaticon2-download-1"></i>Excel Export</a>}
                            </div>
                            <div className="tableFixHead">
                                <div className="table-responsive" style={{maxHeight: "500px"}}>
                                    <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                        <thead>
                                            <tr>
                                                <th>SL</th>
                                                <th>Project</th>
                                                <th>Equipment Qty</th>
                                                <th>Month</th>
                                                <th>Year</th>
                                                <th className="text-right">Regular Billing Amount</th>
                                                <th className="text-right">Deduction Amount</th>
                                                <th className="text-right">Net Billing Amount</th>
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
                                                    <td>{item.projectName}</td>
                                                    <td>{item.numOfEquipment}</td>
                                                    <td>{item.billMonth}</td>
                                                    <td>{item.billYear}</td>
                                                    <td className="text-right">{item.regularBillingAmount}</td>
                                                    <td className="text-right">{item.deductionAmount}</td>
                                                    <td className="text-right">{item.billAmount}</td>
                                                    <td>{item.remarks}</td>
                                                </tr>
                                            )
                                            }
                                        </tbody>

                                    </table>
                                </div>
                            </div>
                        </div> : ""}
                </div>
                <ToastContainer />
            </>
        );
    }
}

export default BillingProjectWiseReport;
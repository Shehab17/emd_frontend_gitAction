import React, { Component } from 'react';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getGetRequestOptions } from "../../components/GetToken";
import ToastMsg from '../../components/ToastMsg';
import "./../../../style/table.css";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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

class LogBookImport extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        logBookBusinessUnit: "",
        logBookBusinessUnitId:"",
        logMonth: "",
        logYear: "",
        reportData: [],
        showReport: false,
        allBusinessUnits: []
    }


    componentDidMount() {
        const { allBusinessUnits, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllBu();
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
				}).filter(e => e.projectId !== process.env.REACT_APP_EMD_BU_ID);
				this.setState({ allBusinessUnits: tempResp });
			})
			.catch((error) => {
				console.log(error, "catch the hoop")
			});

	}

    handleBuChange = businessUnit => {
        this.setState({ logBookBusinessUnit: businessUnit ,logBookBusinessUnitId: businessUnit.projectId});
    }

    handleMonthChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };

    handleYearChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };

    getReportData() {
        this.setState({ loading: true });

        const {logBookBusinessUnitId, logMonth, logYear } = this.state;

        const formData = {
            logBookBusinessUnitId: logBookBusinessUnitId,
            logMonth: logMonth,
            logYear: logYear
        };

        //console.log(formData);
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(formData)
        };
        fetch(process.env.REACT_APP_API_URL + "reports/utilization_report", requestOptions)
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
            this.setState({ loading: false });
            console.log(error, "catch the hoop")
        });
    }

    handleSubmit = evt => {
        evt.preventDefault();
        this.setState({ showReport: true });
        this.getReportData();
    }

    render() {
        const excelExportEndPoint = process.env.REACT_APP_API_URL.split("api/")[0]+'report/utilization_report_excel_export';
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

        const skeletonLenArr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]

        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                               Utilization Report
                            </p>
                        </h3>
                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">
                                <div className="form-group row">
                                    <label htmlFor="logBookBusinessUnit" className="col-lg-2 col-form-label" style={{ "textAlign": "right" }}>Business Unit</label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.logBookBusinessUnit}
                                            onChange={this.handleBuChange}
                                            options={this.state.allBusinessUnits}
                                            styles={customStylesSelect}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="logMonth" className="col-lg-2 col-form-label" style={{ "textAlign": "right" }}>Log Month</label>
                                    <div className="col-lg-6">
                                        <div className="row">
                                            <div className="col-lg-4">
                                                <select className="form-control form-control-sm" id="logMonth" name="logMonth" value={this.state.logMonth} onChange={this.handleMonthChange} >
                                                    <option value="">Select Month</option>
                                                    {monthOption.map((item, key) =>
                                                        <option key={key} value={item.value}>{item.label}</option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="col-lg-8">
                                                <div className="form-group row">
                                                    <label htmlFor="logYear" className="col-lg-4 col-form-label" style={{ "textAlign": "right" }}>Year</label>
                                                    <div className="col-lg-8">
                                                        <select className="form-control form-control-sm" id="logYear" name="logYear" value={this.state.logYear} onChange={this.handleYearChange} >
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
                                    <div className="col-lg-2">
                                    </div>
                                    <div className="col-lg-6">
                                        <button type="submit" className="btn btn-success mr-2">Show</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body" style={{"marginTop": "-60px"}}>
                            <div className="tableFixHead">
                                {this.state.reportData.length > 0 && <div className="card-toolbar mb-5 "><a href={`${excelExportEndPoint}/${this.state.logBookBusinessUnitId}/${this.state.logMonth}/${this.state.logYear}?token=${token.token}`}  className="btn btn-primary btn-sm mr-3"><i className="flaticon2-download-1"></i>Excel Export</a></div>}
                                <div className="table-responsive" style={{maxHeight: "500px"}}>
                                    <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                        <thead>
                                            <tr>
                                                <th>SL No</th>
                                                <th>Equipment Name</th>
                                                <th>Code</th>
                                                <th>Project</th>
                                                <th>Emo No</th>
                                                <th>Manufacturer</th>
                                                <th>Model</th>
                                                <th>Capacity</th>
                                                <th>Month</th>
                                                <th>Year</th>
                                                <th>Monthly <br></br> Stipulated<br></br> Working Hr</th>
                                                <th>Starting Hour</th>
                                                <th>Closing Hour</th>
                                                <th>Total Running Hour</th>
                                                <th>Total Idle Hour</th>
                                                <th>Total  Fuel Used (Ltr)</th>
                                                <th>Total Fuel Received</th>
                                                <th>Actual Consumption per Hour(Ltr)</th>
                                                <th>% of Utilization</th>
                                                <th>Breakdown Hr</th>
                                                <th>Available Hr</th>
                                                <th>% Availability</th>
                                                <th>Standard Availability</th>
                                                <th>Shortfall from <br></br>Standard <br></br> Availability</th>
                                                <th>Monthly Rate</th>
                                                <th>Deduction</th>
                                                <th>Financial Impact
                                                    (Losing Amount)
                                                </th>
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
                                            { !this.state.loading && this.state.reportData.length> 0 ?
                                                this.state.reportData.map((item, index) =>
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.equipmentName}</td>
                                                    <td>{item.equipmentCode}</td>
                                                    <td>{item.projectName}</td>
                                                    <td>{item.emoNo}</td>
                                                    <td>{item.manufacturer}</td>
                                                    <td>{item.model}</td>
                                                    <td>{item.capacity}</td>
                                                    <td>{item.logMonth}</td>
                                                    <td>{item.logYear}</td>
                                                    <td>{item.monthlyStipulatedWorkingHour}</td>
                                                    <td>{item.startingHour}</td>
                                                    <td>{item.closingHour}</td>
                                                    <td>{item.totalRunningHour} </td>
                                                    <td>{item.totalIdleHour}</td>
                                                    <td>{item.totalFuelUsed}</td>
                                                    <td>{item.totalFuelReceived}</td>
                                                    <td>{item.actualConsumption}</td>
                                                    <td>{item.utilizationPercentage}%</td>
                                                    <td>{item.breakdownHour}</td>
                                                    <td>{item.availableHour}</td>
                                                    <td>{item.availabilityPercentage}%</td>
                                                    <td>{item.standardAvailability}%</td>
                                                    <td>{item.shortfallFromStandardAvailability}%</td>
                                                    <td>{item.monthlyRate}</td>
                                                    <td>{item.deduction}</td>
                                                    <td>{item.financialImpact}</td>
                                                </tr>
                                                )
                                            :
                                                <tr>
                                                    <td colSpan="27"><p style={{ "textAlign": "center" }}></p></td>
                                                </tr>
                                            } 
                                        </tbody>
                                    </table>
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

export default LogBookImport;
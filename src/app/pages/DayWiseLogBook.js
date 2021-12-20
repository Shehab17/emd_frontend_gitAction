import React, { Component } from 'react';
import { Spinner } from "react-bootstrap";
import Select from 'react-select';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getGetRequestOptions } from "../components/GetToken";


class DayWiseLogBook extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        project: "",
        logDate: "",
        allBusinessUnits: [],
        logBookData: [],
        logEditModalShow: false,
        logCreateModalShow: false,
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


    handleInputOnChange = evt => {
        evt.preventDefault();
        this.setState({ [evt.target.name]: evt.target.value })
    };


    onChangeLogDate = evt => {
        this.setState({ logDate: evt.target.value }, () => {
            this.getLogBookData();
        })
    }

    handleProjectChange = project => {
        this.setState({ project: project }, () => {
            this.getLogBookData();
        });
    }


    getLogBookData() {
        this.setState({ loading: true });
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const formData = {
            businessUnit: process.env.REACT_APP_EMD_BU_ID,
            project: this.state.project,
            logDate: this.state.logDate,
            logBookData: this.state.logBookData,
        };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(formData)
        };
        fetch(process.env.REACT_APP_API_URL + "log_book/day_wise_log_book", requestOptions)
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                this.setState({ loading: false });
                const newLogBookData = resp.data;
                this.setState({
                    logBookData: newLogBookData
                });


            })
            .catch((error) => {
                this.setState({ loading: false });
                console.log(error, "catch the hoop")
            });

    }

   

    getEquipmentValue(i, logValues, value, index) {

        if (i === 0) {
            return <><td rowSpan={logValues.length}>{++index}</td>
                <td style={{ "padding": "0.75rem" }} rowSpan={logValues.length}>{value.equipmentName}</td>
                <td style={{ "padding": "0.75rem" }} rowSpan={logValues.length}>{value.maxCode}</td> </>
        }
        else {
            return null;
        }
    }

    tableBody() {
        const tbodies = this.state.logBookData.map((value, index) => {
            const logValues = Object.values(value.data);
            const logRows = logValues.map((log, i) => {
                const equipmentValue = this.getEquipmentValue(i, logValues, value, index);

                return (
                    <tr key={i}>
                        {equipmentValue}
                        <td style={{ "padding": "0.75rem" }}>{log.status}</td>
                        <td style={{ "padding": "0.75rem" }}>{log.startTime}</td>
                        <td style={{ "padding": "0.75rem" }}>{log.endTime}</td>
                        <td style={{ "padding": "0.75rem" }}>{log.hour}</td>
                        <td style={{ "padding": "0.75rem" }}>{log.openingOdo}</td>
                        <td style={{ "padding": "0.75rem" }}>{log.closingOdo}</td>
                        <td style={{ "padding": "0.75rem" }}>{log.fuelQty}</td>
                        <td style={{ "padding": "0.75rem" }}>{log.workSiteName}</td>
                        <td style={{ "padding": "0.75rem" }}>{log.usedInWork}</td>
                    </tr>
                );
            });
            return (
                <>
                    {logRows}
                </>
            );
        });

        return tbodies;
    }

    render() {
        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                                Day wise Log Book
                            </p>
                        </h3>
                    </div>
                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Project<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.project}
                                            placeholder="Select Project"
                                            onChange={this.handleProjectChange}
                                            options={this.state.allBusinessUnits}
                                        />
                                    </div>
                                </div>


                                <div className="form-group row">
                                    <label htmlFor="logDate" className="col-lg-2 col-form-label">Date<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <input type="date" name="logDate" id="logDate" value={this.state.logDate} onChange={this.onChangeLogDate} className={"form-control form-control-md"} />

                                    </div>
                                </div>
                            </div>
                        </div>
                        {this.state.logDate !== "" ?
                            <>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover" style={{width: "max-content"}}>
                                            <thead>
                                                <tr>
                                                    <th>SL</th>
                                                    <th>Equipment Name</th>
                                                    <th>Max Code </th>
                                                    <th>Status</th>
                                                    <th>Opening Time</th>
                                                    <th>Closing  Time</th>
                                                    <th>Hour</th>
                                                    <th>Opening Odo </th>
                                                    <th>Closing  Odo</th>
                                                    <th>Fuel Issued </th>
                                                    <th>Work Site Name</th>
                                                    <th>Used in Work</th>
                                                
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { this.state.loading  && <tr><td colSpan="12" className="text-center"> <Spinner animation="grow" /><Spinner animation="grow" /><Spinner animation="grow" /></td></tr> }
                                                { this.state.logBookData.length > 0  ? this.tableBody() : !this.state.loading  && <tr><td colSpan="12"><p style={{'textAlign':'center'}}><strong>No data found.</strong></p></td></tr> }
                                            </tbody>

                                        </table>
                                    </div>
                                </div>
                            </> : ""}
                    </form>
                </div>
                <ToastContainer />
            </>
        );
    }
}

export default DayWiseLogBook;
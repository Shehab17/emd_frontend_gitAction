import React, { Component } from 'react';
import { Spinner } from "react-bootstrap";
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getGetRequestOptions } from "../components/GetToken";


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

class DayWiseLogBook extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        project: "",
        equipment:"",
        logFromDate: "",
        logToDate: "",
        allBusinessUnits: [],
        logBookData: [],
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


    onChangeLogFromDate = evt => {
        this.setState({ logFromDate: evt.target.value }, () => {
            //this.getLogBookData();
        })
    }

    onChangeLogToDate = evt => {
        this.setState({ logToDate: evt.target.value });
    }

    handleProjectChange = project => {
        this.setState({ project: project }, () => {
            this.getLogBookData();
        });
    }


    getEquipment = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        }
        const projectId = this.state.businessUnit;
        var url = process.env.REACT_APP_API_URL + "equipment/equipment_search/" + projectId + "?q=" + inputValue;
        setTimeout(() => {
            fetch(url, getGetRequestOptions())
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

    handleEquipmentChange = equipment => {
        this.setState({ equipment: equipment});
    }



    getLogBookData() {
        this.setState({ loading: true });
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const formData = {
            businessUnit: process.env.REACT_APP_EMD_BU_ID,
            project: this.state.project,
            equipment: this.state.equipment,
            logFromDate: this.state.logFromDate,
            logToDate: this.state.logToDate,
            logBookData: this.state.logBookData,
        };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(formData)
        };
        fetch(process.env.REACT_APP_API_URL + "log_book/equipment_wise_log_book", requestOptions)
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

    handleSubmit = evt => {
        evt.preventDefault();
        const isValid = true;
        if (isValid) {
            this.setState({ isSubmitted : true });
            this.getLogBookData(); 
        }


    }

    getValue(i, logValues, value, index) {
       
        if (i === 0) {

            return <><td rowSpan={logValues.length}>{++index}</td>
                <td style={{ "padding": "0.75rem" }} rowSpan={logValues.length}>{value.logDate}</td>
                </>
        }
        else {
            return null;
        }

    }

    tableBody() {
        const tbodies = this.state.logBookData.map((value, index) => {
            const logValues = Object.values(value.data);
            const logRows = logValues.map((log, i) => {
                const dateValue = this.getValue(i, logValues, value, index);

                return (
                    <tr key={i}>
                        {dateValue}
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
                                Equipment wise Log Book
                            </p>
                        </h3>
                    </div>
                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Equipment <span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <AsyncSelect
                                            value={this.state.equipment}
                                            defaultOptions
                                            loadOptions={this.getEquipment}
                                            //loadOptions={promiseOptions}
                                            placeholder="Select Equipment"
                                            onChange={this.handleEquipmentChange}
                                            styles={customStylesSelect}
                                        // onChange={(e) => {
                                        //this.onSearchChange(e);
                                        //  }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="logFromDate" className="col-lg-2 col-form-label">From Date <span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <div className="row">
                                            <div className="col-lg-4">
                                                <input type="date" name="logFromDate" id="logFromDate" value={this.state.logFromDate} onChange={this.onChangeLogFromDate} className="form-control form-control-md" />

                                            </div>
                                            <div className="col-lg-8">
                                                <div className="form-group row">
                                                    <label htmlFor="logToDate" className="col-lg-4 col-form-label">To Date <span className="required text-danger"> *</span></label>
                                                    <div className="col-lg-8">
                                                        <input type="date" name="logToDate" id="logToDate" value={this.state.logToDate} onChange={this.onChangeLogToDate} className="form-control form-control-md" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <div className="col-2"></div>
                                    <div className="form-group col-3">
                                        <input type="submit" value="Ok" className="btn btn-outline-primary btn-sm float-left" data-loading-text="Loading..." />
                                    </div>
                                </div>

                            </div>
                        </div>
                        {this.state.isSubmitted === true ?
                            <>
                                <div className="card-body">

                                    <table className="table table-bordered table-checkable" id="kt_datatable">
                                        <thead>
                                            <tr>
                                                <th>SL</th>
                                                <th>Date</th>
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
                                            {this.state.loading && <tr><td colSpan="12" className="text-center"> <Spinner animation="grow" /><Spinner animation="grow" /><Spinner animation="grow" /></td></tr>}
                                            { ((!this.state.loading ) && (this.state.logBookData.length > 0) )? this.tableBody() : !this.state.loading && <tr><td colSpan="12"><p style={{ 'textAlign': 'center' }}><strong>No data found.</strong></p></td></tr>}
                                        </tbody>

                                    </table>
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
import React, { Component } from 'react';
import { Button, Modal } from "react-bootstrap";
import SVG from "react-inlinesvg";
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// ES6 Modules or TypeScript
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";
import { getGetRequestOptions } from "../components/GetToken";
import ToastMsg from '../components/ToastMsg';
import LogBookCreate from "./LogBookCreate";
import LogBookEdit from "./LogBookEdit";


class LogBookSiteEngineer extends Component {
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

    editLog = (logId) => {
        //console.log(id);
        this.setState({ logEditModalShow: true, logId: logId });
    }

    createLog = (project, logDate) => {

        this.setState({ logCreateModalShow: true, project: project, logDate: logDate });
    }

    onUpdateLog = (updateData) => {
        console.log(updateData);
        this.setState({ logEditModalShow: false });
        this.getLogBookData();
    }

    onCreateLog = (saveData) => {
        console.log(saveData);
        this.setState({ logCreateModalShow: false });
        this.getLogBookData();
    }


    getFuelOfficer = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        }
        var url = process.env.REACT_APP_API_URL + "search_fuel_officer?q=" + inputValue;
        setTimeout(() => {
            fetch(url, getGetRequestOptions())
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    const tempArray = resp.data.map(function (element) {
                        element.label = `${element.name} (${element.phone})`;
                        element.value = element.id;
                        return element;
                    });
                    callback(tempArray);
                })
                .catch((error) => {
                    console.log(error, "catch the hoop")
                });
        });
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

        fetch(process.env.REACT_APP_API_URL + "log_book/day_wise_log_book_to_approve", requestOptions)
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
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to approve!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, approve it!',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
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

                var apiEnd = "log_book/log_entry_approve";

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
                        <td style={{ "textAlign": "center" }}>
                            {log.logId > 0 && <Button className="btn btn-icon btn-light btn-hover-primary btn-sm mx-3" onClick={() => this.editLog(log.logId)}>
                                <span className="svg-icon svg-icon-md svg-icon-primary">
                                    <SVG
                                        src={toAbsoluteUrl("/media/svg/icons/Communication/Write.svg")}
                                    />
                                </span>
                            </Button>
                            }
                        </td>
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

        let logEditmodalClose = () => {
            this.setState({ logEditModalShow: false });
        };

        let logCreateModalClose = () => {

            this.setState({ logCreateModalShow: false });
        };

        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                                Day wise Log Book Entry
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
                                        <input className="form-control form-control-sm" type="date" name="logDate" id="logDate" value={this.state.logDate} onChange={this.onChangeLogDate} />

                                    </div>
                                </div>
                            </div>
                        </div>
                        {this.state.logDate !== "" ?
                            <>
                                <div className="card-body">
                                    <div className="card-toolbar mr-10 ">
                                        <Button className="btn btn-outline-primary btn-sm float-right mb-5" onClick={() => this.createLog(this.state.project, this.state.logDate)}><i className="flaticon2-plus"></i>Add Log Entry </Button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
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
                                                    <th>Used in   Work</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.tableBody()}
                                            </tbody>

                                        </table>
                                    </div>
                                </div>
                            </> : ""}

                        <div className="card-footer">
                            <div className="row">
                                <div className="col-4">
                                </div>
                                <div className="col-6">
                                    <button type="submit" className="btn btn-success mr-2">Approve</button>

                                </div>
                            </div>
                        </div>
                        {/* <pre>
                            {JSON.stringify(this.state, null, 2)}
                        </pre> */}
                    </form>

                </div>

                <Modal size="lg" show={this.state.logEditModalShow} onHide={logEditmodalClose} aria-labelledby="example-modal-sizes-title-lg">
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        <LogBookEdit onUpdateLog={this.onUpdateLog} logId={this.state.logId} />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={logEditmodalClose}>Cancel</Button>
                    </Modal.Footer>
                </Modal>

                <Modal size="lg" show={this.state.logCreateModalShow} onHide={logCreateModalClose} aria-labelledby="example-modal-sizes-title-lg">
                    <Modal.Header closeButton>
                    </Modal.Header>
                    <Modal.Body>
                        <LogBookCreate onCreateLog={this.onCreateLog} project={this.state.project} logDate={this.state.logDate} />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={logCreateModalClose}>Cancel</Button>
                    </Modal.Footer>
                </Modal>

                <ToastContainer />
            </>
        );
    }
}

export default LogBookSiteEngineer;
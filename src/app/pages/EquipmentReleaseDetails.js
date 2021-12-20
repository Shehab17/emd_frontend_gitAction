import React, { Component } from 'react';
import { getGetRequestOptions } from "../components/GetToken";



class EquipmentReleaseDetails extends Component {
    state = {
        idEquipmentRelease: "",
        details: {
            equipment_release_details: [],
            timeline_history: [],
        },
    }

    componentDidMount() {
        const {
            params: { id }
        } = this.props.match;

        this.setState({ idEquipmentRelease: this.props.match.params.id });
        this.getEquipmentReleaseDetails(id);
    }

    getEquipmentReleaseDetails(idEquipmentRelease) {
        fetch(process.env.REACT_APP_API_URL + "equipment/equipment_release_details/" + idEquipmentRelease, 
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ details: resp });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }
    render() {
        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <div className="card-title">
                            <h3 className="card-label">
                                Equipment Release Order No #{this.state.details.releaseNo}
                            </h3>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="col-6">
                            <table className="table table-bordered table-hover">

                                <tbody>
                                    <tr>
                                        <th>Release No</th>
                                        <td>{this.state.details.releaseNo}</td>
                                    </tr>
                                    <tr>
                                        {this.state.details.fromBusinessUnit != null &&
                                            <>
                                                <th>From Business Unit</th>
                                                <td>{this.state.details.fromBusinessUnit}</td>
                                            </>
                                        }
                                        {this.state.details.customer_id != null &&
                                            <>
                                                <th>Customer</th>
                                                <td>{this.state.details.customer.customerName}</td>
                                            </>
                                        }
                                    </tr>
                                    <tr>
                                        <th>Remarks</th>
                                        <td>{this.state.details.remarks}</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                        <div className="col-12">
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover" style={{width: "max-content"}}>
                                    <thead>
                                        <tr>
                                            <th>SL</th>
                                            <th>Equipment Name</th>
                                            <th>Equipment Code</th>
                                            <th>Capitalization Code</th>
                                            <th>Model</th>
                                            <th>EMO No</th>
                                            <th>Emo Date</th>
                                            <th>Receive Date</th>
                                            <th>Release Date</th>
                                            <th>Location</th>
                                            <th>Releasing Department</th>
                                            <th>Reason</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {
                                            this.state.details.equipment_release_details.map((item, index) =>
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>{item.equipmentName}</td>
                                                    <td>{item.equipmentCode}</td>
                                                    <td>{item.capCode} </td>
                                                    <td>{item.model}</td>
                                                    <td>{item.emoNo}</td>
                                                    <td>{item.emoDate}</td>
                                                    <td>{item.receiveDate}</td>
                                                    <td>{item.releaseDate}</td>
                                                    <td>{item.locationName}</td>
                                                    <td>{item.releasingDepartmentName}</td>
                                                    <td>{item.reason}</td>
                                                </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="col-8">
                        <div className="card card-custom">
                            <div className="card-header">
                                <div className="card-title">
                                    <h3 className="card-label">
                                        Equipment Release Order Timeline
                                    </h3>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="timeline timeline-3">
                                    <div className="timeline-items">
                                        {
                                            this.state.details.timeline_history.map((item, index) =>
                                                <div className="timeline-item" key={index}>
                                                    <div className="timeline-media">
                                                        {item.status === "created" ? <i className="flaticon2-plus text-primary "></i>
                                                            : <i className="flaticon2-paper-plane text-success"></i>
                                                        }
                                                    </div>
                                                    <div className="timeline-content">
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div className="mr-4">
                                                                <span className="mr-3 font-weight-bolder" style={{ "fontSize": "15px", "color": "#e35b5a" }}>
                                                                    Equipment Release Order has been
                                                                {item.status === "created" ? " Created" : "Approved"}
                                                                    <span className="text-muted ml-2"> at {item.create_date}</span>
                                                                </span>
                                                                <p className="mr-3">
                                                                    Created By : <a href="/#"><b>{item.fullName}</b></a>
                                                                </p>
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
                </div>
            </>
        );
    }
}

export default EquipmentReleaseDetails;
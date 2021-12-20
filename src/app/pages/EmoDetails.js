import React, { Component } from 'react';
import { getGetRequestOptions } from "../components/GetToken";

class EmoDetails extends Component {
    state = {
        businessUnit: "",
        emoNo: "",
        emoDate: "",
        sendingBu: "",
        receivingBu: "",
        customer: "",
        type: "",
        items: [],
        remarks: "",
        timelineHistory: [],
    }

    componentDidMount() {
        const {
            params: { id }
        } = this.props.match;

        this.setState({ emoId: this.props.match.params.id });
        this.getEmoDetails(id);
    }

    getEmoDetails(emoId) {
        fetch(process.env.REACT_APP_API_URL + "emo/emo_details/" + emoId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({
                emoNo: resp.emoNo,
                emoDate: resp.emoDate,
                sendingBu: resp.from_businessunit.businessunitName,
                type: resp.type,
                receivingBu: resp.receiving_businessunit,
                customer: resp.customer,
                items: resp.emo_item,
                timelineHistory: resp.timeline_history,
                remarks: resp.remarks
            });
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
                                Equipment Movement  Order No #{this.state.emoNo}
                            </h3>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="col-6">
                            <table className="table table-bordered table-hover">

                                <tbody>
                                    <tr>
                                        <th>EMO No</th>
                                        <td>{this.state.emoNo}</td>
                                    </tr>
                                    <tr>
                                        <th>Type</th>
                                        <td>{this.state.type}</td>
                                    </tr>
                                    <tr>
                                        <th>{this.state.type === "Parking" ? "Releasing" : "Sending"} Business Unit</th>
                                        <td>{this.state.sendingBu}</td>
                                    </tr>
                                    <tr>
                                        {(this.state.type === "In House" || this.state.type === "Parking") &&
                                            <>
                                                <th>Receiving Business Unit</th>
                                                <td>{this.state.receivingBu.businessunitName}</td>
                                            </>
                                        }
                                        {this.state.type === "Third Party" &&
                                            <>
                                                <th>Customer Name</th>
                                                <td>{this.state.customer.customerName}</td>
                                            </>
                                        }
                                    </tr>
                                    <tr>
                                        <th>Remarks</th>
                                        <td>{this.state.remarks}</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                <thead>
                                    <tr>
                                        <th>SL</th>
                                        <th>Equipment Code</th>
                                        <th>Equipment Name</th>
                                        <th>Model</th>
                                        <th>Serial No.</th>
                                        <th>Billing Amount</th>
                                        <th>Status</th>
                                        <th>Location</th>
                                        <th>Emo Date</th>
                                        <th>Receive Date</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {
                                        this.state.items.map((item, index) =>
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.equipment.equipmentCode}</td>
                                                <td>{item.equipment.equipmentName}</td>
                                                <td>{item.equipment.model} </td>
                                                <td>{item.equipment.serialNo}</td>
                                                <td>{item.billing_amount}</td>
                                                <td>
                                                    {item.status === "created" && <span className="label label-primary label-inline mr-2">Created</span>}
                                                    {item.status === "received" && <span className="label label-warning label-inline mr-2">Received</span>}
                                                    {item.status === "denied" && <span className="label label-danger label-inline mr-2">Denied</span>}
                                                    {item.status === "released" && <span className="label label-success label-inline mr-2">Released</span>}
                                                    {item.status === "parked" && <span className="label label-info label-inline mr-2">Parked</span>}
                                                </td>
                                                <td>{item.equipment.location}</td>
                                                <td>{this.state.emoDate}</td>
                                                <td>{item.receive_date}</td>
                                                <td>{item.remarks}</td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-8">
                        <div className="card card-custom">
                            <div className="card-header">
                                <div className="card-title">
                                    <h3 className="card-label">
                                        Equipment Movement Order Timeline
                                    </h3>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="timeline timeline-3">
                                    <div className="timeline-items">
                                        {
                                            this.state.timelineHistory.map((item, index) =>
                                                <div className="timeline-item" key={index}>
                                                    <div className="timeline-media">
                                                        {item.type === "emo" && <i className="flaticon2-plus text-primary "></i>}
                                                        {item.type === "receive_emo" && <i className="flaticon2-gift text-warning"></i>}
                                                        {item.type === "deny_emo" && <i className="flaticon2-gift text-warning"></i>}
                                                        {item.type === "parking_emo" && <i className="flaticon2-map text-success"></i>}
                                                    </div>
                                                    <div className="timeline-content">
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div className="mr-4">
                                                                <span className="mr-3 font-weight-bolder" style={{ "fontSize": "15px", "color": "#e35b5a" }}>
                                                                    Equipment Movement Order has been
                                                                    {item.type === "emo"  && " Created"}
                                                                    {item.type === "parking_emo" && " Created"}
                                                                    {item.type === "receive_emo" && " Received"}
                                                                    <span className="text-muted ml-2">at {item.create_date}</span>
                                                                </span>
                                                                {this.state.type === "In House" && item.type === "emo" && <p className="mr-3 mt-3">Sending Business Unit :   <b style={{color:"#2dc51b"}}>{item.sendingBusinessUnit}</b></p>}
                                                                    
                                                                {this.state.type === "In House" && item.type === "receive_emo"  && <p className="mr-3 mt-3">Receiving Business Unit :   <b style={{color:"#8950FC"}}>{item.receivingBusinessUnit}</b></p>}                                                               
                                                                {this.state.type === "In House" && item.type === "deny_emo"  && <p className="mr-3 mt-3">Receiving Business Unit :   <b style={{color:"#8950FC"}}>{item.receivingBusinessUnit}</b></p>}                                                               
                                                                {this.state.type === "Parking" && item.type === "parking_emo" && <><p className="mr-3 mt-3">Releasing Business Unit :   <b style={{color:"#2dc51b"}}>{item.sendingBusinessUnit}</b></p><p className="mr-3 mt-3">Receiving Business Unit :  <b style={{color:"#8950FC"}}>{item.receivingBusinessUnit}</b></p></>}
                                                                
                                                                {this.state.type === "Third Party" && item.type === "emo" && <p className="mr-3 mt-3">Project Name : <b style={{color:"#2dc51b"}}>{item.sendingBusinessUnit}</b></p>}
                                                                {this.state.type === "Third Party" && item.type === "receive_emo" && <p className="mr-3 mt-3">Customer : <b style={{color:"#8950FC"}}>{this.state.customer.customerName}</b></p>}
                                                                <p className="mr-3">
                                                                    {item.type === "emo" && item.status === "created" && <span> Created By : <a href="/#"><b>{item.fullName}</b></a></span>}
                                                                    {item.type === "receive_emo" && item.status === "created" && <span> Received By : <a href="/#"><b>{item.fullName}</b></a></span>}
                                                                    {item.type === "deny_emo" && item.status === "created" && <span> Received By : <a href="/#"><b>{item.fullName}</b></a></span>}
                                                                    {item.type === "parking_emo" && item.status === "created" && <span> Parked By : <a href="/#"><b>{item.fullName}</b></a></span>}
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
                {/* <pre>
                    {JSON.stringify(this.state, null, 2)}
                </pre> */}
            </>
        );
    }
}

export default EmoDetails;
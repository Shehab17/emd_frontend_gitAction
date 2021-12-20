import React, { Component } from 'react';
import { Tab, Tabs } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getGetRequestOptions } from "../components/GetToken";

class MaintenanceOrderDetails extends Component {
    state = {
        maintOrderId: "",
        details: {
            equipment: { equipmentName: '' },
            team: { teamName: '' },
            maintenancetype: "",
            priority: "",
            responsibleperson: [],
            businessunit: { businessunitName: '' },
            maint_businessunit:{ maintBusinessunitName : ''},
            parts: [],
            operations: [],
            maintenance_status: [],
        },
        totalPartsCost: 0,
        totalOperationsCost: 0,
        totalCost: 0
    }

    componentDidMount() {
        const {
            params: { id }
        } = this.props.match;

        this.setState({ maintOrderId: this.props.match.params.id });
        this.getMaintenanceOrderDetails(id);
    }

    getMaintenanceOrderDetails(maintOrderId) {
        fetch(process.env.REACT_APP_API_URL + "maintenance_order/order_details/" + maintOrderId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ details: resp }, () => this.calcTotal());
            ;
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }

    objPsum = (items, prop) => {
        return items.reduce(function (a, b) {
            return Number(a) + Number(b[prop]);
        }, 0);

    }
    calcTotal = () => {
        var totalPartsCost = 0;
        this.state.details.parts.forEach(function (item) {
            totalPartsCost += item.invStatus === 'Issued' ? Number(item.price) * Number(item.issuedQty) :  Number(item.price) * Number(item.quantity);

        });
        this.setState({ totalPartsCost: (totalPartsCost).toFixed(2) });
        const totalOperationsCost = this.objPsum(this.state.details.operations, 'amount');
        this.setState({ totalOperationsCost: (totalOperationsCost).toFixed(2) });
        const totalCost = Number(totalPartsCost) + Number(totalOperationsCost);
        this.setState({ totalCost: (totalCost).toFixed(2) });
    }


    render() {
        const resListItem = this.state.details.responsibleperson.map((person, key) =>
            <li key={key} >{`${person.employeeName} ${person.employeeCode}`}</li>
        );

        return (
            <div className="card card-custom">
                <div className="card-header">
                    <div className="card-title">
                        <h3 className="card-label">
                            Maintenance Order  #{this.state.details.orderNo}
                        </h3>
                    </div>
                    {this.state.details.status !== "completed" && this.state.details.hasAccessMoDetailsConfirm ===1 &&
                        <div className="card-toolbar mt-5 mr-10" >
                            <Link to={`/maintenance-order-edit/${this.state.maintOrderId}`}>
                                <button className="btn btn-outline-primary btn-sm float-right"><i className="flaticon2-plus"></i>Edit Maintenace Order</button>
                            </Link>
                        </div>
                    }
                </div>

                <div className="card-body">
                    <div className="row">
                        <div className="col-6">
                            <table className="table table-bordered table-hover">
                                <tbody>
                                    <tr>
                                        <th>Equipment</th>
                                        <td>{this.state.details.equipment.equipmentName}</td>
                                    </tr>
                                    <tr>
                                        <th>Equipment Code</th>
                                        <td>{this.state.details.equipment.equipmentCode}</td>
                                    </tr>
                                    <tr>
                                        <th>Maintenance Order No</th>
                                        <td>{this.state.details.orderNo}</td>
                                    </tr>
                                    <tr>
                                        <th>Order Date</th>
                                        <td>{this.state.details.orderDate}</td>
                                    </tr>
                                    <tr>
                                        <th>Title</th>
                                        <td>{this.state.details.title}</td>
                                    </tr>
                                    <tr>
                                        <th>Maintenance Type</th>
                                        <td>{this.state.details.maintenancetype != null ? this.state.details.maintenancetype.name : ''}</td>
                                    </tr>
                                    {this.state.details.completeDate != null &&
                                    <tr>
                                         <th>Complete Date</th>
                                         <td>{this.state.details.completeDate}</td>
                                     </tr>
                                    }
                                </tbody>
                            </table>
                        </div>

                        <div className="col-6">
                            <table className="table table-bordered table-hover">
                                <tbody>
                                    <tr>
                                        <th>Priority</th>
                                        <td>{this.state.details.priority}</td>
                                    </tr>
                                    <tr>
                                        <th>Responsible Person</th>
                                        <td><ul>{resListItem}</ul></td>
                                    </tr>
                                    <tr>
                                        <th> Equipment Location BU</th>
                                        <td>{this.state.details.maint_businessunit != null ? this.state.details.maint_businessunit.maintBusinessunitName : ''}</td>
                                    </tr>
                                    <tr>
                                        <th>Closing Hrs Meter</th>
                                        <td>{this.state.details.closingHrsMeter}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td><span className={this.state.details.status === 'created' ? 'label label-lg label-primary label-inline mr-2' : 'label label-lg label-success label-inline mr-2'}>{this.state.details.status === 'created' ? 'Created':'Completed'}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-12 mt-10">
                        <Tabs defaultActiveKey="parts" id="uncontrolled-tab-example">
                            <Tab eventKey="parts" title="Parts">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                        <thead>
                                            <tr>
                                                <th>SL</th>
                                                <th>Warehouse</th>
                                                <th>Item</th>
                                                <th>Unit</th>
                                                <th>Price</th>
                                                <th>Quantity</th>
                                                <th>Issue Quantity</th>
                                                <th>Cost</th>
                                                <th>Inventory Status</th>
                                                <td>Is Complete</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.details.parts.map((item, index) =>
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.warehouseName}</td>
                                                        <td>{item.item.itemName}</td>
                                                        <td>{item.item.unitName}</td>
                                                        <td>{item.price} </td>
                                                        <td>{item.quantity}</td>
                                                        <td>{Number(item.issuedQty).toFixed(2)}</td>
                                                        <td>{ item.invStatus==='Issued' ? (Number(item.price) * Number(item.issuedQty)).toFixed(2) :(Number(item.price) * Number(item.quantity)).toFixed(2) }</td>
                                                        <td>{item.invStatus}</td>
                                                        <td><span className={item.isComplete === 'no' ? 'label label-lg label-warning label-inline mr-2' : 'label label-lg label-success label-inline mr-2'}>{item.isComplete === 'no' ? 'No':'Yes'}</span></td>
                                                    </tr>

                                                )
                                            }

                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="7" style={{ "textAlign": "right" }}>
                                                    Total
                                                </td>
                                                <td colSpan="3">{this.state.totalPartsCost}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </Tab>

                            <Tab eventKey="operations" title="Operations" >
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                        <thead>
                                            <tr>
                                                <th>SL</th>
                                                <th>Operation</th>
                                                <th>Operation Short Desc</th>
                                                <th>Work Start Date</th>
                                                <th>Work Finish Date</th>
                                                <th>Duration(h:m)</th>
                                                <th>Srr No</th>
                                                <th>Amount</th>
                                                <td>Is Complete</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.details.operations.map((operation, index) =>

                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{operation.operationTitle}</td>
                                                        <td>{operation.operationDetails}</td>
                                                        <td>{operation.startDate}</td>
                                                        <td>{operation.endDate}</td>
                                                        <td>
                                                            {operation.duration.split(":")[0] + ':' + operation.duration.split(":")[1]}
                                                        </td>
                                                        <td>{operation.srrNo}</td>
                                                        <td>{operation.amount}</td>
                                                        <td><span className={operation.isComplete === 'no' ? 'label label-lg label-warning label-inline mr-2' : 'label label-lg label-success label-inline mr-2'}>{operation.isComplete === 'no' ? 'No':'Yes'}</span></td>

                                                    </tr>

                                                )
                                            }

                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="7" style={{ "textAlign": "right" }}>
                                                    Total
                                                </td>
                                                <td colSpan="2">{this.state.totalOperationsCost}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </Tab>
                        </Tabs>

                        <div className="col-md-4 offset-md-8 mt-10">
                            <div className="row">
                                <div className="col-md-6"><b>Total Parts Cost</b></div>
                                <div className="col-md-3">{this.state.totalPartsCost}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-6"><b>Total Operations Cost</b></div>
                                <div className="col-md-3">{this.state.totalOperationsCost}</div>
                            </div>
                            <div className="row">
                                <div className="col-md-6"><b>Total Cost</b></div>
                                <div className="col-md-3">{this.state.totalCost}</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-8">
                        <div className="card card-custom">
                            <div className="card-header">
                                <div className="card-title">
                                    <h3 className="card-label">
                                        Maintenace Order Timeline
                                    </h3>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="timeline timeline-3">
                                    <div className="timeline-items">
                                        {
                                            this.state.details.maintenance_status.map((item, index) =>
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
                                                                    Maintenance Order No {this.state.details.orderNo} has been
                                                                    {item.status === "created" ? " Created" : " Completed"}
                                                                    <span className="text-muted ml-2"> at {item.create_date}</span>
                                                                </span>
                                                                {item.status === "created" &&
                                                                    <>
                                                                        <p className="mr-3">
                                                                            Order Date : {this.state.details.orderDate} <br></br>
                                                                            Created By : <a href="/#"><b>{item.fullName}</b></a>
                                                                        </p>
                                                                    </>
                                                                }
                                                                {item.status === "completed" &&
                                                                    <>
                                                                        <p className="mr-3">
                                                                            Complete Date : {this.state.details.completeDate} <br></br>
                                                                            Completed By : <a href="/#"><b style={{"color": "rgb(45, 197, 27)"}}>{item.fullName}</b></a>
                                                                        </p>
                                                                    </>
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
                </div>
                {/* <pre>
                    {JSON.stringify(this.state, null, 2)}
                </pre> */}
            </div>

        );
    }
}

export default MaintenanceOrderDetails;
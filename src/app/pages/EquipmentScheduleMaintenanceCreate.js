import React, { Component } from 'react';
import { Tab, Tabs } from "react-bootstrap";
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
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


class EquipmentScheduleMaintenanceCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            scheduleMaintId: "",
            category:"schedule_maintenance",
            businessUnit: "",
            maintBusinessUnit:{},
            title:"",
            maintenanceType: "",
            priority: "high",
            equipment:"",
            responsiblePersons:"",
            orderDate: "",
            parts: [],
            operations: [],
            totalPartsCost: "",
            totalOperationsCost: "",
            totalCost: "",
            warehouseOptions: [],

        }
    }


    componentDidMount() {
        const {
            params: { scheduleMaintId }
        } = this.props.match;
        this.setState({ scheduleMaintId: this.props.match.params.scheduleMaintId });
        this.getAllBu();
        this.getMainType();
        this.getMaintenanceEditInfoById(scheduleMaintId);
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
            });
            this.setState({ allBusinessUnits: tempResp });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }

    getMainType() {
        fetch(process.env.REACT_APP_API_URL + "maintenance_type",         
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            let tempResp = resp.data.map(function (element) {
                return { ...element, label: element.typeName, value: element.typeId }
            });
            this.setState({ allMaintType: tempResp });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }

    getMaintenanceEditInfoById(scheduleMaintId) {
        fetch(process.env.REACT_APP_API_URL + "schedule_maint/edit_info/" + scheduleMaintId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({
                businessUnit : {
                    companyId: 3,
                    isdisabled: false,
                    label: "EMD",
                    projectId: 47,
                    projectName: "EMD",
                    value: 47,
                },
                title: resp.title,
                maintenanceType: resp.maintenancetype,
                equipment: {
                    label: resp.label,
                    value: resp.value,
                    equipmentId: resp.equipment_id
                },
                responsiblePersons: resp.responsibleperson,
                requestDate: resp.requestDate,
                parts: resp.parts,
                operations: resp.operations,
            }, () => this.getBuWarehouse(this.state.businessUnit.projectId));
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }

    getResPersons = (inputValue, callback) => {
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

    getBuWarehouse = (businessUnitId) => {
        fetch(process.env.REACT_APP_API_URL + "get_warehouse_bu_wise/" + businessUnitId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ warehouseOptions: resp.data });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    getItemStock = (itemId, warehouseId, index) => {
        fetch(process.env.REACT_APP_API_URL + "item/item_stock_warehouse_wise/" + itemId + "/" + warehouseId, 
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            const newItems = this.state.parts.map(function (row, rindex) {
                if (index !== rindex) return row;
                return { ...row, stock: resp.data}
            });
            this.setState({ parts: newItems });

        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    getItemIssuePrice = (itemId, unitId, warehouseId, index) => {
        fetch(process.env.REACT_APP_API_URL + "item/item_issue_price/" + itemId + "/" + unitId + "/" + warehouseId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            const newItems = this.state.parts.map(function (row, rindex) {
                if (index !== rindex) return row;
                return { ...row, price: resp.data, cost: (Number(row.qty) * Number(resp.data)).toFixed(2) }
            });
            this.setState({ parts: newItems },() => this.calcTotal());

        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    handleMaintBuChange = maintBusinessUnit => {
        this.setState({ maintBusinessUnit: maintBusinessUnit }, () => {
        });
    }

    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };

    handleMaintenanceTypeChange = (maintenanceType) => {
        this.setState({maintenanceType:maintenanceType });
    }

    handleResponsiblePersonsChange = (persons) => {
        this.setState({ responsiblePersons: persons });
    }

    onWarehouseChange = (index) => evt => {
        const newItems = this.state.parts.map(function (row, rindex) {
            if (index !== rindex) return row;
            return { ...row, warehouse: evt.target.value }
        });
        this.setState({ parts: newItems },() => {this.getItemStock(this.state.parts[index].item.itemId, this.state.parts[index].warehouse, index);this.getItemIssuePrice(this.state.parts[index].item.itemId, this.state.parts[index].item.unitId, this.state.parts[index].warehouse, index)});
    }

    onPartsPriceChange = index => evt => {

        const newItems = this.state.parts.map(function (row, rindex) {
            if (index === rindex) {
                row.price = evt.target.value;
                row.cost = (Number(row.qty) * Number(row.price)).toFixed(2);
            }
            return row;
        })

        this.setState({ parts: newItems },() => this.calcTotal());
    }

    objPsum = (items, prop) => {
        return items.reduce(function (a, b) {
            return Number(a) + Number(b[prop]);
        }, 0);
    }
    
    onOperationDateChange = (index) => evt => {

        const newItems = this.state.operations.map(function (row, rindex) {
            if (index === rindex) {
                row.startDate = evt.target.value;
            }
            return row;
        })

        this.setState({ operations: newItems });

    }

    onOperationInputChange = (index, input) => evt => {

        const newItems = this.state.operations.map(function (row, rindex) {
            if (index === rindex) {

                row[input] = evt.target.value;
            }
            return row;
        })

        this.setState({ operations: newItems });

    }


    onOperationDurationChange = index => evt => {

        const newItems = this.state.operations.map(function (row, rindex) {
            if (index === rindex) {
                row.duration = evt.target.value;
            }
            return row;
        })

        this.setState({ operations: newItems });

    }

    onOperationDuration1Change = index => evt => {

        const newItems = this.state.operations.map(function (row, rindex) {
            if (index === rindex) {
                row.duration1 = evt.target.value;
            }
            return row;
        })

        this.setState({ operations: newItems });

    }

    onOperationAmountChange = index => evt => {
        const newItems = this.state.operations.map(function (row, rindex) {
            if (index === rindex) {
                row.amount = evt.target.value;
            }
            return row;
        })

        this.setState({ operations: newItems });
        this.calcTotal();  

    }

    calcTotal = () => {
        const totalPartsCost = this.objPsum(this.state.parts, 'cost');
        const totalOperationsCost = this.objPsum(this.state.operations, 'amount');
        const totalCost = Number(totalPartsCost) + Number(totalOperationsCost);
        
        this.setState({ totalPartsCost: (totalPartsCost).toFixed(2) });
        this.setState({ totalOperationsCost: (totalOperationsCost).toFixed(2) });
        this.setState({ totalCost: (totalCost).toFixed(2) });
    }

    handleSubmit = evt => {
        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to create Maintenance Order!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                const formData = {
                    scheduleMaintId: this.state.scheduleMaintId,
                    category: this.state.category,
                    businessUnit: this.state.businessUnit,
                    maintBusinessUnit:this.state.maintBusinessUnit,
                    title: this.state.title,
                    maintenanceType: this.state.maintenanceType,
                    priority: this.state.priority,
                    equipment: this.state.equipment,
                    responsiblePersons: this.state.responsiblePersons,
                    orderDate: this.state.orderDate,
                    parts: this.state.parts,
                    operations: this.state.operations,
                    totalPartsCost: this.state.totalPartsCost,
                    totalOperationsCost: this.state.totalOperationsCost,
                    totalCost: this.state.totalCost,
                };
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(formData)
                };

                var apiEnd = "maintenance_order/save";

                fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    console.log(resp);

                    if (resp.success === true) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Maintenance Order has been created successfully!',
                        })

                        this.setState(this.baseState);
                        this.props.history.push(`/maintenance-order-details/${resp.data.orderId}`);
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
        const priorityOption = [
            { label: 'High', value: 'high' },
            { label: 'Medium', value: 'medium' },
            { label: 'Low', value: 'low' },
        ]
        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                                Equipment Schedule Maintenance Order Create
                            </p>
                        </h3>
                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">
                            <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Business Unit </label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.businessUnit}
                                            onChange={this.handleBusinessUnitChange}
                                            isDisabled={true}
                                            options={this.state.allBusinessUnits}
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-2 col-form-label">Title</label>
                                    <div className="col-6">
                                        <input className="form-control form-control-sm" type="text" name="title" id="title" value={this.state.title} onChange={this.handleInputOnChange}/>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Maintenance Type<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.maintenanceType}
                                            onChange={this.handleMaintenanceTypeChange}
                                            options={this.state.allMaintType}
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-2 col-form-label">Priority</label>
                                    <div className="col-lg-6">
                                        <select className="form-control" id="priority" name="priority" value={this.state.priority} onChange={this.handleInputOnChange}>
                                            {priorityOption.map(function (item, id) {
                                                return <option key={id} value={item.value}>{item.label}</option>
                                            })
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Equipment<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <AsyncSelect
                                            value={this.state.equipment}
                                            defaultOptions
                                            loadOptions={this.getEquipment}
                                            placeholder="Select Equipment"
                                            onChange={this.handleEquipmentChange}
                                            styles={customStylesSelect}
                                            isDisabled={true}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label className="col-lg-2 col-form-label" >Responsible Persons</label>
                                    <div className="col-lg-6">
                                        <AsyncSelect
                                            value={this.state.responsiblePersons}
                                            isMulti
                                            defaultOptions
                                            loadOptions={this.getResPersons}
                                            placeholder="Select Responsible Persons"
                                            onChange={this.handleResponsiblePersonsChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="orderDate" className="col-lg-2 col-form-label">Order Date<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <input className="form-control form-control-md" type="date" name="orderDate" id="orderDate" value={this.state.orderDate} onChange={this.handleInputOnChange}/>
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Equipment Location BU <span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.maintBusinessUnit}
                                            onChange={this.handleMaintBuChange}
                                            isDisabled={false}
                                            options={this.state.allBusinessUnits}
                                        />
                                    </div>
                                </div>
                            </div>
                        
                        <div className="mt-10">
                            <Tabs defaultActiveKey="parts" id="uncontrolled-tab-example">
                                <Tab eventKey="parts" title="Parts">
                                    <div className="table-responsive">
									    <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                            <thead>
                                                <tr>
                                                    <th>SL</th>
                                                    <th>Warehouse</th>
                                                    <th style={{ 'width': '20%' }}>Item</th>
                                                    <th>Unit</th>
                                                    <th>Stock</th>
                                                    <th>Price</th>
                                                    <th>Quantity</th>
                                                    <th>Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.state.parts.map((item, index) =>
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                <select className="form-control" onChange={this.onWarehouseChange(index)} value={item.warehouse} disabled={item.maintenanceOrderDetailsId} >
                                                                    <option value="">Select Warehouse</option>
                                                                    {
                                                                        this.state.warehouseOptions.map(function (item, id) {
                                                                            return <option key={id} value={item.warehouseId}>{item.warehouseName}</option>
                                                                        })
                                                                    }
                                                                </select>
                                                            </td>
                                                            <td><AsyncSelect
                                                                key={index}
                                                                value={item.item}
                                                                defaultOptions
                                                                loadOptions={this.fetchItemData}
                                                                placeholder="Select Item"
                                                                styles={customStylesSelect}
                                                                isDisabled={true}
                                                            />
                                                            </td>
                                                            <td>{item.unit}</td>
                                                            <td>{item.stock}</td>
                                                            <td><input className="form-control" style={{ 'marginTop': '0px' }} type="text" value={item.price} onChange={this.onPartsPriceChange(index)}/></td>
                                                            <td><input className="form-control" style={{ 'marginTop': '0px' }} type="text" value={item.qty}  readOnly/></td>
                                                            <td>{item.cost}</td>
                                                        </tr>

                                                    )
                                                }
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="7" className="kt-align-right kt-font-bold" style={{ "textAlign": "right" }}>
                                                        Total
                                                            </td>
                                                    <td className="kt-align-right kt-font-brand kt-font-bold">{this.state.totalPartsCost}</td>
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
                                                    <th>Start Date</th>
                                                    <th>End Date</th>
                                                    <th>Duration(h:m)</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.state.operations.map((item, index) =>

                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td><input className="form-control" type="text" value={item.operation||""} readOnly/></td>
                                                            <td><textarea className="form-control" value={item.operationDetails||""}  readOnly/></td>
                                                            <td><input className="form-control" type="date" value={item.startDate||""} onChange={this.onOperationDateChange(index)} /></td>
                                                            <td><input className="form-control" type="date" value={item.endDate||""} onChange={this.onOperationInputChange(index, 'endDate')} /></td>
                                                            <td>
                                                                <div className="input-group">
                                                                    <input className="form-control" type="text" value={item.duration||""} onChange={this.onOperationDurationChange(index)} />
                                                                    <div className="input-group-prepend">
                                                                        <span className="input-group-text">:</span>
                                                                    </div>
                                                                    <input className="form-control" type="text" value={item.duration1||""} onChange={this.onOperationDuration1Change(index)} />
                                                                </div>
                                                            </td>
                                                            <td><input className="form-control" type="number" value={item.amount||""} onChange={this.onOperationAmountChange(index)} /></td>
                                                        </tr>

                                                    )
                                                }

                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colSpan="6" className="kt-align-right kt-font-bold" style={{ "textAlign": "right" }}>
                                                        Total
                                                    </td>
                                                    <td className="kt-align-right kt-font-brand kt-font-bold">{this.state.totalOperationsCost}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </Tab>
                            </Tabs>
                            <div className="col-md-4 offset-md-8 mt-10">
                                <div className="row">
                                        <div className="col-md-6"><b>Total Parts Cost :</b></div>
                                        <div className="col-md-3">{this.state.totalPartsCost}</div>
                                    </div>	
                                    <div className="row">
                                        <div className="col-md-6"><b>Total Operations Cost :</b></div>
                                        <div className="col-md-3">{this.state.totalOperationsCost}</div>
                                    </div> 
                                    <div className="row">
                                        <div className="col-md-6"><b>Total Cost :</b></div>
                                        <div className="col-md-3">{this.state.totalCost}</div>
                                    </div>         
                                </div>
                            </div>
                        </div>

                        <div className="card-footer">
                            <div className="row">
                                <div className="col-4">
                                </div>
                                <div className="col-6">
                                    <button type="submit" className="btn btn-success mr-2">Submit</button>
                                    <button type="reset" className="btn btn-secondary">Cancel</button>
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

export default EquipmentScheduleMaintenanceCreate;
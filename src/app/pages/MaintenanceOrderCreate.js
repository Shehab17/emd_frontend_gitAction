import React, { Component } from 'react';
import { Tab, Tabs,Modal,Button } from "react-bootstrap";
import SVG from "react-inlinesvg";
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";
import { getGetRequestOptions } from "../components/GetToken";
import InputMask from 'react-input-mask';
import SrrConfirm from '../components/SrrConfirm';


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


class MaintenanceOrderCreate extends Component {
	state = {
		businessUnit: {
			projectId: 47,
			projectName: "EMD",
			companyId: 3,
			label: "EMD",
			value: 47,
			isdisabled: false
		},
		maintBusinessUnit:{},
		category:"breakdown_maintenance",
		title: "",
		maintenanceType: "",
		equipment: "",
		closingHrsMeter:"",
		maintenanceTeam: "",
		responsiblePersons: "",
		orderDate: "",
		priority: "high",
		parts: [{ warehouse: "", item: "", unit: "", qty: "", stock: "", price: "", cost: "" }],
		operations: [],
		totalPartsCost: 0,
		totalOperationsCost: 0,
		totalCost: 0,
		operationIndex:"",
		selectedSorrId:[],
		allBusinessUnits: [],
		allMaintTeam: [],
		allMaintType: [],
		warehouseOptions: [],
		errors: {
			orderDate: "",
		},
		touched: {
			orderDate: false,
		}
	}


	componentDidMount() {
		const { allBusinessUnits, allMaintTeam,allMaintType, ...baseState } = this.state;
		this.baseState = baseState;
		this.getAllBu();
		this.getMainTeam();
		this.getMainType();
		if (this.state.businessUnit.projectId != null) {
			this.getBuWarehouse(this.state.businessUnit.projectId);
		}
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

	handleMaintBuChange = maintBusinessUnit => {
		this.setState({ maintBusinessUnit: maintBusinessUnit });
	}

	handleBuChange = businessUnit => {
		this.setState({ businessUnit: businessUnit });
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

	handleMaintenanceTypeChange = (maintenanceType) => {
		this.setState({maintenanceType:maintenanceType });
	}


	getEquipment = (inputValue, callback) => {

		if (!inputValue) {
			callback([]);

		}
		else{
			const projectId = this.state.businessUnit.projectId;
			var url = process.env.REACT_APP_API_URL + "equipment/equipment_search/" + projectId + "?q=" + inputValue;
			setTimeout(() => {
				fetch(url,getGetRequestOptions())
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
	}

	getMainTeam() {
		fetch(process.env.REACT_APP_API_URL + "maintenance_team",
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			let tempResp = resp.data.map(function (element) {
				return { ...element, label: element.teamName, value: element.teamId }
			});
			this.setState({ allMaintTeam: tempResp });
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});
	}


	getResPersons = (inputValue, callback) => {
		if (!inputValue) {
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

	handleResponsiblePersonsChange = (persons) => {
		this.setState({ responsiblePersons: persons });
	}

	getEquipmentClosingHrsMeter = (equipmentId) => {
		fetch(process.env.REACT_APP_API_URL + "equipment/max_closing_hrs_meter/" + equipmentId,
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			this.setState({ closingHrsMeter: resp.maxClosingHrsMeter });

		})
		.catch((error) => {
			console.log(error, "catch the hoop")
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

	fetchItemData = (inputValue, callback) => {
		if (!inputValue) {
			var api = process.env.REACT_APP_API_URL + "item/item_search";
		} else {
			api = process.env.REACT_APP_API_URL + "item/item_search?q=" + inputValue;
		}

		setTimeout(() => {
			fetch(api,getGetRequestOptions())
			.then((resp) => {
				return resp.json()
			})
			.then((resp) => {
				const tempArray = resp.data.map(function (element) {
					return { ...element, id: element.itemId, label: `${element.itemName} ${element.itemCode}`, value: element.itemId }
				});
				callback(tempArray);
			})
			.catch((error) => {
				console.log(error, "catch the hoop")
			});
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
				return { ...row, stock: resp.data }
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
				return { ...row, price: resp.data }
			});
			this.setState({ parts: newItems });

		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});
	}

	handleEquipmentChange = equipment => {
		this.setState({ equipment: equipment, operations:[],operationIndex:"",selectedSorrId:[] },()=>this.getEquipmentClosingHrsMeter(equipment.equipmentId));
	}

	handleMaintenanceTeamChange = maintenanceTeam => {
		this.setState({ maintenanceTeam: maintenanceTeam });
	}

	onWarehouseChange = (index) => evt => {
		const newItems = this.state.parts.map(function (row, rindex) {
			if (index !== rindex) return row;
			return { ...row, warehouse: evt.target.value }
		});
		this.setState({ parts: newItems });
	}

	handleInputOnChange = evt => {
		this.setState({ [evt.target.name]: evt.target.value });
	};

	onChangeOrderDate = evt => {
		this.setState({ orderDate: evt.target.value });

		let errors = this.state.errors;
		let touched = this.state.touched;
		touched.orderDate = true;
		if (evt.target.value === "") {
			errors.orderDate = "Request Date is required!";
		}
		else {
			errors.orderDate = "";
		}
		this.setState({ errors, touched: touched });
	}

	onPartsItemChange = index => item => {
		this.getItemStock(item.itemId, this.state.parts[index].warehouse, index);
		this.getItemIssuePrice(item.itemId, item.unitId, this.state.parts[index].warehouse, index);
		const newItems = this.state.parts.map(function (row, rindex) {
			if (index !== rindex) return row;
			return { ...row, item: item, unit: item.unitName }
		});
		this.setState({ parts: newItems });
	}

	addPartsItem = () => {
		this.setState({
			parts: this.state.parts.concat([{ warehouse: "", item: "", unit: "", qty: "", stock: "", price: "", cost: "" }])
		});
	}

	removePartsItem = (index) => () => {
		this.setState({
			parts: this.state.parts.filter((row, rindex) => index !== rindex)
		});
		this.calcTotal();
	}

	onPartsQtyChange = (index) => evt => {
		const newItems = this.state.parts.map(function (row, rindex) {
			if (index === rindex) {
				row.qty = evt.target.value;
				row.cost = (Number(row.qty) * Number(row.price)).toFixed(2);
			}
			return row;
		})

		this.setState({ parts: newItems });
		this.calcTotal();
	}

	onPartsPriceChange = index => evt => {

		const newItems = this.state.parts.map(function (row, rindex) {
			if (index === rindex) {
				row.price = evt.target.value;
				row.cost = (Number(row.qty) * Number(row.price)).toFixed(2);
			}
			return row;
		})

		this.setState({ parts: newItems });
		this.calcTotal();
	}

	objPsum = (items, prop) => {
		return items.reduce(function (a, b) {
			return Number(a) + Number(b[prop]);
		}, 0);
	}
	calcTotal = () => {
		const totalPartsCost = this.objPsum(this.state.parts, 'cost');
		const totalOperationsCost = this.objPsum(this.state.operations, 'amount');
		const totalCost = Number(totalPartsCost) + Number(totalOperationsCost);
		this.setState({ totalPartsCost: (totalPartsCost).toFixed(2) });
		this.setState({ totalOperationsCost: (totalOperationsCost).toFixed(2) });
		this.setState({ totalCost: (totalCost).toFixed(2) });
	}

	/*  operation  function*/

	onOperationChange = (index) => evt => {

		const newItems = this.state.operations.map(function (row, rindex) {
			if (index === rindex) {
				row.operation = evt.target.value;
			}
			return row;
		})

		this.setState({ operations: newItems });

	}

	onOperationTimeChange = (index) => evt => {

		const newItems = this.state.operations.map(function (row, rindex) {
			if (index === rindex) {
				row.time = evt.target.value;
			}
			return row;
		})

		this.setState({ operations: newItems });

	}

	onOperationDetailsChange = (index) => evt => {

		const newItems = this.state.operations.map(function (row, rindex) {
			if (index === rindex) {
				row.operationDetails = evt.target.value;
			}
			return row;
		})

		this.setState({ operations: newItems });

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

	onOperationAmountChange = index => evt => {
		const newItems = this.state.operations.map(function (row, rindex) {
			if (index === rindex) {
				row.amount = evt.target.value;
			}
			return row;
		})

		this.setState({ operations: newItems },() =>this.calcTotal());  

	}

	addOperationItem = () => {
		this.setState({
			operations: this.state.operations.concat([{operation: "", operationDetails: "", startDate: "", endDate: "", amount: "", time:"",serviceOrderReceive:[] }])
		});
		this.calcTotal();
	}

	removeOperationItem = (index) => () => {
		this.setState({
			operations: this.state.operations.filter((row, rindex) => index !== rindex),
			selectedSorrId: this.state.selectedSorrId.filter((item, i) => index !== i)
		},() =>this.calcTotal());

	}

	confirmSrr = (index,equipmentId) => {
		this.setState({ srrConfirmModalShow: true, equipmentId: equipmentId ,operationIndex:index});
	}

	onSrrConfirm = (confirmData) => {
		this.setState({ srrConfirmModalShow: false});
	}

	onSrrSelected = (serviceOrder) =>{
		var index = this.state.operationIndex;
		var selectedSorrId =  this.state.selectedSorrId;
		const newItems = this.state.operations.map(function (row, rindex) {
			if (index === rindex) {
				row.serviceOrderReceive = serviceOrder.serviceOrderReceive;
				row.amount = serviceOrder.serviceOrderReceive.length !== 0 ? serviceOrder.serviceOrderReceive.totalAmount : "";
			}
			return row;
		})
		selectedSorrId[index] = serviceOrder.serviceOrderReceive.length !== 0 ? serviceOrder.serviceOrderReceive.sorrId: "";
		this.setState({ operations: newItems ,selectedSorrId: selectedSorrId});
		this.calcTotal();
	}

	validateForm = () => {

		let errors = this.state.errors;
		let touched = this.state.touched;
		for (var input in errors) {

			touched[input] = true;

			if (input === "orderDate") {
				if (this.state.orderDate === "") {
					errors.orderDate = "Request Date is required!";
				}
				else {
					errors.orderDate = "";
				}
			}
		}
		this.setState({ errors, touched: touched });

		if (this.state.errors.orderDate !== "") {
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
						businessUnit: this.state.businessUnit,
						maintBusinessUnit:this.state.maintBusinessUnit,
						category: this.state.category,
						title: this.state.title,
						maintenanceType: this.state.maintenanceType,
						equipment: this.state.equipment,
						closingHrsMeter: this.state.closingHrsMeter,
						maintenanceTeam: this.state.maintenanceTeam,
						responsiblePersons: this.state.responsiblePersons,
						orderDate: this.state.orderDate,
						priority: this.state.priority,
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
	}


	render() {
		const { errors, touched } = this.state;
		const priorityOption = [
			{ label: 'High', value: 'high' },
			{ label: 'Medium', value: 'medium' },
			{ label: 'Low', value: 'low' },
		]
		let srrConfirmModalClose = () => {
			this.setState({ srrConfirmModalShow: false });
		};
		return (
			<>
				<div className="card card-custom">
					<div className="card-header">
						<h3 className="card-title">
							<p className="text-primary">
								Maintenance Order Create
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
											onChange={this.handleBuChange}
											isDisabled={true}
											options={this.state.allBusinessUnits}
										/>
									</div>
								</div>
								<div className="form-group row">
									<label htmlFor="example-text-input" className="col-2 col-form-label">Title</label>
									<div className="col-6">
										<input className="form-control form-control-sm" type="text" name="title" id="title" value={this.state.title} onChange={this.handleInputOnChange} />
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
										<select className="form-control" id="priority" name="priority" value={this.state.priority} onChange={this.handleInputOnChange} >
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
										/>
									</div>
								</div>
								<div className="form-group row">
									<label htmlFor="example-text-input" className="col-2 col-form-label">Closing Hrs Meter</label>
									<div className="col-6">
										<input className="form-control form-control-sm" type="text" name="closingHrsMeter" id="closingHrsMeter" onChange={this.handleInputOnChange} value={this.state.closingHrsMeter} />
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
										<input type="date" name="orderDate" id="orderDate" value={this.state.orderDate} onChange={this.onChangeOrderDate} className={`form-control form-control-md ${touched.orderDate === true ? (errors.orderDate === "" ? 'is-valid' : 'is-invalid') : ''}`} />
										<div className="invalid-feedback">{errors.orderDate}</div>
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
															<th>Estimated Price</th>
															<th>Estimated Quantity</th>
															<th>Cost</th>
															<td>Action</td>
														</tr>
													</thead>
													<tbody>
														{
															this.state.parts.map((item, index) =>
																<tr key={index}>
																	<td>{index + 1}</td>
																	<td>
																		<select className="form-control" onChange={this.onWarehouseChange(index)}>
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
																		onChange={this.onPartsItemChange(index)}
																		styles={customStylesSelect}
																	/>
																	</td>
																	<td>{item.unit}</td>
																	<td>{item.stock}</td>
																	<td><input className="form-control" style={{ 'marginTop': '0px' }} type="text" value={item.price} onChange={this.onPartsPriceChange(index)} disabled={item.item.length === 0 || item.warehouse === ""} /></td>
																	<td><input className="form-control" style={{ 'marginTop': '0px' }} type="text" value={item.qty} onChange={this.onPartsQtyChange(index)} /></td>
																	<td>{item.cost}</td>
																	<td>
																		<div className="row">
																			<div className="col-2">
																				<button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removePartsItem(index)}> 
																					<span className="svg-icon svg-icon-md svg-icon-danger">
																						<SVG src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")} />
																					</span>
																				</button>
																			</div>
																		</div>
																	</td>

																</tr>

															)
														}
														<tr>
															<td colSpan="9">
																<div className="form-group row">
																	<div className="col-lg-2">
																		<button type="button" className="btn btn-primary btn-sm" onClick={this.addPartsItem}>Add Parts</button>
																	</div>
																</div>
															</td>
														</tr>
													</tbody>
													<tfoot>
														<tr>
															<td colSpan="7" className="kt-align-right kt-font-bold" style={{ "textAlign": "right" }}>
																Total
																	</td>
															<td className="kt-align-right kt-font-brand kt-font-bold">{this.state.totalPartsCost}</td>
															<td></td>
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
															<th>Estimated Start Date</th>
															<th>Estimated Finish Date</th>
															<th>Duration(h:m)</th>
															<th>Tag SRR/SR Certification</th>
															<th>Estimated Amount</th>
															<th>Action</th>
														</tr>
													</thead>
													<tbody>
														{
															this.state.operations.map((item, index) =>

																<tr key={index}>
																	<td>{index + 1}</td>
																	<td><input className="form-control" type="text" value={item.operation} onChange={this.onOperationChange(index)} /></td>
																	<td><textarea className="form-control" value={item.operationDetails} onChange={this.onOperationDetailsChange(index)} /></td>
																	<td><input className="form-control" type="date" value={item.startDate} onChange={this.onOperationDateChange(index)} /></td>
																	<td><input className="form-control" type="date" value={item.endDate} onChange={this.onOperationInputChange(index, 'endDate')} /></td>
																	<td>
																		<InputMask mask="99:99"className="form-control" onChange={this.onOperationTimeChange(index)} value={item.time} style={{"width":"40%"}}/>
																	</td>
																	<td>
																		<div className="form-group">
																			<div className="input-group">
																				<input type="text" className="form-control" value={item.serviceOrderReceive.length !== 0 ? item.serviceOrderReceive.srrNo : ""} placeholder="Srr no" aria-describedby="basic-addon2" readOnly/>
																				<div className="input-group-append">
																					<button type="button" onClick={() => this.confirmSrr(index,this.state.equipment.equipmentId)} style={{ 'marginTop': '0px' }} className="pt-2 btn btn-primary btn-sm" disabled={this.state.equipment === ""}><i className="flaticon2-tag"></i></button>
																				</div>
																			</div>
																		</div>
																	
																	</td>
																	<td><input className="form-control" type="number" value={item.amount} onChange={this.onOperationAmountChange(index)} readOnly/></td>
																	<td>
																		<div className="row">
																			<div className="col-2">
																				<button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removeOperationItem(index)}>
																					<span className="svg-icon svg-icon-md svg-icon-danger">
																						<SVG src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")} />
																					</span>
																				</button>
																			</div>
																		</div>
																	</td>
																</tr>

															)
														}
														<tr>
															<td colSpan="9">
																<div className="form-group row">
																	<div className="col-lg-2">
																		<button type="button" className="btn btn-primary btn-sm" onClick={this.addOperationItem}>Add Operation</button>
																	</div>
																</div>
															</td>
														</tr>
													</tbody>
													<tfoot>
														<tr>
															<td colSpan="7" className="kt-align-right kt-font-bold" style={{ "textAlign": "right" }}>
																Total
																	</td>
															<td className="kt-align-right kt-font-brand kt-font-bold">{this.state.totalOperationsCost}</td>
															<td></td>
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

						<Modal size="lg" show={this.state.srrConfirmModalShow} onHide={srrConfirmModalClose} aria-labelledby="example-modal-sizes-title-lg">
							<Modal.Body>
								<SrrConfirm onSrrConfirm={this.onSrrConfirm} onSrrSelected={this.onSrrSelected} equipmentId={this.state.equipment.equipmentId} selectedSorrId={this.state.selectedSorrId} operationIndex={this.state.operationIndex} srrType="create" />
							</Modal.Body>

							<Modal.Footer>
								<Button variant="primary" onClick={srrConfirmModalClose}>Ok</Button>
								<Button variant="secondary" onClick={srrConfirmModalClose}>Cancel</Button>
							</Modal.Footer>
						</Modal>

					</form>

				</div>

				<ToastContainer />
			</>
		);
	}
}

export default MaintenanceOrderCreate;
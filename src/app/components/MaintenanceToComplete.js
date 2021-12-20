import React, { Component } from 'react';
import { Button, Modal, Tab, Tabs } from "react-bootstrap";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";
import OperationConfirm from './OperationConfirm';
import PartsConfirm from './PartsConfirm';
import ToastMsg from './ToastMsg';

class MaintenanceToComplete extends Component {
	state = {
		moId: "",
		orderNo: "",
		equipment: { equipmentName: '' },
		orderDate:'',
		team: { teamName: '' },
		maintenancetype: "",
		priority: "",
		responsibleperson: [],
		status:"",
		businessunit: { businessunitName: '' },
		maint_businessunit: {},
		parts: [],
		operations: [],
		totalPartsCost: 0,
		totalOperationsCost: 0,
		totalCost:0,
		completionDate: "",
		isShowOrderComplete: "",
		prevParts:[],
		serviceOrderReceiveList:[],
		hasAccessMoDetailsConfirm : ""
	}

	componentDidMount() {
		const id = this.props.orderId;
		this.setState({ moId: id });
		this.getMainOrderDetails(id);
	}

	componentDidUpdate(prevProps) {
		if (this.props.orderId !== prevProps.orderId) {
		const id = this.props.orderId;
		this.setState({ moId: id });
		this.getMainOrderDetails(id);
		}
	}

	objPsum = (items, prop) => {
		return items.reduce(function (a, b) {
		return Number(a) + Number(b[prop]);
		}, 0);
	}

	calcTotal = () => {
		var totalPartsCost = 0;
		this.state.parts.forEach(function (item) {
			totalPartsCost += item.invStatus==='Issued' ? Number(item.price) * Number(item.issuedQty) :  Number(item.price) * Number(item.quantity);
		});

		this.setState({ totalPartsCost: (totalPartsCost).toFixed(2) });
		const totalOperationsCost = this.objPsum(this.state.operations, 'amount');
		this.setState({ totalOperationsCost: (totalOperationsCost).toFixed(2) });
		const totalCost = Number(totalPartsCost) + Number(totalOperationsCost);
		this.setState({ totalCost: (totalCost).toFixed(2) });

	}

	getMainOrderDetails(orderId) {
		fetch(process.env.REACT_APP_API_URL + "maintenance_order/order_details/" + orderId,         
		getGetRequestOptions())

		.then((resp) => {
		return resp.json()
		})
		.then((resp) => {
		this.setState({
			orderNo: resp.orderNo,
			orderDate: resp.orderDate,
			title: resp.title,
			equipment: resp.equipment,
			team: resp.team,
			maintenancetype: resp.maintenancetype,
			priority: resp.priority,
			responsibleperson: resp.responsibleperson,
			businessunit: resp.businessunit,
			maint_businessunit:resp.maint_businessunit,
			isShowOrderComplete : resp.isShowOrderComplete,
			hasAccessMoDetailsConfirm : resp.hasAccessMoDetailsConfirm,
			parts: resp.parts,
			operations: resp.operations,
			status: resp.status
		}, () => this.calcTotal());

		})
		.catch((error) => {
		console.log(error, "catch the hoop")
		});

	}

	confirmOperation = (operationId) => {
		this.setState({ opConfirmModalShow: true, operationId: operationId });
	}

	onOperationConfirm = (confirmData) => {
		console.log(confirmData);
		this.setState({ opConfirmModalShow: false });
		this.getMainOrderDetails(this.state.moId);
	}

	confirmParts = (prevParts) => {
		this.setState({ opPartsModalShow: true, prevParts: prevParts });
	}

	onPartsConfirm = (confirmData) => {
		console.log(confirmData);
		this.setState({ opPartsModalShow: false });
		this.getMainOrderDetails(this.state.moId);
	}


	
	confirmMocomplete = (moId) => {
		this.setState({ moCompleteModalShow: true, moId: moId });
	}
	
	completeMo = (orderId) => {

		Swal.fire({
		title: 'Are you sure?',
		text: "You won't be able to revert this!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#C1C1C1',
		confirmButtonText: 'Yes, approve it!'
		}).then((result) => {
		if (result.value) {
			const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
			const formData = { orderId: orderId };
			const requestOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
				body: JSON.stringify(formData)
			};
			fetch(process.env.REACT_APP_API_URL + "maintenance_order/order_complete", requestOptions)
			.then((resp) => {
				return resp.json()
			})
			.then((resp) => {
				console.log(resp);

				if (resp.success === true) {

				toast.success(<ToastMsg toastMessage={[resp.successMessage]} heading="Order has been completed successfully" />, {
					position: toast.POSITION.TOP_RIGHT
				});


				this.getMainOrderDetails(orderId);
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

	handleInputOnChange = evt => {
        evt.preventDefault();
        this.setState({ [evt.target.name]: evt.target.value });

    };

	handleSubmitCompleteMo = evt => {

		evt.preventDefault();

		Swal.fire({
		title: 'Are you sure?',
		text: "You won't be able to revert this!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#C1C1C1',
		confirmButtonText: 'Yes, approve it!'
		}).then((result) => {
		if (result.value) {
			const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
			const formData = { orderId: this.state.moId,
				completionDate: this.state.completionDate,
			};
			const requestOptions = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
				body: JSON.stringify(formData)
			};
			fetch(process.env.REACT_APP_API_URL + "maintenance_order/order_complete", requestOptions)
			.then((resp) => {
				return resp.json()
			})
			.then((resp) => {
				console.log(resp);

				if (resp.success === true) {

				toast.success(<ToastMsg toastMessage={[resp.successMessage]} heading="Maintenance Order has been completed successfully" />, {
					position: toast.POSITION.TOP_RIGHT
				});

				this.setState({ moCompleteModalShow: false });

				this.getMainOrderDetails(this.state.moId);
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

  	render() {

		const resListItem = this.state.responsibleperson.map((person, key) =>
		<li key={key} >{`${person.employeeName} ${person.employeeCode}`}</li>
		);

		let opConfirmModalClose = () => {
		this.setState({ opConfirmModalShow: false });
		};
		
		let opPartsModalClose = () => {
			this.setState({ opPartsModalShow: false });
		};

		let moCompleteModalClose = () => {
			this.setState({ moCompleteModalShow: false });
		};


		return (

		<div className="card card-custom mt-5">
			<div className="card-header mt-5">
				<div className="card-title">
					<h3 className="card-label">
					Maintenance Order  #{this.state.orderNo}
					</h3>
				</div>
				{(this.state.status !== 'completed' && this.state.isShowOrderComplete === 1) ?
					<div className="card-toolbar mr-10 ">
					<button type="button" onClick={() => this.confirmMocomplete(this.props.orderId)} style={{ 'marginTop': '0px' }} className="btn btn-success btn-sm float-right mb-5" > Complete </button>
					</div> : ''
				}
			</div>
			<div className="card-body">
				<div className="row">
					<div className="col-6">
						<table className="table table-bordered table-hover">

							<tbody>
								<tr>
									<th>Equipment</th>
									<td>{this.state.equipment.equipmentName}</td>
								</tr>
								<tr>
									<th>Equipment Code</th>
									<td>{this.state.equipment.equipmentCode}</td>
								</tr>
								<tr>
									<th>Maintenance Order No</th>
									<td>{this.state.orderNo}</td>
								</tr>
								<tr>
									<th>Order Date</th>
									<td>{this.state.orderDate}</td>
								</tr>
								<tr>
									<th>Title</th>
									<td>{this.state.title}</td>
								</tr>
								<tr>
									<th>Maintenance Type</th>
									<td>{this.state.maintenancetype != null ? this.state.maintenancetype.name : ''}</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div className="col-6">
						<table className="table table-bordered table-hover">
							<tbody>
								<tr>
									<th>Priority</th>
									<td>{this.state.priority}</td>
								</tr>
								<tr>
									<th>Responsible Person</th>
									<td><ul>{resListItem}</ul></td>
								</tr>
								<tr>
									<th> Location Business unit</th>
									<td>{this.state.maint_businessunit != null ? this.state.maint_businessunit.maintBusinessunitName : ''}</td>
								</tr>
								<tr>
									<th>Status</th>
									<td><span className={this.state.status === 'created' ? 'label label-lg label-primary label-inline mr-2' : 'label label-lg label-success label-inline mr-2'}>{this.state.status}</span></td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className="row">
					<div className="col-12">
						<div className="kt-section">
							<div className="kt-separator kt-separator--dashed"></div>
							<Tabs defaultActiveKey="parts" id="uncontrolled-tab-example">
								<Tab eventKey="parts" title="Parts">

									<div className="kt-section">
										<div className="kt-section__content">
											<table className="table table-bordered table-hover">
											<thead>
												<tr>
												<th>SL</th>
												<th style={{ 'width': '30%' }}>Item</th>
												<th>Unit</th>
												<th>Price</th>
												<th>Quantity</th>
												<th>Issue Quantity</th>
												<th>Cost</th>
												<th>Inventory Status</th>
												<th>Warehouse</th>
												<td>Action</td>
												</tr>
											</thead>
											<tbody>
												{
												this.state.parts.map((item, index) =>
													<tr key={index}>
														<td>{index + 1}</td>
														<td>{item.item.itemName}</td>
														<td>{item.item.unitName}</td>
														<td>{item.price} </td>
														<td>{item.quantity}</td>
														<td>{Number(item.issuedQty).toFixed(2)}</td>
														<td>{ item.invStatus==='Issued' ? (Number(item.price) * Number(item.issuedQty)).toFixed(2) :(Number(item.price) * Number(item.quantity)).toFixed(2) }</td>
														<td>{item.invStatus}</td>
														<td>{item.warehouseName}</td>
														<td>
															{ item.isComplete !== 'yes' ?
															(this.state.hasAccessMoDetailsConfirm=='1' ? <button type="button" onClick={() => this.confirmParts(item)} style={{ 'marginTop': '0px' }} className="pt-2 btn btn-primary btn-sm">Confirm</button> : '')
														: <span className={'label label-lg label-success label-inline mr-2'}>Done</span>}
														</td>
													</tr>

												)}
											</tbody>
											<tfoot>
												<tr>
												<td colSpan="6" style={{ "textAlign": "right" }}>
													Total
												</td>
												<td colSpan="3">{this.state.totalPartsCost}</td>
												</tr>
											</tfoot>
											</table>
										</div>
									</div>
								</Tab>
								<Tab eventKey="operations" title="Operations" >

									<table className="table table-bordered table-hover">
									<thead>
										<tr>
										<th>SL</th>
										<th>Operation</th>
										<th>Operation Short Desc</th>
										<th>Work Start Date</th>
										<th>Work Finish Date</th>
										<th style={{ 'width': '15%' }}>Duration(h:m)</th>
										<th>Srr No</th>
										<th>Amount</th>
										<td>Action</td>
										</tr>
									</thead>
									<tbody>
										{
										this.state.operations.map((operation, index) =>

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
												<td>
													{operation.isComplete !== 'yes' ?
														 (this.state.hasAccessMoDetailsConfirm=='1' ? <button type="button" onClick={() => this.confirmOperation(operation.operationId)} style={{ 'marginTop': '0px' }} className="pt-2 btn btn-primary btn-sm">Confirm</button> : '')
													: <span className={'label label-lg label-success label-inline mr-2'}>Done</span>}
												</td>
											</tr>
										)}

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
			</div>
			{/* <pre>
                    {JSON.stringify(this.state, null, 2)}
                </pre> */}
			<Modal size="lg" show={this.state.opConfirmModalShow} onHide={opConfirmModalClose} aria-labelledby="example-modal-sizes-title-lg">
				<Modal.Body>
					<OperationConfirm onOperationConfirm={this.onOperationConfirm} operationId={this.state.operationId} equipmentId={this.state.equipment.id_equipment} />
				</Modal.Body>

				<Modal.Footer>
					<Button variant="secondary" onClick={opConfirmModalClose}>Cancel</Button>
				</Modal.Footer>
			</Modal>
			<Modal size="lg" show={this.state.opPartsModalShow} onHide={opPartsModalClose} aria-labelledby="example-modal-sizes-title-lg">
				<Modal.Body>
					<PartsConfirm onPartsConfirm={this.onPartsConfirm} prevParts={this.state.prevParts} />
				</Modal.Body>

				<Modal.Footer>
					<Button variant="secondary" onClick={opPartsModalClose}>Cancel</Button>
				</Modal.Footer>
			</Modal>

			<Modal size="lg" show={this.state.moCompleteModalShow} onHide={moCompleteModalClose} aria-labelledby="example-modal-sizes-title-lg">
				<Modal.Body>
					{/* <OperationConfirm onMoComplete={this.onMoComplete} operationId={this.state.operationId} /> */}

					<h3 className="card-title">
                    <p className="text-primary">
					Maintenance Order Complete
                    </p>
                </h3>


                <form onSubmit={this.handleSubmitCompleteMo}>
                    <div className="card-body">
                        <div className="ml-12">

                            <div className="form-group row">
                                <label htmlFor="startDate" className="col-lg-3 col-form-label">Completion  Date</label>
                                <div className="col-lg-4">
                                    <input type="date" name="completionDate" id="completionDate" value={this.state.completionDate} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>


                        </div>
                    </div>

                    <div className="card-footer">
                        <div className="row">
                            <div className="col-4">
                            </div>
                            <div className="col-6">
                                <button type="submit" className="btn btn-success mr-2">Complete</button>

                            </div>
                        </div>
                    </div>
                </form>
				</Modal.Body>

				<Modal.Footer>
					<Button variant="secondary" onClick={moCompleteModalClose}>Cancel</Button>
				</Modal.Footer>
			</Modal>
			{/* <pre>
				{JSON.stringify(this.state, null, 2)}
			</pre> */}

			<ToastContainer />
		</div>
		);
  	}
}

export default MaintenanceToComplete;
import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getGetRequestOptions } from "../components/GetToken";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../_metronic/_helpers";


class SrrConfirm extends Component {
	state = {
		equipmentId:"",
		operationIndex:"",
		selectedSorrId:[],
		serviceOrderReceive:[],
		serviceOrderReceiveList:""
	}


	componentDidMount() {

		if (this.props.equipmentId !== undefined) {
			this.setState({ equipmentId: this.props.equipmentId});
			if(this.props.selectedSorrId !== undefined){
				this.setState({selectedSorrId:this.props.selectedSorrId,operationIndex:this.props.operationIndex});
			}
			this.getServiceOrderReceiveList(this.props.equipmentId,this.props.selectedSorrId,this.props.operationIndex,this.props.srrType,this.props.moId !== undefined ? this.props.moId: "");
		}
	}

	getServiceOrderReceiveList(equipmentId,selectedSorrId,operationIndex,srrType,moId) {
		if(srrType === 'create'){
			var url = process.env.REACT_APP_API_URL + "maintenance_order/service_order_receive_list/" + equipmentId;
		}
		else{
			url = process.env.REACT_APP_API_URL + "maintenance_order/service_order_receive_list_edit/" + equipmentId +'/' + moId;
		}
		fetch(url,getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			var selectedId = selectedSorrId[operationIndex];
			let selectedSorrIdArr = [];
			selectedSorrIdArr = selectedSorrId.filter(item => item !== selectedId);
			const srrResult = resp.filter(item => !selectedSorrIdArr.includes(item.sorrId) );
			const serviceOrderReceiveList = srrResult.map(function (row) {
				if(row.sorrId === selectedId){
					row.isSelected = 1;
				}
				else{
					row.isSelected = 0;
				}
				return row;
			});
			
			this.setState({ serviceOrderReceiveList: serviceOrderReceiveList});
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});

	}

	onSelectChange = (index,selected) =>{
		var serviceOrderReceive = [];
		const newItems = this.state.serviceOrderReceiveList.map(function (row, rindex) {
			if(selected === 0){
				if (index === rindex) {
					if (row.isSelected === 0) {
						row.isSelected = 1;
						serviceOrderReceive = row;
					}
				}    
				else{
					row.isSelected = 0;
				}
			}
			else{
				if (index === rindex) {
					row.isSelected = 0;
					serviceOrderReceive = [];   
				}
			}
			return row;
		})
		this.setState({ serviceOrderReceiveList: newItems, serviceOrderReceive: serviceOrderReceive},()=>this.props.onSrrSelected({serviceOrderReceive:serviceOrderReceive}));
	}

	render() {

		return (
			<>

				<h3 className="card-title">
					<p className="text-primary">
						Service Order Receive List
					</p>
				</h3>


				<form onSubmit={this.handleSubmit}>
					<div className="col-12">
						<table className="table table-bordered table-hover">
							<thead>
								<tr>
									<th>Select</th>
									<th>Vendor Name</th>
									<th>Service Order Id</th>
									<th>SRR No</th>
									<th>Item Name</th>
									<th>Quantity</th>
									<th>Rate</th>
									<th>Amount</th>
								</tr>
							</thead>
							{this.state.serviceOrderReceiveList.length !== 0 ? 
							<tbody>
								{this.state.serviceOrderReceiveList.map((item, index) =>
									<tr key={index}>
										 <td style={{ "padding": "0.75rem", "textAlign": "center" }} onClick={() => this.onSelectChange(index,item.isSelected)}>
											{item.isSelected === 1 &&
												<span className="svg-icon svg-icon-3x svg-icon-success">
													<SVG
														src={toAbsoluteUrl("/media/svg/icons/Navigation/Check.svg")}
													/>
												</span>}

											{item.isSelected === 0 &&
												<span className="svg-icon svg-icon-3x svg-icon-danger">
													<SVG
														src={toAbsoluteUrl("/media/svg/icons/Navigation/Close.svg")}
													/>
												</span>
											}
										</td>
										<td>{item.vendorName}</td>
										<td>{item.serviceOrderId}</td>
										<td>{item.srrNo} </td>
										<td>{item.categoryName}</td>
										<td>{item.quantity}</td>
										<td>{item.rate}</td>
										<td>{item.totalAmount}</td>
									</tr>
								)}
							</tbody> 
							: 
							<tbody>
								<tr>
									<td colSpan="9"><p style={{ "textAlign": "center" }}><strong>No Srr found for this equipment</strong></p></td>
								</tr>
							</tbody>
								}
						   
						</table>
					</div>
					{/* <pre>
						{JSON.stringify(this.state, null, 2)}
					</pre> */}
				</form>

				<ToastContainer />
			</>
		);
	}
}

export default SrrConfirm;
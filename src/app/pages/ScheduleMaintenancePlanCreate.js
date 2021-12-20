import React, { Component } from 'react';
import { Tab, Tabs } from "react-bootstrap";
import SVG from "react-inlinesvg";
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";
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


class ScheduleMaintenancePlanCreate extends Component {
	state = {
		businessUnit: process.env.REACT_APP_EMD_BU_ID,
        scheduleType:"fixed_schedule",
        fixedSchedule: true,
        periodicSchedule: false,
		equipment: "",
        scheduleName:"",
        triggerAt:"",
        triggerBy: "running_hour",
        intervalType:"interval",
        periodInterval:"",
        multipliedBy:"",
        startingIndicator:"",
        endingMark: "",
        triggerType:"Hour",
        defaultActiveKey:"",
        tab:"",
        parts: [{ item: "", unit: "", qty: ""}],
        operations: [{ operationName: "", operationShortDesc: ""}],
        periodicScheduleArr:[],
        usePrevious: false,


	}

	componentDidMount() {
		const {...baseState } = this.state;
		this.baseState = baseState;
	}

	getEquipment = (inputValue, callback) => {

		if (!inputValue) {
			callback([]);

		} else {
			const projectId = this.state.businessUnit;
			var url = process.env.REACT_APP_API_URL + "equipment/equipment_search/" + projectId + "?q=" + inputValue;
			setTimeout(() => {
            fetch(url,         
                getGetRequestOptions())

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

    fetchItemData = (inputValue, callback) => {
        if (!inputValue) {
            //callback([]);
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

    handleScheduleType = evt => {

        if(evt.target.name === "periodicSchedule" && evt.target.checked === true){
            this.setState({
                periodicSchedule:evt.target.checked,
                fixedSchedule: false,
                scheduleType: "periodic_schedule",
                periodicScheduleArr:[],
            },() =>this.onChangeScheduleName());
        }
        else if (evt.target.name === "periodicSchedule" && evt.target.checked === false){
            this.setState({
                periodicSchedule:evt.target.checked,
                fixedSchedule: true,
                scheduleType: "fixed_schedule",
                periodicScheduleArr:[],
            },() =>this.onChangeScheduleName());
        }
        else if(evt.target.name === "fixedSchedule" && evt.target.checked === true){
            this.setState({
                fixedSchedule:evt.target.checked,
                periodicSchedule: false,
                scheduleType: "fixed_schedule",
                periodicScheduleArr:[],
            },() =>this.onChangeScheduleName());
        }
        else{
            this.setState({
                fixedSchedule:evt.target.checked,
                periodicSchedule: true,
                scheduleType: "periodic_schedule",
                periodicScheduleArr:[],
            },() =>this.onChangeScheduleName());
        }
    };


	handleEquipmentChange = equipment => {
		this.setState({ equipment: equipment},() => {this.onChangeScheduleName()});
	}

    onChangeTriggerBy = evt => {
		this.setState({ [evt.target.name]: evt.target.value });
        if(evt.target.value === "running_hour"){
            this.setState({triggerType: "Hours"}, () => {this.stepCount();this.onChangeScheduleName()});
        }
        else{
            this.setState({triggerType: "KM"}, () => {this.stepCount();this.onChangeScheduleName()});
        }
	}

    onChangeTriggerAt = evt => {
        this.setState({ [evt.target.name]: evt.target.value }, () => this.onChangeScheduleName());
    }

    onChangeIntervalType = evt => {
		this.setState({ [evt.target.name]: evt.target.value, periodicScheduleArr : []},() => this.stepCount());
	}

    onChangePeriodInterval = evt => {
        this.setState({ [evt.target.name]: evt.target.value }, () => this.stepCount());
    }

    onChangeMultipliedBy = evt => {
        this.setState({ [evt.target.name]: evt.target.value }, () => this.stepCount());
    }

    onChangeStartingIndicator= evt => {
        this.setState({ [evt.target.name]: evt.target.value },  () => {this.stepCount();this.onChangeScheduleName()});
    }
    onChangeEndingMark = evt => {
        this.setState({ [evt.target.name]: evt.target.value },  () => {this.stepCount();this.onChangeScheduleName()});
    }

    onChangeScheduleName(){ 
        if(this.state.scheduleType === "fixed_schedule"){
            this.setState({scheduleName: `Schedule for Equipment ${this.state.equipment.equipmentName} after ${this.state.triggerAt} ${this.state.triggerType} running`});
        }
        if(this.state.scheduleType === "periodic_schedule"){
            this.setState({scheduleName: `Schedule for Equipment ${this.state.equipment.equipmentName} starting from ${this.state.startingIndicator} ${this.state.triggerType} ending to ${this.state.endingMark} ${this.state.triggerType}`});
        }       
    }

    stepCount(){
        var periodicScheduleArr = []
        if(this.state.startingIndicator !== "" && this.state.endingMark !== ""  && Number(this.state.startingIndicator) < Number(this.state.endingMark)){
            if(this.state.intervalType === "interval" && this.state.periodInterval !== ""){
                var stepCount = (Number(this.state.endingMark)-Number(this.state.startingIndicator))/Number(this.state.periodInterval);
                if(this.state.periodInterval!== ""){
                    for(var i =0; i<= stepCount; i++){
                        var triggerAt = Number(this.state.startingIndicator) + (Number(this.state.periodInterval) * Number(i));
                        var scheduleName =`Schedule for Equipment ${this.state.equipment.equipmentName} after ${triggerAt} ${this.state.triggerType} running`;
                        periodicScheduleArr.push({scheduleName:scheduleName, triggerAt: triggerAt , parts: [{item: "", unit: "", qty: ""}], operations: [{ operationName: "", operationShortDesc: ""}]});
                            
                        if(i === 0){
                            this.setState({tab: triggerAt })
                        }
                    }
                    this.setState({periodicScheduleArr: periodicScheduleArr});
                }
            }
            if(this.state.intervalType ==="multiply" && this.state.multipliedBy !==""){
                stepCount = Number(this.state.endingMark)/Number(this.state.startingIndicator);
                for(i =1; i<= stepCount;){
                    triggerAt = Number(this.state.startingIndicator) * Number(i);
                    if(i === 1){
                        this.setState({tab: triggerAt })
                    }
                    if(triggerAt <= this.state.endingMark){
                        scheduleName =`Schedule for Equipment ${this.state.equipment.equipmentName} after ${triggerAt} ${this.state.triggerType} running`;
                        periodicScheduleArr.push({scheduleName:scheduleName, triggerAt: triggerAt , parts: [{item: "", unit: "", qty: ""}], operations: [{ operationName: "", operationShortDesc: ""}]});
                    }
                    i=i*Number(this.state.multipliedBy);
                }
                this.setState({periodicScheduleArr: periodicScheduleArr});
            }
        }
    }

    setTab = (tabName) => {
		this.setState({ tab: tabName });
	}

    addPartsItem = (index) => {
        const newItems = this.state.periodicScheduleArr.map(function (row, rindex) {
            if (index === rindex){
                row.parts.push({item: "", unit: "", qty: ""})

            } return row;
        });
        this.setState({ periodicScheduleArr: newItems });
    }

    removePartsItem = (index,k) => () => {
        const newItems = this.state.periodicScheduleArr.map(function (row, rindex) {
            if (index === rindex){
                row.parts.splice(k,1)

            } return row;
        });
        this.setState({ periodicScheduleArr: newItems });
    }

    onChangeQty = (index,k) => evt => {
        const newItems = this.state.periodicScheduleArr.map(function (row, rindex) {
            if (index === rindex) {
                row.parts.map(function(r,l){
                    if(k === l){
                        r.qty = evt.target.value;
                    }
                    return r;
                })
            }
            return row;
        })
        this.setState({ periodicScheduleArr: newItems });
    }

    onPartsItemChange = (index,k) => item => {
        const newItems = this.state.periodicScheduleArr.map(function (row, rindex) {
            if (index === rindex){
                row.parts.map(function(r,l){
                    if(k === l){
                        r.item = item;
                        r.unit = item.unitName;
                    }
                    return r;
                })

            } return row;
        });
        this.setState({ periodicScheduleArr: newItems });
    }

	onOperationNameChange = (index,k) => evt => {

        const newItems = this.state.periodicScheduleArr.map(function (row, rindex) {
            if (index === rindex) {
                row.operations.map(function(r,l){
                    if(k === l){
                        r.operationName = evt.target.value;
                    }
                    return r;
                })
            }
            return row;
        })
        this.setState({ periodicScheduleArr: newItems });
    }

    onOperationShortDescChange = (index,k) => evt => {

        const newItems = this.state.periodicScheduleArr.map(function (row, rindex) {
            if (index === rindex) {
                row.operations.map(function(r,l){
                    if(k === l){
                        r.operationShortDesc = evt.target.value;
                    }
                    return r;
                })
            }
            return row;
        })
        this.setState({ periodicScheduleArr: newItems });
    }

	addOperationItem = (index) => {
        const newItems = this.state.periodicScheduleArr.map(function (row, rindex) {
            if (index === rindex){
                row.operations.push({operationName: "", operationShortDesc: ""})

            } return row;
        });
        this.setState({ periodicScheduleArr: newItems });
    }

    removeOperationItem = (index,k) => () => {
        const newItems = this.state.periodicScheduleArr.map(function (row, rindex) {
            if (index === rindex){
                row.operations.splice(k,1)

            } return row;
        });
        this.setState({ periodicScheduleArr: newItems });
    }

    onPartsItemChangeFs = index => item => {
        const newItems = this.state.parts.map(function (row, rindex) {
            if (index !== rindex) return row;
            return { ...row, item: item, unit: item.unitName }
        });
        this.setState({ parts: newItems });
    }

	addPartsItemFs = () => {
        this.setState({
            parts: this.state.parts.concat([{item: "", unit: "", qty: ""}])
        });
    }

    removePartsItemFs = (index) => () => {
        this.setState({
            parts: this.state.parts.filter((row, rindex) => index !== rindex)
        });
    }

    onPartsQtyChangeFs = (index) => evt => {
        const newItems = this.state.parts.map(function (row, rindex) {
            if (index === rindex) {
                row.qty = evt.target.value;
            }
            return row;
        })
        this.setState({ parts: newItems });
    }

	onOperationNameChangeFs = (index) => evt => {

        const newItems = this.state.operations.map(function (row, rindex) {
            if (index === rindex) {
                row.operationName = evt.target.value;
            }
            return row;
        })

        this.setState({ operations: newItems });

    }

    onOperationShortDescChangeFs = (index) => evt => {

        const newItems = this.state.operations.map(function (row, rindex) {
            if (index === rindex) {
                row.operationShortDesc = evt.target.value;
            }
            return row;
        })

        this.setState({ operations: newItems });

    }

	addOperationItemFs = () => {
        this.setState({
            operations: this.state.operations.concat([{ operationName: "", operationShortDesc: ""}])
        });
    }

    removeOperationItemFs = (index) => () => {
        this.setState({
            operations: this.state.operations.filter((row, rindex) => index !== rindex)
        });
    }

    oneChangeUsePrevious = (index) => evt =>{
        if(evt.target.checked === true){
            const parts = [...this.state.periodicScheduleArr[index].parts];
            var operations = [...this.state.periodicScheduleArr[index].operations];
            
            const newItems = this.state.periodicScheduleArr.map(function (row, rindex) {
            if (rindex !== 0) {
                let p =  parts.map(function(r){
                    return {...r};
                });
                let o =  operations.map(function(r){
                    return {...r};
                });
                return {...row,parts: p ,operations:o}
            }
            else{
                return {...row};   
            }
            })

        
        this.setState({ periodicScheduleArr: newItems, usePrevious:true });
        }
        else{
            this.setState({ usePrevious: false });
        }
    }

	handleSubmit = evt => {
		evt.preventDefault();
			Swal.fire({
				title: 'Are you sure?',
				text: "You want to create this Schedule Maintenance",
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes',
				cancelButtonText: 'No'
			}).then((result) => {
				if (result.value) {
					const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
					const formData = {
                        businessUnit: process.env.REACT_APP_EMD_BU_ID,
                        scheduleType: this.state.scheduleType,
                        fixedSchedule: this.state.fixedSchedule,
                        periodicSchedule: this.state.periodicSchedule,
                        equipment: this.state.equipment,
                        scheduleName: this.state.scheduleName,
                        triggerAt: this.state.triggerAt,
                        triggerBy: this.state.triggerBy,
                        intervalType: this.state.intervalType,
                        periodInterval: this.state.periodInterval,
                        multipliedBy: this.state.multipliedBy,
                        startingIndicator: this.state.startingIndicator,
                        endingMark: this.state.endingMark,
                        triggerType: this.state.triggerType,
                        parts: this.state.parts,
                        operations: this.state.operations,
                        periodicScheduleArr: this.state.periodicScheduleArr,
                    };
					const requestOptions = {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
						body: JSON.stringify(formData)
					};

					var apiEnd = "equipment_schedule_maint/save";

					fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
						.then((resp) => {
							return resp.json()
						})
						.then((resp) => {
							console.log(resp);

							if (resp.success === true) {
								let successMsg = resp.successMessage;
								Swal.fire({
									icon: 'success',
									title: 'Success',
									text: successMsg,
								})

								this.setState(this.baseState);
                                this.props.history.push('/schedule-maintenance-plan-list');
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
		const triggerType = [
			{ label: 'Running Hour', value: 'running_hour' },
			{ label: 'Total Distance', value: 'total_distance' }
		]
        const intervalType = [
            { label: 'Interval', value: 'interval' },
			{ label: 'Multiply', value: 'multiply' }
        ]
		return (
			<>
				<div className="card card-custom">
					<div className="card-header">
						<h3 className="card-title">
							<p className="text-primary">
								Schedule Maintenance Plan Create
							</p>
						</h3>
					</div>

					<form onSubmit={this.handleSubmit}>
						<div className="card-body">
							<div className="ml-12">
                                <div className="form-group row col-lg-12">
                                    <div className="row col-lg-3"></div>
                                    <div className="row col-lg-6" style={{"marginLeft":"30px"}}>
                                        <div className="checkbox-inline">
                                            <label className="checkbox checkbox-lg">
                                            <input type="checkbox" 
                                                        name="fixedSchedule"
                                                        checked={this.state.fixedSchedule}
                                                        onChange={this.handleScheduleType}
                                                    />
                                                <span></span>
                                                Fixed Schedule
                                            </label>
                                            <label className="checkbox checkbox-lg">
                                                <input type="checkbox"name="periodicSchedule"
                                                        checked={this.state.periodicSchedule}
                                                        onChange={this.handleScheduleType}
                                                />
                                                <span></span>
                                                Periodic Schedule
                                            </label>
                                        </div>
                                    </div>
                                </div>
								<div className="form-group row mt-6">
									<label htmlFor="example-text-input" className="col-md-3 col-form-label text-right">Equipment<span className="required text-danger"> *</span></label>
									<div className="col-md-6">
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
									<label htmlFor="example-text-input" className="col-md-3 col-form-label text-right">Trigger By<span className="required text-danger"> *</span></label>
									<div className="col-md-6">
										<select className="form-control form-control-sm" id="triggerBy" name="triggerBy" value={this.state.triggerBy} onChange={this.onChangeTriggerBy} >
											{triggerType.map(function (item, id) {
												return <option key={id} value={item.value}>{item.label}</option>
											})
											}
										</select>
									</div>
								</div>
                                {this.state.scheduleType === "fixed_schedule" && 
                                    <>
                                    <div className="form-group row">
                                    <label htmlFor="triggerAt" className="col-md-3 col-form-label text-right">Trigger At<span className="required text-danger"> *</span></label>
                                        <div className="col-md-3">
                                            <div className="input-group input-group-sm">
                                                <input className="form-control" type="number" name="triggerAt" id="triggerAt" value={this.state.triggerAt} onChange={this.onChangeTriggerAt}/>
                                                <div className="input-group-append"><span className="input-group-text">{this.state.triggerType} </span></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group row">
                                        <label htmlFor="scheduleName" className="col-md-3 col-form-label text-right">Schedule Name</label>
                                        <div className="col-md-6">
                                            <input type="text" name="scheduleName" id="scheduleName" value={this.state.scheduleName} className="form-control form-control-sm" readOnly/>
                                        </div>
                                    </div>
                                    </>
                                }
                                {this.state.scheduleType === "periodic_schedule" && 
                                    <div className="form-group row">
                                        <label htmlFor="example-text-input" className="col-md-3 col-form-label text-right">Interval Type<span className="required text-danger"> *</span></label>
                                        <div className="col-md-6">
                                            <select className="form-control form-control-sm" id="intervalType" name="intervalType" value={this.state.intervalType} onChange={this.onChangeIntervalType} >
                                                {intervalType.map(function (item, id) {
                                                    return <option key={id} value={item.value}>{item.label}</option>
                                                })
                                                }
                                            </select>
                                        </div>
								    </div>
                                }
                                {this.state.scheduleType === "periodic_schedule" && this.state.intervalType === "multiply" && 
                                    <div className="form-group row">
                                        <label htmlFor="multipliedBy" className="col-md-3 col-form-label text-right">Multiplied By <span className="required text-danger"> *</span></label>
                                        <div className="col-md-3">
                                            <div className="input-group input-group-sm">
                                                <input className="form-control"  type="number" name="multipliedBy" id="multipliedBy" value={this.state.multipliedBy} onChange={this.onChangeMultipliedBy}/>
                                                <div className="input-group-append"><span className="input-group-text">{this.state.triggerType} </span></div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {this.state.scheduleType === "periodic_schedule" && this.state.intervalType === "interval" && 

                                    <div className="form-group row">
                                        <label htmlFor="periodInterval" className="col-md-3 col-form-label text-right">Period Interval <span className="required text-danger"> *</span></label>
                                        <div className="col-md-3">
                                            <div className="input-group input-group-sm">
                                                <input className="form-control"  type="number" name="periodInterval" id="periodInterval" value={this.state.periodInterval} onChange={this.onChangePeriodInterval}/>
                                                <div className="input-group-append"><span className="input-group-text">{this.state.triggerType} </span></div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                
                                {this.state.scheduleType === "periodic_schedule" && 
                                    <>
                                    <div className="form-group row">
                                        <label htmlFor="startingIndicator" className="col-md-3 col-form-label text-right">Starting Indicator <span className="required text-danger"> *</span></label>
                                        <div className="col-md-3">
                                            <div className="input-group input-group-sm">
                                                <input className="form-control"  type="number" name="startingIndicator" id="startingIndicator" value={this.state.startingIndicator} onChange={this.onChangeStartingIndicator}/>
                                                <div className="input-group-append"><span className="input-group-text">{this.state.triggerType} </span></div>
                                            </div>
                                        </div>
                                    </div>
                                
                                    <div className="form-group row">
                                        <label htmlFor="endingMark" className="col-md-3 col-form-label text-right">Ending Mark <span className="required text-danger"> *</span></label>
                                        <div className="col-md-3">
                                            <div className="input-group input-group-sm">
                                                <input className="form-control"  type="number" name="endingMark" id="endingMark" value={this.state.endingMark} onChange={this.onChangeEndingMark}/>
                                                <div className="input-group-append"><span className="input-group-text">{this.state.triggerType} </span></div>
                                            </div>
                                        </div>
                                    </div>
                                    </>
                                }
                                
                                {this.state.scheduleType ==="periodic_schedule" && this.state.periodicScheduleArr !== [] &&
                                
                                <ul className="nav nav-tabs nav-tabs-line nav-bold mt-12">
                                    {this.state.periodicScheduleArr.map((item, index) =>
                                        <li key={index} className="nav-item" onClick={() => this.setTab(item.triggerAt)}>
                                            <a style={{'borderBottomWidth':'3px'}} className={`nav-link ${this.state.tab === item.triggerAt && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === `${item.triggerAt}`).toString()} href={() => false}>{`${item.triggerAt} ${this.state.triggerType}`}</a>
                                        </li>
                                    )}
                                </ul>
                                
                                }

                                {
                                this.state.scheduleType ==="periodic_schedule" && this.state.periodicScheduleArr.map((item, index) =>{                                        
                                    return ( this.state.tab === item.triggerAt &&
                                        <>
                                        <div className="ml-6 mt-6">
                                            <Tabs defaultActiveKey="parts" id="uncontrolled-tab-example">
                                                <Tab eventKey="parts" title="Parts">
                                                    <div className="table-responsive-lg">
                                                        <table className="table table-bordered table-hover">
                                                            <thead>
                                                                <tr>
                                                                    <th>SL</th>
                                                                    <th style={{ 'width': '30%' }}>Item</th>
                                                                    <th>Unit</th>
                                                                    <th>Quantity</th>
                                                                    <td>Action</td>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    item.parts.map((j, k) =>
                                                                        <tr key={k}>
                                                                            <td>{k + 1}</td>
                                                                            <td><AsyncSelect
                                                                                key={k}
                                                                                value={j.item}
                                                                                defaultOptions
                                                                                loadOptions={this.fetchItemData}
                                                                                placeholder="Select Item"
                                                                                styles={customStylesSelect}
                                                                                onChange={this.onPartsItemChange(index,k)}
                                                                            />
                                                                            </td>
                                                                            <td>{j.unit}</td>
                                                                            <td><input className="form-control" style={{ 'marginTop': '0px' }} type="number" value={j.qty} onChange={this.onChangeQty(index,k)}  /></td>
                                                                            <td>
                                                                                <div className="row">
                                                                                    {item.parts.length > 1 &&
                                                                                    <div className="col-2">
                                                                                        <button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removePartsItem(index,k)}> <span className="svg-icon svg-icon-md svg-icon-danger">
                                                                                            <SVG src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")} />
                                                                                        </span></button>
                                                                                    </div>
                                                                                    }
                                                                                    <div className="col-lg-10">
                                                                                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => this.addPartsItem(index)}><i className="flaticon2-plus"></i> Add Parts</button>
                                                                                    </div>
                                                                                </div>
                                                                            </td>

                                                                        </tr>

                                                                    )
                                                                }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </Tab>

                                                <Tab eventKey="operations" title="Operations" >
                                                    <div className="table-responsive-lg">
                                                        <table className="table table-bordered table-hover">
                                                            <thead>
                                                                <tr>
                                                                    <th>SL</th>
                                                                    <th>Operation Name</th>
                                                                    <th>Operation Short Desc</th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {
                                                                    item.operations.map((j, k) =>
                                                                        <tr key={k}>
                                                                            <td>{k + 1}</td>
                                                                            <td><input className="form-control" type="text" value={j.operationName} onChange={this.onOperationNameChange(index,k)} /></td>
                                                                            <td><textarea className="form-control" value={j.operationShortDesc} onChange={this.onOperationShortDescChange(index,k)} /></td>
                                                                            <td>
                                                                                <div className="row">
                                                                                    {item.operations.length > 1 &&
                                                                                    <div className="col-2">
                                                                                    <button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removeOperationItem(index,k)}> <span className="svg-icon svg-icon-md svg-icon-danger">
                                                                                            <SVG src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")} />
                                                                                        </span></button>
                                                                                    </div>
                                                                                    }
                                                                                    <div className="col-lg-10">
                                                                                        <button type="button" className="btn btn-outline-primary btn-sm" onClick={() =>this.addOperationItem(index)}><i className="flaticon2-plus"></i> Add Operation</button>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>

                                                                    )
                                                                }
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </Tab>
                                            </Tabs>
                                        </div>
                                        {index === 0 &&
                                            <div className="row col-lg-12" style={{"marginLeft":"10px"}}>
                                                <div className="checkbox-list">
                                                    <label className="checkbox">
                                                    <input type="checkbox" 
                                                                name="usePrevious"
                                                                checked={this.state.usePrevious}
                                                                onChange={this.oneChangeUsePrevious(index)}
                                                            />
                                                        <span></span>
                                                        Use this process for next maintenaces
                                                    </label>
                                                </div>
                                            </div>

                                        }
                                        </>
                                    )}            
                                )}

                                { this.state.scheduleType === "fixed_schedule" &&

                                    <div className="mt-10">
                                    <Tabs defaultActiveKey="parts" id="uncontrolled-tab-example">
                                        <Tab eventKey="parts" title="Parts">
                                            <div className="table-responsive-lg">
                                                <table className="table table-bordered table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>SL</th>
                                                            <th style={{ 'width': '30%' }}>Item</th>
                                                            <th>Unit</th>
                                                            <th>Quantity</th>
                                                            <td>Action</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            this.state.parts.map((item, index) =>
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td><AsyncSelect
                                                                        key={index}
                                                                        value={item.item}
                                                                        defaultOptions
                                                                        loadOptions={this.fetchItemData}
                                                                        placeholder="Select Item"
                                                                        onChange={this.onPartsItemChangeFs(index)}
                                                                        styles={customStylesSelect}
                                                                    />
                                                                    </td>
                                                                    <td>{item.unit}</td>
                                                                    <td><input className="form-control" style={{ 'marginTop': '0px' }} type="text" value={item.qty} onChange={this.onPartsQtyChangeFs(index)} /></td>
                                                                    <td>
                                                                        <div className="row">
                                                                            {this.state.parts.length > 1 && 
                                                                                <div className="col-2">
                                                                                    <button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removePartsItemFs(index)}> <span className="svg-icon svg-icon-md svg-icon-danger">
                                                                                        <SVG src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")} />
                                                                                    </span></button>    
                                                                                </div>
                                                                            }
                                                                            <div className="col-lg-10">
                                                                                <button type="button" className="btn btn-outline-primary btn-sm" onClick={this.addPartsItemFs}><i className="flaticon2-plus"></i> Add Parts</button>
                                                                            </div>
                                                                        </div>
                                                                    </td>

                                                                </tr>

                                                            )
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Tab>

                                        <Tab eventKey="operations" title="Operations" >
                                            <div className="table-responsive-lg">
                                                <table className="table table-bordered table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>SL</th>
                                                            <th>Operation Name</th>
                                                            <th>Operation Short Desc</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            this.state.operations.map((item, index) =>
                                                                <tr key={index}>
                                                                    <td>{index + 1}</td>
                                                                    <td><input className="form-control" type="text" value={item.operationName} onChange={this.onOperationNameChangeFs(index)} /></td>
                                                                    <td><textarea className="form-control" value={item.operationShortDesc} onChange={this.onOperationShortDescChangeFs(index)} /></td>
                                                                    <td>
                                                                        <div className="row">
                                                                            {this.state.operations.length >1 &&
                                                                            <div className="col-2">
                                                                                
                                                                                    <button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removeOperationItemFs(index)}> <span className="svg-icon svg-icon-md svg-icon-danger">
                                                                                        <SVG src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")} />
                                                                                    </span></button> 
                                                                            </div>
                                                                            }
                                                                            <div className="col-lg-10">
                                                                                <button type="button" className="btn btn-outline-primary btn-sm" onClick={this.addOperationItemFs}><i className="flaticon2-plus"></i> Add Operation</button>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>

                                                            )
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Tab>
                                    </Tabs>
                                </div>
                                }
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

export default ScheduleMaintenancePlanCreate;
import React, { Component } from 'react';
import SVG from "react-inlinesvg";
import Select from 'react-select';
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

class EmoParking extends Component {
    state = {
        sendingBu: "",
        emoDate: "",
        receivingBu: "",
        items: [{ equipment: "", itemName: "", model: "", parkingDate:"",receiveDate:"",location:"",remarks:""}],
        remarks: "",
        allBusinessUnits: [],
        receivingBusinessUnit: [],
        errors: {
            emoDate: "",
        },
        touched: {
            emoDate: false,
        }
    }


    componentDidMount() {
        const { allBusinessUnits, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllBu();
        this.getAllReceivingBu();
    }

    handleInputOnChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
        let errors = this.state.errors;
        let touched = this.state.touched;

        if (evt.target.name === "emoDate") {
            touched.emoDate = true;
            if (evt.target.value === "") {
                errors.emoDate = "Emo Date is required!";
            }
            else {
                errors.emoDate = "";
            }
        }
        this.setState({ errors, touched: touched });
    };

    handleSendingBuChange = businessUnit => {
        this.setState({ sendingBu: businessUnit }, );
    }

    handleReceivingBuChange = businessUnit => {
        this.setState({ receivingBu: businessUnit }, );
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

    getAllReceivingBu() {
        fetch(process.env.REACT_APP_API_URL + "get_business_units",     
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            let tempResp = resp.data.map(function (element) {
                return { ...element, label: element.projectName, value: element.projectId }
            });
            this.setState({ receivingBusinessUnit: tempResp});
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }

    getEquipment = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        } else {
            const projectId = this.state.sendingBu !== "" ? this.state.sendingBu.projectId : "";
            var url = process.env.REACT_APP_API_URL + "emo_parking/released_equipment_search/" + projectId + "?q=" + inputValue;
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
    }

    getProjectLocation = (inputValue, callback) => {
		if (!inputValue) {
			callback([]);

		} else {
			var projectId = this.state.receivingBu !== "" ?  this.state.receivingBu.projectId: "";
			var api = process.env.REACT_APP_API_URL + "project_location/"+ projectId +"?q=" + inputValue;
			setTimeout(() => {
				fetch(api, getGetRequestOptions())
				.then((resp) => {
					return resp.json()
				})
				.then((resp) => {
					const tempArray = resp.data.map(function (element) {
						return {
							...element, id: element.locationId, label: `${element.locationName} ( ${element.projectName} )`, value: element.locationId
						}
					});
	
					callback(tempArray);
				})
				.catch((error) => {
					console.log(error, "catch the hoop")
				});
			});
		}
	}

    onEquipmentChange = index => item => {
        const newItems = this.state.items.map(function (row, rindex) {
            if (index !== rindex) return row;
            return { ...row, equipment: item, itemName: `${item.equipmentName}  (${item.equipmentCode})`, model: item.model, parkingDate:item.parkingDate}
        });
        this.setState({ items: newItems });
    }

    onChangeParkingDate = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.parkingDate = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

    onChangeReceiveDate = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.receiveDate = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

    
	onProjectLocationChange = index => item => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index !== rindex) return row;
			return { ...row, location: item }
		})

		this.setState({ items: newItems });
	}

    onChangeRemarks = index => evt => {
		const newItems = this.state.items.map(function (row, rindex) {
			if (index === rindex) {
				row.remarks = evt.target.value;
			}
			return row;
		})
		this.setState({ items: newItems });
	}

    addItem = () => {
        this.setState({
            items: this.state.items.concat([{ equipment: "", itemName: "", model: "", parkingDate:"",receiveDate:"",location:"",remarks:"" }])
        });
    }

    removeItem = (index) => () => {
        this.setState({
            items: this.state.items.filter((row, rindex) => index !== rindex)
        });
    }

    validateForm = () => {
        let errors = this.state.errors;
        let touched = this.state.touched;
        for (var input in errors) {

            touched[input] = true;

            if (input === "emoDate") {
                if (this.state.emoDate === "") {
                    errors.emoDate = "Emo Date is required!";
                }
                else {
                    errors.emoDate = "";
                }
            }
        }
        this.setState({ errors, touched: touched });

        if (this.state.errors.emoDate !== "") {
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
                text: "You want to create Parking Equipment Movement Order!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        sendingBu: this.state.sendingBu,
                        emoDate: this.state.emoDate,
                        receivingBu: this.state.receivingBu,
                        items: this.state.items,
                        remarks: this.state.remarks,
                    };
                    
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "emo_parking/save_emo";

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {
                                let successMsg = [`EMO NO# ${resp.data.emoNo}`];
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: successMsg,
                                })

                                this.setState(this.baseState);
                                this.props.history.push(`/emo-details/${resp.data.id}`);
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
        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                                Parking Emo Create
                            </p>
                        </h3>
                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Releasing Business Unit<span className="required text-danger">*</span></label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.sendingBu}
                                            onChange={this.handleSendingBuChange}
                                            options={this.state.allBusinessUnits}
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="example-text-input" className="col-lg-2 col-form-label">Receiving Business Unit<span className="required text-danger">*</span></label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.receivingBu}
                                            onChange={this.handleReceivingBuChange}
                                            options={this.state.receivingBusinessUnit}
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label htmlFor="emoDate" className="col-lg-2 col-form-label">EMO Date<span className="required text-danger"> *</span></label>
                                    <div className="col-lg-6">
                                        <input type="date" name="emoDate" id="emoDate" value={this.state.emoDate} onChange={this.handleInputOnChange} className={`form-control form-control-md ${touched.emoDate === true ? (errors.emoDate === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                        <div className="invalid-feedback">{errors.emoDate}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5">
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                        <thead>
                                            <tr>
                                                <th>Sl. No</th>
                                                <th>Equipment Code</th>
                                                <th>Equipment Name</th>
                                                <th>Model</th>
                                                <th>Parking Date</th>
                                                <th>Receive Date</th>
                                                <th>Location</th>
                                                <th>Remarks</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.items.map((item, index) =>
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td style={{minWidth:"250px"}}>
                                                            <AsyncSelect
                                                                key={index}
                                                                value={item.equipment}
                                                                defaultOptions
                                                                loadOptions={this.getEquipment}
                                                                placeholder="Select Equipment"
                                                                onChange={this.onEquipmentChange(index)}
                                                            />
                                                        </td>
                                                        <td>
                                                            {item.itemName}
                                                        </td>
                                                        <td>
                                                            {item.model}
                                                        </td>
                                                        <td>
                                                            {item.parkingDate}
                                                        </td>
                                                        <td>
                                                            <div className="form-group row">
																<div className="col-lg-12">
																	<input className="form-control" type="date" name="receiveDate" id="receiveDate" value={item.receiveDate} onChange={this.onChangeReceiveDate(index)} />
																</div>
															</div>
                                                        </td>
                                                        <td style={{minWidth:"250px"}}>
                                                            <AsyncSelect
                                                                value={item.location}
                                                                defaultOptions
                                                                loadOptions={this.getProjectLocation}
                                                                placeholder="Select Location"
                                                                onChange={this.onProjectLocationChange(index)}
                                                                styles={customStylesSelect}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className="col-lg-12">
																<textarea className="form-control" name="remarks" id="remarks" value={item.remarks} onChange={this.onChangeRemarks(index)} style={{width:"auto"}}/>
															</div>
                                                        </td>
                                                        <td>
                                                            <div className="row">
                                                                <div className="col-2">
                                                                    {this.state.items.length > 1 ? <button type="button" className="btn btn-icon btn-light btn-hover-danger btn-sm" onClick={this.removeItem(index)}> <span className="svg-icon svg-icon-md svg-icon-danger">
                                                                        <SVG src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")} />
                                                                    </span></button> : ''}
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
                                                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={this.addItem}>Add New</button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="ml-12 mt-5">
                                <div className="form-group row">
                                    <label htmlFor="remarks" className="col-lg-2 col-form-label">Remarks</label>
                                    <div className="col-lg-6">
                                        <textarea className="form-control" name="remarks" id="remarks" value={this.state.remarks} onChange={this.handleInputOnChange} />
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

export default EmoParking;
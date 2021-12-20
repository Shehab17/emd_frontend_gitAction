import React, { Component } from 'react';
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

class EquipmentAssign extends Component {
	state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
		idUsers: "",
		user: "",
        items: [{ equipment: "", equipmentCode: "", model: "" }]
	}

	componentDidMount() {
		const { ...baseState } = this.state;
		this.baseState = baseState;
	}

	getUser = (inputValue, callback) => {

		if (!inputValue) {
			callback([]);

		}
		else {
			var url = process.env.REACT_APP_API_URL + "user_search?q=" + inputValue;
			setTimeout(() => {
				fetch(url,  
                getGetRequestOptions())
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    const tempArray = resp.data.map(function (element) {
                        element.label = `${element.fullName} (${element.email})`;
                        element.value = element.idUsers;
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

    onEquipmentChange = index => item => {
        const newItems = this.state.items.map(function (row, rindex) {
            if (index !== rindex) return row;
            return { ...row, equipment: item, equipmentCode: `(${item.equipmentCode})`, model: item.model, capCode: item.capCode}
        });
        this.setState({ items: newItems });
    }

    addItem = () => {
        this.setState({
            items: this.state.items.concat([{ equipment: "", equipmentCode: "", model: "", capCode: "" }])
        });
    }

    removeItem = (index) => () => {
        this.setState({
            items: this.state.items.filter((row, rindex) => index !== rindex)
        });
    }

	handleUserChange = user => {
		this.setState({ user: user, idUsers: user.idUsers });
        //this.getUserEquipment(user.idUsers )
	}

    getUserEquipment(idUsers) {
		fetch(process.env.REACT_APP_API_URL + "equipment/user_assigned_equipment/" + idUsers, getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            
            this.setState({ items: [{ equipment: "", equipmentCode: "", model: "" }]});

            if(resp.length > 0){
                const newItems = resp.map(function (row) {
                    return { ...row, equipment: {...row, label: `${row.equipmentName} (${row.equipmentCode})`,value:row.equipmentId}}
                });
                this.setState({ items: newItems });
           }

        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

	}


    handleSubmit = evt => {
        evt.preventDefault();
        const isValid = true
        if (isValid) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You want to save equpment assignment",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        businessUnit: process.env.REACT_APP_EMD_BU_ID,
                        idUsers:this.state.idUsers,
                        user: this.state.user,
                        items: this.state.items,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "equipment/save_equipment_assign";

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
                               
                            }
                            else {
                                //var errorsMessage = "";
                                var errorsMessage = [];

                                if (resp.errorMessage !== undefined && typeof resp.errorMessage === 'object') {
                                    var errorsObj = resp.errorMessage;
                                    Object.keys(errorsObj).forEach(function (value) {
                                        errorsObj[value].forEach(function (v) {
                                            //errorsMessage.push(v)
                                            errorsMessage += '<div>' + v + '</div>';
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
                                    html: errorsMessage
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

		return (
			<>
				<div className="card card-custom">
					<div className="card-header">
						<h3 className="card-title">
							<p className="text-primary">
								Equipment Assign
                            </p>
						</h3>
					</div>

					<form onSubmit={this.handleSubmit}>
						<div className="card-body">
                        <div className="ml-12">
							<div className="form-group row">
                            <label htmlFor="" className="col-lg-2 col-form-label">User</label>
								<div className="col-lg-6">
									<AsyncSelect
										value={this.state.user}
										defaultOptions
										loadOptions={this.getUser}
										placeholder="Select User"
										onChange={this.handleUserChange}
										styles={customStylesSelect}
									/>
								</div>
							</div>
                            {this.state.user.length !== 0 &&
                               
								<div className="form-group row">
                                    <div className="col-lg-2">&nbsp;</div>
									<div className="col-lg-6">
                                    <div>
										<label className="col-lg-12 ml-5" >
											<span className="svg-icon svg-icon-primary menu-icon">
												<SVG src={toAbsoluteUrl("/media/svg/icons/General/User.svg")} /> User : {this.state.user.fullName}
											</span>
										</label>
									</div>
									<div>
										<label className="col-lg-12 ml-5" >
											<span className="svg-icon svg-icon-primary menu-icon">
												<SVG src={toAbsoluteUrl("/media/svg/icons/Clothes/Briefcase.svg")} /> Designation : {this.state.user.designation}
											</span>
										</label>
									</div>
									<div>
										<label className="col-lg-12 ml-5" >
											<span className="svg-icon svg-icon-primary menu-icon">
												<SVG src={toAbsoluteUrl("/media/svg/icons/Devices/Phone.svg")} /> Phone : {this.state.user.phoneNumber}
											</span>
										</label>
									</div>
									<div>
										<label className="col-lg-12 ml-5" >
											<span className="svg-icon svg-icon-primary menu-icon">
												<SVG src={toAbsoluteUrl("/media/svg/icons/Communication/Mail.svg")} /> Email : {this.state.user.email}
											</span>
										</label>
									</div>
                                  </div>  
								</div>
							}
							
                            </div>
                           
							<div className="mt-5">
                                <div className="table-responsive-lg">
                                    <table className="table table-bordered table-hover">
                                        <thead>
                                            <tr>
                                                <th>Sl. No</th>
                                                <th>Equipment</th>
                                                <th>Equipment Code</th>
                                                <th>Model</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.items.map((item, index) =>
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td style={{ width: '25%' }}>
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
                                                            {item.equipmentCode}
                                                        </td>
                                                        <td>
                                                            {item.model}
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
                                                <td colSpan="8">
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

export default EquipmentAssign;
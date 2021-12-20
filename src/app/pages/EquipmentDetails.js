import axios from 'axios';
import React, { Component } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";

class EquipmentDetails extends Component {
	state = {
		tab: "equipmentDetails",
		idEquipment: "",
		equipmentDetails: [],
		selectedFile: null,
        file: [],
		selectedImage: null,
		image:[],
		imageTitle:"",
		isMain: "0"
	}

	componentDidMount() {
		const {
			params: { id }
		} = this.props.match;

		this.setState({ idEquipment: this.props.match.params.id });
		this.getEquipmentDetails(id);
		this.getAllFiles("Equipment_Details", id);
		this.getAllImages(id);
	}

	getEquipmentDetails(idEquipment) {
		fetch(process.env.REACT_APP_API_URL + "equipment/equipment_details/" + idEquipment,
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			this.setState({ equipmentDetails: resp ,selectedFile: null});
		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});
	}

	setTab = (tabName) => {
		this.setState({ tab: tabName });
	}

	getAllFiles(refType, refId) {
        fetch(process.env.REACT_APP_API_URL + "emd/get_all_files/" + refType + "/" + refId,
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			this.setState({ file: resp });

		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});
    }

	getAllImages(equipmentId) {
        fetch(process.env.REACT_APP_API_URL + "emd/get_all_asset_images/"+ equipmentId,
		getGetRequestOptions())
		.then((resp) => {
			return resp.json()
		})
		.then((resp) => {
			this.setState({ image: resp });

		})
		.catch((error) => {
			console.log(error, "catch the hoop")
		});
    }

	handleInputOnChange = evt => {
		this.setState({ [evt.target.name]: evt.target.value });
	};

	onImageSetMainChange = evt =>{
		if(this.state.isMain === '1'){
			this.setState({isMain:'0' });
		}
		else{
			this.setState({ isMain: '1' });
		}
	}
	onFileChange = event => {
        this.setState({ selectedFile: event.target.files[0] });

    };

    // On file upload (click the upload button) 
    onFileUpload = evt => {

        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to upload this file',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
				const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                const formData = new FormData();

                formData.append(
                    "myFile",
                    this.state.selectedFile,
                    this.state.selectedFile.name,
                );
                formData.append("refType", "Equipment_Details");
                formData.append("refId", this.state.idEquipment);
                var authOptions = {
                    method: 'post',
					headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + jwt().token },
                    url: process.env.REACT_APP_API_URL + "emd/file_upload",
                    data: formData,

                };
                axios(authOptions)
				.then(response => {
					console.log(response);
					if (response.data.success === true) {

						Swal.fire({
							icon: 'success',
							title: 'Success',
							text: 'File uploaded successfully',
						})

						this.setState({ selectedFile: null });
						this.getAllFiles("Equipment_Details", this.state.idEquipment);
					}
					else {
						//var errorsMessage = "";
						var errorsMessage = [];

						if (response.data.errorMessage !== undefined && typeof response.data.errorMessage === 'object') {
							var errorsObj = response.data.errorMessage;
							Object.keys(errorsObj).forEach(function (value) {
								errorsObj[value].forEach(function (v) {
									errorsMessage.push(v)
								});

							});

						} else if (response.data.errorMessage !== undefined && (typeof response.data.errorMessage === 'string' || response.data.errorMessage instanceof String)) {

							errorsMessage.push(response.data.errorMessage);
						} else {

							errorsMessage.push("Something went wrong");
						}
						Swal.fire({
							icon: 'error',
							title: response.heading,
							text: errorsMessage,
						})

					}
				})
				.catch((error) => {
					console.log(error, "catch the hoop");
				})
            }
        })
    }

    fileData = () => {

        if (this.state.selectedFile) {

            return (
                <>
                    <h3>File Details:</h3>
                    <p>File Name: {this.state.selectedFile.name}</p>
                    <p>File Type: {this.state.selectedFile.type}</p>
                </>
            );
        }
    };

    removeFile = fileId => evt => {
        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this file',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
				const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                const { ...formData } = this.state;
                const requestOptions = {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' ,'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(formData)
                };

                fetch(process.env.REACT_APP_API_URL + "emd/delete_file/" + fileId, requestOptions)
                    .then((resp) => {
                        return resp.json()
                    })
                    .then((resp) => {
                        console.log(resp);

                        if (resp.success === true) {

                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'File deleted successfully',
                            })
                            this.getAllFiles("Equipment_Details", this.state.idEquipment);
                        }
                        else {
                            //var errorsMessage = "";
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

	onImageChange = event => {
        this.setState({ selectedImage: event.target.files[0] });

    };
	 // On Image upload (click the upload button) 
	 onImageUpload = evt => {

        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to upload this image',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
				const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                const formData = new FormData();

                formData.append(
                    "myFile",
                    this.state.selectedImage,
                    this.state.selectedImage.name,
                );
				formData.append("refType", "Equipment_Image");
                formData.append("equipmentId", this.state.idEquipment);
				formData.append("capDetailsId", this.state.equipmentDetails.cap_details_id);
				formData.append("isMain", this.state.isMain);
				formData.append("title", this.state.imageTitle);
                var authOptions = {
                    method: 'post',
					headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + jwt().token },
                    url: process.env.REACT_APP_API_URL + "emd/image_upload",
                    data: formData,

                };
                axios(authOptions)
				.then(response => {
					console.log(response);
					if (response.data.success === true) {

						Swal.fire({
							icon: 'success',
							title: 'Success',
							text: 'Image uploaded successfully',
						})

						this.setState({ selectedImage: null,imageTitle:"",isMain: "0" });
						this.getAllImages(this.state.idEquipment);
					}
					else {
						//var errorsMessage = "";
						var errorsMessage = [];

						if (response.data.errorMessage !== undefined && typeof response.data.errorMessage === 'object') {
							var errorsObj = response.data.errorMessage;
							Object.keys(errorsObj).forEach(function (value) {
								errorsObj[value].forEach(function (v) {
									errorsMessage.push(v)
								});

							});

						} else if (response.data.errorMessage !== undefined && (typeof response.data.errorMessage === 'string' || response.data.errorMessage instanceof String)) {

							errorsMessage.push(response.data.errorMessage);
						} else {

							errorsMessage.push("Something went wrong");
						}
						Swal.fire({
							icon: 'error',
							title: response.heading,
							text: errorsMessage,
						})

					}
				})
				.catch((error) => {
					console.log(error, "catch the hoop");
				})
            }
        })
    }

    imageData = () => {

        if (this.state.selectedImage) {
            return (
                <>
                    <h3>Image Details:</h3>
                    <p>Image Name: {this.state.selectedImage.name}</p>
                    <p>Image Type: {this.state.selectedImage.type}</p>
                </>
            );
        }
    };

    removeImage = assetImageId => evt => {
        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this image',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
				const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                const { ...formData } = this.state;
                const requestOptions = {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' ,'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(formData)
                };

                fetch(process.env.REACT_APP_API_URL + "emd/delete_image/" + assetImageId, requestOptions)
                    .then((resp) => {
                        return resp.json()
                    })
                    .then((resp) => {
                        console.log(resp);

                        if (resp.success === true) {

                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'Image deleted successfully',
                            })
                            this.getAllImages(this.state.idEquipment);
                        }
                        else {
                            //var errorsMessage = "";
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
		//const filehost = process.env.REACT_APP_API_URL.split("api/")[0];
		const filehost = process.env.REACT_APP_AWS_URL+'emd/';
        const filePath = "Equipment_Details";
		const imagePath = process.env.REACT_APP_AWS_URL+'asset/';
		return (
			<>
				<div className="card card-custom">
					<div className="card-header">
						<div className="card-title">
							<h3 className="card-label">Equipment Details #{this.state.equipmentDetails.equipment_name}</h3>
						</div>
					</div>
					<div className="ml-12">
						<ul className="nav nav-tabs nav-tabs-line">
							<li className="nav-item" onClick={() => this.setTab("equipmentDetails")}>
								<a className={`nav-link ${this.state.tab === "equipmentDetails" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "equipmentDetails").toString()} href={() => false}>Equipment Info</a>
							</li>
							<li className="nav-item" onClick={() => this.setTab("machineDetails")}>
								<a className={`nav-link ${this.state.tab === "machineDetails" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "machineDetails").toString()} href={() => false}>Machine Details</a>
							</li>
							<li className="nav-item" onClick={() => this.setTab("engineDetails")}>
								<a className={`nav-link ${this.state.tab === "engineDetails" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "engineDetails").toString()} href={() => false}>Engine Details</a>
							</li>
							<li className="nav-item" onClick={() => this.setTab("warranty")}>
								<a className={`nav-link ${this.state.tab === "warranty" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "warranty").toString()} href={() => false}>Warranty</a>
							</li>
							<li className="nav-item" onClick={() => this.setTab("manufacturer")}>
								<a className={`nav-link ${this.state.tab === "manufacturer" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "manufacturer").toString()} href={() => false}>Manufacturer</a>
							</li>
							<li className="nav-item" onClick={() => this.setTab("fuel")}>
								<a className={`nav-link ${this.state.tab === "fuel" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "fuel").toString()} href={() => false}>Fuel</a>
							</li>
							<li className="nav-item" onClick={() => this.setTab("emiInfo")}>
								<a className={`nav-link ${this.state.tab === "emiInfo" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "timeline").toString()} href={() => false}>Emi Info</a>
							</li>
							<li className="nav-item" onClick={() => this.setTab("timeline")}>
								<a className={`nav-link ${this.state.tab === "timeline" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "timeline").toString()} href={() => false}>Timeline</a>
							</li>
							<li className="nav-item" onClick={() => this.setTab("fileUpload")}>
								<a className={`nav-link ${this.state.tab === "fileUpload" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "fileUpload").toString()} href={() => false}>File Upload</a>
							</li>
							<li className="nav-item" onClick={() => this.setTab("imageUpload")}>
								<a className={`nav-link ${this.state.tab === "imageUpload" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "imageUpload").toString()} href={() => false}>Image Upload</a>
							</li>
						</ul>

						<div className="col-8 mt-5">
							{this.state.tab === "equipmentDetails" &&
								<table className="table table-bordered table-hover">
									<tbody>
										<tr>
											<th>Equipment Name</th>
											<td>{this.state.equipmentDetails.equipment_name}</td>
										</tr>
										<tr>
											<th>Equipment Code</th>
											<td>{this.state.equipmentDetails.equipment_code}</td>
										</tr>
										<tr>
											<th>Business Unit</th>
											<td>{this.state.equipmentDetails.businessUnit}</td>
										</tr>
										<tr>
											<th>Fixed Asset Code</th>
											<td>{this.state.equipmentDetails.cap_code}</td>
										</tr>
										<tr>
											<th>Country Name</th>
											<td>{this.state.equipmentDetails.countryName}</td>
										</tr>
										<tr>
											<th>Capacity</th>
											<td>{this.state.equipmentDetails.capacity}</td>
										</tr>
										<tr>
											<th>Specs</th>
											<td>{this.state.equipmentDetails.specs}</td>
										</tr>
										<tr>
											<th>Year of Manufacture</th>
											<td>{this.state.equipmentDetails.year_of_manufacture}</td>
										</tr>
										<tr>
											<th>Purchase Date</th>
											<td>{this.state.equipmentDetails.purchase_date}</td>
										</tr>
										<tr>
											<th>Remarks</th>
											<td>{this.state.equipmentDetails.remarks}</td>
										</tr>
									</tbody>
								</table>
							}
							{this.state.tab === "emiInfo" &&
								<table className="table table-bordered table-hover">
									<tbody>
										<tr>
											<th>Emi Amount</th>
											<td>{this.state.equipmentDetails.emiAmount}</td>
										</tr>
										<tr>
											<th>Interest Period</th>
											<td>{this.state.equipmentDetails.interestPeriod}</td>
										</tr>
										<tr>
											<th>Interest Rate</th>
											<td>{this.state.equipmentDetails.interestRate}</td>
										</tr>
									</tbody>
								</table>
							}
							{this.state.tab === "machineDetails" &&
								<table className="table table-bordered table-hover">
									<tbody>
										<tr>
											<th>Make</th>
											<td>{this.state.equipmentDetails.makeName}</td>
										</tr>
										<tr>
											<th>Model</th>
											<td>{this.state.equipmentDetails.machine_model}</td>
										</tr>
										<tr>
											<th>Chassis No</th>
											<td>{this.state.equipmentDetails.chassis_number}</td>
										</tr>
										<tr>
											<th>Serial No</th>
											<td>{this.state.equipmentDetails.machine_serial_no}</td>
										</tr>
									</tbody>
								</table>
							}
							{this.state.tab === "engineDetails" &&
								<table className="table table-bordered table-hover">
									<tbody>
										<tr>
											<th>Model</th>
											<td>{this.state.equipmentDetails.model}</td>
										</tr>
										<tr>
											<th>Serial No</th>
											<td>{this.state.equipmentDetails.serial_no}</td>
										</tr>
										<tr>
											<th>HP/KW</th>
											<td>{this.state.equipmentDetails.hp_kw}</td>
										</tr>
									</tbody>
								</table>
							}
							{this.state.tab === "warranty" &&
								<table className="table table-bordered table-hover">
									<tbody>
										<tr>
											<th>Warranty Hour</th>
											<td>{this.state.equipmentDetails.warranty_hour}</td>
										</tr>
										<tr>
											<th>Warranty Start Date</th>
											<td>{this.state.equipmentDetails.warranty_start_date}</td>
										</tr>
										<tr>
											<th>Warranty End Date</th>
											<td>{this.state.equipmentDetails.warranty_end_date}</td>
										</tr>
									</tbody>
								</table>
							}
							{this.state.tab === "manufacturer" &&
								<table className="table table-bordered table-hover">
									<tbody>
										<tr>
											<th>Manufacturer Name</th>
											<td>{this.state.equipmentDetails.manufacturerName}</td>
										</tr>
										<tr>
											<th>Address</th>
											<td>{this.state.equipmentDetails.manufacturer_address}</td>
										</tr>
										<tr>
											<th>Contact No</th>
											<td>{this.state.equipmentDetails.manufacturer_contact_no}</td>
										</tr>
										<tr>
											<th>Email</th>
											<td>{this.state.equipmentDetails.manufacturer_email}</td>
										</tr>
									</tbody>
								</table>
							}
							{this.state.tab === "fuel" &&
								<table className="table table-bordered table-hover">
									<tbody>
										<tr>
											<th>Fuel Type</th>
											<td>{this.state.equipmentDetails.fuelType}</td>
										</tr>
										<tr>
											<th>Tank Capacity</th>
											<td>{this.state.equipmentDetails.tankCapacity}</td>
										</tr>
										<tr>
											<th>Standard Fuel Consumption</th>
											<td>{this.state.equipmentDetails.standardFuelConsumption}</td>
										</tr>
									</tbody>
								</table>
							}
						</div>
						<div className="col-12 mt-5">
							{this.state.tab === "timeline" &&
								<div className="timeline timeline-3">

									<div className="timeline-items" style={{ "height": "600px", "overflow": "auto" }}>
										{
											this.state.equipmentDetails.timeline_history.map((item, index) =>
												<div className="timeline-item" key={index}>
													<div className="timeline-media">
														{item.type === "emo" && <i className="flaticon2-plus text-primary "></i>}
														{item.type === "receive_emo" && <i className="flaticon2-gift text-warning "></i>}
														{item.type === "deny_emo" && <i className="flaticon2-delete text-danger "></i>}
														{item.type === "equipment_release" && <i className="flaticon2-paper-plane text-success "></i>}
														{item.type === "parking_emo" && <i className="flaticon2-map text-info"></i>}
													</div>
													<div className="timeline-content">
														<div className="d-flex align-items-center justify-content-between mb-3">
															<div className="mr-4">
																<span className="mr-3 font-weight-bolder" style={{ "fontSize": "14px", "color": "#e35b5a" }}>
																	Equipment {(item.type === "emo" || item.type === "parking_emo") && <span>Movement Order</span>} has been
																	{item.type === "emo" && item.status === "created" && " Created"}
																	{item.type === "receive_emo" && item.status === "created" && " Received"}
																	{item.type === "deny_emo" && item.status === "created" && " Denied"}
																	{item.type === "equipment_release" && item.status === "created" && " Released"}
																	{item.type === "parking_emo" && " Created"}
																	<span className="text-muted ml-2"> at {item.create_date}</span>
																</span>
																<p className="mr-3 mt-3"> Ref No : <span style={{color:"#1a34bf"}}><b>{item.ref_no}</b></span></p>
																<p className="mr-3">
																	{item.type === "emo" && <span> Project Name : <b style={{color:"#2dc51b"}}> {item.sendingBusinessUnit}</b></span>}
																	{item.type === "receive_emo" && item.emoType === "in-house" && <span> Project Name : <b style={{color:"#2dc51b"}}>{item.receivingBusinessUnit}</b></span>}
																	{item.type === "receive_emo" && item.emoType === "third-party" && <span> Customer Name : <b style={{color:"#2dc51b"}}>{item.customerName}</b></span>}
																	{item.type === "deny_emo" && <span> Project Name : <b style={{color:"#2dc51b"}}>{item.receivingBusinessUnit}</b></span>}
																	{item.type === "equipment_release" && item.emoType === "in-house" && <span> Project Name : <b style={{color:"#2dc51b"}}>{item.receivingBusinessUnit}</b></span>}
																	{item.type === "equipment_release" && item.emoType === "third-party" && <span> Customer Name : <b style={{color:"#2dc51b"}}>{item.customerName}</b></span>}
																	{item.type === "parking_emo" && item.emoType === "parking" && <><span> Sending Business Unit : <b style={{color:"#2dc51b"}}>{item.sendingBusinessUnit}</b></span><br></br></>}
																</p>
																{item.type === "parking_emo" && item.emoType === "parking" && <p className="mr-3"><span> Receiving Business Unit : <b style= {{color: "#8950FC"}}>{item.receivingBusinessUnit}</b></span></p>}
																{item.location_id != null && <p className="mr-3"> Location: <b style={{color:"#ff001b"}}>{item.location}</b></p>}
																<p className="mr-3">
																	{item.type === "emo" && item.status === "created" && <span> Created By : <a href="/#"><b>{item.fullName}</b></a></span>}
																	{item.type === "receive_emo" && item.status === "created" && <span> Received By : <a href="/#"><b>{item.fullName}</b></a></span>}
																	{item.type === "deny_emo" && item.status === "created" && <span> Denied By : <a href="/#"><b> {item.fullName}</b></a></span>}
																	{item.type === "equipment_release" && item.status === "created" && <span> Released By :  <a href="/#"><b>{item.fullName}</b></a></span>}
																	{item.type === "parking_emo" && item.status === "created" && <span> Parked By :  <a href="/#"><b>{item.fullName}</b></a></span>}
																</p>

															</div>
														</div>
													</div>
												</div>
											)
										}
									</div>
								</div>
							}
						</div>
						<div className="col-12 mt-5">
							{this.state.tab === "imageUpload" &&
							<>
								<div className="row col-lg-12">
									<label className="col-lg-2 col-form-label" ></label>
									<div className="checkbox-list" style={{"paddingLeft":"10px"}} >
										<label className="checkbox checkbox-lg">
										<input type="checkbox" 
													name="isMain"
													checked={this.state.isMain === '1'}
													onChange={this.onImageSetMainChange}
												/>
											<span></span>
											Set as Main Image
										</label>
									</div>
								</div>

								<div className="form-group row mt-5">
									<label htmlFor="imageTitle" className="col-lg-2 col-form-label" >Image Title</label>
									<div className="col-lg-6">
										<div className="input-group input-group-sm">
											<input className="form-control form-control-sm" type="text" name="imageTitle" id="imageTitle" value={this.state.imageTitle} onChange={this.handleInputOnChange} />
										</div>
									</div>
								</div>
								<div className="form-group row">
									<label className="col-lg-2 col-form-label">Upload Image:</label>
									<div className="col-lg-4  col-form-label">
										<input type="file" onChange={this.onImageChange}
										/>
									</div>

								</div>
								<div className="mt-2 mr-2">
									{this.imageData()}
								</div>
								<button type="button" className="btn btn-outline-primary btn-sm btn-square mt-1 mr-2" onClick={this.onImageUpload}> Upload</button>
								<table className="table table-bordered table-hover mt-5">
									<thead>
										<tr>
											<td>Sl</td>
											<td>Image</td>
											<td>File Name</td>
											<td>Title</td>
											<td>Size</td>
											<td>Main Image</td>
											<td style={{ "textAlign": "center" }}>Action</td>
										</tr>
									</thead>
									{this.state.image.length > 0 ?
										<tbody>
											{this.state.image.map((item, index) =>
												<tr key={index}>
													<td>{index + 1}</td>
													<td>
														<img src={`${imagePath}${this.state.equipmentDetails.cap_details_id}/thumb/${item.thumbnailName}`} alt="" style={{"width":"200px"}} />
													</td>
													<td>{item.originalFileName}</td>
													<td>{item.title}</td>
													<td>{item.fileSize}</td>
													<td>{item.isMain}</td>
													<td style={{ "textAlign": "center" }}>
														<a href={`${imagePath}${this.state.equipmentDetails.cap_details_id}/${item.fileName}`} target="_blank" rel="noopener noreferrer"  alt="" className="btn btn-outline-primary mr-3"><i className="flaticon2-download-1"></i> Download</a>
														<button type="button" className="btn btn-outline-danger mr-3" onClick={this.removeImage(item.assetImageId)}> <i className="flaticon-delete"></i>Delete</button>
													</td>
												</tr>
											)}
										</tbody>
										:
										<tbody>
											<tr>
												<td colSpan="4"><p style={{ "textAlign": "center" }}><strong>No File Found</strong></p></td>
											</tr>
										</tbody>
									}
								</table>
								</>
							}
							{this.state.tab === "fileUpload" &&
							<>
								<div className="form-group row">
									<label className="col-lg-2 col-form-label">Upload File:</label>
									<div className="col-lg-4  col-form-label">
										<input type="file" onChange={this.onFileChange}
										/>
									</div>

								</div>
								<div className="mt-2 mr-2">
									{this.fileData()}
								</div>
								<button type="button" className="btn btn-outline-primary btn-sm btn-square mt-1 mr-2" onClick={this.onFileUpload}> Upload</button>
								<table className="table table-bordered table-hover mt-5">
									<thead>
										<tr>
											<td>Sl</td>
											<td>Name</td>
											<td>Size</td>
											<td style={{ "textAlign": "center" }}>Action</td>
										</tr>
									</thead>
									{this.state.file.length > 0 ?
										<tbody>
											{this.state.file.map((item, index) =>
												<tr key={index}>
													<td>{index + 1}</td>
													<td>{item.originalFileName}</td>
													<td>{item.fileSize}</td>
													<td style={{ "textAlign": "center" }}>
														<a href={`${filehost}uploads/${filePath}/${this.state.idEquipment}/${item.fileName}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary mr-3"><i className="flaticon2-download-1"></i> Download</a>
														<button type="button" className="btn btn-outline-danger mr-3" onClick={this.removeFile(item.fileId)}> <i className="flaticon-delete"></i>Delete</button>
													</td>
												</tr>
											)}
										</tbody>
										:
										<tbody>
											<tr>
												<td colSpan="4"><p style={{ "textAlign": "center" }}><strong>No File Found</strong></p></td>
											</tr>
										</tbody>
									}
								</table>
								</>
							}
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

export default EquipmentDetails;
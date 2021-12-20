import React, { Component } from 'react';
import AsyncSelect from 'react-select/async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";
import Manufecture from "../components/Manufacture";

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

class EquipmentEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            idEquipment: "",
            equipmentPhysicalCode: "",
            equipmentName: "",
            capDataloading: false,
            businessUnit: process.env.REACT_APP_EMD_BU_ID,
            capCode: "",
            capDetails: "",
            engineModel: "",
            engineSerial: "",
            enginehpkw: "",
            make: "",
            machineModel: "",
            chassisNumber: "",
            machineSerialNo: "",
            country: "",
            capacity: "",
            specs: "",
            yearOfManufacture: "",
            purchaseDate: "",
            warrantyHour: "",
            warrantyStartDate: "",
            warrantyEndDate: "",
            remarks: "",
            fuel: "",
            tankCapacity: "",
            standardFuelConsumption: "",
            manufacture: { manufacturer: "", address: "", contactNo: "", email: "" },
            countryOption: [],
            fuelOption: [],
            allBusinessUnits: [],
            makeOption: [],
            manufacturerOption: [],
            tab: "equipmentDetails",
            errors: {
                equipmentName: "",
                equipmentPhysicalCode: "",
                yearOfManufacture: "",
            },
            touched: {
                equipmentName: true,
                equipmentPhysicalCode: true,
                yearOfManufacture: true,
            },
        }
    }

    componentDidMount() {
        const {
            params: { id }
        } = this.props.match;
        this.setState({ idEquipment: this.props.match.params.id });
        this.getEquipmentEditInfo(id);
        this.getAllBu();
        this.getAllCountry();
        this.getAllMake();
        this.getAllFuelType();

    }

    onManufactureChange = (newManufactur) => {
        //console.log(newManufactur);
        this.setState({ manufacture: newManufactur });
    }

    handleInputOnChange = evt => {

        this.setState({ [evt.target.name]: evt.target.value });
        let errors = this.state.errors;
        let touched = this.state.touched;
        touched[evt.target.name] = true;

        if (evt.target.name === "equipmentName") {
            if (evt.target.value === "") {
                errors.equipmentName = "Equipment Name is required!";
            }
            else {
                errors.equipmentName = "";
            }
        }
        else if (evt.target.name === "equipmentPhysicalCode") {
            if (evt.target.value === "") {
                errors.equipmentPhysicalCode = "Equipment Code is required!";
            }
            else {
                errors.equipmentPhysicalCode = "";
            }
        }
        else if (evt.target.name === "yearOfManufacture") {
            if (evt.target.value === "") {
                errors.yearOfManufacture = "Year of Manufacture is required!";
            }
            else if (evt.target.value !== "" && evt.target.value.length !== 4) {
                errors.yearOfManufacture = "Year of Manufacture must be 4 digit!";
            }
            else {
                errors.yearOfManufacture = "";
            }
        }
        this.setState({ errors, touched: touched });
    };

    equipmentPhysicalCode = evt => {
        this.handleInputOnChange(evt);

    }

    handleAssetChange = assetDetails => {
        this.setState({ capDetails: assetDetails, capDataloading: false, equipmentName: assetDetails.itemName, errors: { equipmentName: "", equipmentPhysicalCode: "", yearOfManufacture: "" }, touched: { equipmentName: false, equipmentPhysicalCode: false, yearOfManufacture: false }, idEquipment: "" });
    }
    handleBusinessUnitChange = (businessUnit) => {
        this.setState({ businessUnit: businessUnit });
    }

    getEquipmentEditInfo(idEquipment) {
        fetch(process.env.REACT_APP_API_URL + "equipment/equipment_edit/" + idEquipment, 
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({
                equipmentPhysicalCode: resp.equipmentPhysicalCode,
                equipmentName: resp.equipmentName,
                businessUnit: resp.businessUnit,
                capCode: resp.capCode,
                engineModel: resp.engineModel,
                engineSerial: resp.engineSerial,
                enginehpkw: resp.enginehpkw,
                make: resp.make,
                machineModel: resp.machineModel,
                chassisNumber: resp.chassisNumber,
                machineSerialNo: resp.machineSerialNo,
                country: resp.country,
                capacity: resp.capacity,
                specs: resp.specs,
                yearOfManufacture: resp.yearOfManufacture,
                purchaseDate: resp.purchaseDate,
                warrantyHour: resp.warrantyHour,
                warrantyStartDate: resp.warrantyStartDate,
                warrantyEndDate: resp.warrantyEndDate,
                remarks: resp.remarks,
                fuel: resp.fuelTypeId,
                tankCapacity: resp.tankCapacity,
                standardFuelConsumption: resp.standardFuelConsumption,
                manufacture: {
                    manufacturer: resp.manufacturer,
                    address: resp.address,
                    contactNo: resp.contactNo,
                    email: resp.email
                },
                capDetails: {
                    capitalizationId: resp.capitalizationId,
                    docNo: resp.docNo,
                    postingDate: resp.postingDate,
                    capDetailsId: resp.capDetailsId,
                    code: resp.code,
                    rate: resp.rate,
                    quantity: resp.quantity,
                    total: resp.total,
                    salvageValue: resp.salvageValue,
                    originalUsefulLifeInMonth: resp.originalUsefulLifeInMonth,
                    usefulLifeInMonth: resp.usefulLifeInMonth,
                    availableQty: resp.availableQty,
                    assignQty: resp.assignQty,
                    remainingLifeMonth: resp.remainingLifeMonth,
                    itemName: resp.equipmentName,
                    itemCode: resp.itemCode,
                    itemId: resp.itemId,
                    label: resp.code,
                    value: resp.value,
                },
            });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }


    getAllCountry() {
        fetch(process.env.REACT_APP_API_URL + "country", 
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ countryOption: resp.data });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    getAllFuelType() {
        fetch(process.env.REACT_APP_API_URL + "fuel_type",
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ fuelOption: resp.data });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    getAllMake() {
        fetch(process.env.REACT_APP_API_URL + "make",
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ makeOption: resp.data });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    getAllManufacturer() {
        fetch(process.env.REACT_APP_API_URL + "manufacturer",
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ manufacturerOption: resp.data });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }


    getAssetCode = (inputValue, callback) => {

        if (!inputValue) {
            callback([]);

        }
        else {
            var projectId = this.state.businessUnit;
            var url = process.env.REACT_APP_API_URL + "capitalization/search_capitalization_item/" + projectId + "?q=" + inputValue;

            setTimeout(() => {
                fetch(url, 
                getGetRequestOptions())
                .then((resp) => {
                    return resp.json()
                })
                .then((resp) => {
                    const tempArray = resp.data.map(function (element) {
                        element.label = element.code;
                        element.value = element.capDetailsId;
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
    validateForm = () => {

        let errors = this.state.errors;
        let touched = this.state.touched;

        for (var input in errors) {

            touched[input] = true;

            if (input === "equipmentName") {
                if (this.state.equipmentName === "") {
                    errors.equipmentName = "Equipment Name is required!";
                }
                else {
                    errors.equipmentName = "";
                }
            }
            else if (input === "equipmentPhysicalCode") {
                if (this.state.equipmentPhysicalCode === "") {
                    errors.equipmentPhysicalCode = "Equipment Code is required!";
                }
                else {
                    errors.equipmentPhysicalCode = "";
                }
            }

            else if (input === "yearOfManufacture") {
                if (this.state.yearOfManufacture === "") {
                    errors.yearOfManufacture = "Year of Manufacture is required!";
                }
                else {
                    errors.yearOfManufacture = "";
                }
            }
        }

        this.setState({ errors, touched: touched });

        if (this.state.errors.equipmentName === "" && this.state.errors.equipmentPhysicalCode === "" && this.state.errors.yearOfManufacture === "") {
            return true;
        }
        else {
            return false;
        }
    }

    setTab = (tabName) => {
        this.setState({ tab: tabName });
    }

    handleSubmit = evt => {
        evt.preventDefault();
        const isValid = this.validateForm();
        if (isValid) {
            Swal.fire({
                title: 'Are you sure?',
                text: 'You want to update this euipment details',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        equipmentPhysicalCode:this.state.equipmentPhysicalCode,
						equipmentName:this.state.equipmentName,
						capDataloading:this.state.capDataloading,
						businessUnit: process.env.REACT_APP_EMD_BU_ID,
						capCode:this.state.capCode,
						capDetails:this.state.capDetails,
						engineModel:this.state.engineModel,
						engineSerial:this.state.engineSerial,
						enginehpkw:this.state.enginehpkw,
						make:this.state.make,
						machineModel:this.state.machineModel,
						chassisNumber:this.state.chassisNumber,
						machineSerialNo:this.state.machineSerialNo,
						country:this.state.country,
						capacity:this.state.capacity,
						specs:this.state.specs,
						yearOfManufacture:this.state.yearOfManufacture,
						purchaseDate:this.state.purchaseDate,
						warrantyHour:this.state.warrantyHour,
						warrantyStartDate:this.state.warrantyStartDate,
						warrantyEndDate:this.state.warrantyEndDate,
						remarks:this.state.remarks,
						fuel:this.state.fuel,
						tankCapacity:this.state.tankCapacity,
						standardFuelConsumption:this.state.standardFuelConsumption,
						manufacture:this.state.manufacture,
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };
                    var apiEnd = "equipment/equipment_update/";

                    fetch(process.env.REACT_APP_API_URL + apiEnd + this.state.idEquipment, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: 'Equipment Details Updated Successfully',
                                })
                                this.setState(this.baseState);
                                this.props.history.push(`/equipment-details/${resp.data.id}`);
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
    }

    render() {
        const { errors, touched } = this.state;
        return (<>
            <div className="card card-custom">
                <div className="card-header">
                    <h3 className="card-title">
                        <p className="text-primary">
                            Update Equipment Details
						</p>
                    </h3>
                </div>
                <div className="ml-12">
                    <ul className="nav nav-tabs nav-tabs-line">
                        <li className="nav-item" onClick={() => this.setTab("equipmentDetails")}>
                            <a className={`nav-link ${this.state.tab === "equipmentDetails" && "active"}`} data-toggle="tab" role="tab" aria-selected={(this.state.tab === "equipmentDetails").toString()} href={() => false}>Equipment Basic Info</a>
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
                    </ul>

                    <div className="mt-5">
                        <form onSubmit={this.handleSubmit}>
                            <div className="card-body">
                                {this.state.tab === "equipmentDetails" &&
                                    <>
                                        <div className="form-group row">
                                            <label htmlFor="example-text-input" className="col-lg-2 col-form-label" >Business Unit</label>
                                            <div className="col-lg-6">

                                                <select className="form-control form-control-sm" id="businessUnit" name="businessUnit" value={this.state.businessUnit} onChange={this.handleInputOnChange} disabled>
                                                    <option value="">Select </option>
                                                    {this.state.allBusinessUnits.map(item =>
                                                        <option key={item.projectId} value={item.projectId}>{item.projectName}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="example-text-input" className="col-lg-2 col-form-label" >Fixed Asset Code</label>
                                            <div className="col-lg-6">
                                                <AsyncSelect
                                                    value={this.state.capDetails}
                                                    defaultOptions
                                                    loadOptions={this.getAssetCode}
                                                    placeholder="Select Asset"
                                                    onChange={this.handleAssetChange}
                                                    styles={customStylesSelect}
                                                    isDisabled={this.state.idEquipment !== ""}
                                                />
                                            </div>
                                        </div>
                                        {this.state.capDetails !== "" ? <div className="form-group row">
                                            <table className="table table-striped table-hover table-bordered table-condensed">
                                                <thead>
                                                    <tr>
                                                        <th>Capitalization Code</th>
                                                        <th>Asset Name</th>
                                                        <th>Capitalization Date</th>
                                                        <th>Location</th>
                                                        <th>Quantity </th>
                                                        <th>Price </th>
                                                        <th>Value </th>
                                                        <th>Useful life </th>
                                                        <th>Salvage value</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>{this.state.capDetails.code}</td>
                                                        <td>{this.state.capDetails.itemName}</td>
                                                        <td>{this.state.capDetails.postingDate}</td>
                                                        <td>{this.state.capDetails.postingDate}</td>
                                                        <td>{this.state.capDetails.quantity}</td>
                                                        <td>{this.state.capDetails.rate}</td>
                                                        <td>{this.state.capDetails.total}</td>
                                                        <td>{this.state.capDetails.usefulLifeInMonth}</td>
                                                        <td>{this.state.capDetails.salvageValue}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div> : ""}

                                        <div className="form-group row">
                                            <label htmlFor="equipmentName" className="col-lg-2 col-form-label" >Equipment Name<span className="required text-danger"> *</span></label>
                                            <div className="col-lg-6">
                                                <input type="text" name="equipmentName" id="equipmentName" value={this.state.equipmentName} onChange={this.handleInputOnChange} className={`form-control form-control-sm ${touched.equipmentName === true ? (errors.equipmentName === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                                <div className="invalid-feedback">{errors.equipmentName}</div>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="equipmentPhysicalCode" className="col-lg-2 col-form-label" >Equipment Code<small>(Max Code)</small><span className="required text-danger"> *</span></label>
                                            <div className="col-lg-6">
                                                <input type="text" name="equipmentPhysicalCode" id="equipmentPhysicalCode" value={this.state.equipmentPhysicalCode} onChange={this.handleInputOnChange} className={`form-control form-control-sm ${touched.equipmentPhysicalCode === true ? (errors.equipmentPhysicalCode === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                                <div className="invalid-feedback">{errors.equipmentPhysicalCode}</div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label htmlFor="country" className="col-lg-2 col-form-label" >Country</label>
                                            <div className="col-lg-6">
                                                <select className="form-control form-control-sm" id="country" name="country" value={this.state.country || ''} onChange={this.handleInputOnChange} >
                                                    <option value="">Select Country</option>
                                                    {this.state.countryOption.map(item =>
                                                        <option key={item.countryId} value={item.countryId}>{item.countryName}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="capacity" className="col-lg-2 col-form-label" >Capacity</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="text" name="capacity" id="capacity" value={this.state.capacity || ''} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="specs" className="col-lg-2 col-form-label" >Specs</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="text" name="specs" id="specs" value={this.state.specs || ''} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="yearOfManufacture" className="col-lg-2 col-form-label" >Year Of Manufacture<span className="required text-danger"> *</span></label>
                                            <div className="col-lg-6">
                                                <input type="number" name="yearOfManufacture" id="yearOfManufacture" value={this.state.yearOfManufacture} onChange={this.handleInputOnChange} className={`form-control form-control-sm ${touched.yearOfManufacture === true ? (errors.yearOfManufacture === "" ? 'is-valid' : 'is-invalid') : ''}`} />
                                                <div className="invalid-feedback">{errors.yearOfManufacture}</div>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="purchaseDate" className="col-lg-2 col-form-label" >Purchase Date</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="date" name="purchaseDate" id="purchaseDate" value={this.state.purchaseDate || ''} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label htmlFor="remarks" className="col-lg-2 col-form-label" >Remarks</label>
                                            <div className="col-lg-6">
                                                <textarea className="form-control form-control-sm" name="remarks" id="remarks" value={this.state.remarks || ''} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>
                                    </>
                                }
                                {this.state.tab === "machineDetails" &&
                                    <>
                                        <div className="form-group row">
                                            <label htmlFor="make" className="col-lg-2 col-form-label" >Make</label>
                                            <div className="col-lg-6">
                                                <select className="form-control form-control-sm" id="make" name="make" value={this.state.make} onChange={this.handleInputOnChange} >
                                                    <option value="">Select Make</option>
                                                    {this.state.makeOption.map(item =>
                                                        <option key={item.makeId} value={item.makeId}>{item.makeName}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="machineModel" className="col-lg-2 col-form-label" >Model</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="text" name="machineModel" id="machineModel" value={this.state.machineModel} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="chassisNumber" className="col-lg-2 col-form-label" >Chassis Number</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="text" name="chassisNumber" id="chassisNumber" value={this.state.chassisNumber} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="machineSerialNo" className="col-lg-2 col-form-label" >Serial Number</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="text" name="machineSerialNo" id="machineSerialNo" value={this.state.machineSerialNo} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>
                                    </>
                                }
                                {this.state.tab === "engineDetails" &&
                                    <>
                                        <div className="form-group row">
                                            <label htmlFor="engineModel" className="col-lg-2 col-form-label" >Model</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="text" name="engineModel" id="engineModel" value={this.state.engineModel} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="engineSerial" className="col-lg-2 col-form-label" >Serial</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="text" name="engineSerial" id="engineSerial" value={this.state.engineSerial} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="enginehpkw" className="col-lg-2 col-form-label" >HP/KW</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="text" name="enginehpkw" id="enginehpkw" value={this.state.enginehpkw} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>
                                    </>
                                }
                                {this.state.tab === "warranty" &&
                                    <>
                                        <div className="form-group row">
                                            <label htmlFor="warrantyHour" className="col-lg-2 col-form-label" >Warranty Hour</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="text" name="warrantyHour" id="warrantyHour" value={this.state.warrantyHour} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="warrantyStartDate" className="col-lg-2 col-form-label" >Warranty Start Date</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="date" name="warrantyStartDate" id="warrantyStartDate" value={this.state.warrantyStartDate} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>

                                        <div className="form-group row">
                                            <label htmlFor="warrantyEndDate" className="col-lg-2 col-form-label" >Warranty End Date</label>
                                            <div className="col-lg-6">
                                                <input className="form-control form-control-sm" type="date" name="warrantyEndDate" id="warrantyEndDate" value={this.state.warrantyEndDate} onChange={this.handleInputOnChange} />
                                            </div>
                                        </div>
                                    </>
                                }
                                {this.state.tab === "manufacturer" &&
                                    <Manufecture onManufactureChange={this.onManufactureChange} prevManufacture={this.state.manufacture} />
                                }
                                {this.state.tab === "fuel" &&
                                    <>
                                        <div className="form-group row">
                                            <label htmlFor="fuel" className="col-lg-2 col-form-label" >Fuel Type</label>
                                            <div className="col-lg-6">
                                                <select className="form-control form-control-sm" id="fuel" name="fuel" value={this.state.fuel} onChange={this.handleInputOnChange} >
                                                    <option value="">Select Fuel Type</option>
                                                    {this.state.fuelOption.map(item =>
                                                        <option key={item.id} value={item.id}>{item.fuelType}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label htmlFor="tankCapacity" className="col-lg-2 col-form-label" >Tank Capacity</label>
                                            <div className="col-lg-6">
                                                <div className="input-group input-group-sm">
                                                    <input className="form-control form-control-sm" type="number" name="tankCapacity" id="tankCapacity" value={this.state.tankCapacity} onChange={this.handleInputOnChange} />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text">Liter</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <label htmlFor="standardFuelConsumption" className="col-lg-2 col-form-label" >Standard Fuel Consumption</label>
                                            <div className="col-lg-6">
                                                <div className="input-group input-group-sm">
                                                    <input className="form-control form-control-sm" type="number" name="standardFuelConsumption" id="standardFuelConsumption" value={this.state.standardFuelConsumption} onChange={this.handleInputOnChange} />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text">Liter</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }
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
                </div>
                <ToastContainer />
            </div>
        </>);
    }
}

export default EquipmentEdit;
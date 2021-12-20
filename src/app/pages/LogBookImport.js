import axios from 'axios';
import React, { Component } from 'react';
import Select from 'react-select';
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

class LogBookImport extends Component {
    state = {
        businessUnit: process.env.REACT_APP_EMD_BU_ID,
        logBookBusinessUnit: "",
        logBookBusinessUnitId:"",
        logMonth: "",
        logYear: "",
        selectedFile: null,
        itemLoader:false,
        allBusinessUnits: []
    }


    componentDidMount() {
        const { allBusinessUnits, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllBu();

        if(this.props.location.info !== undefined){
			var details = JSON.parse(this.props.location.info.details);
			this.setState({ logBookBusinessUnit:{projectId:details.projectId,label:details.projectName,value:details.projectId},logBookBusinessUnitId:details.projectId,logMonth:details.monthNumber, logYear:details.year});
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
				}).filter(e => e.projectId !== process.env.REACT_APP_EMD_BU_ID);
				this.setState({ allBusinessUnits: tempResp });
			})
			.catch((error) => {
				console.log(error, "catch the hoop")
			});

	}

    handleBuChange = businessUnit => {
        this.setState({ logBookBusinessUnit: businessUnit ,logBookBusinessUnitId: businessUnit.projectId});
    }

    handleMonthChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };

    handleYearChange = evt => {
        this.setState({ [evt.target.name]: evt.target.value });
    };

    fileData = () => {

        if (this.state.selectedFile) {
            return (
                <>
                    <p>File Name: {this.state.selectedFile.name}</p>
                    <p>File Type: {this.state.selectedFile.type}</p>
                </>
            );
        }
    };

    onFileChange = event => {
        // Update the state 
        this.setState({ selectedFile: event.target.files[0] });
    };

    handleSubmit = evt => {
        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to upload this Log Book',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.setState({itemLoader:true});
                const formData = new FormData();
                if(this.state.selectedFile != null){
                    formData.append(
                        "myFile",
                        this.state.selectedFile
                    );
                }
                else{
                    formData.append("myFile","");
                }
                formData.append("logBookBusinessUnitId",this.state.logBookBusinessUnitId);
                formData.append("logMonth", this.state.logMonth);
                formData.append("logYear",this.state.logYear);
                const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                var authOptions = {
                    method: 'post',
                    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + jwt().token },
                    url: process.env.REACT_APP_API_URL + "log_book/log_book_import",
                    data: formData
                };
                axios(authOptions)
                .then(response => {
                    this.setState({itemLoader:false});
                    console.log(response);
                    if (response.data.success === true) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'File uploaded successfully',
                        })
                    }
                    this.props.history.push(`/log-book-details/'${response.data.data.logEntryTrackId}`);
                })
                .catch(({ response }) => {
                    this.setState({itemLoader:false});
                    var errorsMessage = [];
                    if(response !== undefined){
                        if (response.data.errorMessage !== undefined && typeof response.data.errorMessage === 'object') {
                            var errorsObj = response.data.errorMessage;
                            Object.keys(errorsObj).forEach(function (value) {
                                errorsObj[value].forEach(function (v) {
                                    errorsMessage.push(v)
                                });
    
                            });
    
                        } else if (response.data.errorMessage !== undefined && (typeof response.data.errorMessage === 'string' || response.errorMessage instanceof String)) {
    
                            errorsMessage.push(response.data.errorMessage);
                        } else {
    
                            errorsMessage.push("Something went wrong");
                        }
                        Swal.fire({
                            icon: 'error',
                            title: response.data.heading,
                            text: errorsMessage,
                        })
                    }
                })
            }
        })
    }



    render() {
        const yearEndRange = new Date().getFullYear();
        const yearStartRange = yearEndRange - 1;

        const monthOption = [{ label: 'January', value: '1', },
        { label: 'February', value: '2' },
        { label: 'March', value: '3' },
        { label: 'April', value: '4' },
        { label: 'May', value: '5' },
        { label: 'June', value: '6' },
        { label: 'July', value: '7' },
        { label: 'August', value: '8' },
        { label: 'September', value: '9' },
        { label: 'October', value: '10' },
        { label: 'November', value: '11' },
        { label: 'December', value: '12' },
        ];

        const yearOption = [];
        for (let i = yearStartRange; i <= yearEndRange; i++) {
            yearOption.push(i);
        }

        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                               Log Book Import
                            </p>
                        </h3>
                        {this.state.itemLoader === true && 
                            <h4 className="mt-2" >
                                <button type="button" className="btn btn-secondary spinner spinner-dark spinner-right">
                                    Please Wait
                                </button>
                            </h4>
                        }
                    </div>

                    <form onSubmit={this.handleSubmit}>
                        <div className="card-body">
                            <div className="ml-12">
                                <div className="form-group row">
                                    <label htmlFor="logBookBusinessUnit" className="col-lg-2 col-form-label" style={{ "textAlign": "right" }}>Business Unit</label>
                                    <div className="col-lg-6">
                                        <Select
                                            value={this.state.logBookBusinessUnit}
                                            onChange={this.handleBuChange}
                                            options={this.state.allBusinessUnits}
                                            styles={customStylesSelect}
                                        />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label htmlFor="logMonth" className="col-lg-2 col-form-label" style={{ "textAlign": "right" }}>Log Month</label>
                                    <div className="col-lg-6">
                                        <div className="row">
                                            <div className="col-lg-4">
                                                <select className="form-control form-control-sm" id="logMonth" name="logMonth" value={this.state.logMonth} onChange={this.handleMonthChange} >
                                                    <option value="">Select Month</option>
                                                    {monthOption.map((item, key) =>
                                                        <option key={key} value={item.value}>{item.label}</option>
                                                    )}
                                                </select>
                                            </div>
                                            <div className="col-lg-8">
                                                <div className="form-group row">
                                                    <label htmlFor="logYear" className="col-lg-4 col-form-label" style={{ "textAlign": "right" }}>Year</label>
                                                    <div className="col-lg-8">
                                                        <select className="form-control form-control-sm" id="logYear" name="logYear" value={this.state.logYear} onChange={this.handleYearChange} >
                                                            <option value="">Select Year</option>
                                                            {yearOption.map((item, key) =>
                                                                <option key={key} value={item}>{item}</option>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-lg-2 col-form-label" style={{ "textAlign": "right" }}>Upload Files </label>
                                    <div className="col-lg-6  col-form-label">
                                        <input type="file" onChange={this.onFileChange}/>
                                        <div className="form-text text-danger">*File must be in our provided CSV format</div>
                                        <div className="mt-2">
                                            {this.fileData()}
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
                    </form>

                </div>

                <ToastContainer />
            </>
        );
    }
}

export default LogBookImport;
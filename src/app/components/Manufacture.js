import React, { Component } from 'react';
import { getGetRequestOptions } from "../components/GetToken";

class Manufacture extends Component {
    constructor(props) {
        super(props);
        this.state = {
            manufacturer: "",
            address: "",
            contactNo: "",
            email: "",
            manufacturerOption: []
        }
    }
    componentDidMount() {
        this.baseState = this.state;
        if (this.props.prevManufacture !== undefined) {
            this.setState({ manufacturer: this.props.prevManufacture.manufacturer, address: this.props.prevManufacture.address, contactNo: this.props.prevManufacture.contactNo, email: this.props.prevManufacture.email });
        }
        this.getAllManufacturer();

    }

    componentDidUpdate(prevProps) {
        //this.getAllManufacturer();

    }
    handleInputOnChange = evt => {

        this.setState({
            [evt.target.name]: evt.target.value
        }, () => {
            const { manufacturerOption, ...manfactureFormData } = this.state;
            this.props.onManufactureChange(manfactureFormData);
        });

    };


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

    render() {
        return (<>
            <div className="form-group row">
                <label htmlFor="manufacturer" className="col-lg-2 col-form-label">Manufacturer Name</label>
                <div className="col-lg-6">
                    <select className="form-control form-control-sm" id="manufacturer" name="manufacturer" value={this.state.manufacturer} onChange={this.handleInputOnChange} >
                        <option value="">Select Manufacturer</option>
                        {this.state.manufacturerOption.map((item, key) =>
                            <option key={key} value={item.manufacturerId}>{item.manufacturerName}</option>
                        )}
                    </select>
                </div>
            </div>

            <div className="form-group row">
                <label htmlFor="address" className="col-lg-2 col-form-label">Address</label>
                <div className="col-lg-6">
                    <textarea className="form-control form-control-sm" name="address" id="address" value={this.state.address} onChange={this.handleInputOnChange} />
                </div>
            </div>

            <div className="form-group row">
                <label htmlFor="contactNo" className="col-lg-2 col-form-label">Contact No</label>
                <div className="col-lg-6">
                    <input className="form-control form-control-sm" type="number" name="contactNo" id="contactNo" value={this.state.contactNo} onChange={this.handleInputOnChange} />
                </div>
            </div>

            <div className="form-group row">
                <label htmlFor="email" className="col-lg-2 col-form-label">Email</label>
                <div className="col-lg-6">
                    <input className="form-control form-control-sm" type="text" name="email" id="email" value={this.state.email} onChange={this.handleInputOnChange} />
                </div>
            </div>

            {/* <pre>
						{JSON.stringify(this.state, null, 2)}
				</pre> */}
        </>);
    }
}

export default Manufacture;
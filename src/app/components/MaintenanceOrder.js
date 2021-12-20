import React, { Component } from 'react';
import AsyncSelect from 'react-select/async';
import { getGetRequestOptions } from "../components/GetToken";

const customStylesSelect = {
    control: (provided) => ({
      ...provided,
      height: 'calc(1.5em + 1.3rem + 2px)'
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: 'calc(1.5em + 1.3rem + 2px)'
    })
  };

class MaintenanceOrder extends Component {
    constructor(props) {
        super(props);
        this.state = { maintenanceOrder: "" }
    }

    componentDidMount() {
      //console.log(this.props.moObj);
      if(this.props.moObj !=undefined ){
        this.setState({ maintenanceOrder: {label:this.props.moObj.maintOrderNo,maintOrderNo:this.props.moObj.maintOrderNo,value:this.props.moObj.maintOrderId,maintOrderId:this.props.moObj.maintOrderId}}, () => 
        this.props.onSelect(this.state.maintenanceOrder.maintOrderId));
      }

    
    }

    getMaintenanceOrder = (inputValue, callback) => {
        if (!inputValue) {
          //callback([]);
          var url= process.env.REACT_APP_API_URL + "maintenance_order/order_search";
          
        } else {
          url = process.env.REACT_APP_API_URL + "maintenance_order/order_search?q=" + inputValue;
        }
    
        setTimeout(() => {
        fetch(url,getGetRequestOptions())
            .then((resp) => {
              return resp.json()
            })
            .then((resp) => {
              const tempArray = resp.data.map(function (element) {
                element.label = element.orderNo;
                element.value = element.orderId;
                return element;
              });
              callback(tempArray);
            })
            .catch((error) => {
              console.log(error, "catch the hoop")
            });
        });
    }

    handleMaintenanceOrderChange = (maintenanceOrder) => {
        //console.log(maintenanceOrder);
        this.setState({maintenanceOrder:maintenanceOrder});
        this.props.onSelect(maintenanceOrder.orderId);
    }

    render() { 
        return ( 
        <div className="form-group row">
        <label htmlFor="example-text-input" className="col-2 col-form-label" style={{"textAlign":"right"}}>MO Order <span className="required text-danger">*</span></label>
			<div className="col-6">
				<AsyncSelect
					value={this.state.maintenanceOrder}
					defaultOptions
					loadOptions={this.getMaintenanceOrder}
					placeholder="Select Maintenance"
					onChange={this.handleMaintenanceOrderChange}
					styles={customStylesSelect}
				/>
			</div>
      </div> );
    }
}
 
export default MaintenanceOrder;
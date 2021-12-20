import React, { Component } from 'react';
import MaintenanceOrder from '../components/MaintenanceOrder';
import MaintenanceToComplete from '../components/MaintenanceToComplete';

class MaintenanceOrderConfirmation extends Component {
    state = {
        orderId:"",
        moObj:""  
    }

    componentDidMount() {
        if(this.props.match.params.orderId !== undefined){
        const orderId = this.props.match.params.orderId;
        this.setState({orderId:orderId});
        }

        if(this.props.location.info !== undefined){
			var details = JSON.parse(this.props.location.info.details);
            //console.log(details);
		    this.setState({ moObj: details});
        }   
    }

    onSelect = (orderId) => {
        console.log(orderId);
        this.setState({orderId:orderId});
    }
 
    render() {
        return (
            <div className="card card-custom">
            <div className="card-header">
                <h3 className="card-title">
                    <p className="text-primary">
                        Maintenance Order Confirmation
                    </p>
                </h3>
            </div>
                
            <div className="card-body">
                 {(this.props.match.params.orderId === undefined  && this.props.location.info === undefined) ? <MaintenanceOrder  onSelect={this.onSelect}  /> : "" }
                 { (this.props.match.params.orderId === undefined && this.state.moObj !="" )  ? <MaintenanceOrder moObj={this.state.moObj} onSelect={this.onSelect}  /> : "" }
                 { this.state.orderId !==""  ?  <MaintenanceToComplete orderId={this.state.orderId}/> : "" }
                 
                </div>
            </div>
        );
    }
}

export default MaintenanceOrderConfirmation;
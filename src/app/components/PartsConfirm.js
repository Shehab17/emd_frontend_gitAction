import React, { Component } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import ToastMsg from './ToastMsg';

class PartsConfirm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            orderDetailsId:"",
            orderId:"",
            warehouseName: "",
            item: "",
            unit: "",
            qty: "",
            stock: "",
            price: "",
            cost: "",
            previousQty:""
        }
    }

    componentDidMount() {
        this.baseState = this.state;
        if (this.props.prevParts !== undefined) {
            this.setState({ 
                orderDetailsId:this.props.prevParts.maintenanceOrderDetailsId,
                orderId:this.props.prevParts.maint_order_id,
                warehouseName: this.props.prevParts.warehouseName, 
                item: this.props.prevParts.item, 
                unit: this.props.prevParts.item.unitName,
                issuedQty: this.props.prevParts.issuedQty, 
                reqQty: this.props.prevParts.quantity,
                qty: this.props.prevParts.issuedQty,
                price: this.props.prevParts.price, 
                cost: (this.props.prevParts.issuedQty * this.props.prevParts.price).toFixed(2),
                previousQty:this.props.prevParts.issuedQty
            });
        }
    }

    handleInputOnChange = evt => {
        evt.preventDefault();
        if(Number(evt.target.value) > Number(this.state.previousQty)){
            toast.error(<ToastMsg toastMessage={['Quantity can not be raised']} heading="Invalid" />, {
                position: toast.POSITION.TOP_RIGHT
            });
        }
        else{
            this.setState({ [evt.target.name]: evt.target.value ,cost:(evt.target.value*this.state.price).toFixed(2)});
        }

    };

    handleSubmit = evt => {
        evt.preventDefault();
        const isValid = true;  
    
        if (isValid) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You want to confirm this part !",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }).then((result) => {
                if (result.value) {
                    const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                    const formData = {
                        orderDetailsId: this.state.orderDetailsId,
                        orderId:this.state.orderId, 
                        qty: this.state.qty 
                    };
                    const requestOptions = {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                        body: JSON.stringify(formData)
                    };

                    var apiEnd = "maintenance_order/parts_op_complete";

                    fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                        .then((resp) => {
                            return resp.json()
                        })
                        .then((resp) => {
                            console.log(resp);

                            if (resp.success === true) {
                                let successMsg = [resp.successMessage];

                                Swal.fire({
                                    icon: 'success',
                                    title: 'Success',
                                    text: successMsg,
                                })
                                this.setState(this.baseState);
                                this.props.onPartsConfirm({ id: resp.data.id, rid: Math.random() });
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

        return (
            <>

                <h3 className="card-title">
                    <p className="text-primary">
                        Parts Confirmation
                    </p>
                </h3>


                <form onSubmit={this.handleSubmit}>
                    <div className="card-body">
                        <div className="ml-12">

                            <div className="form-group row">
                                <label htmlFor="warehouseName" className="col-lg-3 col-form-label">Warehouse</label>
                                <div className="col-lg-6">
                                    <input type="text" name="warehouseName" id="warehouseName" value={this.state.warehouseName} className="form-control form-control-sm" readOnly />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="itemName" className="col-lg-3 col-form-label">Item</label>
                                <div className="col-lg-6">
                                    <input type="text" name="itemName" id="itemName" value={this.state.item.itemName} className="form-control form-control-sm" readOnly />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="unitName" className="col-lg-3 col-form-label">Unit</label>
                                <div className="col-lg-4">
                                    <input type="text" name="unitName" id="unitName" value={this.state.item.unitName} className="form-control form-control-sm" readOnly />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="reqQty" className="col-lg-3 col-form-label"> Qty </label>
                                <div className="col-lg-4">
                                    <input type="number" name="reqQty" id="reqQty" value={this.state.reqQty} className="form-control form-control-sm" readOnly />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="previousQty" className="col-lg-3 col-form-label"> Issued Qty </label>
                                <div className="col-lg-4">
                                    <input type="number" name="previousQty" id="previousQty" value={this.state.previousQty} className="form-control form-control-sm" readOnly />
                                </div>
                            </div>

                            <div className="form-group row">
                                <label htmlFor="qty" className="col-lg-3 col-form-label"> Actual Qty Used <span className="required text-danger"> *</span></label>
                                <div className="col-lg-4">
                                    <input type="number" name="qty" id="qty" value={this.state.qty} className="form-control form-control-sm" onChange={this.handleInputOnChange} />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="price" className="col-lg-3 col-form-label">Price</label>
                                <div className="col-lg-3">
                                    <input type="number" name="price" id="price" value={this.state.price} className="form-control form-control-sm" readOnly />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="cost" className="col-lg-3 col-form-label">Cost</label>
                                <div className="col-lg-3">
                                    <input type="number" name="cost" id="cost" value={this.state.cost} className="form-control form-control-sm" readOnly />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="col-4">
                        </div>
                        <div className="col-6">
                            <button type="submit" className="btn btn-success mr-2">Confirm</button>

                        </div>
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

export default PartsConfirm;
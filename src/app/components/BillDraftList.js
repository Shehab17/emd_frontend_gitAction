import React, { Component } from 'react';
import { Button, Spinner } from "react-bootstrap";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { getGetRequestOptions } from "../components/GetToken";
import ToastMsg from './ToastMsg';

class BillDraftList extends Component {

    constructor(props) {
        super(props);
        this.state = { draft: []};
    }

    componentDidMount() {
        this.getDraftList();
    }

    getDraftList() {
        this.setState({ loading: true });
        fetch(process.env.REACT_APP_API_URL + "bill_draft_list",
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ loading: false });
            this.setState({ draft: resp });
            
        })
        .catch((error) => {
            this.setState({ loading: false });
            console.log(error, "catch the hoop")
        });

    }

    deleteDraft = (id) =>{

        Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete draft!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                const formData = {id: id};
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(formData)
                };

                var apiEnd = "bill_draft_delete";

                fetch(process.env.REACT_APP_API_URL + apiEnd, requestOptions)
                    .then((resp) => {
                        return resp.json()
                    })
                    .then((resp) => {
                        console.log(resp);

                        if (resp.success === true) {
                            let successMsg = [`Draft Deleted`];

                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: successMsg,
                            })

                           this.getDraftList();
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
                            toast.error(<ToastMsg toastMessage={errorsMessage} heading={resp.heading} />, {
                                position: toast.POSITION.TOP_RIGHT
                            });

                        }


                    })
                    .catch((error) => {
                        console.log(error, "catch the hoop")
                    });

            }
        })

        
    }
    render() {
        return (
            <div className="card card-custom">
                <div className="card-body">
                          <div style={{height:'350px',overflow:'auto'}}>
                            <table className="table table-bordered table-condensed">
                                <tbody>
                                    <tr>
                                        <th>SL</th>
                                        <th>Name</th>
                                        <th>Created On</th>
                                        <th>Action</th>

                                    </tr>
                                    {this.state.loading ? <tr><td colSpan="4" className="text-center"> <Spinner animation="grow" /><Spinner animation="grow" /><Spinner animation="grow" /></td></tr> :
                                    this.state.draft.map((row, index) =>
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{row.name}</td>
                                            <td>{row.createDate}</td>
                                            <td className="text-center">                     
                                                <Button className="btn btn-outline-primary btn-sm" style={{marginRight:5}} onClick={() => this.props.onDraftLoad({id:row.id})}>Load Draft </Button>
                                                <Button className="btn  btn-outline-danger btn-sm" onClick={() => this.deleteDraft(row.id)}>Delete Draft </Button> 
                                            </td>
                                        </tr>
                                    )}
                                { (this.state.draft.length === 0 && !this.state.loading)  && <tr><td colSpan="4"><p style={{'textAlign':'center'}}><strong>No data found.</strong></p></td></tr> }
                                </tbody> 
                            </table>
                         </div>   
                </div>

            </div >

        );
    }
}

export default BillDraftList;
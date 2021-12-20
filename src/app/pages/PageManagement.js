import React, { Component } from 'react';
import { Button, Spinner } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { Link } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";
import { getGetRequestOptions } from "../components/GetToken";

class PageManagement extends Component {
    state = {
        pageList: []
    }

    componentDidMount() {
        const { loading, ...baseState } = this.state;
        this.baseState = baseState;
        this.getAllPages();
    }

    getAllPages() {
        this.setState({ loading: true });
        fetch(process.env.REACT_APP_API_URL + "page_list",    
        getGetRequestOptions())

        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({
                pageList: resp.data,
                loading: false
            });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    delete = idPages => evt => {
        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this page',
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
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(formData)
                };

                fetch(process.env.REACT_APP_API_URL + "page_delete/" + idPages, requestOptions)
                    .then((resp) => {
                        return resp.json()
                    })
                    .then((resp) => {
                        console.log(resp);

                        if (resp.success === true) {

                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'Page deleted successfully',
                            })
                            this.getAllPages();
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
        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <h3 className="card-title">
                            <p className="text-primary">
                                Pages List
                            </p>
                        </h3>
                    </div>
                    <div className="card-toolbar mt-5 mr-10">
                        <Link to={`/accesscontrol-createpage`}>
                            <button className="btn btn-outline-primary btn-sm float-right"><i className="flaticon2-plus"></i>Create New Page</button>
                        </Link>
                    </div>
                    <div className="card-body">
                        <table className="table table-sm table-hover table-bordered table-condensed">
                            <thead>
                                <tr className="text-primary" style={{ "textAlign": "center" }}>
                                    <th>Sl. No</th>
                                    <th>Parent Name</th>
                                    <th>Pages Title</th>
                                    <th>Pages Link</th>
                                    <th>Icon Path</th>
                                    <th>Pages Type</th>
                                    <th>Is Show</th>
                                    <th>Active Status</th>
                                    <th>Sequence</th>
                                    <th>Action</th>
                                </tr>

                            </thead>
                            <tbody>
                                {
                                    this.state.loading ? <tr><td colSpan="9" className="text-center"> <Spinner animation="grow" /><Spinner animation="grow" /><Spinner animation="grow" /></td></tr> :
                                        this.state.pageList.map((value, key) =>
                                            <tr key={key} >
                                                <td className="text-center">{key + 1}</td>
                                                <td className="text-center">{value.parentName}</td>
                                                <td className="text-center">{value.pagesTitle}</td>
                                                <td className="text-center">{value.pagesLink}</td>
                                                <td className="text-center">{value.iconPath}</td>
                                                <td className="text-center">{value.pagesType}</td>
                                                <td className="text-center">{value.isShow}</td>
                                                <td className="text-center">{value.activeShowStatus}</td>
                                                <td className="text-center">{value.sequence}</td>
                                                <td>
                                                    <Link to={`/accesscontrol-editpage/${value.idPages}`}>
                                                        <Button
                                                            className="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                                                        >
                                                            <span className="svg-icon svg-icon-md svg-icon-primary">
                                                                <SVG
                                                                    src={toAbsoluteUrl("/media/svg/icons/Communication/Write.svg")}
                                                                />
                                                            </span>
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        className="btn btn-icon btn-light btn-hover-danger btn-sm mx-3"
                                                        onClick={this.delete(value.idPages)}
                                                    >
                                                        <span className="svg-icon svg-icon-md svg-icon-danger">
                                                            <SVG
                                                                src={toAbsoluteUrl("/media/svg/icons/General/Trash.svg")}
                                                            />
                                                        </span>
                                                    </Button>

                                                </td>
                                            </tr>
                                        )
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <ToastContainer />
            </>
        );
    }
}

export default PageManagement;
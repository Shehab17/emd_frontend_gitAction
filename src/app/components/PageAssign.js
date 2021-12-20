import React, { Component } from 'react';
import SVG from "react-inlinesvg";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";
import { getGetRequestOptions } from "../components/GetToken";

class PageAssign extends Component {
    state = {
        idRoles: "",
        idPages: "",
        roleOptions: [],
        pageList: [],
    }


    componentDidMount() {
        const { loading, ...baseState } = this.state;
        this.baseState = baseState;
        this.getRoleList();
    }

    getRoleList() {
        fetch(process.env.REACT_APP_API_URL + "get_role_list",         
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ roleOptions: resp.data });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    getRolePages(idRoles) {
        fetch(process.env.REACT_APP_API_URL + "get_role_pages/" + idRoles,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            const menu = resp.data.map(function (row) {
                return { ...row, totalSubMenu: row.subMenu.length }
            });
            this.setState({ pageList: menu });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });
    }

    handleInputOnChange = evt => {
        evt.preventDefault();
        this.setState({ [evt.target.name]: evt.target.value }, () => this.getRolePages(this.state.idRoles));
    };

    onPermissionChange = (i, j, pages) => {
        const newItems = this.state.pageList.map(function (row, rindex) {
            if (i === rindex) {
                const subMenu = Object.values(row.subMenu);
                subMenu.map((sv, index) => {
                    if (j === index) {
                        if (sv.isPermission === 0) {
                            sv.isPermission = 1;
                        }
                        else {
                            sv.isPermission = 0;
                        }
                    }
                    return sv;
                })
            }
            return row;
        })
        this.setState({ pageList: newItems, idPages: pages }, () => this.assignRolePage());
    }

    assignRolePage() {
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        const formData = {
            idRoles: this.state.idRoles,
            idPages: this.state.idPages,
        };
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
            body: JSON.stringify(formData)
        };
        fetch(process.env.REACT_APP_API_URL + "set_role_page_assign", requestOptions)
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                console.log(resp);

                if (resp.success === true) {
                    Swal.fire({
                        position: "top-right",
                        icon: "success",
                        title: "Permission Changed",
                        showConfirmButton: false,
                        timer: 1500
                    });

                }
                else {
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



    tableBody() {
        const tbodies = this.state.pageList.map((value, index) => {
            const subMenuValues = Object.values(value.subMenu);
            const subMenuRows = subMenuValues.map((sv, i) => {
                const menuValue =
                    i === 0 ? <td style={{ "padding": "0.75rem" }} rowSpan={subMenuValues.length}>{value.pagesTitle}</td> : null;

                return (
                    <tr key={i}>
                        {menuValue}
                        <td style={{ "padding": "0.75rem" }}>{sv.pagesTitle}</td>
                        <td style={{ "padding": "0.75rem", "textAlign": "center" }} onClick={() => this.onPermissionChange(index, i, sv.idPages)}>
                            {sv.isPermission === 1 &&
                                <span className="svg-icon svg-icon-3x svg-icon-success">
                                    <SVG
                                        src={toAbsoluteUrl("/media/svg/icons/Navigation/Check.svg")}
                                    />
                                </span>}

                            {sv.isPermission === 0 &&
                                <span className="svg-icon svg-icon-3x svg-icon-danger">
                                    <SVG
                                        src={toAbsoluteUrl("/media/svg/icons/Navigation/Close.svg")}
                                    />
                                </span>
                            }
                        </td>
                    </tr>
                );
            });
            return (
                <>
                    {subMenuRows}
                </>
            );
        });

        return tbodies;
    }

    render() {

        return (
            <>
                <div className="card card-custom">
                    <form>
                        <div className="card-body">
                            <div className="form-group row">
                                <select className="form-control form-control-sm" id="idRoles" name="idRoles" value={this.state.idRoles} onChange={this.handleInputOnChange}>
                                    <option value="">Select A Role</option>
                                    {this.state.roleOptions.map(item =>
                                        <option key={item.idRoles} value={item.idRoles}>{item.roleName}</option>
                                    )}
                                </select>
                            </div>
                            <div className="form-group row">
                                <table className="table table-sm  table-bordered table-condensed">
                                    <thead>
                                        <tr>
                                            <th style={{ "textAlign": "center" }}>Menu</th>
                                            <th style={{ "textAlign": "center" }}>Sub Menu</th>
                                            <th style={{ "textAlign": "center" }}>Permission</th>
                                        </tr>

                                    </thead>
                                    <tbody>
                                        {this.tableBody()}
                                    </tbody>
                                </table>
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

export default PageAssign;
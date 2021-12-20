import React, { Component } from 'react';
import { Button, Spinner } from "react-bootstrap";
import SVG from "react-inlinesvg";
import Swal from 'sweetalert2';
import { toAbsoluteUrl } from "../../_metronic/_helpers";

const columns = [

    { 'value': 'equipmentId', 'title': 'Equipment Id' },
    { 'value': 'equipmentCode', 'title': 'Equipment Code' },
    { 'value': 'equipmentName', 'title': 'Equipment Name' },
    { 'value': 'capCode', 'title': 'Capitalization Code' },
    { 'value': 'model', 'title': 'Model' },
    { 'value': 'capacity', 'title': 'Capacity' },
    { 'value': 'manufacturer', 'title': 'Manufacturer' },
    { 'value': 'manufactureYear', 'title': 'Year of Manufacture' },
    { 'value': 'openingRunningHour', 'title': 'Opening Running Hour' },
    { 'value': 'action', 'title': 'Action' },

];

const url = process.env.REACT_APP_API_URL + "equipment/equipment_opening_running_hour_list";

class EquipmentOpeningRunningHour extends Component {
    constructor(props) {
        super(props);

        this.state = {
            entities: {
                data: [],
                current_page: 1,
                from: 1,
                last_page: 1,
                per_page: 10,
                to: 1,
                total: 1,
            },
            first_page: 1,
            current_page: 1,
            sorted_column: columns[1].value,
            offset: 4,
            order: 'DESC',
            /*new obj*/
            limit: '10',
            // offset: 0,
            orderBy: 'Id',
            orderType: 'ASC',
            globalSearch: '',
            columns: {
                'equipmentId': {
                    filterType: 'like',
                    filterValue: ''
                },
                'equipmentCode': {
                    filterType: 'like',
                    filterValue: ''
                },
                'equipmentName': {
                    filterType: 'like',
                    filterValue: ''
                },
                'capCode': {
                    filterType: 'like',
                    filterValue: ''
                },
                'model': {
                    filterType: 'like',
                    filterValue: ''
                },
                'capacity': {
                    filterType: 'like',
                    filterValue: ''
                },
                'manufacturer': {
                    filterType: 'like',
                    filterValue: ''
                },
                'manufactureYear': {
                    filterType: 'like',
                    filterValue: ''
                },
                'openingRunningHour': {
                    filterType: 'like',
                    filterValue: ''
                },
            }
        };
    }

    fetchEntities() {
        this.setState({ loading: true });
        let fetchUrl = `${url}?page=${this.state.current_page}&column=${this.state.sorted_column}&order=${this.state.order}&globalSearch=${this.state.globalSearch}&per_page=${this.state.entities.per_page}`;
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }

        fetch(fetchUrl, {
            method: "POST",
            headers: {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + jwt().token
            },
            body: JSON.stringify(this.state)
        })
            .then((resp) => {
                return resp.json()
            })
            .then((response) => {
                this.setState({ entities: response.data.data, loading: false });

            })
            .catch((error) => {
                this.setState({ loading: false });
                console.log(error, "catch the hoop")
            });

    }

    componentDidMount() {
        this.setState({ current_page: this.state.entities.current_page, loading: true }, () => { this.fetchEntities() });
    }

    changePage(pageNumber) {
        this.setState({ current_page: pageNumber }, () => { this.fetchEntities() });
    }

    changePerPage = evt => {

        this.setState({ entities: { ...this.state.entities, per_page: evt.target.value } }, () => { this.fetchEntities() });
    }

    changeGlobalSearch = evt => {
        this.setState({ globalSearch: evt.target.value }, () => { this.fetchEntities() });
    }

    columnsFilterChange = evt => {
        this.setState({
            columns: {
                ...this.state.columns, [evt.target.name]: {
                    filterType: 'like',
                    filterValue: evt.target.value
                },
            }
        }, () => { this.fetchEntities() });
    }


    columnHead(value) {
        return value.split('_').join(' ');
    }

    pagesNumbers() {
        if (!this.state.entities.to) {
            return [];
        }
        let from = this.state.entities.current_page - this.state.offset;
        if (from < 1) {
            from = 1;
        }
        let to = from + (this.state.offset * 2);
        if (to >= this.state.entities.last_page) {
            to = this.state.entities.last_page;
        }
        let pagesArray = [];

        for (let page = from; page <= to; page++) {
            pagesArray.push(page);
        }
        return pagesArray;
    }

    
    onOpeningRunningHourChange = index => evt => {
        const newItems = this.state.entities.data.map(function (row, rindex) {
            if (index === rindex) {
                row.openingRunningHour = evt.target.value;
            }
            return row;
        })

        this.setState({ entities: { ...this.state.entities, data: newItems } });
    }

    save = value => evt => {
        var obj = {
            equipmentOpeningRunningHourId: value.equipmentOpeningRunningHourId,
            equipmentId: value.equipmentId,
            openingRunningHour: value.openingRunningHour,
            capDetailsId: value.capDetailsId,
        }
        evt.preventDefault();
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to update this Opening Running Hour',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' , 'Authorization': 'Bearer ' + jwt().token },
                    body: JSON.stringify(obj)
                };

                fetch(process.env.REACT_APP_API_URL + "equipment/equipment_opening_running_hour_setup", requestOptions)
                    .then((resp) => {
                        return resp.json()
                    })
                    .then((resp) => {
                        console.log(resp);

                        if (resp.success === true) {

                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: 'Opening Running Hour Updated successfully',
                            })
                            this.fetchEntities();
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

    tableHeads() {
        let icon;
        if (this.state.order === 'asc') {
            icon = <i className="fa fa-arrow-up"></i>;
        } else {
            icon = <i className="fa fa-arrow-down"></i>;
        }
        return columns.map((column, index) => {
            if (column.value === 'action') {
                return <th style={{ "textAlign": "center" }} key={index}>
                    <p className="text-primary"> {column.title}</p>
                </th>
            }
            else {
                return <th style={{ "textAlign": "center" }} key={index} onClick={() => this.sortByColumn(column.value)}>
                    <p className="text-primary"> {this.columnHead(column.title)}{column.value === this.state.sorted_column && icon}</p>
                </th>
            }

        });
    }

    tableHeadFilter() {

        return columns.map((column, index) => {
            if (column.value === 'action') {
                return <td key={index}></td>
            }
            else {
                return <td key={index} >
                    <input type="text" name={column.value} value={this.state.columns[column.value].filterValue} onChange={this.columnsFilterChange} className="form-control form-control-sm" style={{ "borderColor": "#e4e6ef" }} />
                </td>
            }
        });

    }


    dataList() {
        if (this.state.entities.data.length) {
            return this.state.entities.data.map((value, key) => {
                return <tr key={key} >
                    <td className="text-center">{value.equipmentId}</td>
                    <td className="text-center">{value.equipmentCode}</td>
                    <td className="text-center">{value.equipmentName}</td>
                    <td className="text-center">{value.capCode}</td>
                    <td className="text-center">{value.model}</td>
                    <td className="text-center">{value.capacity}</td>
                    <td className="text-center">{value.manufacturer}</td>
                    <td className="text-center">{value.manufactureYear}</td>
                    <td><input className="form-control form-control-sm" type="text" value={value.openingRunningHour != null ? value.openingRunningHour.split(":")[0] : ""} onChange={this.onOpeningRunningHourChange(key)} /></td>
                    <td className="text-center pr-0">
                        <Button
                            className="btn btn-icon btn-light btn-hover-primary btn-sm mx-3"
                            onClick={this.save(value)}
                        >
                            <span className="svg-icon svg-icon-md svg-icon-primary">
                                <SVG
                                    src={toAbsoluteUrl("/media/svg/icons/General/Save.svg")}
                                />
                            </span>
                        </Button>
                    </td>
                </tr>
            })
        } else {
            return <tr>
                < td colSpan={columns.length} className="text-center" > No Records Found.</td >
            </tr >
        }
    }


    sortByColumn(column) {
        if (column === this.state.sorted_column) {
            this.state.order === 'asc' ? this.setState({ order: 'desc', current_page: this.state.first_page }, () => { this.fetchEntities() }) : this.setState({ order: 'asc' }, () => { this.fetchEntities() });
        } else {
            this.setState({ sorted_column: column, order: 'asc', current_page: this.state.first_page }, () => { this.fetchEntities() });
        }
    }

    pageList() {
        return this.pagesNumbers().map(page => {
            return <li className={page === this.state.entities.current_page ? 'page-item active' : 'page-item'} key={page}>
                <button className="page-link" onClick={() => this.changePage(page)}>{page}</button>
            </li>
        })
    }

    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Equipment Opening Running Hour Setup</p></h3>
                </div>


                <div className="card-body">

                    <div className="row">
                        <div className="col-md-2">
                            <select className="form-control form-control-sm" value={this.state.entities.per_page} onChange={this.changePerPage} style={{ "borderColor": "#e4e6ef" }}>
                                <option value="10">10</option>
                                <option value="100">100</option>
                                <option value="200">200</option>
                                <option value="500">500</option>
                            </select>
                        </div>
                        <div className="pull-right col-md-6">
                            <input type="text" placeholder="Global Search" value={this.state.globalSearch} onChange={this.changeGlobalSearch} className="form-control form-control-sm" style={{ "borderColor": "#e4e6ef" }} />
                        </div>
                    </div>
                    <br />
                    <div className="table-responsive" style={{ 'height': '550px', 'overflow': 'auto' }}>
                        <table className="table table-sm table-hover table-bordered table-condensed" style={{minWidth:"max-content"}}>
                            <thead>
                                <tr>{this.tableHeads()}</tr>
                                <tr>
                                    {
                                        this.tableHeadFilter()
                                    }
                                </tr>
                            </thead>
                            <tbody>{this.state.loading ? <tr><td colSpan={columns.length} className="text-center"> <Spinner animation="grow" /><Spinner animation="grow" /><Spinner animation="grow" /></td></tr> : this.dataList()}</tbody>
                        </table>
                    </div>
                    {(this.state.entities.data && this.state.entities.data.length > 0) &&
                        <>
                            <div className="pt-2"></div>
                            <nav>
                                <ul className="pagination">
                                    <li className="page-item">
                                        <button className="page-link" disabled={1 === this.state.entities.current_page} onClick={() => this.changePage(this.state.entities.current_page - 1)}>
                                            Previous
                                        </button>
                                    </li>
                                    {this.pageList()}
                                    <li className="page-item">
                                        <button className="page-link" disabled={this.state.entities.last_page === this.state.entities.current_page} onClick={() => this.changePage(this.state.entities.current_page + 1)}>
                                            Next
                                        </button>
                                    </li>
                                    <span style={{ marginTop: '8px' }}> &nbsp; <i>Displaying {this.state.entities.data.length} of {this.state.entities.total} entries.</i></span>
                                </ul>
                            </nav>
                        </>
                    }
                </div>
            </div>
        );
    }

}


export default EquipmentOpeningRunningHour;
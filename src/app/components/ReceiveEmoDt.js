import React, { Component } from 'react';
import { Button, Spinner } from "react-bootstrap";
import SVG from "react-inlinesvg";
import { Link } from "react-router-dom";
import { toAbsoluteUrl } from "../../_metronic/_helpers";

const columns = [
    { 'value': 'idEmo', 'title': 'Id' },
    { 'value': 'emoNo', 'title': 'EMO NO' },
    { 'value': 'emoDate', 'title': 'EMO  Date' },
    { 'value': 'fromBu', 'title': 'Business Unit' },
    { 'value': 'receivingBu', 'title': 'Receiving Business Unit' },
    { 'value': 'action', 'title': 'Action' }
];

const url = process.env.REACT_APP_API_URL + "emo_receive/emo_receive_dt";

class ReceiveEmoDt extends Component {
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
            sorted_column: columns[0].value,
            offset: 4,
            order: 'DESC',
            limit: '10',
            orderBy: 'idEmo',
            orderType: 'ASC',
            globalSearch: '',
            columns: {
                'idEmo': {
                    filterType: 'like',
                    filterValue: ''
                },
                'emoNo': {
                    filterType: 'like',
                    filterValue: ''
                },
                'emoDate': {
                    filterType: 'like',
                    filterValue: ''
                },
                'fromBu': {
                    filterType: 'like',
                    filterValue: ''
                },
                'receivingBu': {
                    filterType: 'like',
                    filterValue: ''
                }

            }
        };
    }

    getApprovalPermission() {
		const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        fetch(process.env.REACT_APP_API_URL + "emo_receive_edit_permission", {
			method: "GET",
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
        })
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ approvalPermission: resp });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }

    fetchEntities() {
        this.setState({ loading: true });
        let fetchUrl = `${url}?page=${this.state.current_page}&column=${this.state.sorted_column}&order=${this.state.order}&globalSearch=${this.state.globalSearch}&per_page=${this.state.entities.per_page}`;
        const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }

        fetch(fetchUrl, {
            method: "POST",
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
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

    componentDidMount() {
        this.getApprovalPermission();
        this.setState({ current_page: this.state.entities.current_page, loading: true }, () => { this.fetchEntities() });
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
                    <td className="text-center">{value.idEmo}</td>
                    <td className="text-center">{value.emoNo}</td>
                    <td className="text-center">{value.emoDate}</td>
                    <td className="text-center">{value.fromBu}</td>
                    <td className="text-center">{value.receivingBu}</td>
                    <td className="text-center">
                        { this.state.approvalPermission != null && 
                            <Link to={`/emo-receive-edit/${value.idEmo}`}>
                                <Button className="btn btn-icon btn-light btn-hover-primary btn-sm mx-3">
                                    <span className="svg-icon svg-icon-md svg-icon-primary">
                                        <SVG
                                            src={toAbsoluteUrl("/media/svg/icons/Communication/Write.svg")}
                                        />
                                    </span>
                                </Button>
                            </Link>
                        }
                        <Link to={`/emo-details/${value.idEmo}`}>
                            <Button className="btn btn-icon btn-light btn-hover-primary btn-sm mx-3">
                                <span className="svg-icon svg-icon-md svg-icon-primary">
                                    <SVG
                                        src={toAbsoluteUrl("/media/svg/icons/Text/Bullet-list.svg")}
                                    />
                                </span>
                            </Button>
                        </Link>
                    </td>
                </tr>
            })
        } else {
            return <tr>
                <td colSpan={columns.length} className="text-center">No Records Found.</td>
            </tr>
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
            <>
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
                        <div className="mt-5"></div>
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
            </>
        );
    }

}

export default ReceiveEmoDt;
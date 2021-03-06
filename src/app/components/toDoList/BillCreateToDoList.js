import React, { Component } from 'react';
import { Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

const columns = [
    { 'value': 'projectId', 'title': 'Id' },
    { 'value': 'projectName', 'title': 'Bill Project' },
    { 'value': 'billMonth', 'title': 'Bill Month' },
    { 'value': 'billYear', 'title': 'Bill Year' },
    { 'value': 'action', 'title': 'Action' }
];

const url = process.env.REACT_APP_API_URL + "emd/bill_create_to_do_list";

class BillCreateToDoList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            entities: {
                data: [],
                current_page: 1,
                from: 1,
                last_page: 1,
                per_page: 5,
                to: 1,
                total: 1,
            },
            first_page: 1,
            current_page: 1,
            sorted_column: columns[0].value,
            offset: 4,
            order: 'DESC',
            limit: '5',
            orderBy: 'projectId',
            orderType: 'ASC',
            globalSearch: '',
            columns: {
                'projectId': {
                    filterType: 'like',
                    filterValue: ''
                },
                'projectName': {
                    filterType: 'like',
                    filterValue: ''
                },
                'billMonth': {
                    filterType: 'like',
                    filterValue: ''
                },
                'billYear': {
                    filterType: 'like',
                    filterValue: ''
                }
            }
        };
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
                    <td className="text-center">{value.projectId}</td>
                    <td className="text-center">{value.projectName}</td>
                    <td className="text-center">{value.billMonth}</td>
                    <td className="text-center">{value.billYear}</td>
                    <td className="text-center">
                        <Link to={{pathname:'/generate-bill-create',info:{ details : JSON.stringify(value)}}}>
                            <Button type="button" className="btn btn-outline-success btn-sm"> <i className="flaticon2-open-text-book"></i> Bill Generate</Button>
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
                <div className="row" style={{"height":"25px"}}>
                    <div className="col-md-2">
                        <select className="form-control form-control-sm" value={this.state.entities.per_page} onChange={this.changePerPage} style={{ "borderColor": "#e4e6ef" }}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                    <div className="col-md-2" style={{"paddingTop":"6px"}}> of {this.state.entities.total}</div>
                    <div className="col-md-4">
                        {(this.state.entities.data && this.state.entities.data.length > 0) &&
                            <nav>
                                <ul className="pagination">
                                    <li className="page-item">
                                        <button className="page-link" disabled={1 === this.state.entities.current_page} onClick={() => this.changePage(this.state.entities.current_page - 1)}>
                                            ??
                                        </button>
                                    </li>
                                    {this.pageList()}
                                    <li className="page-item">
                                        <button className="page-link" disabled={this.state.entities.last_page === this.state.entities.current_page} onClick={() => this.changePage(this.state.entities.current_page + 1)}>
                                            ??
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        }
                    </div>
                    <div className="col-md-4">
                        <input type="text" placeholder="Search all columns" value={this.state.globalSearch} onChange={this.changeGlobalSearch} className="form-control form-control-sm" style={{ "borderColor": "#e4e6ef" }} />
                    </div>
                </div>
                <br />
                <div className="table-responsive" style={{ 'height': '345px'}}>
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
            </>
        );
    }

}

export default BillCreateToDoList;
import React, { Component } from 'react';
import { Spinner } from "react-bootstrap";


const columns = [
	{ 'value': 'equipmentEmiId', 'title': 'Id', 'htmtStyle': { minWidth: '100px' } },
	{ 'value': 'equipmentName', 'title': 'Equipment Name', 'htmtStyle': { minWidth: '200px' } },
	{ 'value': 'equipmentCode', 'title': 'Equipment Code', 'htmtStyle': { minWidth: '120px' } },
	{ 'value': 'fixedAssetCode', 'title': 'Fixed Asset Code', 'htmtStyle': { minWidth: '200px' } },
	{ 'value': 'landedCost', 'title': 'Landed Cost' },
	{ 'value': 'accumulatedDepreciation', 'title': 'Accumulated Depreciation' },
	{ 'value': 'equipmentValue', 'title': 'Equipment Value' },
	{ 'value': 'usefulLife', 'title': 'Useful Life' },
	{ 'value': 'interestEffectiveDate', 'title': 'Interest Effective Date' },
	{ 'value': 'interestPeriod', 'title': 'Interest Period' },
	{ 'value': 'interestRate', 'title': 'Interest Rate', 'htmtStyle': { minWidth: '120px' } },
	{ 'value': 'emiAmount', 'title': 'EMI Amount', 'htmtStyle': { minWidth: '120px' } }
];

const url = process.env.REACT_APP_API_URL + "equipment/equipment_emi_dt";

class EquipmentEmiSetupDt extends Component {
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
			order: 'ASC',
			/*new obj*/
			limit: '10',
			// offset: 0,
			orderBy: 'Id',
			orderType: 'ASC',
			globalSearch: '',
			columns: {
				'equipmentEmiId': {
					filterType: 'like',
					filterValue: ''
				},
				'equipmentName': {
					filterType: 'like',
					filterValue: ''
				},
				'equipmentCode': {
					filterType: 'like',
					filterValue: ''
				},
				'fixedAssetCode': {
					filterType: 'like',
					filterValue: ''
				},
				'landedCost': {
					filterType: 'like',
					filterValue: ''
				},
				'accumulatedDepreciation': {
					filterType: 'like',
					filterValue: ''
				},
				'equipmentValue': {
					filterType: 'like',
					filterValue: ''
				},
				'usefulLife': {
					filterType: 'like',
					filterValue: ''
				},
				'interestEffectiveDate': {
					filterType: 'like',
					filterValue: ''
				},
				'interestPeriod': {
					filterType: 'like',
					filterValue: ''
				},
				'interestRate': {
					filterType: 'like',
					filterValue: ''
				},
				'emiAmount': {
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
				//console.log(this.state.entities);
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
				return <th th style={{ "textAlign": "center" }}>
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
					<td className="text-center">{value.equipmentEmiId}</td>
					<td className="text-center">{value.equipmentName}</td>
					<td className="text-center">{value.equipmentCode}</td>
					<td className="text-center">{value.fixedAssetCode}</td>
					<td className="text-center">{value.landedCost}</td>
					<td className="text-center">{value.accumulatedDepreciation}</td>
					<td className="text-center">{value.equipmentValue}</td>
					<td className="text-center">{value.usefulLife}</td>
					<td className="text-center">{value.interestEffectiveDate}</td>
					<td className="text-center">{value.interestPeriod}</td>
					<td className="text-center">{value.interestRate}</td>
					<td className="text-center">{value.emiAmount}</td>
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
					<table className="table table-sm table-hover table-bordered table-condensed">
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

export default EquipmentEmiSetupDt;
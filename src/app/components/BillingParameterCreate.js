import React, { Component } from 'react';
class BillingParameterCreate extends Component {
	constructor(props) {
		super(props);
		this.state = { parameterName: "", parameterValue: "" }
	}
	handleInputOnChange = evt => {
		//this.setState({[evt.target.name]:evt.target.value});
		this.setState({ 'parameterName': evt.target.value });

	}

	render() {
		return (
			<form>
				<div className="card-body">

					<div className="form-group row">
						<label for="" className="col-2 col-form-label">Parameter Name</label>
						<div className="col-10">
							<input className="form-control" type="text" name="parameterName" id="parameterName" value={this.state.parameterName} onChange={this.handleInputOnChange} />
						</div>
					</div>
					<div className="form-group row">
						<label for="" className="col-2 col-form-label">Parameter Name</label>
						<div className="col-10">
							<input className="form-control" type="text" name="parameterName" id="parameterName" value={this.state.parameterName} onChange={this.handleInputOnChange} />
						</div>
					</div>


				</div>
				<div className="card-footer">
					<div className="row">
						<div className="col-2">
						</div>
						<div className="col-10">
							<button type="reset" className="btn btn-success mr-2">Submit</button>
							<button type="reset" className="btn btn-secondary">Cancel</button>
						</div>
					</div>
				</div>
			</form>
		);
	}
}

export default BillingParameterCreate;
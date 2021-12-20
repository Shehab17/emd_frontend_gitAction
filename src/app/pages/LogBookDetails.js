import React, { Component } from 'react';
import { getGetRequestOptions } from "../components/GetToken";
import "./../../style/table.css";

class LogBookDetails extends Component {
    state = {
        logEntryTrackId: "",
        details:{},
        logData:[
            {dateWiseData:[]}
        ]
    }

    componentDidMount() {
        const {
            params: { logEntryTrackId }
        } = this.props.match;
        this.setState({ logEntryTrackId: this.props.match.params.logEntryTrackId });
        this.getLogEntryDetails(logEntryTrackId);
    }

    getLogEntryDetails(logEntryTrackId) {
        fetch(process.env.REACT_APP_API_URL + "log_book/details/" + logEntryTrackId,
        getGetRequestOptions())
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({details:resp.details,logData:resp.logData})
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }
    
    tableBody() {
        const tbodies = this.state.logData.map((value, index) => {
            const dateWiseData = Object.values(value.dateWiseData);
            var consumption = ['usedLtr','runHourPerKm','startingHrsMeter','closingHrsMeter','openingBalance','received','closingBalance'];
            var consumptionLabel = ['Used (Ltr)','Run Hour/KM','Starting Hrs Meter','Closing Hrs Meter','Opening Balance','Received','Closing Balance'];
            
            const comsumptionRows = consumption.map((sv, i) => {
                const slNo = i === 0 ? <td rowSpan={7}>{index+1}</td> : null;
                const equipmentName = i === 0 ? <td rowSpan={7}>{value.equipmentName}</td> : null;
                const equipmentCode = i === 0 ? <td rowSpan={7}>{value.equipmentCode}</td> : null;
                const manufacturer = i === 0 ? <td rowSpan={7}>{value.manufacturer}</td> : null;
                const model = i === 0 ? <td rowSpan={7}>{value.model}</td> : null;
                const capacity = i === 0 ? <td rowSpan={7}>{value.capacity}</td> : null;
                const operator = i === 0 ? <td rowSpan={7}>{value.operator}</td> : null;
                const tankCapacity = i === 0 ? <td rowSpan={7}>{value.tankCapacity}</td> : null;
                const closingTankBalance = i === 0 ? <td rowSpan={7}>{value.closingTankBalance}</td> : null;
                const breakdown = i === 0 ? <td rowSpan={7}>{value.breakdown}</td> : null;
                return ([
                    <tr key={i}>
                        {slNo}
                        {equipmentName}
                        {equipmentCode}
                        {manufacturer}
                        {model}
                        {capacity}
                        {operator}
                        {tankCapacity}
                        {closingTankBalance}
                        {breakdown}
                        <td>{consumptionLabel[i]}</td>
                        {dateWiseData.map((item,index) =>
                            <td>{item[sv]}</td>
                         )}                    
                    </tr>
                ]);
            });
            return (
                <>
                    {comsumptionRows}
                </>
            );
        });

        return tbodies;
    }

    render() {
        return (
            <>
                <div className="card card-custom">
                    <div className="card-header">
                        <div className="card-title">
                            <h3 className="card-label">
                                Log Book Details for {this.state.details.month} Month {this.state.details.projectName}
                            </h3>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="col-8">
                            <table className="table table-bordered table-condensed">
                                <tbody>
                                    <tr>
                                        <th>Business Unit</th>
                                        <td>{this.state.details.projectName}</td>
                                    </tr>
                                    <tr>
                                        <th>Month</th>
                                        <td>{this.state.details.month}</td>
                                    </tr>
                                    <tr>
                                        <th>Year</th>
                                        <td>{this.state.details.year}</td>
                                    </tr>                                        
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-12">
                            <div className="tableFixHead">
                                <div className="table-responsive" style={{maxHeight: "500px"}}>
                                    <table className="table table-bordered table-hover" style={{minWidth: "max-content"}}>
                                        <thead>
                                            <tr>
                                                <th>SL No</th>
                                                <th>Equipment</th>
                                                <th>Code</th>
                                                <th>Manufacturer</th>
                                                <th>Model</th>
                                                <th>Capacity</th>
                                                <th>Operator Name</th>
                                                <th>Tank Capacity</th>
                                                <th>Closing Tank Balance</th>
                                                <th>Breakdown</th>
                                                <th>Consumption</th>
                                                {this.state.logData[0]['dateWiseData'].map((item,index) =>
                                                    <th>{item.logDate}</th>
                                                )}
                                            </tr>

                                        </thead>
                                        <tbody>
                                            {this.tableBody()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <pre>
                        {JSON.stringify(this.state, null, 2)}
                    </pre> */}
                </div>
            </>
        );
    }
}

export default LogBookDetails;
import React, { Component } from 'react';
import MakeCreate from '../components/MakeCreate';
import MakeDt from '../components/MakeDt';
class Make extends Component {

    constructor(props) {
        super(props);
        this.state = { newMake: "", name: "" }
    }
    onCreate = (newMake) => {
        this.setState({ newMake: newMake });
    }
    onAction = (id, name) => {
        this.setState({ id: id, name: name });
    }
    render() {
        return (
            <div className="card card-custom">

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Make Setup</p></h3>
                </div>

                <div className="card-body">
                    <MakeCreate onCreate={this.onCreate} id={this.state.id} name={this.state.name} />
                </div>

                <div className="card-header">
                    <h3 className="card-title"><p className="text-primary">Make List</p></h3>
                </div>
                <div className="card-body">
                    <MakeDt addnewMake={this.state.newMake} onAction={this.onAction} />
                </div>

            </div >

        );
    }
}

export default Make;
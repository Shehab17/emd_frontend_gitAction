import React, { Component } from 'react';
import EmoReceiveToDoList from '../components/toDoList/EmoReceiveToDoList';
import MaintenanceOrderTodo from '../components/toDoList/MaintenanceOrderTodo'
import BillCreateToDoList from '../components/toDoList/BillCreateToDoList';
import LogBookImportToDoList from '../components/toDoList/LogBookImportToDoList';


class ToDoList extends Component {
    state = {
        toDoListPermission:[]
    }

    componentDidMount() {
        const { toDoListPermission, ...baseState } = this.state;
        this.baseState = baseState;
        this.getToDoListPermission();
    }

	getToDoListPermission() {
		const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }
        fetch(process.env.REACT_APP_API_URL + "emd/to_do_list_permission", {
			method: "GET",
			headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + jwt().token },
        })
        .then((resp) => {
            return resp.json()
        })
        .then((resp) => {
            this.setState({ toDoListPermission: resp });
        })
        .catch((error) => {
            console.log(error, "catch the hoop")
        });

    }

    render() {
        return (
            <>
            {this.state.toDoListPermission.includes(42) && 
                <div className="card card-custom" style={{"height":"480px"}}>

                    <div className="card-header" style={{"minHeight":"35px"}}>
                        <h3 className="card-title"><p className="text-primary">Maintenance Order Confirmation To Do</p></h3>
                    </div>
                    <div className="card-body" style={{"marginTop":"-20px"}}>
                        <MaintenanceOrderTodo />
                    </div>
                </div>
            }
            {this.state.toDoListPermission.includes(14) && 
                 <div className="card card-custom" style={{"height":"450px","marginTop":"15px"}}>

                    <div className="card-header" style={{"minHeight":"35px"}}>
                        <h3 className="card-title"><p className="text-primary">Emo Receive To Do List</p></h3>
                    </div>
    
                    <div className="card-body" style={{"marginTop":"-20px"}}>
                        <EmoReceiveToDoList />
                    </div>
                </div>
            }
            {this.state.toDoListPermission.includes(24) && 
                <div className="card card-custom" style={{"height":"435px","marginTop":"15px"}}>

                    <div className="card-header" style={{"minHeight":"35px"}}>
                        <h3 className="card-title"><p className="text-primary">Bill Create To Do List</p></h3>
                    </div>

                    <div className="card-body" style={{"marginTop":"-20px"}}>
                        <BillCreateToDoList />
                    </div>
                </div>
            }
            {this.state.toDoListPermission.includes(72) && 
                <div className="card card-custom" style={{"height":"450px","marginTop":"15px"}}>

                    <div className="card-header" style={{"minHeight":"35px"}}>
                        <h3 className="card-title"><p className="text-primary">Log Book Import To Do List</p></h3>
                    </div>

                    <div className="card-body" style={{"marginTop":"-20px"}}>
                        <LogBookImportToDoList />
                    </div>
                </div>
            }
            </>
        );
    }
}

export default ToDoList;
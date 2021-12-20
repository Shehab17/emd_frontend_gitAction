import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { LayoutSplashScreen } from "../../_metronic/layout";
const jwt = () => { return JSON.parse(localStorage.getItem('MyToken')); }

class Logout extends Component {
    componentDidMount() {
        this.Logout();
        localStorage.removeItem('MyToken');
        window.location.href = process.env.REACT_APP_LOGIN + "login/index/" + encodeURIComponent(window.btoa(process.env.REACT_APP_URL));
    }

    Logout() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'jwt': jwt })
        };
        fetch(process.env.REACT_APP_LOGIN + "login/logout_view", requestOptions)
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                console.log(resp);

            })
            .catch((error) => {
                console.log(error, "catch the hoop")
            });
    }

    render() {
        return jwt ? <LayoutSplashScreen /> : <Redirect to="/" />;
    }
}

export default Logout;

/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import React from "react";
import { Route, Switch } from "react-router-dom";
import { Layout } from "../_metronic/layout";
import BasePage from "./BasePage";
import ErrorsPage from "./modules/ErrorsExamples/ErrorsPage";
import Logout from "./pages/Logout";

export function Routes() {

    var redirect_url = process.env.REACT_APP_URL;
    redirect_url = btoa(redirect_url);
    redirect_url = encodeURIComponent(redirect_url);
    //const token = {"token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI0MyIsImlkIjoiNDMiLCJpc3N1ZWRBdCI6IjIwMjAtMDUtMTZUMDg6NTM6MjUrMDIwMCIsInR0bCI6MzE1Mzk5OTk5OTksInN1YiI6IjQzIn0.lvFrufv7KBSDv77nBQuuSv0NZlqkUpM8-2q3wRyhl4Y"};
    //localStorage.setItem("MyToken", JSON.stringify(token));
     const  jwt = JSON.parse(localStorage.getItem('MyToken'));
     console.log(jwt);

    return (
        <Switch>

            <Route path="/error" component={ErrorsPage}/>
            <Route path="/logout" component={Logout}/>

            {!jwt ? (
            /* Redirect to `/auth` when user is not authorized */
            <Route path='/' component={() => { 
                window.location.href = process.env.REACT_APP_LOGIN + 'login/index/'+ redirect_url; 
                return null;
            }}/>
            ) 
            :(
                <Layout>
                    <BasePage/>
                </Layout>
            )}
        </Switch>
    );
}

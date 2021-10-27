import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Switch
} from "react-router-dom";


import PublicRoutes from "./routes/PublicRoutes/PublicRoutes";
import PrivateRoutes from "./routes/PrivateRoutes/PrivateRoutes";
// import OneTimeRoutes from "./routes/OneTimeRoutes/OneTimeRoutes"
//guards
import AuthGuard from "./routes/Guards/AuthGuard";
import NoGuard from "./routes/Guards/NoGuard";
import LoaderComponent from "./Components/LoaderCompoent/LoaderCompoent";

class Application extends Component {
  render() {
    return (
      <React.Fragment>
        <LoaderComponent></LoaderComponent>
        <Router>
          <Switch>
            <AuthGuard path={`/auth`} component={PrivateRoutes} />
              
            <NoGuard path={`/`} component={PublicRoutes} />
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

export default Application;

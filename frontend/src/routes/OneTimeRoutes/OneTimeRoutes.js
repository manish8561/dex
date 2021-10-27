import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { withRouter } from "react-router";
import Home from "../../Pages/Public/Home/Home"


class OneTimeRoutes extends Component {
  state = {};
  render() {
    return (
      <>
        <Switch>

          <Route
            path={`/Home`}
            component={Home}
            exact={true}
          />


        </Switch>

      </>
    );
  }
}

export default withRouter(OneTimeRoutes);

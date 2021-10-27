import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import {getToken} from "../../Helpers/storageHelper";
import {AUTH_TOKEN_KEY, HOME_ROUTE} from "../../constant"

const FirstTimeLoginGuard = ({ component: Component, ...rest }) => {
  const { token ,isUserFirstTimeLogin} = rest;
  var isAuthenticated = false;
  var tokens = getToken(AUTH_TOKEN_KEY);
  
  if (tokens!==null && isUserFirstTimeLogin==0) {
    isAuthenticated = true;
  }

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated && isUserFirstTimeLogin==0 ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: `${HOME_ROUTE}signIn`,
              state: {
                from: props.location
              }
            }}
          />
        )
      }
    />
  );
};

const mapStateToProps = state => {
  return {
    token: true,
    isUserFirstTimeLogin:state.persist.isUserFirstTimeLogin
  };
};

export default connect(
  mapStateToProps,
  null
)(FirstTimeLoginGuard);

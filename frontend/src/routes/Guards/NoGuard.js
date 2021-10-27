import React, { Component } from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { AUTH_TOKEN_KEY, HOME_ROUTE } from "../../constant";
import {getToken,removeToken} from "../../Helpers/storageHelper";

const NoGuard = ({ component: Component, ...rest }) => {

  const { token,isUserFirstTimeLogin } = rest;
 var tokens = getToken(AUTH_TOKEN_KEY);
//  removeToken(AUTH_TOKEN_KEY)
  var isAuthenticated = false;
  if (tokens == null || tokens==undefined) {
  
    isAuthenticated = true;
  }

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname:`${HOME_ROUTE}auth/dashboard`,
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

const mapStateToProps = (state) => {
  return {
    isUserFirstTimeLogin:state.persist.isUserFirstTimeLogin

  };
};

export default connect(mapStateToProps, null)(NoGuard);

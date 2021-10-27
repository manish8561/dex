import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { getToken } from "../../Helpers/storageHelper";
import { AUTH_TOKEN_KEY } from "../../constant"

const AuthGuard = ({ component: Component, ...rest }) => {
  const { isUserFirstTimeLogin } = rest;
  var isAuthenticated = false;
  var tokens = getToken(AUTH_TOKEN_KEY);
  if (tokens !== null) {


    if (isUserFirstTimeLogin == 0) {
      isAuthenticated = false;
    } else {
      // isUserFirstTimeLogin (1,2);
      isAuthenticated = true;
    }

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
              pathname: tokens == null ? '/signIn' : isUserFirstTimeLogin == 0 ? `/secure/authenticator` : isUserFirstTimeLogin == 1 ? `/auth/dashboard` : `/signIn`,
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
  console.log("AUTH STATE", state)
  return {
    isUserFirstTimeLogin: state.persist.isUserFirstTimeLogin

  };
};

export default connect(
  mapStateToProps,
  null
)(AuthGuard);

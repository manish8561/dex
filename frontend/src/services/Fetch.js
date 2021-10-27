import axios from "axios";
import { toast } from "../Components/Toast/Toast";
import {removeToken} from "../Helpers/storageHelper"
import {AUTH_TOKEN_KEY} from  "../constant"
export { _fetch as fetch };

function handleError(error, reject) {
  console.log("ERRRRR",error)
  if (!error) {
    toast.error("Something went wrong, Please try again");
  }
  if (error) {
    if (error.data === "jwt expired") {
      toast.error("Session expired");
      setTimeout(() => {
        localStorage.clear();
        removeToken(AUTH_TOKEN_KEY);
        window.location.reload();
      }, 2000);

  }
  reject(error);
  return;
}
}

function handleResponse(successs, resolve) {
  resolve(successs);
  return;
}

function setMehod(method, path, body, options, params) {
  let config = {};
  if (options) {
    if (options.jwt) {
      config.headers = {
        "api-access-token": options.jwt
      };
    }
  }
  params = params ? "?" + new URLSearchParams(params).toString() : "";
  if (method === "get" || method === "delete") {
    return axios[method](`${path}${params}`, config);
  }
  if (method === "post" || method === "put") {
    return axios[method](`${path}`, body, config);
  }
}

function _fetch(method, path, body, options, params) {
  return new Promise((resolve, reject) => {
    return setMehod(method, path, body, options, params)
      .then(function(response) {
        handleResponse(response, resolve);
        return;
      })
      .catch(function(error) {
        handleError(error.response, reject);
        return;
      });
  });
}

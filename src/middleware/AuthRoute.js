import React from "react";
import Auth from "./Auth";
import { Redirect } from "react-router-dom";

function RequireAuth({ children, ...rest }) {
    return Auth.Check(rest.isLogin) ? children : <Redirect
        to={{
            pathname: "/login",
            state: { from: location }
        }}
    />;
}

export default RequireAuth;

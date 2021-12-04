import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { Switch, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import App from "./App";
import cloureveApp from "./reducers";
import { UpdateSiteConfig } from "./middleware/Init";
import ErrorBoundary from "react-error-boundary";
import ErrorFallback from "./component/Placeholder/ErrorBoundary";
import { createBrowserHistory } from "history";
import { routerMiddleware } from "connected-react-router";
import { ConnectedRouter } from "connected-react-router";

const Admin = React.lazy(() => import("./Admin"));
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as en from "./locales/en-US.json";
import * as zhCn from "./locales/zh-CN.json";

i18n
    .use(initReactI18next)
    .init({
        resources: {
            "en-US": {
                translation: en
            },
            "zh-CN": {
                translation: zhCn
            }
        },
        lng: "en-US",
        interpolation: {
            escapeValue: false
        }
    });

if (window.location.hash !== "") {
    window.location.href = window.location.hash.split("#")[1];
}

serviceWorker.register();
export const history = createBrowserHistory();
let reduxEnhance = applyMiddleware(routerMiddleware(history), thunk);
if (
    process.env.NODE_ENV === "development" &&
    window.__REDUX_DEVTOOLS_EXTENSION__
) {
    reduxEnhance = compose(reduxEnhance, window.__REDUX_DEVTOOLS_EXTENSION__());
}

const store = createStore(cloureveApp(history), reduxEnhance);
UpdateSiteConfig(store);

ReactDOM.render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <Switch>
                    <Route path="/admin">
                        <Suspense fallback={"Loading..."}>
                            <Admin />
                        </Suspense>
                    </Route>
                    <Route exact path="">
                        <App />
                    </Route>
                </Switch>
            </ConnectedRouter>
        </Provider>
    </ErrorBoundary>,
    document.getElementById("root")
);

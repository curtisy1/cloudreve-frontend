import { useTranslation, withTranslation } from "react-i18next";
import React from "react";
import { withStyles } from "@material-ui/core";

const styles = {
    h1: {
        color: "#a4a4a4",
        margin: "5px 0px"
    },
    h2: {
        margin: "15px 0px"
    }
};

function ErrorBoundary(props) {
    const { classes, error } = props;
    const { t } = useTranslation();

    return <>
        <h1 className={classes.h1}>:(</h1>
        <h2 className={classes.h2}>
            {t("There was an error in page rendering, please try to refresh this page.")}
        </h2>
        {this.state.error &&
            this.state.errorInfo &&
            this.state.errorInfo.componentStack && (
                <details>
                    <summary>{t("Error details")}</summary>
                    <pre>
                    <code>{error.message}</code>
                    </pre>
                </details>
            )}
    </>;
}

export default withTranslation()(withStyles(styles)(ErrorBoundary));

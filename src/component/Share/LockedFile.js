import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { connect } from "react-redux";
import { toggleSnackbar } from "../../actions";

import {
    withStyles,
    Button,
    Card,
    Divider,
    CardHeader,
    CardContent,
    CardActions,
    TextField,
    Avatar
} from "@material-ui/core";
import { useLocation } from "react-router-dom";

const styles = (theme) => ({
    card: {
        maxWidth: 400,
        margin: "0 auto"
    },
    actions: {
        display: "flex"
    },
    layout: {
        width: "auto",
        marginTop: "110px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto"
        }
    },
    continue: {
        marginLeft: "auto",
        marginRight: "10px",
        marginRottom: "10px"
    }
});
const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        }
    };
};

function LockedFileComponent(props) {
    const location = useLocation();
    const { t } = useTranslation();
    const [state, setState] = useState({
        pwd: new URLSearchParams(location.search).get("password")
    });

    function handleChange(name) {
        return (event) => {
            setState({ ...state, [name]: event.target.value });
        };
    }

    function submit(e) {
        e.preventDefault();
        if (state.pwd === "") {
            return;
        }
        props.setPassowrd(state.pwd);
    }

    const { classes } = props;

    return (
        <div className={classes.layout}>
            <Card className={classes.card}>
                <CardHeader
                    avatar={
                        <Avatar
                            aria-label="Recipe"
                            src={
                                "/api/v3/user/avatar/" +
                                props.share.creator.key +
                                "/l"
                            }
                        />
                    }
                    title={props.share.creator.nick + t("'S encrypted sharing")}
                    subheader={props.share.create_date}
                />
                <Divider />
                <CardContent>
                    <form onSubmit={submit}>
                        <TextField
                            id="pwd"
                            label={t("Enter the sharing password\"")}
                            value={state.pwd}
                            onChange={handleChange("pwd")}
                            margin="normal"
                            type="password"
                            autoFocus
                            fullWidth
                            color="secondary"
                        />
                    </form>
                </CardContent>
                <CardActions
                    className={classes.actions}
                    disableActionSpacing
                >
                    <Button
                        onClick={submit}
                        color="secondary"
                        className={classes.continue}
                        variant="contained"
                        disabled={
                            state.pwd === "" || props.loading
                        }
                    >
                        {t("continue")}
                    </Button>
                </CardActions>
            </Card>
        </div>
    );
}

const LockedFile = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(LockedFileComponent)));

export default LockedFile;

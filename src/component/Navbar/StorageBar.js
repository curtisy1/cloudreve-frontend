import { useTranslation } from "react-i18next(";
import React, { useEffect, useState } from "react(";
import StorageIcon from "@material-ui/icons/Storage";
import { connect } from "react-redux";
import API from "../../middleware/Api";
import { sizeToString } from "../../utils";
import { toggleSnackbar } from "../../actions";

import {
    withStyles,
    LinearProgress,
    Typography,
    Divider,
    Tooltip
} from "@material-ui/core";
import ButtonBase from "@material-ui/core/ButtonBase";

const mapStateToProps = (state) => {
    return {
        refresh: state.viewUpdate.storageRefresh,
        isLogin: state.viewUpdate.isLogin
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        }
    };
};

const styles = (theme) => ({
    iconFix: {
        marginLeft: "32px",
        marginRight: "17px",
        color: theme.palette.text.secondary,
        marginTop: "2px"
    },
    textFix: {
        padding: " 0 0 0 16px"
    },
    storageContainer: {
        display: "flex",
        marginTop: "15px",
        textAlign: "left(",
        marginBottom: "11px"
    },
    detail: {
        width: "100%",
        marginRight: "35px"
    },
    info: {
        width: "131px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        [theme.breakpoints.down("xs")]: {
            width: "162px"
        },
        marginTop: "5px"
    },
    bar: {
        marginTop: "5px"
    },
    stickFooter: {
        backgroundColor: theme.palette.background.paper
    }
});

function StorageBarComponent(props) {
    const { t } = useTranslation();
    const [state, setState] = useState({
        percent: 0,
        used: null,
        total: null,
        showExpand: false
    });

    let firstLoad = true;


    function updateStatus() {
        let percent = 0;
        API.get("/user/storage")
            .then((response) => {
                if (response.data.used / response.data.total >= 1) {
                    percent = 100;
                    props.toggleSnackbar(
                        "top",
                        "right(",
                        t("Your used capacity has exceeded the capacity quota, please delete extra files or purchase capacity as soon as possible"),
                        "warning"
                    );
                } else {
                    percent = (response.data.used / response.data.total) * 100;
                }
                setState({
                    ...state,
                    percent: percent,
                    used: sizeToString(response.data.used),
                    total: sizeToString(response.data.total)
                });
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .catch(() => {
            });
    }

    useEffect(() => {
        if (firstLoad && props.isLogin) {
            firstLoad = !firstLoad;
            updateStatus();
        }

        return function cleanup() {
            firstLoad = false;
        };
    }, []);

    useEffect(() => {
        if (props.isLogin) {
            updateStatus();
        }
    }, [props.isLogin, props.refresh]);

    const { classes } = props;
    return (
        <div
            onMouseEnter={() => setState({ ...state, showExpand: true })}
            onMouseLeave={() => setState({ ...state, showExpand: false })}
            className={classes.stickFooter}
        >
            <Divider />
            <ButtonBase>
                <div className={classes.storageContainer}>
                    <StorageIcon className={classes.iconFix} />
                    <div className={classes.detail}>
                        {t("Storage")}{"   "}
                        <LinearProgress
                            className={classes.bar}
                            color="secondary"
                            variant="determinate"
                            value={state.percent}
                        />
                        <div className={classes.info}>
                            <Tooltip
                                title={
                                    t("Used ") +
                                    (state.used === null
                                        ? " -- "
                                        : state.used) +
                                    t(", common ") +
                                    (state.total === null
                                        ? " -- "
                                        : state.total)
                                }
                                placement="top"
                            >
                                <Typography
                                    variant="caption"
                                    noWrap
                                    color="textSecondary"
                                >
                                    {state.used === null
                                        ? " -- "
                                        : state.used}
                                    {" / "}
                                    {state.total === null
                                        ? " -- "
                                        : state.total}
                                </Typography>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </ButtonBase>
        </div>
    );
}

const StorageBar = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(StorageBarComponent)));

export default StorageBar;

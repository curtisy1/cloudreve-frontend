import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { sizeToString, vhCheck } from "../../utils";
import {
    openMusicDialog,
    openResaveDialog,
    setSelectedTarget,
    showImgPreivew,
    toggleSnackbar
} from "../../actions";
import { isPreviewable } from "../../config";
import { withStyles, Button, Typography } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import TypeIcon from "../FileManager/TypeIcon";
import Auth from "../../middleware/Auth";
import API from "../../middleware/Api";
import { useHistory } from "react-router-dom";
import Creator from "./Creator";
import pathHelper from "../../utils/page";

vhCheck();
const styles = (theme) => ({
    layout: {
        width: "auto",
        marginTop: "90px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginTop: "90px",
            marginLeft: "auto",
            marginRight: "auto"
        },
        [theme.breakpoints.down("sm")]: {
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0
        },
        justifyContent: "center",
        display: "flex"
    },
    player: {
        borderRadius: "4px"
    },
    fileCotainer: {
        width: "200px",
        margin: "0 auto"
    },
    buttonCotainer: {
        width: "400px",
        margin: "0 auto",
        textAlign: "center",
        marginTop: "20px"
    },
    paper: {
        padding: theme.spacing(2)
    },
    icon: {
        borderRadius: "10%",
        marginTop: 2
    },

    box: {
        width: "100%",
        maxWidth: 440,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 12,
        boxShadow: "0 8px 16px rgba(29,39,55,.25)",
        [theme.breakpoints.down("sm")]: {
            height: "calc(var(--vh, 100vh) - 56px)",
            borderRadius: 0,
            maxWidth: 1000
        },
        display: "flex",
        flexDirection: "column"
    },
    boxContent: {
        padding: 24,
        display: "flex",
        flex: "1"
    },
    fileName: {
        marginLeft: 20
    },
    fileSize: {
        color: theme.palette.text.disabled,
        fontSize: 14
    },
    boxFooter: {
        display: "flex",
        padding: "20px 16px",
        justifyContent: "space-between"
    },
    downloadButton: {
        marginLeft: 8
    }
});
const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        openMusicDialog: () => {
            dispatch(openMusicDialog());
        },
        setSelectedTarget: (targets) => {
            dispatch(setSelectedTarget(targets));
        },
        showImgPreivew: (first) => {
            dispatch(showImgPreivew(first));
        },
        openResave: (key) => {
            dispatch(openResaveDialog(key));
        }
    };
};

const Modals = React.lazy(() => import("../FileManager/Modals"));
const ImgPreview = React.lazy(() => import("../FileManager/ImgPreview"));

function SharedFileComponent(props) {
    const [state, setState] = useState({
        anchorEl: null,
        open: false,
        purchaseCallback: null,
        loading: false
    });

    const { t } = useTranslation();
    const history = useHistory();

    // TODO merge into react thunk
    function preview() {
        if (pathHelper.isSharePage(props.location.pathname)) {
            const user = Auth.GetUser();
            if (!Auth.Check() && user && !user.group.shareDownload) {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("please log in first"),
                    "warning"
                );
                return;
            }
        }

        switch (isPreviewable(props.share.source.name)) {
            case "img":
                props.showImgPreivew({
                    key: props.share.key,
                    name: props.share.source.name
                });
                return;
            case "msDoc":
                history.push(
                    props.share.key +
                    "/doc?name=" +
                    encodeURIComponent(props.share.source.name)
                );
                return;
            case "audio":
                props.setSelectedTarget([
                    {
                        key: props.share.key,
                        type: "share"
                    }
                ]);
                props.openMusicDialog();
                return;
            case "video":
                history.push(
                    props.share.key +
                    "/video?name=" +
                    encodeURIComponent(props.share.source.name)
                );
                return;
            case "edit":
                history.push(
                    props.share.key +
                    "/text?name=" +
                    encodeURIComponent(props.share.source.name)
                );
                return;
            case "pdf":
                history.push(
                    props.share.key +
                    "/pdf?name=" +
                    encodeURIComponent(props.share.source.name)
                );
                return;
            case "code":
                history.push(
                    props.share.key +
                    "/code?name=" +
                    encodeURIComponent(props.share.source.name)
                );
                return;
            default:
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("This file cannot be previewed"),
                    "warning"
                );
                return;
        }
    }

    useEffect(() => {
        return function cleanup() {
            props.setSelectedTarget([]);
        };
    }, []);

    function scoreHandle(callback) {
        return (event) => {
            callback(event);
        };
    }

    function download() {
        setState({ ...state, loading: true });
        API.put("/share/download/" + props.share.key)
            .then((response) => {
                window.location.assign(response.data);
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "warning"
                );
            })
            .then(() => {
                setState({ ...state, loading: false });
            });
    }

    const { classes } = props;
    return (
        <div className={classes.layout}>
            <Modals />
            <ImgPreview />
            <div className={classes.box}>
                <Creator share={props.share} />
                <Divider />
                <div className={classes.boxContent}>
                    <TypeIcon
                        className={classes.icon}
                        isUpload
                        fileName={props.share.source.name}
                    />
                    <div className={classes.fileName}>
                        <Typography style={{ wordBreak: "break-all" }}>
                            {props.share.source.name}
                        </Typography>
                        <Typography className={classes.fileSize}>
                            {sizeToString(props.share.source.size)}
                        </Typography>
                    </div>
                </div>
                <Divider />
                <div className={classes.boxFooter}>
                    <div className={classes.actionLeft}>
                        {props.share.preview && (
                            (<Button
                                variant="outlined"
                                color="secondary"
                                onClick={scoreHandle(preview)}
                                disabled={state.loading}
                            >
                                {t("Preview")}
                            </Button>)
                        )}
                    </div>
                    <div className={classes.actions}>
                        <Button
                            variant="contained"
                            color="secondary"
                            className={classes.downloadButton}
                            onClick={scoreHandle(download)}
                            disabled={state.loading}
                        >
                            {t("download")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const SharedFile = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(SharedFileComponent)));

export default SharedFile;

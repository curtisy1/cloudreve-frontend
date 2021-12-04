import {
    ButtonBase,
    Divider,
    Tooltip,
    Typography,
    withStyles,
    fade
} from "@material-ui/core";
import classNames from "classnames";
import React, { useState } from "react";
import ContentLoader from "react-content-loader";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { connect } from "react-redux";
import { baseURL } from "../../middleware/Api";
import pathHelper from "../../utils/page";
import TypeIcon from "./TypeIcon";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import statusHelper from "../../utils/page";
import Grow from "@material-ui/core/Grow";

const styles = (theme) => ({
    container: {
        padding: "7px"
    },

    selected: {
        "&:hover": {
            border: "1px solid #d0d0d0"
        },
        backgroundColor: fade(
            theme.palette.primary.main,
            theme.palette.type === "dark" ? 0.3 : 0.18
        )
    },

    notSelected: {
        "&:hover": {
            backgroundColor: theme.palette.background.default,
            border: "1px solid #d0d0d0"
        },
        backgroundColor: theme.palette.background.paper
    },

    button: {
        border: "1px solid " + theme.palette.divider,
        width: "100%",
        borderRadius: "6px",
        boxSizing: "border-box",
        transition:
            "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        alignItems: "initial",
        display: "initial"
    },
    folderNameSelected: {
        color:
            theme.palette.type === "dark" ? "#fff" : theme.palette.primary.dark,
        fontWeight: "500"
    },
    folderNameNotSelected: {
        color: theme.palette.text.secondary
    },
    folderName: {
        marginTop: "15px",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden",
        marginRight: "20px"
    },
    preview: {
        overflow: "hidden",
        height: "150px",
        width: "100%",
        borderRadius: "6px 6px 0 0",
        backgroundColor: theme.palette.background.default
    },
    previewIcon: {
        overflow: "hidden",
        height: "149px",
        width: "100%",
        borderRadius: "5px 5px 0 0",
        backgroundColor: theme.palette.background.paper,
        paddingTop: "50px"
    },
    iconBig: {
        fontSize: 50
    },
    picPreview: {
        objectFit: "cover",
        width: "100%",
        height: "100%"
    },
    fileInfo: {
        height: "50px",
        display: "flex"
    },
    icon: {
        margin: "10px 10px 10px 16px",
        height: "30px",
        minWidth: "30px",
        backgroundColor: theme.palette.background.paper,
        borderRadius: "90%",
        paddingTop: "3px",
        color: theme.palette.text.secondary
    },
    hide: {
        display: "none"
    },
    loadingAnimation: {
        borderRadius: "6px 6px 0 0",
        height: "100%",
        width: "100%"
    },
    shareFix: {
        marginLeft: "20px"
    },
    checkIcon: {
        color: theme.palette.primary.main
    }
});

const mapStateToProps = (state) => {
    return {
        path: state.navigator.path,
        selected: state.explorer.selected
    };
};

const mapDispatchToProps = () => {
    return {};
};

function FileIconComponent(props = {
    share: false
}) {
    const [state, setState] = useState({
        loading: false,
        showPicIcon: false
    });

    const { classes } = props;
    const isSelected =
        props.selected.findIndex((value) => {
            return value === props.file;
        }) !== -1;
    const isSharePage = pathHelper.isSharePage(
        location.pathname
    );
    const isMobile = statusHelper.isMobile();

    return (
        <div className={classes.container}>
            <ButtonBase
                focusRipple
                className={classNames(
                    {
                        [classes.selected]: isSelected,
                        [classes.notSelected]: !isSelected
                    },
                    classes.button
                )}
            >
                {props.file.pic !== "" &&
                    !state.showPicIcon &&
                    props.file.pic !== " " &&
                    props.file.pic !== "null,null" && (
                        <div className={classes.preview}>
                            <LazyLoadImage
                                className={classNames({
                                    [classes.hide]: state.loading,
                                    [classes.picPreview]: !state
                                        .loading
                                })}
                                src={
                                    baseURL +
                                    (isSharePage
                                        ? "/share/thumb/" +
                                        window.shareInfo.key +
                                        "/" +
                                        props.file.id +
                                        "?path=" +
                                        encodeURIComponent(
                                            props.file.path
                                        )
                                        : "/file/thumb/" +
                                        props.file.id)
                                }
                                afterLoad={() =>
                                    setState({ ...state, loading: false })
                                }
                                beforeLoad={() =>
                                    setState({ ...state, loading: true })
                                }
                                onError={() =>
                                    setState({ ...state, showPicIcon: true })
                                }
                            />
                            <ContentLoader
                                height={150}
                                width={170}
                                className={classNames(
                                    {
                                        [classes.hide]: !state.loading
                                    },
                                    classes.loadingAnimation
                                )}
                            >
                                <rect
                                    x="0"
                                    y="0"
                                    width="100%"
                                    height="150"
                                />
                            </ContentLoader>
                        </div>
                    )}
                {(props.file.pic === "" ||
                    state.showPicIcon ||
                    props.file.pic === " " ||
                    props.file.pic === "null,null") && (
                    <div className={classes.previewIcon}>
                        <TypeIcon
                            className={classes.iconBig}
                            fileName={props.file.name}
                        />
                    </div>
                )}
                {(props.file.pic === "" ||
                    state.showPicIcon ||
                    props.file.pic === " " ||
                    props.file.pic === "null,null") && <Divider />}
                <div className={classes.fileInfo}>
                    {!props.share && (
                        <div
                            onClick={props.onIconClick}
                            className={classNames(classes.icon, {
                                [classes.iconSelected]: isSelected,
                                [classes.iconNotSelected]: !isSelected
                            })}
                        >
                            {(!isSelected || !isMobile) && (
                                <TypeIcon fileName={props.file.name} />
                            )}
                            {isSelected && isMobile && (
                                <Grow in={isSelected && isMobile}>
                                    <CheckCircleRoundedIcon
                                        className={classes.checkIcon}
                                    />
                                </Grow>
                            )}
                        </div>
                    )}
                    <Tooltip
                        title={props.file.name}
                        aria-label={props.file.name}
                    >
                        <Typography
                            variant="body2"
                            className={classNames(classes.folderName, {
                                [classes.folderNameSelected]: isSelected,
                                [classes.folderNameNotSelected]: !isSelected,
                                [classes.shareFix]: props.share
                            })}
                        >
                            {props.file.name}
                        </Typography>
                    </Tooltip>
                </div>
            </ButtonBase>
        </div>
    );
}

const FileIcon = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(FileIconComponent));

export default FileIcon;

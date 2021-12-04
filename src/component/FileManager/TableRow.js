import React  from "react";
import { connect } from "react-redux";

import FolderIcon from "@material-ui/icons/Folder";
import classNames from "classnames";
import { sizeToString } from "../../utils/index";
import {
    withStyles,
    TableCell,
    TableRow,
    Typography,
    fade
} from "@material-ui/core";
import TypeIcon from "./TypeIcon";
import pathHelper from "../../utils/page";
import KeyboardReturnIcon from "@material-ui/icons/KeyboardReturn";
import CheckCircleRoundedIcon from "@material-ui/icons/CheckCircleRounded";
import statusHelper from "../../utils/page";
import Grow from "@material-ui/core/Grow";
import { formatLocalTime } from "../../utils/datetime";
import { useLocation } from "react-router-dom";

const styles = (theme) => ({
    selected: {
        "&:hover": {},
        backgroundColor: fade(theme.palette.primary.main, 0.18)
    },

    selectedShared: {
        "&:hover": {},
        backgroundColor: fade(theme.palette.primary.main, 0.18)
    },

    notSelected: {
        "&:hover": {
            backgroundColor: theme.palette.background.default
        }
    },
    icon: {
        verticalAlign: "middle",
        marginRight: "20px",
        color: theme.palette.text.secondary
    },
    tableIcon: {
        marginRight: "20px",
        verticalAlign: "middle"
    },
    folderNameSelected: {
        color:
            theme.palette.type === "dark" ? "#fff" : theme.palette.primary.dark,
        fontWeight: "500",
        userSelect: "none"
    },
    folderNameNotSelected: {
        color: theme.palette.text.secondary,
        userSelect: "none"
    },
    folderName: {
        marginRight: "20px",
        display: "flex",
        alignItems: "center"
    },
    hideAuto: {
        [theme.breakpoints.down("sm")]: {
            display: "none"
        }
    },
    tableRow: {
        padding: "10px 16px"
    },
    checkIcon: {
        color: theme.palette.primary.main
    },
    active: {
        backgroundColor: fade(theme.palette.primary.main, 0.1)
    }
});

const mapStateToProps = (state) => {
    return {
        selected: state.explorer.selected
    };
};

const mapDispatchToProps = () => {
    return {};
};

function TableRowComponent(props) {
    const location = useLocation();

    const { classes } = props;
    const isShare = pathHelper.isSharePage(location.pathname);

    let icon;
    if (props.file.type === "dir") {
        icon = <FolderIcon className={classes.icon} />;
    } else if (props.file.type === "up") {
        icon = <KeyboardReturnIcon className={classes.icon} />;
    } else {
        icon = (
            <TypeIcon
                className={classes.tableIcon}
                fileName={props.file.name}
            />
        );
    }
    const isSelected =
        props.selected.findIndex((value) => {
            return value === props.file;
        }) !== -1;
    const isMobile = statusHelper.isMobile();

    return (
        <TableRow
            ref={props.pref}
            onContextMenu={props.contextMenu}
            onClick={props.handleClick}
            onDoubleClick={props.handleDoubleClick.bind(this)}
            className={classNames({
                [classes.selected]: isSelected && !isShare,
                [classes.selectedShared]: isSelected && isShare,
                [classes.notSelected]: !isSelected,
                [classes.active]: props.isActive
            })}
        >
            <TableCell
                ref={props.dref}
                component="th"
                scope="row"
                className={classes.tableRow}
            >
                <Typography
                    variant="body2"
                    className={classNames(classes.folderName, {
                        [classes.folderNameSelected]: isSelected,
                        [classes.folderNameNotSelected]: !isSelected
                    })}
                >
                    <div
                        onClick={
                            props.file.type !== "up"
                                ? props.onIconClick
                                : null
                        }
                    >
                        {(!isSelected || !isMobile) && icon}
                        {isSelected && isMobile && (
                            <Grow in={isSelected && isMobile}>
                                <CheckCircleRoundedIcon
                                    className={classNames(
                                        classes.checkIcon,
                                        classes.icon
                                    )}
                                />
                            </Grow>
                        )}
                    </div>
                    {props.file.name}
                </Typography>
            </TableCell>
            <TableCell
                className={classNames(classes.hideAuto, classes.tableRow)}
            >
                <Typography
                    variant="body2"
                    className={classNames(classes.folderName, {
                        [classes.folderNameSelected]: isSelected,
                        [classes.folderNameNotSelected]: !isSelected
                    })}
                >
                    {" "}
                    {props.file.type !== "dir" &&
                        props.file.type !== "up" &&
                        sizeToString(props.file.size)}
                </Typography>
            </TableCell>
            <TableCell
                className={classNames(classes.hideAuto, classes.tableRow)}
            >
                <Typography
                    variant="body2"
                    className={classNames(classes.folderName, {
                        [classes.folderNameSelected]: isSelected,
                        [classes.folderNameNotSelected]: !isSelected
                    })}
                >
                    {" "}
                    {formatLocalTime(
                        props.file.date,
                        "YYYY-MM-DD H:mm:ss"
                    )}
                </Typography>
            </TableCell>
        </TableRow>
    );
}

const TableItem = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(TableRowComponent));

export default TableItem;

import { useTranslation } from "react-i18next";
import {
    CircularProgress,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    withStyles
} from "@material-ui/core";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import SadIcon from "@material-ui/icons/SentimentVeryDissatisfied";
import EmptyIcon from "@material-ui/icons/Unarchive";
import classNames from "classnames";
import React, { useEffect } from "react";
import { configure, GlobalHotKeys } from "react-hotkeys";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import {
    changeContextMenu,
    navigateTo,
    navigateUp,
    openRemoveDialog,
    setSelectedTarget
} from "../../actions/index";
import explorer from "../../redux/explorer";
import { isMac } from "../../utils";
import pathHelper from "../../utils/page";
import ContextMenu from "./ContextMenu";
import ImgPreivew from "./ImgPreview";
import ObjectIcon from "./ObjectIcon";

const styles = (theme) => ({
    paper: {
        padding: theme.spacing(2),
        textAlign: "center",
        color: theme.palette.text.secondary,
        margin: "10px"
    },
    root: {
        flexGrow: 1,
        padding: "10px",
        overflowY: "auto",
        height: "calc(100vh - 113px)",
        [theme.breakpoints.up("sm")]: {
            overflowY: "auto",
            height: "calc(100vh - 113px)"
        },
        [theme.breakpoints.down("sm")]: {
            height: "100%"
        }
    },
    rootTable: {
        padding: "0px",
        backgroundColor: theme.palette.background.paper.white,
        [theme.breakpoints.up("sm")]: {
            overflowY: "auto",
            height: "calc(100vh - 113px)"
        },
        [theme.breakpoints.down("sm")]: {
            height: "100%"
        }
    },
    typeHeader: {
        margin: "10px 25px",
        color: "#6b6b6b",
        fontWeight: "500"
    },
    loading: {
        justifyContent: "center",
        display: "flex",
        marginTop: "40px"
    },
    errorBox: {
        padding: theme.spacing(4)
    },
    errorMsg: {
        marginTop: "10px"
    },
    emptyContainer: {
        bottom: "0",
        height: "300px",
        margin: "50px auto",
        width: "300px",
        color: theme.palette.text.disabled,
        textAlign: "center",
        paddingTop: "20px"
    },
    emptyIcon: {
        fontSize: "160px"
    },
    emptyInfoBig: {
        fontSize: "25px",
        color: theme.palette.text.disabled
    },
    emptyInfoSmall: {
        color: theme.palette.text.hint
    },
    hideAuto: {
        [theme.breakpoints.down("sm")]: {
            display: "none"
        }
    },
    flexFix: {
        minWidth: 0
    },
    upButton: {
        marginLeft: "20px",
        marginTop: "10px",
        marginBottom: "10px"
    },
    clickAway: {
        height: "100%",
        width: "100%"
    },
    rootShare: {
        height: "100%",
        minHeight: 500
    },
    visuallyHidden: {
        border: 0,
        clip: "rect(0 0 0 0)",
        height: 1,
        margin: -1,
        overflow: "hidden",
        padding: 0,
        position: "absolute",
        top: 20,
        width: 1
    }
});

const mapStateToProps = (state) => {
    return {
        path: state.navigator.path,
        drawerDesktopOpen: state.viewUpdate.open,
        viewMethod: state.viewUpdate.explorerViewMethod,
        sortMethod: state.viewUpdate.sortMethod,
        fileList: state.explorer.fileList,
        dirList: state.explorer.dirList,
        loading: state.viewUpdate.navigatorLoading,
        navigatorError: state.viewUpdate.navigatorError,
        navigatorErrorMsg: state.viewUpdate.navigatorErrorMsg,
        keywords: state.explorer.keywords,
        selected: state.explorer.selected
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        navigateToPath: (path) => {
            dispatch(navigateTo(path));
        },

        changeContextMenu: (type, open) => {
            dispatch(changeContextMenu(type, open));
        },
        navigateUp: () => {
            dispatch(navigateUp());
        },
        setSelectedTarget: (targets) => {
            dispatch(setSelectedTarget(targets));
        },
        openRemoveDialog: () => {
            dispatch(openRemoveDialog());
        },
        changeSort: (method) => {
            dispatch(explorer.actions.changeSortMethod(method));
        }
    };
};

function ExplorerComponent(props) {
    const keyMap = {
        DELETE_FILE: "del",
        SELECT_ALL: `${isMac() ? "command" : "ctrl"}+a`
    };

    const handlers = {
        DELETE_FILE: () => {
            if (props.selected.length > 0 && !props.share) {
                props.openRemoveDialog();
            }
        },
        SELECT_ALL: (e) => {
            e.preventDefault();
            if (
                props.selected.length >=
                props.dirList.length + props.fileList.length
            ) {
                props.setSelectedTarget([]);
            } else {
                props.setSelectedTarget([
                    ...props.dirList,
                    ...props.fileList
                ]);
            }
        }
    };

    const location = useLocation();
    const { t } = useTranslation();

    useEffect(() => {
        configure({
            ignoreTags: ["input", "select", "textarea"]
        });
    }, []);

    function contextMenu(e) {
        e.preventDefault();
        if (
            props.keywords === "" &&
            !pathHelper.isSharePage(location.pathname)
        ) {
            if (!props.loading) {
                props.changeContextMenu("empty", true);
            }
        }
    }

    function ClickAway(e) {
        const element = e.target;
        if (element.dataset.clickaway) {
            props.setSelectedTarget([]);
        }
    }

    const { classes } = props;
    const isHomePage = pathHelper.isHomePage(location.pathname);

    const showView =
        !props.loading &&
        (props.dirList.length !== 0 ||
            props.fileList.length !== 0);
    const listView = (
        <Table className={classes.table}>
            <TableHead>
                <TableRow>
                    <TableCell>
                        <TableSortLabel
                            active={
                                props.sortMethod === "namePos" ||
                                props.sortMethod === "nameRev"
                            }
                            direction={
                                props.sortMethod === "namePos"
                                    ? "asc"
                                    : "des"
                            }
                            onClick={() => {
                                props.changeSort(
                                    props.sortMethod === "namePos"
                                        ? "nameRev"
                                        : "namePos"
                                );
                            }}
                        >
                            {t("Name")}
                            {props.sortMethod === "namePos" ||
                            props.sortMethod === "nameRev" ? (
                                <span className={classes.visuallyHidden}>
                                      {props.sortMethod === "nameRev"
                                          ? "sorted descending"
                                          : "sorted ascending"}
                                  </span>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.hideAuto}>
                        <TableSortLabel
                            active={
                                props.sortMethod === "sizePos" ||
                                props.sortMethod === "sizeRes"
                            }
                            direction={
                                props.sortMethod === "sizePos"
                                    ? "asc"
                                    : "des"
                            }
                            onClick={() => {
                                props.changeSort(
                                    props.sortMethod === "sizePos"
                                        ? "sizeRes"
                                        : "sizePos"
                                );
                            }}
                        >
                            {t("Size")}
                            {props.sortMethod === "sizePos" ||
                            props.sortMethod === "sizeRes" ? (
                                <span className={classes.visuallyHidden}>
                                      {props.sortMethod === "sizeRes"
                                          ? "sorted descending"
                                          : "sorted ascending"}
                                  </span>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                    <TableCell className={classes.hideAuto}>
                        <TableSortLabel
                            active={
                                props.sortMethod === "timePos" ||
                                props.sortMethod === "timeRev"
                            }
                            direction={
                                props.sortMethod === "timePos"
                                    ? "asc"
                                    : "des"
                            }
                            onClick={() => {
                                props.changeSort(
                                    props.sortMethod === "timePos"
                                        ? "timeRev"
                                        : "timePos"
                                );
                            }}
                        >
                            {t("date")}
                            {props.sortMethod === "timePos" ||
                            props.sortMethod === "timeRev" ? (
                                <span className={classes.visuallyHidden}>
                                      {props.sortMethod === "sizeRes"
                                          ? "sorted descending"
                                          : "sorted ascending"}
                                  </span>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {pathHelper.isMobile() && props.path !== "/" && (
                    <ObjectIcon
                        file={{
                            type: "up",
                            name: t("Parent directory")
                        }}
                    />
                )}
                {props.dirList.map((value, index) => (
                    <ObjectIcon key={value.id} file={value} index={index} />
                ))}
                {props.fileList.map((value, index) => (
                    <ObjectIcon key={value.id} file={value} index={index} />
                ))}
            </TableBody>
        </Table>
    );

    const normalView = (
        <div className={classes.flexFix}>
            {props.dirList.length !== 0 && (
                <>
                    <Typography
                        data-clickAway={"true"}
                        variant="body2"
                        className={classes.typeHeader}
                    >
                        {t("folder")}
                    </Typography>
                    <Grid
                        data-clickAway={"true"}
                        container
                        spacing={0}
                        alignItems="flex-start"
                    >
                        {props.dirList.map((value, index) => (
                            <Grid
                                key={value.id}
                                item
                                xs={6}
                                md={3}
                                sm={4}
                                lg={2}
                            >
                                <ObjectIcon
                                    key={value.id}
                                    file={value}
                                    index={index}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
            {props.fileList.length !== 0 && (
                <>
                    <Typography
                        data-clickAway={"true"}
                        variant="body2"
                        className={classes.typeHeader}
                    >
                        {t("document")}
                    </Typography>
                    <Grid
                        data-clickAway={"true"}
                        container
                        spacing={0}
                        alignItems="flex-start"
                    >
                        {props.fileList.map((value, index) => (
                            <Grid
                                key={value.id}
                                item
                                xs={6}
                                md={3}
                                sm={4}
                                lg={2}
                            >
                                <ObjectIcon
                                    key={value.id}
                                    index={index}
                                    file={value}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </div>
    );
    const view = props.viewMethod === "list" ? listView : normalView;
    return (
        <div
            onContextMenu={contextMenu}
            onClick={ClickAway}
            className={classNames(
                {
                    [classes.root]: props.viewMethod !== "list",
                    [classes.rootTable]: props.viewMethod === "list",
                    [classes.rootShare]: props.share
                },
                classes.button
            )}
        >
            <GlobalHotKeys handlers={handlers} keyMap={keyMap} />
            <ContextMenu share={props.share} />
            <ImgPreivew />
            {props.navigatorError && (
                <Paper elevation={1} className={classes.errorBox}>
                    <Typography variant="h5" component="h3">
                        {t(":( An error occurred during request")}
                    </Typography>
                    <Typography
                        color={"textSecondary"}
                        className={classes.errorMsg}
                    >
                        {props.navigatorErrorMsg.message}
                    </Typography>
                </Paper>
            )}

            {props.loading && !props.navigatorError && (
                <div className={classes.loading}>
                    <CircularProgress />
                </div>
            )}

            {props.keywords === "" &&
                isHomePage &&
                props.dirList.length === 0 &&
                props.fileList.length === 0 &&
                !props.loading &&
                !props.navigatorError && (
                    <div className={classes.emptyContainer}>
                        <EmptyIcon className={classes.emptyIcon} />
                        <div className={classes.emptyInfoBig}>
                            {t("Drag and drop files here")}
                        </div>
                        <div className={classes.emptyInfoSmall}>
                            {t("Or click the \"Upload File\" button at the bottom right to add a file")}
                        </div>
                    </div>
                )}
            {((props.keywords !== "" &&
                    props.dirList.length === 0 &&
                    props.fileList.length === 0 &&
                    !props.loading &&
                    !props.navigatorError) ||
                (props.dirList.length === 0 &&
                    props.fileList.length === 0 &&
                    !props.loading &&
                    !props.navigatorError &&
                    !isHomePage)) && (
                <div className={classes.emptyContainer}>
                    <SadIcon className={classes.emptyIcon} />
                    <div className={classes.emptyInfoBig}>
                        {t("Nothing was found")}
                    </div>
                </div>
            )}
            {showView && view}
        </div>
    );
}

const Explorer = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(ExplorerComponent)));

export default Explorer;

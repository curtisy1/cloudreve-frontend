import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { connect } from "react-redux";
import ShareIcon from "@material-ui/icons/Share";
import BackIcon from "@material-ui/icons/ArrowBack";
import OpenIcon from "@material-ui/icons/OpenInNew";
import DownloadIcon from "@material-ui/icons/CloudDownload";
import OpenFolderIcon from "@material-ui/icons/FolderOpen";
import RenameIcon from "@material-ui/icons/BorderColor";
import MoveIcon from "@material-ui/icons/Input";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import MenuIcon from "@material-ui/icons/Menu";
import { isPreviewable } from "../../config";
import {
    drawerToggleAction,
    setSelectedTarget,
    navigateTo,
    openCreateFolderDialog,
    changeContextMenu,
    searchMyFile,
    saveFile,
    openMusicDialog,
    showImgPreivew,
    toggleSnackbar,
    openMoveDialog,
    openRemoveDialog,
    openShareDialog,
    openRenameDialog,
    openLoadingDialog,
    setSessionStatus,
    openPreview
} from "../../actions";
import {
    allowSharePreview,
    checkGetParameters,
    changeThemeColor
} from "../../utils";
import Uploader from "../Upload/Uploader.js";
import { sizeToString, vhCheck } from "../../utils";
import pathHelper from "../../utils/page";
import SezrchBar from "./SearchBar";
import StorageBar from "./StorageBar";
import UserAvatar from "./UserAvatar";
import LanguageSwitcher from "./LanguageSwitcher";
import UserInfo from "./UserInfo";
import { AccountArrowRight, AccountPlus, LogoutVariant } from "mdi-material-ui";
import { useHistory, useLocation } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    withStyles,
    withTheme,
    Drawer,
    SwipeableDrawer,
    IconButton,
    Hidden,
    ListItem,
    ListItemIcon,
    ListItemText,
    List,
    Grow,
    Tooltip
} from "@material-ui/core";
import Auth from "../../middleware/Auth";
import API from "../../middleware/Api";
import FileTag from "./FileTags";
import { Assignment, Devices, MoreHoriz, Settings } from "@material-ui/icons";
import Divider from "@material-ui/core/Divider";
import SubActions from "../FileManager/Navigator/SubActions";

vhCheck();
const drawerWidth = 240;
const drawerWidthMobile = 270;

const mapStateToProps = (state) => {
    return {
        desktopOpen: state.viewUpdate.open,
        selected: state.explorer.selected,
        isMultiple: state.explorer.selectProps.isMultiple,
        withFolder: state.explorer.selectProps.withFolder,
        withFile: state.explorer.selectProps.withFile,
        path: state.navigator.path,
        keywords: state.explorer.keywords,
        title: state.siteConfig.title,
        subTitle: state.viewUpdate.subTitle,
        loadUploader: state.viewUpdate.loadUploader,
        isLogin: state.viewUpdate.isLogin
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        handleDesktopToggle: (open) => {
            dispatch(drawerToggleAction(open));
        },
        setSelectedTarget: (targets) => {
            dispatch(setSelectedTarget(targets));
        },
        navigateTo: (path) => {
            dispatch(navigateTo(path));
        },
        openCreateFolderDialog: () => {
            dispatch(openCreateFolderDialog());
        },
        changeContextMenu: (type, open) => {
            dispatch(changeContextMenu(type, open));
        },
        searchMyFile: (keywords) => {
            dispatch(searchMyFile(keywords));
        },
        saveFile: () => {
            dispatch(saveFile());
        },
        openMusicDialog: () => {
            dispatch(openMusicDialog());
        },
        showImgPreivew: (first) => {
            dispatch(showImgPreivew(first));
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        openRenameDialog: () => {
            dispatch(openRenameDialog());
        },
        openMoveDialog: () => {
            dispatch(openMoveDialog());
        },
        openRemoveDialog: () => {
            dispatch(openRemoveDialog());
        },
        openShareDialog: () => {
            dispatch(openShareDialog());
        },
        openLoadingDialog: (text) => {
            dispatch(openLoadingDialog(text));
        },
        setSessionStatus: () => {
            dispatch(setSessionStatus());
        },
        openPreview: () => {
            dispatch(openPreview());
        }
    };
};

const styles = (theme) => ({
    appBar: {
        marginLeft: drawerWidth,
        [theme.breakpoints.down("xs")]: {
            marginLeft: drawerWidthMobile
        },
        zIndex: theme.zIndex.drawer + 1,
        transition: " background-color 250ms"
    },

    drawer: {
        width: 0,
        flexShrink: 0
    },
    drawerDesktop: {
        width: drawerWidth,
        flexShrink: 0
    },
    icon: {
        marginRight: theme.spacing(2)
    },
    menuButton: {
        marginRight: 20,
        [theme.breakpoints.up("sm")]: {
            display: "none"
        }
    },
    menuButtonDesktop: {
        marginRight: 20,
        [theme.breakpoints.down("sm")]: {
            display: "none"
        }
    },
    menuIcon: {
        marginRight: 20
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidthMobile
    },
    drawerPaperDesktop: {
        width: drawerWidth
    },
    upDrawer: {
        overflowX: "hidden"
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen
        })
    },
    drawerClose: {
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
        }),
        overflowX: "hidden",
        width: 0
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3)
    },
    grow: {
        flexGrow: 1
    },
    badge: {
        top: 1,
        right: -15
    },
    nested: {
        paddingLeft: theme.spacing(4)
    },
    sectionForFile: {
        display: "flex"
    },
    extendedIcon: {
        marginRight: theme.spacing(1)
    },
    addButton: {
        marginLeft: "40px",
        marginTop: "25px",
        marginBottom: "15px"
    },
    fabButton: {
        borderRadius: "100px"
    },
    badgeFix: {
        right: "10px"
    },
    iconFix: {
        marginLeft: "16px"
    },
    dividerFix: {
        marginTop: "8px"
    },
    folderShareIcon: {
        verticalAlign: "sub",
        marginRight: "5px"
    },
    shareInfoContainer: {
        display: "flex",
        marginTop: "15px",
        marginBottom: "20px",
        marginLeft: "28px",
        textDecoration: "none"
    },
    shareAvatar: {
        width: "40px",
        height: "40px"
    },
    stickFooter: {
        bottom: "0px",
        position: "absolute",
        backgroundColor: theme.palette.background.paper,
        width: "100%"
    },
    ownerInfo: {
        marginLeft: "10px",
        width: "150px"
    },
    minStickDrawer: {
        overflowY: "auto",
        [theme.breakpoints.up("sm")]: {
            height: "calc(var(--vh, 100vh) - 145px)"
        },

        [theme.breakpoints.down("sm")]: {
            minHeight: "calc(var(--vh, 100vh) - 360px)"
        }
    }
});

function NavbarComponent(props) {
    const history = useHistory();
    const location = useLocation();
    const { t } = useTranslation();
    const [state, setState] = useState({
        mobileOpen: false
    });

    useEffect(() => {
        const unlisten = history.listen(() => {
            setState({ mobileOpen: false });
        });

        return function cleanup() {
            unlisten();
        };
    }, []);

    useEffect(() => {
        changeThemeColor(
            props.selected.length <= 1 &&
            !(!props.isMultiple && props.withFile)
                ? props.theme.palette.primary.main
                : props.theme.palette.background.default
        );
    }, []);

    useEffect(() => {
        changeThemeColor(
            !(
                props.selected.length <= 1 &&
                !(!props.isMultiple && props.withFile)
            )
                ? props.theme.palette.type === "dark"
                    ? props.theme.palette.background.default
                    : props.theme.palette.primary.main
                : props.theme.palette.background.default
        );
    }, [props.selected.length, props.isMultiple, props.withFile]);

    function handleDrawerToggle() {
        setState((state) => ({ mobileOpen: !state.mobileOpen }));
    }

    function loadUploader() {
        if (pathHelper.isHomePage(location.pathname)) {
            return (
                <>
                    {props.loadUploader && props.isLogin && (
                        <Uploader />
                    )}
                </>
            );
        }
    }

    function openDownload() {
        if (!allowSharePreview()) {
            props.toggleSnackbar(
                "top",
                "right",
                t("Users who are not logged in cannot preview"),
                "warning"
            );
            return;
        }
        props.openLoadingDialog(t("Get download address..."));
    }

    function archiveDownload() {
        props.openLoadingDialog(t("Packing..."));
    }

    function signOut() {
        API.delete("/user/session/")
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("You have logged out"),
                    "success"
                );
                Auth.signout();
                window.location.reload();
                props.setSessionStatus(false);
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "warning"
                );
            })
            .finally(() => {
                // handleClose();
            });
    }

    const { classes } = props;
    const user = Auth.GetUser(props.isLogin);
    const isHomePage = pathHelper.isHomePage(location.pathname);
    const isSharePage = pathHelper.isSharePage(
        location.pathname
    );

    const drawer = (
        <div id="container" className={classes.upDrawer}>
            {pathHelper.isMobile() && <UserInfo />}

            {Auth.Check(props.isLogin) && (
                <>
                    <div className={classes.minStickDrawer}>
                        <FileTag />
                        <List>
                            <ListItem
                                button
                                key={t("My Share")}
                                onClick={() =>
                                    history.push("/shares?")
                                }
                            >
                                <ListItemIcon>
                                    <ShareIcon
                                        className={classes.iconFix}
                                    />
                                </ListItemIcon>
                                <ListItemText primary={t("My Share")} />
                            </ListItem>
                            <ListItem
                                button
                                key={t("Offline download")}
                                onClick={() =>
                                    history.push("/aria2?")
                                }
                            >
                                <ListItemIcon>
                                    <DownloadIcon
                                        className={classes.iconFix}
                                    />
                                </ListItemIcon>
                                <ListItemText primary={t("Offline download")} />
                            </ListItem>
                            {user.group.webdav && (
                                <ListItem
                                    button
                                    key="WebDAV"
                                    onClick={() =>
                                        history.push("/webdav?")
                                    }
                                >
                                    <ListItemIcon>
                                        <Devices
                                            className={classes.iconFix}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary="WebDAV" />
                                </ListItem>
                            )}

                            <ListItem
                                button
                                key={t("Task Queue")}
                                onClick={() =>
                                    history.push("/tasks?")
                                }
                            >
                                <ListItemIcon>
                                    <Assignment
                                        className={classes.iconFix}
                                    />
                                </ListItemIcon>
                                <ListItemText primary={t("Task Queue")} />
                            </ListItem>
                        </List>
                    </div>

                    {pathHelper.isMobile() && (
                        <>
                            <Divider />
                            <List>
                                <ListItem
                                    button
                                    key={t("Personal settings")}
                                    onClick={() =>
                                        history.push("/setting?")
                                    }
                                >
                                    <ListItemIcon>
                                        <Settings
                                            className={classes.iconFix}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={t("Personal settings")} />
                                </ListItem>

                                <ListItem
                                    button
                                    key={t("Sign out")}
                                    onClick={signOut}
                                >
                                    <ListItemIcon>
                                        <LogoutVariant
                                            className={classes.iconFix}
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={t("Sign out")} />
                                </ListItem>
                            </List>
                        </>
                    )}
                    <div>
                        <StorageBar />
                    </div>
                </>
            )}

            {!Auth.Check(props.isLogin) && (
                <div>
                    <ListItem
                        button
                        key={t("Log in")}
                        onClick={() => history.push("/login")}
                    >
                        <ListItemIcon>
                            <AccountArrowRight
                                className={classes.iconFix}
                            />
                        </ListItemIcon>
                        <ListItemText primary={t("Log in")} />
                    </ListItem>
                    <ListItem
                        button
                        key={t("Register")}
                        onClick={() => history.push("/signup")}
                    >
                        <ListItemIcon>
                            <AccountPlus className={classes.iconFix} />
                        </ListItemIcon>
                        <ListItemText primary={t("Register")} />
                    </ListItem>
                </div>
            )}
        </div>
    );
    const iOS =
        process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);
    return (
        <div>
            <AppBar
                position="fixed"
                className={classes.appBar}
                color={
                    props.theme.palette.type !== "dark" &&
                    props.selected.length <= 1 &&
                    !(!props.isMultiple && props.withFile)
                        ? "primary"
                        : "default"
                }
            >
                <Toolbar>
                    {props.selected.length <= 1 &&
                        !(
                            !props.isMultiple && props.withFile
                        ) && (
                            <IconButton
                                color="inherit"
                                aria-label="Open drawer"
                                onClick={handleDrawerToggle}
                                className={classes.menuButton}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                    {props.selected.length <= 1 &&
                        !(
                            !props.isMultiple && props.withFile
                        ) && (
                            <IconButton
                                color="inherit"
                                aria-label="Open drawer"
                                onClick={() =>
                                    props.handleDesktopToggle(
                                        !props.desktopOpen
                                    )
                                }
                                className={classes.menuButtonDesktop}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                    {(props.selected.length > 1 ||
                            (!props.isMultiple && props.withFile)) &&
                        (isHomePage ||
                            pathHelper.isSharePage(
                                location.pathname
                            )) && (
                            <Grow
                                in={
                                    props.selected.length > 1 ||
                                    (!props.isMultiple &&
                                        props.withFile)
                                }
                            >
                                <IconButton
                                    color="inherit"
                                    className={classes.menuIcon}
                                    onClick={() =>
                                        props.setSelectedTarget([])
                                    }
                                >
                                    <BackIcon />
                                </IconButton>
                            </Grow>
                        )}
                    {props.selected.length <= 1 &&
                        !(
                            !props.isMultiple && props.withFile
                        ) && (
                            <Typography
                                variant="h6"
                                color="inherit"
                                noWrap
                                onClick={() => {
                                    history.push("/");
                                }}
                            >
                                {props.subTitle
                                    ? props.subTitle
                                    : props.title}
                            </Typography>
                        )}

                    {!props.isMultiple &&
                        props.withFile &&
                        !pathHelper.isMobile() && (
                            <Typography variant="h6" color="inherit" noWrap>
                                {props.selected[0].name}{" "}
                                {(isHomePage ||
                                        pathHelper.isSharePage(
                                            location.pathname
                                        )) &&
                                    "(" +
                                    sizeToString(
                                        props.selected[0].size
                                    ) +
                                    ")"}
                            </Typography>
                        )}

                    {props.selected.length > 1 &&
                        !pathHelper.isMobile() && (
                            (<Typography variant="h6" color="inherit" noWrap>
                                {props.selected.length}{t("Objects")}
                            </Typography>)
                        )}
                    {props.selected.length <= 1 &&
                        !(
                            !props.isMultiple && props.withFile
                        ) && <SezrchBar />}
                    <div className={classes.grow} />
                    {(props.selected.length > 1 ||
                            (!props.isMultiple && props.withFile)) &&
                        !isHomePage &&
                        !pathHelper.isSharePage(
                            location.pathname
                        ) &&
                        Auth.Check(props.isLogin) &&
                        !checkGetParameters("share") && (
                            <div className={classes.sectionForFile}>
                                <Tooltip title={t("save")}>
                                    <IconButton
                                        color="inherit"
                                        onClick={() =>
                                            props.saveFile()
                                        }
                                    >
                                        <SaveIcon />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        )}
                    {(props.selected.length > 1 ||
                            (!props.isMultiple && props.withFile)) &&
                        (isHomePage || isSharePage) && (
                            <div className={classes.sectionForFile}>
                                {!props.isMultiple &&
                                    props.withFile &&
                                    isPreviewable(
                                        props.selected[0].name
                                    ) && (
                                        <Grow
                                            in={
                                                !props.isMultiple &&
                                                props.withFile &&
                                                isPreviewable(
                                                    props.selected[0]
                                                        .name
                                                )
                                            }
                                        >
                                            <Tooltip title={t("Open")}>
                                                <IconButton
                                                    color="inherit"
                                                    onClick={() =>
                                                        props.openPreview()
                                                    }
                                                >
                                                    <OpenIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grow>
                                    )}
                                {!props.isMultiple &&
                                    props.withFile && (
                                        <Grow
                                            in={
                                                !props.isMultiple &&
                                                props.withFile
                                            }
                                        >
                                            <Tooltip title={t("download")}>
                                                <IconButton
                                                    color="inherit"
                                                    onClick={() =>
                                                        openDownload()
                                                    }
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grow>
                                    )}
                                {(props.isMultiple ||
                                        props.withFolder) &&
                                    user.group.allowArchiveDownload && (
                                        <Grow
                                            in={
                                                (props.isMultiple ||
                                                    props
                                                        .withFolder) &&
                                                user.group
                                                    .allowArchiveDownload
                                            }
                                        >
                                            <Tooltip title={t("Download package")}>
                                                <IconButton
                                                    color="inherit"
                                                    onClick={() =>
                                                        archiveDownload()
                                                    }
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grow>
                                    )}

                                {!props.isMultiple &&
                                    props.withFolder && (
                                        <Grow
                                            in={
                                                !props.isMultiple &&
                                                props.withFolder
                                            }
                                        >
                                            <Tooltip title={t("Enter directory")}>
                                                <IconButton
                                                    color="inherit"
                                                    onClick={() =>
                                                        props.navigateTo(
                                                            props
                                                                .path ===
                                                            "/"
                                                                ? props
                                                                    .path +
                                                                this
                                                                    .props
                                                                    .selected[0]
                                                                    .name
                                                                : props
                                                                    .path +
                                                                "/" +
                                                                this
                                                                    .props
                                                                    .selected[0]
                                                                    .name
                                                        )
                                                    }
                                                >
                                                    <OpenFolderIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grow>
                                    )}
                                {!props.isMultiple &&
                                    !pathHelper.isMobile() &&
                                    !isSharePage && (
                                        <Grow in={!props.isMultiple}>
                                            <Tooltip title={t("share")}>
                                                <IconButton
                                                    color="inherit"
                                                    onClick={() =>
                                                        props.openShareDialog()
                                                    }
                                                >
                                                    <ShareIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grow>
                                    )}
                                {!props.isMultiple && !isSharePage && (
                                    <Grow in={!props.isMultiple}>
                                        <Tooltip title={t("Rename")}>
                                            <IconButton
                                                color="inherit"
                                                onClick={() =>
                                                    props.openRenameDialog()
                                                }
                                            >
                                                <RenameIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Grow>
                                )}
                                {!isSharePage && (
                                    <div style={{ display: "flex" }}>
                                        {!pathHelper.isMobile() && (
                                            <Grow
                                                in={
                                                    props.selected
                                                        .length !== 0 &&
                                                    !pathHelper.isMobile()
                                                }
                                            >
                                                <Tooltip title={t("move")}>
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            props.openMoveDialog()
                                                        }
                                                    >
                                                        <MoveIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grow>
                                        )}

                                        <Grow
                                            in={
                                                props.selected
                                                    .length !== 0
                                            }
                                        >
                                            <Tooltip title={t("delete")}>
                                                <IconButton
                                                    color="inherit"
                                                    onClick={() =>
                                                        props.openRemoveDialog()
                                                    }
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Grow>

                                        {pathHelper.isMobile() && (
                                            <Grow
                                                in={
                                                    props.selected
                                                        .length !== 0 &&
                                                    pathHelper.isMobile()
                                                }
                                            >
                                                <Tooltip title={t("More operations")}>
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            props.changeContextMenu(
                                                                "file",
                                                                true
                                                            )
                                                        }
                                                    >
                                                        <MoreHoriz />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grow>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    {props.selected.length <= 1 &&
                        !(
                            !props.isMultiple && props.withFile
                        ) && <UserAvatar />}
                    {props.selected.length <= 1 &&
                        !(
                            !props.isMultiple && props.withFile
                        ) && <LanguageSwitcher position="top" />}
                    {props.selected.length <= 1 &&
                        !(!props.isMultiple && props.withFile) &&
                        isHomePage &&
                        pathHelper.isMobile() && <SubActions inherit />}
                </Toolbar>
            </AppBar>
            {loadUploader()}

            <Hidden smUp implementation="css">
                <SwipeableDrawer
                    container={props.container}
                    variant="temporary"
                    classes={{
                        paper: classes.drawerPaper
                    }}
                    anchor="left"
                    open={state.mobileOpen}
                    onClose={handleDrawerToggle}
                    onOpen={() =>
                        setState(() => ({ mobileOpen: true }))
                    }
                    disableDiscovery={iOS}
                    ModalProps={{
                        keepMounted: true // Better open performance on mobile.
                    }}
                >
                    {drawer}
                </SwipeableDrawer>
            </Hidden>
            <Hidden xsDown implementation="css">
                <Drawer
                    classes={{
                        paper: classes.drawerPaperDesktop
                    }}
                    className={classNames(classes.drawer, {
                        [classes.drawerOpen]: props.desktopOpen,
                        [classes.drawerClose]: !props.desktopOpen
                    })}
                    variant="persistent"
                    anchor="left"
                    open={props.desktopOpen}
                >
                    <div className={classes.toolbar} />
                    {drawer}
                </Drawer>
            </Hidden>
        </div>
    );
}

const Navbar = connect(
    mapStateToProps,
    mapDispatchToProps
)((withTheme(withStyles(styles)(NavbarComponent))));

export default Navbar;

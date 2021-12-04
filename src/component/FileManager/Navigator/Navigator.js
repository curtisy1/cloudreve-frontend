import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import ShareIcon from "@material-ui/icons/Share";
import NewFolderIcon from "@material-ui/icons/CreateNewFolder";
import RefreshIcon from "@material-ui/icons/Refresh";
import {
    navigateTo,
    navigateUp,
    setNavigatorError,
    setNavigatorLoadingStatus,
    refreshFileList,
    setSelectedTarget,
    openCreateFolderDialog,
    openShareDialog,
    drawerToggleAction,
    openCompressDialog
} from "../../../actions/index";
import explorer from "../../../redux/explorer";
import API from "../../../middleware/Api";
import { setCookie, setGetParameter, fixUrlHash } from "../../../utils/index";
import {
    withStyles,
    Divider,
    Menu,
    MenuItem,
    ListItemIcon
} from "@material-ui/core";
import PathButton from "./PathButton";
import DropDown from "./DropDown";
import pathHelper from "../../../utils/page";
import classNames from "classnames";
import Auth from "../../../middleware/Auth";
import { Archive } from "@material-ui/icons";
import { FilePlus } from "mdi-material-ui";
import { openCreateFileDialog } from "../../../actions";
import SubActions from "./SubActions";

const mapStateToProps = (state) => {
    return {
        path: state.navigator.path,
        refresh: state.navigator.refresh,
        drawerDesktopOpen: state.viewUpdate.open,
        viewMethod: state.viewUpdate.explorerViewMethod,
        keywords: state.explorer.keywords,
        sortMethod: state.viewUpdate.sortMethod
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        navigateToPath: (path) => {
            dispatch(navigateTo(path));
        },
        navigateUp: () => {
            dispatch(navigateUp());
        },
        setNavigatorError: (status, msg) => {
            dispatch(setNavigatorError(status, msg));
        },
        updateFileList: (list) => {
            dispatch(explorer.actions.updateFileList(list));
        },
        setNavigatorLoadingStatus: (status) => {
            dispatch(setNavigatorLoadingStatus(status));
        },
        refreshFileList: () => {
            dispatch(refreshFileList());
        },
        setSelectedTarget: (target) => {
            dispatch(setSelectedTarget(target));
        },
        openCreateFolderDialog: () => {
            dispatch(openCreateFolderDialog());
        },
        openCreateFileDialog: () => {
            dispatch(openCreateFileDialog());
        },
        openShareDialog: () => {
            dispatch(openShareDialog());
        },
        handleDesktopToggle: (open) => {
            dispatch(drawerToggleAction(open));
        },
        openCompressDialog: () => {
            dispatch(openCompressDialog());
        }
    };
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const styles = (theme) => ({
    container: {
        [theme.breakpoints.down("xs")]: {
            display: "none"
        },
        height: "49px",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper
    },
    navigatorContainer: {
        display: "flex",
        justifyContent: "space-between"
    },
    nav: {
        height: "48px",
        padding: "5px 15px",
        display: "flex"
    },
    optionContainer: {
        paddingTop: "6px",
        marginRight: "10px"
    },
    rightIcon: {
        marginTop: "6px",
        verticalAlign: "top",
        color: "#868686"
    },
    expandMore: {
        color: "#8d8d8d"
    },
    roundBorder: {
        borderRadius: "4px 4px 0 0"
    }
});

function NavigatorComponent(props) {
    let currentID = 0;

    const location = useLocation();
    const { t } = useTranslation();
    const element = useRef();
    const [state, setState] = useState({
        hidden: false,
        hiddenFolders: [],
        folders: [],
        anchorEl: null,
        hiddenMode: false,
        anchorHidden: null
    });

    function checkOverFlow(force) {
        if (!force) {
            return;
        }
        if (element.current !== null) {
            const hasOverflowingChildren =
                element.current.offsetHeight <
                element.current.scrollHeight ||
                element.current.offsetWidth <
                element.current.scrollWidth;
            if (hasOverflowingChildren) {
                setState({...state, hiddenMode: true });
            }
            if (!hasOverflowingChildren && state.hiddenMode) {
                setState({ ...state, hiddenMode: false });
            }
        }
    }

    function renderPath(path = null) {
        props.setNavigatorError(false, null);
        setState({
            folders:
                path !== null
                    ? path.substr(1).split("/")
                    : props.path.substr(1).split("/")
        });
        let newPath = path !== null ? path : props.path;
        const apiURL = props.share
            ? "/share/list/" + props.share.key
            : props.keywords === ""
                ? "/directory"
                : "/file/search/";
        newPath = props.keywords === "" ? newPath : props.keywords;

        API.get(apiURL + encodeURIComponent(newPath))
            .then((response) => {
                currentID = response.data.parent;
                props.updateFileList(response.data.objects);
                props.setNavigatorLoadingStatus(false);
                const pathTemp = (path !== null
                        ? path.substr(1).split("/")
                        : props.path.substr(1).split("/")
                ).join(",");
                setCookie("path_tmp", encodeURIComponent(pathTemp), 1);
                if (props.keywords === "") {
                    setGetParameter("path", encodeURIComponent(newPath));
                }
            })
            .catch((error) => {
                props.setNavigatorError(true, error);
            });

        checkOverFlow(true);
    }

    useEffect(() => {
        const url = new URL(fixUrlHash(window.location.href));
        const c = url.searchParams.get("path");
        renderPath(c === null ? "/" : c);

        if (!props.isShare) {
            // 如果是在个人文件管理页，首次加载时打开侧边栏
            props.handleDesktopToggle(true);
        }

        // 后退操作时重新导航
        window.onpopstate = () => {
            const url = new URL(fixUrlHash(window.location.href));
            const c = url.searchParams.get("path");
            if (c !== null) {
                props.navigateToPath(c);
            }
        };

        return function cleanup() {
            props.updateFileList([]);
        };
    }, []);

    function refresh(path) {
        props.setNavigatorLoadingStatus(true);
        props.setNavigatorError(false, "error");
        renderPath(path);
    }

    useEffect(() => {
        renderPath(props.path);
    }, [props.path]);

    useEffect(() => {
        refresh(props.path);
    }, [props.refresh]);

    useEffect(() => {
        checkOverFlow(true);
    }, [props.folders]);

    useEffect(() => {
        delay(500).then(() => checkOverFlow());
    }, [props.drawerDesktopOpen]);

    function handleClose() {
        setState({ ...state, anchorEl: null, anchorHidden: null, anchorSort: null });
    }

    function navigateTo(event, id) {
        if (id === state.folders.length - 1) {
            //最后一个路径
            setState({ ...state, anchorEl: event.currentTarget });
        } else if (
            id === -1 &&
            state.folders.length === 1 &&
            state.folders[0] === ""
        ) {
            props.refreshFileList();
            handleClose();
        } else if (id === -1) {
            props.navigateToPath("/");
            handleClose();
        } else {
            props.navigateToPath(
                "/" + state.folders.slice(0, id + 1).join("/")
            );
            handleClose();
        }
    }

    function showHiddenPath(e) {
        setState({ ...state, anchorHidden: e.currentTarget });
    }

    function performAction(e) {
        handleClose();
        if (e === "refresh") {
            refresh();
            return;
        }
        const presentPath = props.path.split("/");
        const newTarget = [
            {
                id: currentID,
                type: "dir",
                name: presentPath.pop(),
                path: presentPath.length === 1 ? "/" : presentPath.join("/")
            }
        ];
        //props.navitateUp();
        switch (e) {
            case "share":
                props.setSelectedTarget(newTarget);
                props.openShareDialog();
                break;
            case "newfolder":
                props.openCreateFolderDialog();
                break;
            case "compress":
                props.setSelectedTarget(newTarget);
                props.openCompressDialog();
                break;
            case "newFile":
                props.openCreateFileDialog();
                break;
            default:
                break;
        }
    }

    const { classes } = props;
    const isHomePage = pathHelper.isHomePage(location.pathname);
    const user = Auth.GetUser();

    const presentFolderMenu = (
        <Menu
            id="presentFolderMenu"
            anchorEl={state.anchorEl}
            open={Boolean(state.anchorEl)}
            onClose={handleClose}
            disableAutoFocusItem={true}
        >
            <MenuItem onClick={() => performAction("refresh")}>
                <ListItemIcon>
                    <RefreshIcon />
                </ListItemIcon>
                {t("Refresh")}
            </MenuItem>
            {props.keywords === "" && isHomePage && (
                <div>
                    <Divider />
                    <MenuItem onClick={() => performAction("share")}>
                        <ListItemIcon>
                            <ShareIcon />
                        </ListItemIcon>
                        {t("share")}
                    </MenuItem>
                    {user.group.compress && (
                        (<MenuItem
                            onClick={() => performAction("compress")}
                        >
                            <ListItemIcon>
                                <Archive />
                            </ListItemIcon>
                            {t("compression")}
                        </MenuItem>)
                    )}
                    <Divider />
                    <MenuItem
                        onClick={() => performAction("newfolder")}
                    >
                        <ListItemIcon>
                            <NewFolderIcon />
                        </ListItemIcon>
                        {t("Create Folder")}
                    </MenuItem>
                    <MenuItem onClick={() => performAction("newFile")}>
                        <ListItemIcon>
                            <FilePlus />
                        </ListItemIcon>
                        {t("Create a file")}
                    </MenuItem>
                </div>
            )}
        </Menu>
    );

    return (
        <div
            className={classNames(
                {
                    [classes.roundBorder]: props.isShare
                },
                classes.container
            )}
        >
            <div className={classes.navigatorContainer}>
                <div className={classes.nav} ref={element}>
                      <span>
                          <PathButton
                              folder="/"
                              path="/"
                              onClick={(e) => navigateTo(e, -1)}
                          />
                          <RightIcon className={classes.rightIcon} />
                      </span>
                    {state.hiddenMode && (
                        <span>
                              <PathButton
                                  more
                                  title={t("Display Path")}
                                  onClick={showHiddenPath}
                              />
                              <Menu
                                  id="hiddenPathMenu"
                                  anchorEl={state.anchorHidden}
                                  open={Boolean(state.anchorHidden)}
                                  onClose={handleClose}
                                  disableAutoFocusItem={true}
                              >
                                  <DropDown
                                      onClose={handleClose}
                                      folders={state.folders.slice(
                                          0,
                                          -1
                                      )}
                                      navigateTo={navigateTo}
                                  />
                              </Menu>
                              <RightIcon className={classes.rightIcon} />
                            {/* <Button component="span" onClick={(e)=>navigateTo(e,state.folders.length-1)}>
                                  {state.folders.slice(-1)}  
                                  <ExpandMore className={classes.expandMore}/>
                              </Button> */}
                            <PathButton
                                folder={state.folders.slice(-1)}
                                path={
                                    "/" +
                                    state.folders
                                        .slice(0, -1)
                                        .join("/")
                                }
                                last={true}
                                onClick={(e) =>
                                    navigateTo(
                                        e,
                                        state.folders.length - 1
                                    )
                                }
                            />
                            {presentFolderMenu}
                          </span>
                    )}
                    {!state.hiddenMode &&
                        state.folders.map((folder, id, folders) => (
                            <span key={id}>
                                  {folder !== "" && (
                                      <span>
                                          <PathButton
                                              folder={folder}
                                              path={
                                                  "/" +
                                                  folders
                                                      .slice(0, id)
                                                      .join("/")
                                              }
                                              last={id === folders.length - 1}
                                              onClick={(e) =>
                                                  navigateTo(e, id)
                                              }
                                          />
                                          {id === folders.length - 1 &&
                                              presentFolderMenu}
                                          {id !== folders.length - 1 && (
                                              <RightIcon
                                                  className={
                                                      classes.rightIcon
                                                  }
                                              />
                                          )}
                                      </span>
                                  )}
                              </span>
                        ))}
                </div>
                <div className={classes.optionContainer}>
                    <SubActions isSmall share={props.share} />
                </div>
            </div>
            <Divider />
        </div>
    );
}

const Navigator = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(NavigatorComponent)));

export default Navigator;

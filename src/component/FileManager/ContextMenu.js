import { useTranslation } from "react-i18next";
import {
    Divider,
    ListItemIcon,
    MenuItem,
    Typography,
    withStyles
} from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import { Archive, InfoOutlined, Unarchive } from "@material-ui/icons";
import RenameIcon from "@material-ui/icons/BorderColor";
import DownloadIcon from "@material-ui/icons/CloudDownload";
import UploadIcon from "@material-ui/icons/CloudUpload";
import NewFolderIcon from "@material-ui/icons/CreateNewFolder";
import DeleteIcon from "@material-ui/icons/Delete";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import OpenFolderIcon from "@material-ui/icons/FolderOpen";
import MoveIcon from "@material-ui/icons/Input";
import LinkIcon from "@material-ui/icons/InsertLink";
import OpenIcon from "@material-ui/icons/OpenInNew";
import ShareIcon from "@material-ui/icons/Share";
import { FolderUpload, MagnetOn, FilePlus } from "mdi-material-ui";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import {
    openCompressDialog,
    openCreateFileDialog,
    refreshFileList
} from "../../actions";
import {
    changeContextMenu,
    navigateTo,
    openCopyDialog,
    openCreateFolderDialog,
    openDecompressDialog,
    openGetSourceDialog,
    openLoadingDialog,
    openMoveDialog,
    openMusicDialog,
    openRemoteDownloadDialog,
    openRemoveDialog,
    openRenameDialog,
    openShareDialog,
    openTorrentDownloadDialog,
    setNavigatorLoadingStatus,
    setSelectedTarget,
    showImgPreivew,
    toggleSnackbar
} from "../../actions/index";
import { isCompressFile, isPreviewable, isTorrent } from "../../config";
import Auth from "../../middleware/Auth";
import { allowSharePreview } from "../../utils/index";
import pathHelper from "../../utils/page";
import RefreshIcon from "@material-ui/icons/Refresh";
import { openPreview } from "../../actions";
import {
    toggleObjectInfoSidebar
} from "../../redux/explorer/action";

const styles = () => ({
    propover: {},
    divider: {
        marginTop: 4,
        marginBottom: 4
    }
});

const StyledListItemIcon = withStyles({
    root: {
        minWidth: 38
    }
})(ListItemIcon);

const mapStateToProps = (state) => {
    return {
        menuType: state.viewUpdate.contextType,
        menuOpen: state.viewUpdate.contextOpen,
        isMultiple: state.explorer.selectProps.isMultiple,
        withFolder: state.explorer.selectProps.withFolder,
        withFile: state.explorer.selectProps.withFile,
        path: state.navigator.path,
        selected: state.explorer.selected,
        keywords: state.explorer.keywords
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        changeContextMenu: (type, open) => {
            dispatch(changeContextMenu(type, open));
        },
        setNavigatorLoadingStatus: (status) => {
            dispatch(setNavigatorLoadingStatus(status));
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
        openCreateFileDialog: () => {
            dispatch(openCreateFileDialog());
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
        showImgPreivew: (first) => {
            dispatch(showImgPreivew(first));
        },
        openMusicDialog: () => {
            dispatch(openMusicDialog());
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        openRemoteDownloadDialog: () => {
            dispatch(openRemoteDownloadDialog());
        },
        openTorrentDownloadDialog: () => {
            dispatch(openTorrentDownloadDialog());
        },
        openGetSourceDialog: () => {
            dispatch(openGetSourceDialog());
        },
        openCopyDialog: () => {
            dispatch(openCopyDialog());
        },
        openLoadingDialog: (text) => {
            dispatch(openLoadingDialog(text));
        },
        openDecompressDialog: () => {
            dispatch(openDecompressDialog());
        },
        openCompressDialog: () => {
            dispatch(openCompressDialog());
        },
        refreshFileList: () => {
            dispatch(refreshFileList());
        },
        openPreview: () => {
            dispatch(openPreview());
        },
        toggleObjectInfoSidebar: (open) => {
            dispatch(toggleObjectInfoSidebar(open));
        }
    };
};

function ContextMenuComponent(props) {
    const { t } = useTranslation();
    const location = useLocation();

    let X = 0;
    let Y = 0;


    function setPoint(e) {
        Y = e.clientY;
        X = e.clientX;
    }

    useEffect(() => {
        window.document.addEventListener("mousemove", setPoint);
    });

    function openArchiveDownload() {
        props.changeContextMenu("file", false);
        props.openLoadingDialog(t("Packing..."));
    }

    function openDownload() {
        if (!allowSharePreview()) {
            props.toggleSnackbar(
                "top",
                "right",
                t("Users who are not logged in cannot preview"),
                "warning"
            );
            props.changeContextMenu("file", false);
            return;
        }
        props.changeContextMenu("file", false);
        props.openLoadingDialog(t("Get download address..."));
    }

    function enterFolder() {
        props.navigateTo(
            props.path === "/"
                ? props.path + props.selected[0].name
                : props.path + "/" + props.selected[0].name
        );
    }

    function clickUpload(id) {
        props.changeContextMenu("empty", false);
        const uploadButton = document.getElementsByClassName(id)[0];
        if (document.body.contains(uploadButton)) {
            uploadButton.click();
        } else {
            props.toggleSnackbar(
                "top",
                "right",
                t("The upload component has not been loaded yet"),
                "warning"
            );
        }
    }

    const { classes } = props;
    const user = Auth.GetUser();
    const isHomePage = pathHelper.isHomePage(location.pathname);

    return (
        <div>
            <Menu
                keepMounted
                open={props.menuOpen}
                onClose={() =>
                    props.changeContextMenu(props.menuType, false)
                }
                anchorReference="anchorPosition"
                anchorPosition={{ top: Y, left: X }}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "left"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "left"
                }}
            >
                {props.menuType === "empty" && (
                    <div>
                        <MenuItem
                            dense
                            onClick={() => {
                                props.refreshFileList();
                                props.changeContextMenu(
                                    props.menuType,
                                    false
                                );
                            }}
                        >
                            <StyledListItemIcon>
                                <RefreshIcon />
                            </StyledListItemIcon>
                            <Typography variant="inherit">{t("Refresh")}</Typography>
                        </MenuItem>
                        <Divider className={classes.divider} />
                        <MenuItem
                            dense
                            onClick={() =>
                                clickUpload("uploadFileForm")
                            }
                        >
                            <StyledListItemIcon>
                                <UploadIcon />
                            </StyledListItemIcon>
                            <Typography variant="inherit">
                                {t("upload files")}
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            dense
                            onClick={() =>
                                clickUpload("uploadFolderForm")
                            }
                        >
                            <StyledListItemIcon>
                                <FolderUpload />
                            </StyledListItemIcon>
                            <Typography variant="inherit">
                                {t("Upload directory")}
                            </Typography>
                        </MenuItem>
                        {user.group.allowRemoteDownload && (
                            <MenuItem
                                dense
                                onClick={() =>
                                    props.openRemoteDownloadDialog()
                                }
                            >
                                <StyledListItemIcon>
                                    <DownloadIcon />
                                </StyledListItemIcon>
                                <Typography variant="inherit">
                                    {t("Offline download")}
                                </Typography>
                            </MenuItem>
                        )}

                        <Divider className={classes.divider} />
                        <MenuItem
                            dense
                            onClick={() =>
                                props.openCreateFolderDialog()
                            }
                        >
                            <StyledListItemIcon>
                                <NewFolderIcon />
                            </StyledListItemIcon>
                            <Typography variant="inherit">
                                {t("Create Folder")}
                            </Typography>
                        </MenuItem>
                        <MenuItem
                            dense
                            onClick={() =>
                                props.openCreateFileDialog()
                            }
                        >
                            <StyledListItemIcon>
                                <FilePlus />
                            </StyledListItemIcon>
                            <Typography variant="inherit">
                                {t("Create a file")}
                            </Typography>
                        </MenuItem>
                    </div>
                )}
                {props.menuType !== "empty" && (
                    <div>
                        {!props.isMultiple && props.withFolder && (
                            <div>
                                <MenuItem dense onClick={enterFolder}>
                                    <StyledListItemIcon>
                                        <OpenFolderIcon />
                                    </StyledListItemIcon>
                                    <Typography variant="inherit">
                                        {t("Enter")}
                                    </Typography>
                                </MenuItem>
                                {isHomePage && (
                                    <Divider className={classes.divider} />
                                )}
                            </div>
                        )}
                        {!props.isMultiple &&
                            props.withFile &&
                            (!props.share ||
                                props.share.preview) &&
                            isPreviewable(props.selected[0].name) && (
                                <div>
                                    <MenuItem
                                        dense
                                        onClick={() =>
                                            props.openPreview()
                                        }
                                    >
                                        <StyledListItemIcon>
                                            <OpenIcon />
                                        </StyledListItemIcon>
                                        <Typography variant="inherit">
                                            {t("Open")}
                                        </Typography>
                                    </MenuItem>
                                </div>
                            )}

                        {!props.isMultiple && props.withFile && (
                            <div>
                                <MenuItem
                                    dense
                                    onClick={() => openDownload()}
                                >
                                    <StyledListItemIcon>
                                        <DownloadIcon />
                                    </StyledListItemIcon>
                                    <Typography variant="inherit">
                                        {t("download")}
                                    </Typography>
                                </MenuItem>
                                {isHomePage && (
                                    <Divider className={classes.divider} />
                                )}
                            </div>
                        )}

                        {(props.isMultiple || props.withFolder) &&
                            (user.group.allowArchiveDownload ||
                                !isHomePage) && (
                                <MenuItem
                                    dense
                                    onClick={() =>
                                        openArchiveDownload()
                                    }
                                >
                                    <StyledListItemIcon>
                                        <DownloadIcon />
                                    </StyledListItemIcon>
                                    <Typography variant="inherit">
                                        {t("Download package")}
                                    </Typography>
                                </MenuItem>
                            )}

                        {!props.isMultiple &&
                            props.withFile &&
                            isHomePage &&
                            user.policy.allowSource && (
                                <MenuItem
                                    dense
                                    onClick={() =>
                                        props.openGetSourceDialog()
                                    }
                                >
                                    <StyledListItemIcon>
                                        <LinkIcon />
                                    </StyledListItemIcon>
                                    <Typography variant="inherit">
                                        {t("Get External Links")}
                                    </Typography>
                                </MenuItem>
                            )}

                        {!props.isMultiple &&
                            isHomePage &&
                            user.group.allowRemoteDownload &&
                            props.withFile &&
                            isTorrent(props.selected[0].name) && (
                                <MenuItem
                                    dense
                                    onClick={() =>
                                        props.openTorrentDownloadDialog()
                                    }
                                >
                                    <StyledListItemIcon>
                                        <MagnetOn />
                                    </StyledListItemIcon>
                                    <Typography variant="inherit">
                                        {t("Create offline download task")}
                                    </Typography>
                                </MenuItem>
                            )}
                        {!props.isMultiple &&
                            isHomePage &&
                            user.group.compress &&
                            props.withFile &&
                            isCompressFile(props.selected[0].name) && (
                                <MenuItem
                                    dense
                                    onClick={() =>
                                        props.openDecompressDialog()
                                    }
                                >
                                    <StyledListItemIcon>
                                        <Unarchive />
                                    </StyledListItemIcon>
                                    <Typography variant="inherit">
                                        {t("unzip")}
                                    </Typography>
                                </MenuItem>
                            )}

                        {isHomePage && user.group.compress && (
                            <MenuItem
                                dense
                                onClick={() =>
                                    props.openCompressDialog()
                                }
                            >
                                <StyledListItemIcon>
                                    <Archive />
                                </StyledListItemIcon>
                                <Typography variant="inherit">
                                    {t("Create compressed file")}
                                </Typography>
                            </MenuItem>
                        )}

                        {!props.isMultiple && isHomePage && (
                            <MenuItem
                                dense
                                onClick={() => props.openShareDialog()}
                            >
                                <StyledListItemIcon>
                                    <ShareIcon />
                                </StyledListItemIcon>
                                <Typography variant="inherit">
                                    {t("Create a share link")}
                                </Typography>
                            </MenuItem>
                        )}

                        {!props.isMultiple && isHomePage && (
                            <MenuItem
                                dense
                                onClick={() =>
                                    props.toggleObjectInfoSidebar(true)
                                }
                            >
                                <StyledListItemIcon>
                                    <InfoOutlined />
                                </StyledListItemIcon>
                                <Typography variant="inherit">
                                    {t("details")}
                                </Typography>
                            </MenuItem>
                        )}

                        {!props.isMultiple && isHomePage && (
                            <Divider className={classes.divider} />
                        )}

                        {!props.isMultiple && isHomePage && (
                            <div>
                                <MenuItem
                                    dense
                                    onClick={() =>
                                        props.openRenameDialog()
                                    }
                                >
                                    <StyledListItemIcon>
                                        <RenameIcon />
                                    </StyledListItemIcon>
                                    <Typography variant="inherit">
                                        {t("Rename")}
                                    </Typography>
                                </MenuItem>
                                {props.keywords === "" && (
                                    <MenuItem
                                        dense
                                        onClick={() =>
                                            props.openCopyDialog()
                                        }
                                    >
                                        <StyledListItemIcon>
                                            <FileCopyIcon />
                                        </StyledListItemIcon>
                                        <Typography variant="inherit">
                                            {t("copy")}
                                        </Typography>
                                    </MenuItem>
                                )}
                            </div>
                        )}
                        {isHomePage && (
                            <div>
                                {props.keywords === "" && (
                                    <MenuItem
                                        dense
                                        onClick={() =>
                                            props.openMoveDialog()
                                        }
                                    >
                                        <StyledListItemIcon>
                                            <MoveIcon />
                                        </StyledListItemIcon>
                                        <Typography variant="inherit">
                                            {t("move")}
                                        </Typography>
                                    </MenuItem>
                                )}

                                <Divider className={classes.divider} />
                                <MenuItem
                                    dense
                                    className={classes.propover}
                                    onClick={() =>
                                        props.openRemoveDialog()
                                    }
                                >
                                    <StyledListItemIcon>
                                        <DeleteIcon />
                                    </StyledListItemIcon>
                                    <Typography variant="inherit">
                                        {t("delete")}
                                    </Typography>
                                </MenuItem>
                            </div>
                        )}
                    </div>
                )}
            </Menu>
        </div>
    );
}

const ContextMenu = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(ContextMenuComponent)));

export default ContextMenu;

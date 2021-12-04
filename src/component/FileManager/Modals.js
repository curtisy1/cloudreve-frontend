import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
    closeAllModals,
    toggleSnackbar,
    setModalsLoading,
    refreshFileList,
    refreshStorage,
    openLoadingDialog
} from "../../actions/index";
import PathSelector from "./PathSelector";
import API, { baseURL } from "../../middleware/Api";
import {
    withStyles,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    CircularProgress
} from "@material-ui/core";
import Loading from "../Modals/Loading";
import CopyDialog from "../Modals/Copy";
import CreatShare from "../Modals/CreateShare";
import { useLocation } from "react-router-dom";
import pathHelper from "../../utils/page";
import DecompressDialog from "../Modals/Decompress";
import CompressDialog from "../Modals/Compress";

const styles = (theme) => ({
    wrapper: {
        margin: theme.spacing(1),
        position: "relative"
    },
    buttonProgress: {
        color: theme.palette.secondary.light,
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12
    },
    contentFix: {
        padding: "10px 24px 0px 24px"
    }
});

const mapStateToProps = (state) => {
    return {
        path: state.navigator.path,
        selected: state.explorer.selected,
        modalsStatus: state.viewUpdate.modals,
        modalsLoading: state.viewUpdate.modalsLoading,
        dirList: state.explorer.dirList,
        fileList: state.explorer.fileList,
        dndSignale: state.explorer.dndSignal,
        dndTarget: state.explorer.dndTarget,
        dndSource: state.explorer.dndSource,
        loading: state.viewUpdate.modals.loading,
        loadingText: state.viewUpdate.modals.loadingText
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeAllModals: () => {
            dispatch(closeAllModals());
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        setModalsLoading: (status) => {
            dispatch(setModalsLoading(status));
        },
        refreshFileList: () => {
            dispatch(refreshFileList());
        },
        refreshStorage: () => {
            dispatch(refreshStorage());
        },
        openLoadingDialog: (text) => {
            dispatch(openLoadingDialog(text));
        }
    };
};

function ModalsComponent(props) {
    const { t } = useTranslation();
    const location = useLocation();
    const [state, setState] = useState({
        newFolderName: "",
        newFileName: "",
        newName: "",
        selectedPath: "",
        selectedPathName: "",
        secretShare: false,
        sharePwd: "",
        shareUrl: "",
        downloadURL: "",
        remoteDownloadPathSelect: false,
        source: "",
        purchaseCallback: null
    });

    function handleInputChange(e) {
        setState({
            ...state,
            [e.target.id]: e.target.value
        });
    }

    let DragSelectedPath = "";

    useEffect(() => {
        const name = props.selected[0].name;
        setState({
            ...state,
            newName: name
        });
    }, [props.modalsStatus.rename]);

    useEffect(() => {

        if (
            props.modalsStatus.getSource
        ) {
            API.get("/file/source/" + props.selected[0].id)
                .then((response) => {
                    setState({
                        ...state,
                        source: response.data.url
                    });
                })
                .catch((error) => {
                    props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
    }, [props.modalsStatus.getSource]);

    function scoreHandler(callback) {
        callback();
    }

    function onClose() {
        setState({
            ...state,
            newFolderName: "",
            newFileName: "",
            newName: "",
            selectedPath: "",
            selectedPathName: "",
            secretShare: false,
            sharePwd: "",
            downloadURL: "",
            shareUrl: "",
            remoteDownloadPathSelect: false,
            source: ""
        });
        props.closeAllModals();
    }

    function Download() {
        let reqURL;
        if (props.selected[0].key) {
            const downloadPath =
                props.selected[0].path === "/"
                    ? props.selected[0].path + props.selected[0].name
                    : props.selected[0].path +
                    "/" +
                    props.selected[0].name;
            reqURL =
                "/share/download/" +
                props.selected[0].key +
                "?path=" +
                encodeURIComponent(downloadPath);
        } else {
            reqURL = "/file/download/" + props.selected[0].id;
        }

        API.put(reqURL)
            .then((response) => {
                window.location.assign(response.data);
                onClose();
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                onClose();
            });
    }

    function archiveDownload() {
        const dirs = [],
            items = [];
        props.selected.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
            return null;
        });

        let reqURL = "/file/archive";
        const postBody = {
            items: items,
            dirs: dirs
        };
        if (pathHelper.isSharePage(location.pathname)) {
            reqURL = "/share/archive/" + window.shareInfo.key;
            postBody["path"] = props.selected[0].path;
        }

        API.post(reqURL, postBody)
            .then((response) => {
                if (response.rawData.code === 0) {
                    onClose();
                    window.location.assign(response.data);
                } else {
                    props.toggleSnackbar(
                        "top",
                        "right",
                        response.rawData.msg,
                        "warning"
                    );
                }
                onClose();
                props.refreshStorage();
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                onClose();
            });
    }

    useEffect(() => {
        if (props.loading === true) {
            if (props.loadingText === t("Packing...")) {
                if (
                    pathHelper.isSharePage(location.pathname) &&
                    props.share &&
                    props.share.score > 0
                ) {
                    scoreHandler(archiveDownload);
                    return;
                }
                archiveDownload();
            } else if (props.loadingText === t("Get download address...")) {
                if (
                    pathHelper.isSharePage(location.pathname) &&
                    props.share &&
                    props.share.score > 0
                ) {
                    scoreHandler(Download);
                    return;
                }
                Download();
            }
        }
    }, [props.loading]);

    function submitRemove(e) {
        e.preventDefault();
        props.setModalsLoading(true);
        const dirs = [],
            items = [];
        // eslint-disable-next-line
        props.selected.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });
        API.delete("/object", {
            data: {
                items: items,
                dirs: dirs
            }
        })
            .then((response) => {
                if (response.rawData.code === 0) {
                    onClose();
                    setTimeout(props.refreshFileList, 500);
                } else {
                    props.toggleSnackbar(
                        "top",
                        "right",
                        response.rawData.msg,
                        "warning"
                    );
                }
                props.setModalsLoading(false);
                props.refreshStorage();
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                props.setModalsLoading(false);
            });
    }

    function submitMove(e) {
        if (e != null) {
            e.preventDefault();
        }
        props.setModalsLoading(true);
        const dirs = [],
            items = [];
        // eslint-disable-next-line
        props.selected.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });
        API.patch("/object", {
            action: "move",
            src_dir: props.selected[0].path,
            src: {
                dirs: dirs,
                items: items
            },
            dst: DragSelectedPath
                ? DragSelectedPath
                : state.selectedPath === "//"
                    ? "/"
                    : state.selectedPath
        })
            .then(() => {
                onClose();
                props.refreshFileList();
                props.setModalsLoading(false);
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                props.setModalsLoading(false);
            })
            .then(() => {
                props.closeAllModals();
            });
    }

    function dragMove(source, target) {
        if (props.selected.length === 0) {
            props.selected[0] = source;
        }
        let doMove = true;

        // eslint-disable-next-line
        props.selected.map((value) => {
            // 根据ID过滤
            if (value.id === target.id && value.type === target.type) {
                doMove = false;
                // eslint-disable-next-line
                return;
            }
            // 根据路径过滤
            if (
                value.path ===
                target.path + (target.path === "/" ? "" : "/") + target.name
            ) {
                doMove = false;
            }
        });
        if (doMove) {
            DragSelectedPath =
                target.path === "/"
                    ? target.path + target.name
                    : target.path + "/" + target.name;
            props.openLoadingDialog(t("Processing..."));
            submitMove();
        }
    }

    useEffect(() => {
        dragMove(props.dndSource, props.dndTarget);
    }, [props.dndSignale]);

    function submitRename(e) {
        e.preventDefault();
        props.setModalsLoading(true);
        const newName = state.newName;

        const src = {
            dirs: [],
            items: []
        };

        if (props.selected[0].type === "dir") {
            src.dirs[0] = props.selected[0].id;
        } else {
            src.items[0] = props.selected[0].id;
        }

        // 检查重名
        if (
            props.dirList.findIndex((value) => {
                return value.name === newName;
            }) !== -1 ||
            props.fileList.findIndex((value) => {
                return value.name === newName;
            }) !== -1
        ) {
            props.toggleSnackbar(
                "top",
                "right",
                t("The new name is the same as the existing file"),
                "warning"
            );
            props.setModalsLoading(false);
        } else {
            API.post("/object/rename", {
                action: "rename",
                src: src,
                new_name: newName
            })
                .then(() => {
                    onClose();
                    props.refreshFileList();
                    props.setModalsLoading(false);
                })
                .catch((error) => {
                    props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                    props.setModalsLoading(false);
                });
        }
    }

    function submitCreateNewFolder(e) {
        e.preventDefault();
        props.setModalsLoading(true);
        if (
            props.dirList.findIndex((value) => {
                return value.name === state.newFolderName;
            }) !== -1
        ) {
            props.toggleSnackbar(
                "top",
                "right",
                t("Duplicate folder name"),
                "warning"
            );
            props.setModalsLoading(false);
        } else {
            API.put("/directory", {
                path:
                    (props.path === "/" ? "" : props.path) +
                    "/" +
                    state.newFolderName
            })
                .then(() => {
                    onClose();
                    props.refreshFileList();
                    props.setModalsLoading(false);
                })
                .catch((error) => {
                    props.setModalsLoading(false);

                    props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
        //props.toggleSnackbar();
    }

    function submitCreateNewFile(e) {
        e.preventDefault();
        props.setModalsLoading(true);
        if (
            props.dirList.findIndex((value) => {
                return value.name === state.newFileName;
            }) !== -1
        ) {
            props.toggleSnackbar(
                "top",
                "right",
                t("Duplicate file name"),
                "warning"
            );
            props.setModalsLoading(false);
        } else {
            API.post("/file/create", {
                path:
                    (props.path === "/" ? "" : props.path) +
                    "/" +
                    state.newFileName
            })
                .then(() => {
                    onClose();
                    props.refreshFileList();
                    props.setModalsLoading(false);
                })
                .catch((error) => {
                    props.setModalsLoading(false);

                    props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
        //props.toggleSnackbar();
    }

    function submitTorrentDownload(e) {
        e.preventDefault();
        props.setModalsLoading(true);
        API.post("/aria2/torrent/" + props.selected[0].id, {
            dst:
                state.selectedPath === "//"
                    ? "/"
                    : state.selectedPath
        })
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("Task has been created"),
                    "success"
                );
                onClose();
                props.setModalsLoading(false);
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                props.setModalsLoading(false);
            });
    }

    function submitDownload(e) {
        e.preventDefault();
        props.setModalsLoading(true);
        API.post("/aria2/url", {
            url: state.downloadURL,
            dst:
                state.selectedPath === "//"
                    ? "/"
                    : state.selectedPath
        })
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("Task has been created"),
                    "success"
                );
                onClose();
                props.setModalsLoading(false);
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                props.setModalsLoading(false);
            });
    }

    function setMoveTarget(folder) {
        const path =
            folder.path === "/"
                ? folder.path + folder.name
                : folder.path + "/" + folder.name;
        setState({
            ...state,
            selectedPath: path,
            selectedPathName: folder.name
        });
    }

    function remoteDownloadNext() {
        props.closeAllModals();
        setState({
            ...state,
            remoteDownloadPathSelect: true
        });
    }

    const { classes } = props;

    return (
        <div>
            <Loading />
            <Dialog
                open={props.modalsStatus.getSource}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {t("Get files outside the chain")}
                </DialogTitle>

                <DialogContent>
                    <form onSubmit={submitCreateNewFolder}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="newFolderName"
                            label={t("External link address")}
                            type="text"
                            value={state.source}
                            fullWidth
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("Close")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={props.modalsStatus.createNewFolder}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">{t("new folder")}</DialogTitle>

                <DialogContent>
                    <form onSubmit={submitCreateNewFolder}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="newFolderName"
                            label={t("Folder name")}
                            type="text"
                            value={state.newFolderName}
                            onChange={(e) => handleInputChange(e)}
                            fullWidth
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("Cancel")}</Button>
                    <div className={classes.wrapper}>
                        <Button
                            onClick={submitCreateNewFolder}
                            color="primary"
                            disabled={
                                state.newFolderName === "" ||
                                props.modalsLoading
                            }
                        >
                            {t("create")}
                            {props.modalsLoading && (
                                <CircularProgress
                                    size={24}
                                    className={classes.buttonProgress}
                                />
                            )}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>

            <Dialog
                open={props.modalsStatus.createNewFile}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">{t("New file")}</DialogTitle>

                <DialogContent>
                    <form onSubmit={submitCreateNewFile}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="newFileName"
                            label={t("File name")}
                            type="text"
                            value={state.newFileName}
                            onChange={(e) => handleInputChange(e)}
                            fullWidth
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("Cancel")}</Button>
                    <div className={classes.wrapper}>
                        <Button
                            onClick={submitCreateNewFile}
                            color="primary"
                            disabled={
                                state.newFileName === "" ||
                                props.modalsLoading
                            }
                        >
                            {t("create")}
                            {props.modalsLoading && (
                                <CircularProgress
                                    size={24}
                                    className={classes.buttonProgress}
                                />
                            )}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>

            <Dialog
                open={props.modalsStatus.rename}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
                maxWidth="sm"
                fullWidth={true}
            >
                <DialogTitle id="form-dialog-title">{t("Rename")}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("enter")}{" "}
                        <strong>
                            {props.selected.length === 1
                                ? props.selected[0].name
                                : ""}
                        </strong>{" "}
                        {t("The new name: ")}
                    </DialogContentText>
                    <form onSubmit={submitRename}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="newName"
                            label={t("New name")}
                            type="text"
                            value={state.newName}
                            onChange={(e) => handleInputChange(e)}
                            fullWidth
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("Cancel")}</Button>
                    <div className={classes.wrapper}>
                        <Button
                            onClick={submitRename}
                            color="primary"
                            disabled={
                                state.newName === "" ||
                                props.modalsLoading
                            }
                        >
                            {t("Ok")}
                            {props.modalsLoading && (
                                <CircularProgress
                                    size={24}
                                    className={classes.buttonProgress}
                                />
                            )}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
            <CopyDialog
                open={props.modalsStatus.copy}
                onClose={onClose}
                presentPath={props.path}
                selected={props.selected}
                modalsLoading={props.modalsLoading}
            />

            <Dialog
                open={props.modalsStatus.move}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">{t("Move to")}</DialogTitle>
                <PathSelector
                    presentPath={props.path}
                    selected={props.selected}
                    onSelect={setMoveTarget}
                />

                {state.selectedPath !== "" && (
                    <DialogContent className={classes.contentFix}>
                        <DialogContentText>
                            {t("Move to")}{" "}
                            <strong>{state.selectedPathName}</strong>
                        </DialogContentText>
                    </DialogContent>
                )}
                <DialogActions>
                    <Button onClick={onClose}>{t("Cancel")}</Button>
                    <div className={classes.wrapper}>
                        <Button
                            onClick={submitMove}
                            color="primary"
                            disabled={
                                state.selectedPath === "" ||
                                props.modalsLoading
                            }
                        >
                            {t("Ok")}
                            {props.modalsLoading && (
                                <CircularProgress
                                    size={24}
                                    className={classes.buttonProgress}
                                />
                            )}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
            <Dialog
                open={props.modalsStatus.remove}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">{t("Delete Object")}</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        {t("Are you sure you want to delete")}
                        {props.selected.length === 1 && (
                            <strong> {props.selected[0].name} </strong>
                        )}
                        {props.selected.length > 1 && (
                            (<span>
                              {t("this")}{props.selected.length}{t("Objects")}
                            </span>)
                        )}
                        {t("?")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("Cancel")}</Button>
                    <div className={classes.wrapper}>
                        <Button
                            onClick={submitRemove}
                            color="primary"
                            disabled={props.modalsLoading}
                        >
                            {t("Ok")}
                            {props.modalsLoading && (
                                <CircularProgress
                                    size={24}
                                    className={classes.buttonProgress}
                                />
                            )}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>

            <CreatShare
                open={props.modalsStatus.share}
                onClose={onClose}
                modalsLoading={props.modalsLoading}
                setModalsLoading={props.setModalsLoading}
                selected={props.selected}
            />

            <Dialog
                open={props.modalsStatus.music}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">{t("Music player")}</DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        {props.selected.length !== 0 && (
                            <audio
                                controls
                                src={
                                    pathHelper.isSharePage(
                                        location.pathname
                                    )
                                        ? baseURL +
                                        "/share/preview/" +
                                        props.selected[0].key +
                                        (props.selected[0].key
                                            ? "?path=" +
                                            encodeURIComponent(
                                                props.selected[0]
                                                    .path === "/"
                                                    ? props
                                                        .selected[0]
                                                        .path +
                                                    props
                                                        .selected[0]
                                                        .name
                                                    : props
                                                        .selected[0]
                                                        .path +
                                                    "/" +
                                                    props
                                                        .selected[0]
                                                        .name
                                            )
                                            : "")
                                        : baseURL +
                                        "/file/preview/" +
                                        props.selected[0].id
                                }
                            />
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("Close")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={props.modalsStatus.remoteDownload}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
                fullWidth
            >
                <DialogTitle id="form-dialog-title">
                    {t("Create a new offline download task")}
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        <TextField
                            label={t("File Address")}
                            autoFocus
                            fullWidth
                            id="downloadURL"
                            onChange={handleInputChange}
                            placeholder={t("Enter the file download address, support HTTP(s)/FTP/magnet link")}
                        />
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t("Close")}</Button>
                    <Button
                        onClick={remoteDownloadNext}
                        color="primary"
                        disabled={
                            props.modalsLoading ||
                            state.downloadURL === ""
                        }
                    >
                        {t("Next step\"")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={state.remoteDownloadPathSelect}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {t("Choose storage location")}
                </DialogTitle>
                <PathSelector
                    presentPath={props.path}
                    selected={props.selected}
                    onSelect={setMoveTarget}
                />

                {state.selectedPath !== "" && (
                    <DialogContent className={classes.contentFix}>
                        <DialogContentText>
                            {t("Download to")}{" "}
                            <strong>{state.selectedPathName}</strong>
                        </DialogContentText>
                    </DialogContent>
                )}
                <DialogActions>
                    <Button onClick={onClose}>{t("Cancel")}</Button>
                    <div className={classes.wrapper}>
                        <Button
                            onClick={submitDownload}
                            color="primary"
                            disabled={
                                state.selectedPath === "" ||
                                props.modalsLoading
                            }
                        >
                            {t("Create Task")}
                            {props.modalsLoading && (
                                <CircularProgress
                                    size={24}
                                    className={classes.buttonProgress}
                                />
                            )}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
            <Dialog
                open={props.modalsStatus.torrentDownload}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {t("Choose storage location")}
                </DialogTitle>
                <PathSelector
                    presentPath={props.path}
                    selected={props.selected}
                    onSelect={setMoveTarget}
                />

                {state.selectedPath !== "" && (
                    <DialogContent className={classes.contentFix}>
                        <DialogContentText>
                            {t("Download to")}{" "}
                            <strong>{state.selectedPathName}</strong>
                        </DialogContentText>
                    </DialogContent>
                )}
                <DialogActions>
                    <Button onClick={onClose}>{t("Cancel")}</Button>
                    <div className={classes.wrapper}>
                        <Button
                            onClick={submitTorrentDownload}
                            color="primary"
                            disabled={
                                state.selectedPath === "" ||
                                props.modalsLoading
                            }
                        >
                            {t("Create Task")}
                            {props.modalsLoading && (
                                <CircularProgress
                                    size={24}
                                    className={classes.buttonProgress}
                                />
                            )}
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>

            <DecompressDialog
                open={props.modalsStatus.decompress}
                onClose={onClose}
                presentPath={props.path}
                selected={props.selected}
                modalsLoading={props.modalsLoading}
            />
            <CompressDialog
                open={props.modalsStatus.compress}
                onClose={onClose}
                presentPath={props.path}
                selected={props.selected}
                modalsLoading={props.modalsLoading}
            />
        </div>
    );
}

const Modals = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(ModalsComponent)));

export default Modals;

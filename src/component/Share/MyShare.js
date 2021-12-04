import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toggleSnackbar } from "../../actions";
import OpenIcon from "@material-ui/icons/OpenInNew";
import Pagination from "@material-ui/lab/Pagination";
import FolderIcon from "@material-ui/icons/Folder";
import LockIcon from "@material-ui/icons/Lock";
import UnlockIcon from "@material-ui/icons/LockOpen";
import EyeIcon from "@material-ui/icons/RemoveRedEye";
import DeleteIcon from "@material-ui/icons/Delete";

import {
    withStyles,
    Tooltip,
    Card,
    Avatar,
    CardHeader,
    CardActions,
    Typography,
    Grid,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField
} from "@material-ui/core";
import API from "../../middleware/Api";
import TypeIcon from "../FileManager/TypeIcon";
import Chip from "@material-ui/core/Chip";
import Divider from "@material-ui/core/Divider";
import { VisibilityOff, VpnKey } from "@material-ui/icons";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import { useHistory } from "react-router-dom";
import ToggleIcon from "material-ui-toggle-icon";
import { formatLocalTime } from "../../utils/datetime";

const styles = (theme) => ({
    cardContainer: {
        padding: theme.spacing(1)
    },
    card: {
        maxWidth: 400,
        margin: "0 auto"
    },
    actions: {
        display: "flex"
    },
    layout: {
        width: "auto",
        marginTop: "50px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginLeft: "auto",
            marginRight: "auto"
        }
    },
    shareTitle: {
        maxWidth: "200px"
    },
    avatarFile: {
        backgroundColor: theme.palette.primary.light
    },
    avatarFolder: {
        backgroundColor: theme.palette.secondary.light
    },
    gird: {
        marginTop: "30px"
    },
    loadMore: {
        textAlign: "right",
        marginTop: "20px",
        marginBottom: "40px"
    },
    badge: {
        marginLeft: theme.spacing(1),
        height: 17
    },
    orderSelect: {
        textAlign: "right",
        marginTop: 5
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

function MyShareComponent(props) {
    const [state, setState] = useState({
        page: 1,
        total: 0,
        shareList: [],
        showPwd: null,
        orderBy: "created_at DESC"
    });

    const { t } = useTranslation();
    const history = useHistory();

    function loadList(page, orderBy) {
        const order = orderBy.split(" ");
        API.get(
            "/share?page=" +
            page +
            "&order_by=" +
            order[0] +
            "&order=" +
            order[1]
        )
            .then((response) => {
                if (response.data.items.length === 0) {
                    props.toggleSnackbar(
                        "top",
                        "right",
                        t("No more"),
                        "info"
                    );
                }
                setState({
                    ...state,
                    total: response.data.total,
                    shareList: response.data.items
                });
            })
            .catch(() => {
                props.toggleSnackbar("top", "right", t("Failed to load"), "error");
            });
    }

    useEffect(() => {
        loadList(1, state.orderBy);
    }, []);

    function showPwd(pwd) {
        setState({ ...state, showPwd: pwd });
    }

    function handleClose() {
        setState({ ...state, showPwd: null });
    }

    function removeShare(id) {
        API.delete("/share/" + id)
            .then(() => {
                let oldList = state.shareList;
                oldList = oldList.filter((value) => {
                    return value.key !== id;
                });
                setState({
                    ...state, ...{
                        shareList: oldList,
                        total: state.total - 1
                    }
                });
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("Sharing canceled"),
                    "success"
                );
                if (oldList.length === 0) {
                    loadList(1, state.orderBy);
                }
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

    function changePermission(id) {
        const newPwd = Math.random().toString(36).substr(2).slice(2, 8);
        const oldList = state.shareList;
        const shareIndex = oldList.findIndex((value) => {
            return value.key === id;
        });
        API.patch("/share/" + id, {
            prop: "password",
            value: oldList[shareIndex].password === "" ? newPwd : ""
        })
            .then((response) => {
                oldList[shareIndex].password = response.data;
                setState({
                    ...state, ...{
                        shareList: oldList
                    }
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

    function changePreviewOption(id) {
        const oldList = state.shareList;
        const shareIndex = oldList.findIndex((value) => {
            return value.key === id;
        });
        API.patch("/share/" + id, {
            prop: "preview_enabled",
            value: oldList[shareIndex].preview ? "false" : "true"
        })
            .then((response) => {
                oldList[shareIndex].preview = response.data;
                setState({
                    ...state,
                    shareList: oldList
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

    function handlePageChange(event, value) {
        setState({
            ...state,
            page: value
        });
        loadList(value, state.orderBy);
    }

    function handleOrderChange(event) {
        setState({
            ...state,
            orderBy: event.target.value
        });
        loadList(state.page, event.target.value);
    }

    function isExpired(share) {
        return share.expire < -1 || share.remain_downloads === 0;
    }

    const { classes } = props;

    return (
        <div className={classes.layout}>
            <Grid container>
                <Grid sm={6} xs={6}>
                    <Typography color="textSecondary" variant="h4">
                        {t("My Share")}
                    </Typography>
                </Grid>
                <Grid sm={6} xs={6} className={classes.orderSelect}>
                    <FormControl>
                        <Select
                            color={"secondary"}
                            onChange={handleOrderChange}
                            value={state.orderBy}
                        >
                            <MenuItem value={"created_at DESC"}>
                                {t("Created from late to early")}
                            </MenuItem>
                            <MenuItem value={"created_at ASC"}>
                                {t("Created from early to late")}
                            </MenuItem>
                            <MenuItem value={"downloads DESC"}>
                                {t("The number of downloads from large to small")}
                            </MenuItem>
                            <MenuItem value={"downloads ASC"}>
                                {t("The number of downloads from small to large")}
                            </MenuItem>
                            <MenuItem value={"views DESC"}>
                                {t("Browse times from large to small")}
                            </MenuItem>
                            <MenuItem value={"views ASC"}>
                                {t("Views from small to large")}
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid container spacing={24} className={classes.gird}>
                {state.shareList.map((value) => (
                    <Grid
                        item
                        xs={12}
                        sm={4}
                        key={value.id}
                        className={classes.cardContainer}
                    >
                        <Card className={classes.card}>
                            <CardHeader
                                avatar={
                                    <div>
                                        {!value.is_dir && (
                                            <TypeIcon
                                                fileName={
                                                    value.source
                                                        ? value.source.name
                                                        : ""
                                                }
                                                isUpload
                                            />
                                        )}{" "}
                                        {value.is_dir && (
                                            <Avatar
                                                className={
                                                    classes.avatarFolder
                                                }
                                            >
                                                <FolderIcon />
                                            </Avatar>
                                        )}
                                    </div>
                                }
                                title={
                                    <Tooltip
                                        placement="top"
                                        title={
                                            value.source
                                                ? value.source.name
                                                : t("[Original object does not exist]")
                                        }
                                    >
                                        <Typography
                                            noWrap
                                            className={classes.shareTitle}
                                        >
                                            {value.source
                                                ? value.source.name
                                                : t("[Original object does not exist]")}{" "}
                                        </Typography>
                                    </Tooltip>
                                }
                                subheader={
                                    <span>
                                          {formatLocalTime(
                                              value.create_date,
                                              "YYYY-MM-DD H:mm:ss"
                                          )}
                                        {isExpired(value) && (
                                            <Chip
                                                size="small"
                                                className={classes.badge}
                                                label={t("expired")}
                                            />
                                        )}
                                      </span>
                                }
                            />
                            <Divider />
                            <CardActions
                                disableActionSpacing
                                style={{
                                    display: "block",
                                    textAlign: "right"
                                }}
                            >
                                <Tooltip placement="top" title={t("Open")}>
                                    <IconButton
                                        onClick={() =>
                                            history.push(
                                                "/s/" +
                                                value.key +
                                                (value.password === ""
                                                    ? ""
                                                    : "?password=" +
                                                    value.password)
                                            )
                                        }
                                    >
                                        <OpenIcon fontSize={"small"} />
                                    </IconButton>
                                </Tooltip>{" "}
                                {value.password !== "" && (
                                    <>
                                        <Tooltip
                                            placement="top"
                                            title={t("Change to public sharing")}
                                            onClick={() =>
                                                changePermission(
                                                    value.key
                                                )
                                            }
                                        >
                                            <IconButton>
                                                <LockIcon
                                                    fontSize={"small"}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip
                                            placement="top"
                                            title={t("View Password")}
                                            onClick={() =>
                                                showPwd(value.password)
                                            }
                                        >
                                            <IconButton>
                                                <VpnKey
                                                    fontSize={"small"}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                                {value.password === "" && (
                                    <Tooltip
                                        placement="top"
                                        title={t("Change to private sharing")}
                                        onClick={() =>
                                            changePermission(value.key)
                                        }
                                    >
                                        <IconButton>
                                            <UnlockIcon
                                                fontSize={"small"}
                                            />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip
                                    placement="top"
                                    title={
                                        value.preview
                                            ? t("Preview prohibited")
                                            : t("Allow preview")
                                    }
                                    onClick={() =>
                                        changePreviewOption(value.key)
                                    }
                                >
                                    <IconButton>
                                        <ToggleIcon
                                            on={value.preview}
                                            onIcon={
                                                <EyeIcon
                                                    fontSize={"small"}
                                                />
                                            }
                                            offIcon={
                                                <VisibilityOff
                                                    fontSize={"small"}
                                                />
                                            }
                                        />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip
                                    placement="top"
                                    title={t("Cancel sharing")}
                                    onClick={() =>
                                        removeShare(value.key)
                                    }
                                >
                                    <IconButton>
                                        <DeleteIcon fontSize={"small"} />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <div className={classes.loadMore}>
                <Pagination
                    count={Math.ceil(state.total / 18)}
                    onChange={handlePageChange}
                    color="secondary"
                />
            </div>
            {" "}
            <Dialog
                open={state.showPwd !== null}
                onClose={handleClose}
            >
                <DialogTitle> {t("Share Password")} </DialogTitle>{" "}
                <DialogContent>
                    <TextField
                        id="standard-name"
                        value={state.showPwd}
                        margin="normal"
                        autoFocus
                    />
                </DialogContent>{" "}
                <DialogActions>
                    <Button onClick={handleClose} color="default">
                        {t("Close")}{" "}
                    </Button>{" "}
                </DialogActions>{" "}
            </Dialog>{" "}
        </div>
    );
}

const MyShare = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(MyShareComponent)));

export default MyShare;

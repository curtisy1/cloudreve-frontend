import { useTranslation } from "react-i18next";
import React, { createRef, useEffect, useState } from "react";
import { connect } from "react-redux";
import PhotoIcon from "@material-ui/icons/InsertPhoto";
import GroupIcon from "@material-ui/icons/Group";
import DateIcon from "@material-ui/icons/DateRange";
import EmailIcon from "@material-ui/icons/Email";
import HomeIcon from "@material-ui/icons/Home";
import LinkIcon from "@material-ui/icons/Phonelink";
import InputIcon from "@material-ui/icons/Input";
import SecurityIcon from "@material-ui/icons/Security";
import NickIcon from "@material-ui/icons/PermContactCalendar";
import LockIcon from "@material-ui/icons/Lock";
import VerifyIcon from "@material-ui/icons/VpnKey";
import ColorIcon from "@material-ui/icons/Palette";
import {
    applyThemes,
    changeViewMethod,
    toggleDaylightMode,
    toggleSnackbar
} from "../../actions";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import {
    ListItemIcon,
    withStyles,
    Button,
    Divider,
    TextField,
    Avatar,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    ListItemAvatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Switch
} from "@material-ui/core";
import { blue, green, yellow } from "@material-ui/core/colors";
import API from "../../middleware/Api";
import Auth from "../../middleware/Auth";
import QRCode from "qrcode-react";
import { Brightness3, ListAlt, PermContactCalendar, Schedule } from "@material-ui/icons";
import Authn from "./Authn";
import { formatLocalTime, timeZone } from "../../utils/datetime";
import TimeZoneDialog from "../Modals/TimeZone";
import { useHistory } from "react-router-dom";

const styles = (theme) => ({
    layout: {
        width: "auto",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 700,
            marginLeft: "auto",
            marginRight: "auto"
        }
    },
    sectionTitle: {
        paddingBottom: "10px",
        paddingTop: "30px"
    },
    rightIcon: {
        marginTop: "4px",
        marginRight: "10px",
        color: theme.palette.text.secondary
    },
    uploadFromFile: {
        backgroundColor: blue[100],
        color: blue[600]
    },
    userGravatar: {
        backgroundColor: yellow[100],
        color: yellow[800]
    },
    policySelected: {
        backgroundColor: green[100],
        color: green[800]
    },
    infoText: {
        marginRight: "17px"
    },
    infoTextWithIcon: {
        marginRight: "17px",
        marginTop: "1px"
    },
    rightIconWithText: {
        marginTop: "0px",
        marginRight: "10px",
        color: theme.palette.text.secondary
    },
    iconFix: {
        marginRight: "11px",
        marginLeft: "7px",
        minWidth: 40
    },
    flexContainer: {
        display: "flex"
    },
    desenList: {
        paddingTop: 0,
        paddingBottom: 0
    },
    flexContainerResponse: {
        display: "flex",
        [theme.breakpoints.down("sm")]: {
            display: "initial"
        }
    },
    desText: {
        marginTop: "10px"
    },
    secondColor: {
        height: "20px",
        width: "20px",
        backgroundColor: theme.palette.secondary.main,
        borderRadius: "50%",
        marginRight: "17px"
    },
    firstColor: {
        height: "20px",
        width: "20px",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "50%",
        marginRight: "6px"
    },
    themeBlock: {
        height: "20px",
        width: "20px"
    },
    paddingBottom: {
        marginBottom: "30px"
    },
    paddingText: {
        paddingRight: theme.spacing(2)
    },
    qrcode: {
        width: 128,
        marginTop: 16,
        marginRight: 16
    }
});

const mapStateToProps = (state) => {
    return {
        title: state.siteConfig.title,
        authn: state.siteConfig.authn,
        viewMethod: state.viewUpdate.explorerViewMethod
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        applyThemes: (color) => {
            dispatch(applyThemes(color));
        },
        toggleDaylightMode: () => {
            dispatch(toggleDaylightMode());
        },
        changeView: (method) => {
            dispatch(changeViewMethod(method));
        }
    };
};

function UserSettingComponent(props) {
    const fileInput = createRef();
    const history = useHistory();
    const { t } = useTranslation();
    const [state, setState] = useState({
        avatarModal: false,
        nickModal: false,
        changePassword: false,
        loading: "",
        oldPwd: "",
        newPwd: "",
        webdavPwd: "",
        newPwdRepeat: "",
        twoFactor: false,
        authCode: "",
        changeTheme: false,
        chosenTheme: null,
        showWebDavUrl: false,
        showWebDavUserName: false,
        changeWebDavPwd: false,
        groupBackModal: false,
        changePolicy: false,
        changeTimeZone: false,
        settings: {
            uid: 0,
            group_expires: 0,
            policy: {
                current: {
                    name: "-",
                    id: ""
                },
                options: []
            },
            qq: "",
            homepage: true,
            two_factor: "",
            two_fa_secret: "",
            prefer_theme: "",
            themes: {},
            authn: []
        }
    });

    function handleClose() {
        setState({
            ...state,
            avatarModal: false,
            nickModal: false,
            changePassword: false,
            loading: "",
            twoFactor: false,
            changeTheme: false,
            showWebDavUrl: false,
            showWebDavUserName: false,
            changeWebDavPwd: false,
            groupBackModal: false,
            changePolicy: false
        });
    }

    function loadSetting() {
        API.get("/user/setting")
            .then((response) => {
                response.data.themes = JSON.parse(response.data.themes);
                setState({
                    ...state,
                    settings: response.data
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

    useEffect(() => {
        loadSetting();
    }, []);

    function toggleViewMethod() {
        const newMethod =
            props.viewMethod === "icon"
                ? "list"
                : props.viewMethod === "list"
                    ? "smallIcon"
                    : "icon";
        Auth.SetPreference("view_method", newMethod);
        props.changeView(newMethod);
    }

    function useGravatar() {
        setState({
            ...state,
            loading: "gravatar"
        });
        API.put("/user/setting/avatar")
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("The avatar has been updated and will take effect after refreshing"),
                    "success"
                );
                setState({
                    ...state,
                    loading: ""
                });
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                setState({
                    ...state,
                    loading: ""
                });
            });
    }

    function changeNick() {
        setState({
            ...state,
            loading: "nick"
        });
        API.patch("/user/setting/nick", {
            nick: state.nick
        })
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("The nickname has been changed and will take effect after refreshing"),
                    "success"
                );
                setState({
                    ...state,
                    loading: ""
                });
                handleClose();
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                setState({
                    ...state,
                    loading: ""
                });
            });
    }

    function uploadAvatar() {
        setState({
            ...state,
            loading: "avatar"
        });
        const formData = new FormData();
        formData.append("avatar", fileInput.current.files[0]);
        API.post("/user/setting/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("The avatar has been updated and will take effect after refreshing"),
                    "success"
                );
                setState({
                    ...state,
                    loading: ""
                });
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                setState({
                    ...state,
                    loading: ""
                });
            });
    }

    function handleToggle() {
        API.patch("/user/setting/homepage", {
            status: !state.settings.homepage
        })
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("Settings have been saved"),
                    "success"
                );
                setState({
                    ...state,
                    settings: {
                        ...state.settings,
                        homepage: !state.settings.homepage
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

    function changhePwd() {
        if (state.newPwd !== state.newPwdRepeat) {
            props.toggleSnackbar(
                "top",
                "right",
                t("The two password entries are inconsistent"),
                "warning"
            );
            return;
        }
        setState({
            ...state,
            loading: "changePassword"
        });
        API.patch("/user/setting/password", {
            old: state.oldPwd,
            new: state.newPwd
        })
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("Password has been updated"),
                    "success"
                );
                setState({
                    ...state,
                    loading: ""
                });
                handleClose();
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                setState({
                    ...state,
                    loading: ""
                });
            });
    }

    function changeTheme() {
        setState({
            ...state,
            loading: "changeTheme"
        });
        API.patch("/user/setting/theme", {
            theme: state.chosenTheme
        })
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("The theme color has been changed"),
                    "success"
                );
                props.applyThemes(state.chosenTheme);
                setState({
                    ...state,
                    loading: ""
                });
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                setState({
                    ...state,
                    loading: ""
                });
            });
    }

    function init2FA() {
        if (state.settings.two_factor) {
            setState({ ...state, twoFactor: true });
            return;
        }
        API.get("/user/setting/2fa")
            .then((response) => {
                setState({
                    ...state,
                    two_fa_secret: response.data,
                    twoFactor: true
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

    function twoFactor() {
        setState({
            ...state,
            loading: "twoFactor"
        });
        API.patch("/user/setting/2fa", {
            code: state.authCode
        })
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t("Settings saved"),
                    "success"
                );
                setState({
                    ...state,
                    loading: "",
                    settings: {
                        ...state.settings,
                        two_factor: !state.settings.two_factor
                    }
                });
                handleClose();
            })
            .catch((error) => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                setState({
                    ...state,
                    loading: ""
                });
            });
    }

    function handleChange(name) {
        return (event) => {
            setState({ ...state, [name]: event.target.value });
        };
    }

    function handleAlignment(event, chosenTheme) {
        setState({ ...state, chosenTheme });
    }

    function toggleThemeMode(current) {
        if (current !== null) {
            props.toggleDaylightMode();
            Auth.SetPreference("theme_mode", null);
        }
    }

    const { classes } = props;
    const user = Auth.GetUser();
    const dark = Auth.GetPreference("theme_mode");

    return (
        <div>
            <div className={classes.layout}>
                <Typography
                    className={classes.sectionTitle}
                    variant="subtitle2"
                >
                    {t("personal information")}
                </Typography>
                <Paper>
                    <List className={classes.desenList}>
                        <ListItem
                            button
                            onClick={() =>
                                setState({ avatarModal: true })
                            }
                        >
                            <ListItemAvatar>
                                <Avatar
                                    src={
                                        "/api/v3/user/avatar/" +
                                        user.id +
                                        "/l"
                                    }
                                />
                            </ListItemAvatar>
                            <ListItemText primary={t("Avatar")} />
                            <ListItemSecondaryAction>
                                <RightIcon className={classes.rightIcon} />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem button>
                            <ListItemIcon className={classes.iconFix}>
                                <PermContactCalendar />
                            </ListItemIcon>
                            <ListItemText primary="UID" />

                            <ListItemSecondaryAction>
                                <Typography
                                    className={classes.infoTextWithIcon}
                                    color="textSecondary"
                                >
                                    {state.settings.uid}
                                </Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem
                            button
                            onClick={() =>
                                setState({ nickModal: true })
                            }
                        >
                            <ListItemIcon className={classes.iconFix}>
                                <NickIcon />
                            </ListItemIcon>
                            <ListItemText primary={t("Nickname")} />

                            <ListItemSecondaryAction
                                onClick={() =>
                                    setState({ nickModal: true })
                                }
                                className={classes.flexContainer}
                            >
                                <Typography
                                    className={classes.infoTextWithIcon}
                                    color="textSecondary"
                                >
                                    {user.nickname}
                                </Typography>
                                <RightIcon
                                    className={classes.rightIconWithText}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem button>
                            <ListItemIcon className={classes.iconFix}>
                                <EmailIcon />
                            </ListItemIcon>
                            <ListItemText primary="Email" />

                            <ListItemSecondaryAction>
                                <Typography
                                    className={classes.infoText}
                                    color="textSecondary"
                                >
                                    {user.user_name}
                                </Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem button>
                            <ListItemIcon className={classes.iconFix}>
                                <GroupIcon />
                            </ListItemIcon>
                            <ListItemText primary={t("User group")} />

                            <ListItemSecondaryAction>
                                <Typography
                                    className={classes.infoText}
                                    color="textSecondary"
                                >
                                    {user.group.name}
                                </Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem button>
                            <ListItemIcon className={classes.iconFix}>
                                <DateIcon />
                            </ListItemIcon>
                            <ListItemText primary={t("Registration time")} />

                            <ListItemSecondaryAction>
                                <Typography
                                    className={classes.infoText}
                                    color="textSecondary"
                                >
                                    {formatLocalTime(
                                        user.created_at,
                                        "YYYY-MM-DD H:mm:ss"
                                    )}
                                </Typography>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>
                <Typography
                    className={classes.sectionTitle}
                    variant="subtitle2"
                >
                    {t("Security and Privacy")}
                </Typography>
                <Paper>
                    <List className={classes.desenList}>
                        <ListItem button>
                            <ListItemIcon className={classes.iconFix}>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary={t("Homepage")} />

                            <ListItemSecondaryAction>
                                <Switch
                                    onChange={handleToggle}
                                    checked={state.settings.homepage}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem
                            button
                            onClick={() =>
                                setState({ changePassword: true })
                            }
                        >
                            <ListItemIcon className={classes.iconFix}>
                                <LockIcon />
                            </ListItemIcon>
                            <ListItemText primary={t("Login Password")} />

                            <ListItemSecondaryAction
                                className={classes.flexContainer}
                            >
                                <RightIcon className={classes.rightIcon} />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem button onClick={() => init2FA()}>
                            <ListItemIcon className={classes.iconFix}>
                                <VerifyIcon />
                            </ListItemIcon>
                            <ListItemText primary={t("Two-step verification")} />

                            <ListItemSecondaryAction
                                className={classes.flexContainer}
                            >
                                <Typography
                                    className={classes.infoTextWithIcon}
                                    color="textSecondary"
                                >
                                    {!state.settings.two_factor
                                        ? t("Not configured")
                                        : t("activated")}
                                </Typography>
                                <RightIcon
                                    className={classes.rightIconWithText}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>

                <Authn
                    list={state.settings.authn}
                    add={(credential) => {
                        setState({
                            settings: {
                                ...state.settings,
                                authn: [
                                    ...state.settings.authn,
                                    credential
                                ]
                            }
                        });
                    }}
                    remove={(id) => {
                        let credentials = [...state.settings.authn];
                        credentials = credentials.filter((v) => {
                            return v.id !== id;
                        });
                        setState({
                            settings: {
                                ...state.settings,
                                authn: credentials
                            }
                        });
                    }}
                />

                <Typography
                    className={classes.sectionTitle}
                    variant="subtitle2"
                >
                    {t("Personalise")}
                </Typography>
                <Paper>
                    <List className={classes.desenList}>
                        <ListItem
                            button
                            onClick={() =>
                                setState({ changeTheme: true })
                            }
                        >
                            <ListItemIcon className={classes.iconFix}>
                                <ColorIcon />
                            </ListItemIcon>
                            <ListItemText primary={t("Theme Colors")} />

                            <ListItemSecondaryAction
                                className={classes.flexContainer}
                            >
                                <div className={classes.firstColor} />
                                <div className={classes.secondColor} />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem
                            button
                            onClick={() => toggleThemeMode(dark)}
                        >
                            <ListItemIcon className={classes.iconFix}>
                                <Brightness3 />
                            </ListItemIcon>
                            <ListItemText primary={t("Dark Mode")} />

                            <ListItemSecondaryAction
                                className={classes.flexContainer}
                            >
                                <Typography
                                    className={classes.infoTextWithIcon}
                                    color="textSecondary"
                                >
                                    {dark &&
                                        (dark === "dark"
                                            ? t("Preferences on")
                                            : t("Preferences off"))}
                                    {dark === null && t("Follow the system")}
                                </Typography>
                                <RightIcon
                                    className={classes.rightIconWithText}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem
                            button
                            onClick={() => toggleViewMethod()}
                        >
                            <ListItemIcon className={classes.iconFix}>
                                <ListAlt />
                            </ListItemIcon>
                            <ListItemText primary={t("Document tiles")} />

                            <ListItemSecondaryAction
                                className={classes.flexContainer}
                            >
                                <Typography
                                    className={classes.infoTextWithIcon}
                                    color="textSecondary"
                                >
                                    {props.viewMethod === "icon" &&
                                        t("Large Icon")}
                                    {props.viewMethod === "list" &&
                                        t("List")}
                                    {props.viewMethod ===
                                        "smallIcon" && t("Small Icon")}
                                </Typography>
                                <RightIcon
                                    className={classes.rightIconWithText}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem
                            onClick={() =>
                                setState({ changeTimeZone: true })
                            }
                            button
                        >
                            <ListItemIcon className={classes.iconFix}>
                                <Schedule />
                            </ListItemIcon>
                            <ListItemText primary={t("Time zone")} />

                            <ListItemSecondaryAction
                                className={classes.flexContainer}
                            >
                                <Typography
                                    className={classes.infoTextWithIcon}
                                    color="textSecondary"
                                >
                                    {timeZone}
                                </Typography>
                                <RightIcon
                                    className={classes.rightIconWithText}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </Paper>
                {user.group.webdav && (
                    <div>
                        <Typography
                            className={classes.sectionTitle}
                            variant="subtitle2"
                        >
                            WebDAV
                        </Typography>
                        <Paper>
                            <List className={classes.desenList}>
                                <ListItem
                                    button
                                    onClick={() =>
                                        setState({
                                            showWebDavUrl: true
                                        })
                                    }
                                >
                                    <ListItemIcon
                                        className={classes.iconFix}
                                    >
                                        <LinkIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t("Connect Address")} />

                                    <ListItemSecondaryAction
                                        className={classes.flexContainer}
                                    >
                                        <RightIcon
                                            className={classes.rightIcon}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                                <ListItem
                                    button
                                    onClick={() =>
                                        setState({
                                            showWebDavUserName: true
                                        })
                                    }
                                >
                                    <ListItemIcon
                                        className={classes.iconFix}
                                    >
                                        <InputIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t("Username")} />

                                    <ListItemSecondaryAction
                                        className={classes.flexContainer}
                                    >
                                        <RightIcon
                                            className={classes.rightIcon}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                                <ListItem
                                    button
                                    onClick={() =>
                                        history.push("/webdav?")
                                    }
                                >
                                    <ListItemIcon
                                        className={classes.iconFix}
                                    >
                                        <SecurityIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={t("Account Management")} />

                                    <ListItemSecondaryAction
                                        className={classes.flexContainer}
                                    >
                                        <RightIcon
                                            className={classes.rightIcon}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </List>
                        </Paper>
                    </div>
                )}
                <div className={classes.paddingBottom} />
            </div>
            <TimeZoneDialog
                onClose={() => setState({ changeTimeZone: false })}
                open={state.changeTimeZone}
            />
            <Dialog
                open={state.avatarModal}
                onClose={handleClose}
            >
                <DialogTitle>{t("Modify avatar")}</DialogTitle>
                <List>
                    <ListItem
                        button
                        component="label"
                        disabled={state.loading === "avatar"}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            ref={fileInput}
                            onChange={uploadAvatar}
                        />
                        <ListItemAvatar>
                            <Avatar className={classes.uploadFromFile}>
                                <PhotoIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={t("Upload from file")} />
                    </ListItem>
                    <ListItem
                        button
                        onClick={useGravatar}
                        disabled={state.loading === "gravatar"}
                    >
                        <ListItemAvatar>
                            <Avatar className={classes.userGravatar}>
                                <FingerprintIcon />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            className={classes.paddingText}
                            primary={t("Use Gravatar Avatar ")}
                        />
                    </ListItem>
                </List>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t("Cancel")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={state.nickModal} onClose={handleClose}>
                <DialogTitle>{t("Change username")}</DialogTitle>
                <DialogContent>
                    <TextField
                        id="standard-name"
                        label={t("Nickname")}
                        className={classes.textField}
                        value={state.nick}
                        onChange={handleChange("nick")}
                        margin="normal"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="default">
                        {t("Cancel")}
                    </Button>
                    <Button
                        onClick={changeNick}
                        color="primary"
                        disabled={
                            state.loading === "nick" ||
                            state.nick === ""
                        }
                    >
                        {t("save")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={state.changePassword}
                onClose={handleClose}
            >
                <DialogTitle>{t("Change password")}</DialogTitle>
                <DialogContent>
                    <div>
                        <TextField
                            id="standard-name"
                            label={t("Old password")}
                            type="password"
                            className={classes.textField}
                            value={state.oldPwd}
                            onChange={handleChange("oldPwd")}
                            margin="normal"
                            autoFocus
                        />
                    </div>
                    <div>
                        <TextField
                            id="standard-name"
                            label={t("New password")}
                            type="password"
                            className={classes.textField}
                            value={state.newPwd}
                            onChange={handleChange("newPwd")}
                            margin="normal"
                        />
                    </div>
                    <div>
                        <TextField
                            id="standard-name"
                            label={t("Confirm password")}
                            type="password"
                            className={classes.textField}
                            value={state.newPwdRepeat}
                            onChange={handleChange("newPwdRepeat")}
                            margin="normal"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="default">
                        {t("Cancel")}
                    </Button>
                    <Button
                        onClick={changhePwd}
                        color="primary"
                        disabled={
                            state.loading === "changePassword" ||
                            state.oldPwd === "" ||
                            state.newPwdRepeat === "" ||
                            state.newPwd === ""
                        }
                    >
                        {t("save")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={state.twoFactor} onClose={handleClose}>
                <DialogTitle>
                    {state.settings.two_factor ? t("Close") : t("Enable")}
                    {}
                    {t("Two-step verification")}
                </DialogTitle>
                <DialogContent>
                    <div className={classes.flexContainerResponse}>
                        {!state.settings.two_factor && (
                            <div className={classes.qrcode}>
                                <QRCode
                                    value={
                                        "otpauth://totp/" +
                                        props.title +
                                        "?secret=" +
                                        state.two_fa_secret
                                    }
                                />
                            </div>
                        )}

                        <div className={classes.desText}>
                            {!state.settings.two_factor && (
                                (<Typography>
                                    {t("Please use any two-step verification APP or password management software that supports two-step verification to scan the QR code on the left to add this site. After scanning, please fill in the 6-digit verification code given by the two-step verification APP to enable the two-step verification. ")}
                                </Typography>)
                            )}
                            {state.settings.two_factor && (
                                (<Typography>
                                    {t("Please verify the current two-step verification code.")}
                                </Typography>)
                            )}
                            <TextField
                                id="standard-name"
                                label={t("6-digit verification code")}
                                type="number"
                                className={classes.textField}
                                value={state.authCode}
                                onChange={handleChange("authCode")}
                                margin="normal"
                                autoFocus
                                fullWidth
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="default">
                        {t("Cancel")}
                    </Button>
                    <Button
                        onClick={twoFactor}
                        color="primary"
                        disabled={
                            state.loading === "twoFactor" ||
                            state.authCode === ""
                        }
                    >
                        {state.settings.two_factor ? t("Close") : t("Enable")}
                        {t("Two-step verification")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={state.changeTheme}
                onClose={handleClose}
            >
                <DialogTitle>{t("Change theme color")}</DialogTitle>
                <DialogContent>
                    <ToggleButtonGroup
                        value={state.chosenTheme}
                        exclusive
                        onChange={handleAlignment}
                    >
                        {Object.keys(state.settings.themes).map(
                            (value, key) => (
                                <ToggleButton value={value} key={key}>
                                    <div
                                        className={classes.themeBlock}
                                        style={{ backgroundColor: value }}
                                    />
                                </ToggleButton>
                            )
                        )}
                    </ToggleButtonGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="default">
                        {t("Cancel")}
                    </Button>
                    <Button
                        onClick={changeTheme}
                        color="primary"
                        disabled={
                            state.loading === "changeTheme" ||
                            state.chosenTheme === null
                        }
                    >
                        {t("save")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={state.showWebDavUrl}
                onClose={handleClose}
            >
                <DialogTitle>{t("WebDAV connection address")}</DialogTitle>
                <DialogContent>
                    <TextField
                        id="standard-name"
                        className={classes.textField}
                        value={window.location.origin + "/dav"}
                        margin="normal"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="default">
                        {t("Close")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={state.showWebDavUserName}
                onClose={handleClose}
            >
                <DialogTitle>{t("WebDAV username")}</DialogTitle>
                <DialogContent>
                    <TextField
                        id="standard-name"
                        className={classes.textField}
                        value={user.user_name}
                        margin="normal"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="default">
                        {t("Close")}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

const UserSetting = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(UserSettingComponent)));

export default UserSetting;

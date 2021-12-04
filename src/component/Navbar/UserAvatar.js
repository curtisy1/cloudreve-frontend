import { useTranslation } from "react-i18next";
import React  from "react";
import { connect } from "react-redux";
import SettingIcon from "@material-ui/icons/Settings";
import UserAvatarPopover from "./UserAvatarPopover";
import { AccountCircle } from "mdi-material-ui";
import { setUserPopover } from "../../actions";
import Auth from "../../middleware/Auth";
import {
    withStyles,
    Grow,
    Avatar,
    IconButton,
    Tooltip
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import pathHelper from "../../utils/page";
import DarkModeSwitcher from "./DarkModeSwitcher";
import { Home } from "@material-ui/icons";

const mapStateToProps = (state) => {
    return {
        selected: state.explorer.selected,
        isMultiple: state.explorer.selectProps.isMultiple,
        withFolder: state.explorer.selectProps.withFolder,
        withFile: state.explorer.selectProps.withFile,
        isLogin: state.viewUpdate.isLogin
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setUserPopover: (anchor) => {
            dispatch(setUserPopover(anchor));
        }
    };
};

const styles = (theme) => ({
    mobileHidden: {
        [theme.breakpoints.down("xs")]: {
            display: "none"
        },
        whiteSpace: "nowrap"
    },
    avatar: {
        width: "30px",
        height: "30px"
    },
    header: {
        display: "flex",
        padding: "20px 20px 20px 20px"
    },
    largeAvatar: {
        height: "90px",
        width: "90px"
    },
    info: {
        marginLeft: "10px",
        width: "139px"
    },
    badge: {
        marginTop: "10px"
    },
    visitorMenu: {
        width: 200
    }
});

function UserAvatarComponent(props) {
    const {t} = useTranslation();
    const history = useHistory();

    function showUserInfo(e) {
        props.setUserPopover(e.currentTarget);
    }

    function returnHome() {
        window.location.href = "/home";
    }

    const { classes } = props;
    const loginCheck = Auth.Check(props.isLogin);
    const user = Auth.GetUser(props.isLogin);
    const isAdminPage = pathHelper.isAdminPage(
        props.location.pathname
    );

    return (
        <div className={classes.mobileHidden}>
            <Grow
                in={
                    props.selected.length <= 1 &&
                    !(!props.isMultiple && props.withFile)
                }
            >
                <div>
                    {!isAdminPage && (
                        <>
                            <DarkModeSwitcher position="top" />
                            {loginCheck && (
                                <>
                                    <Tooltip
                                        title={t("Settings")}
                                        placement="bottom"
                                    >
                                        <IconButton
                                            onClick={() =>
                                                history.push(
                                                    "/setting?"
                                                )
                                            }
                                            color="inherit"
                                        >
                                            <SettingIcon />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </>
                    )}
                    {isAdminPage && (
                        <Tooltip title={t("return to home page")} placement="bottom">
                            <IconButton
                                color="inherit"
                                onClick={returnHome}
                            >
                                <Home />
                            </IconButton>
                        </Tooltip>
                    )}
                    <IconButton color="inherit" onClick={showUserInfo}>
                        {!loginCheck && <AccountCircle />}
                        {loginCheck && (
                            <Avatar
                                src={
                                    "/api/v3/user/avatar/" + user.id + "/s"
                                }
                                className={classes.avatar}
                            />
                        )}
                    </IconButton>{" "}
                </div>
            </Grow>
            <UserAvatarPopover />
        </div>
    );
}

const UserAvatar = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(UserAvatarComponent)));

export default UserAvatar;

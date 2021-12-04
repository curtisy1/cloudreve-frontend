import { useTranslation } from "react-i18next";
import React  from "react";
import { connect } from "react-redux";
import {
    LogoutVariant,
    HomeAccount,
    DesktopMacDashboard,
    AccountArrowRight,
    AccountPlus,
} from "mdi-material-ui";
import {
    setSessionStatus,
    setUserPopover,
    toggleSnackbar,
} from "../../actions";
import { useHistory, useLocation } from "react-router-dom";
import Auth from "../../middleware/Auth";
import {
    withStyles,
    Avatar,
    Popover,
    Typography,
    Chip,
    ListItemIcon,
    MenuItem,
    Divider,
} from "@material-ui/core";
import API from "../../middleware/Api";
import pathHelper from "../../utils/page";

const mapStateToProps = (state) => {
    return {
        anchorEl: state.viewUpdate.userPopoverAnchorEl,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setUserPopover: (anchor) => {
            dispatch(setUserPopover(anchor));
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        setSessionStatus: (status) => {
            dispatch(setSessionStatus(status));
        },
    };
};
const styles = () => ({
    avatar: {
        width: "30px",
        height: "30px",
    },
    header: {
        display: "flex",
        padding: "20px 20px 20px 20px",
    },
    largeAvatar: {
        height: "90px",
        width: "90px",
    },
    info: {
        marginLeft: "10px",
        width: "139px",
    },
    badge: {
        marginTop: "10px",
    },
    visitorMenu: {
        width: 200,
    },
});

function UserAvatarPopoverComponent(props) {
    const { t} = useTranslation();
    const location = useLocation();
    const history = useHistory();

    function handleClose () {
        props.setUserPopover(null);
    }

    function sigOut () {
        API.delete("/user/session/")
            .then(() => {
                props.toggleSnackbar(
                    "top",
                    "right",
                    t('You have logged out'),
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
            .then(() => {
                handleClose();
            });
    }

        const { classes } = props;
        const user = Auth.GetUser();
        const isAdminPage = pathHelper.isAdminPage(
            location.pathname
        );

        return (
          <Popover
              open={props.anchorEl !== null}
              onClose={handleClose}
              anchorEl={props.anchorEl}
              anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
              }}
              transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
              }}
          >
              {!Auth.Check() && (
                  <div className={classes.visitorMenu}>
                      <Divider />
                      <MenuItem
                          onClick={() => history.push("/login")}
                      >
                        <ListItemIcon>
                            <AccountArrowRight />
                        </ListItemIcon>
                        {t('Log in')}
                      </MenuItem>
                      <MenuItem
                          onClick={() => history.push("/signup")}
                      >
                        <ListItemIcon>
                            <AccountPlus />
                        </ListItemIcon>
                        {t('Register')}
                      </MenuItem>
                  </div>
              )}
              {Auth.Check() && (
                  <div>
                      <div className={classes.header}>
                          <div className={classes.largeAvatarContainer}>
                              <Avatar
                                  className={classes.largeAvatar}
                                  src={
                                      "/api/v3/user/avatar/" + user.id + "/l"
                                  }
                              />
                          </div>
                          <div className={classes.info}>
                              <Typography noWrap>{user.nickname}</Typography>
                              <Typography
                                  color="textSecondary"
                                  style={{
                                      fontSize: "0.875rem",
                                  }}
                                  noWrap
                              >
                                  {user.user_name}
                              </Typography>
                              <Chip
                                  className={classes.badge}
                                  color={
                                      user.group.id === 1
                                          ? "secondary"
                                          : "default"
                                  }
                                  label={user.group.name}
                              />
                          </div>
                      </div>
                      <div>
                          <Divider />
                          {!isAdminPage && (
                              (<MenuItem
                                  style={{
                                      padding: " 11px 16px 11px 16px",
                                  }}
                                  onClick={() => {
                                      handleClose();
                                      history.push(
                                          "/profile/" + user.id
                                      );
                                  }}
                              >
                                <ListItemIcon>
                                    <HomeAccount />
                                </ListItemIcon>
                                {t('Homepage')}
                              </MenuItem>)
                          )}
                          {user.group.id === 1 && (
                              (<MenuItem
                                  style={{
                                      padding: " 11px 16px 11px 16px",
                                  }}
                                  onClick={() => {
                                      handleClose();
                                      history.push("/admin/home");
                                  }}
                              >
                                <ListItemIcon>
                                    <DesktopMacDashboard />
                                </ListItemIcon>
                                {t('Admin Panel')}
                              </MenuItem>)
                          )}

                          <MenuItem
                              style={{
                                  padding: " 11px 16px 11px 16px",
                              }}
                              onClick={sigOut}
                          >
                            <ListItemIcon>
                                <LogoutVariant />
                            </ListItemIcon>
                            {t('Sign out')}
                          </MenuItem>
                      </div>
                  </div>
              )}
          </Popover>
        );
}

const UserAvatarPopover = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(UserAvatarPopoverComponent)));

export default UserAvatarPopover;

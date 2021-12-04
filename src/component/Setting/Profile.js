import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { toggleSnackbar } from "../../actions";
import API from "../../middleware/Api";

import {
    withStyles,
    Paper,
    Avatar,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Grid
} from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";
import { useHistory } from "react-router-dom";

const styles = (theme) => ({
    layout: {
        width: "auto",
        marginTop: "50px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        marginBottom: "30px",
        [theme.breakpoints.up("sm")]: {
            width: 700,
            marginLeft: "auto",
            marginRight: "auto"
        }
    },
    userNav: {
        height: "270px",
        backgroundColor: theme.palette.primary.main,
        padding: "20px 20px 2em",
        backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 900'%3E%3Cpolygon fill='" +
            theme.palette.primary.light.replace("#", "%23") +
            "' points='957 450 539 900 1396 900'/%3E%3Cpolygon fill='" +
            theme.palette.primary.dark.replace("#", "%23") +
            "' points='957 450 872.9 900 1396 900'/%3E%3Cpolygon fill='" +
            theme.palette.secondary.main.replace("#", "%23") +
            "' points='-60 900 398 662 816 900'/%3E%3Cpolygon fill='" +
            theme.palette.secondary.dark.replace("#", "%23") +
            "' points='337 900 398 662 816 900'/%3E%3Cpolygon fill='" +
            theme.palette.secondary.light.replace("#", "%23") +
            "' points='1203 546 1552 900 876 900'/%3E%3Cpolygon fill='" +
            theme.palette.secondary.main.replace("#", "%23") +
            "' points='1203 546 1552 900 1162 900'/%3E%3Cpolygon fill='" +
            theme.palette.primary.dark.replace("#", "%23") +
            "' points='641 695 886 900 367 900'/%3E%3Cpolygon fill='" +
            theme.palette.primary.main.replace("#", "%23") +
            "' points='587 900 641 695 886 900'/%3E%3Cpolygon fill='" +
            theme.palette.secondary.light.replace("#", "%23") +
            "' points='1710 900 1401 632 1096 900'/%3E%3Cpolygon fill='" +
            theme.palette.secondary.dark.replace("#", "%23") +
            "' points='1710 900 1401 632 1365 900'/%3E%3Cpolygon fill='" +
            theme.palette.secondary.main.replace("#", "%23") +
            "' points='1210 900 971 687 725 900'/%3E%3Cpolygon fill='" +
            theme.palette.secondary.dark.replace("#", "%23") +
            "' points='943 900 1210 900 971 687'/%3E%3C/svg%3E\")",
        backgroundSize: "cover",
        backgroundPosition: "bottom"
    },
    avatarContainer: {
        height: "80px",
        width: "80px",
        borderRaidus: "50%",
        margin: "auto",
        marginTop: "50px",
        boxShadow:
            "0 2px 5px 0 rgba(0,0,0,0.16), 0 2px 10px 0 rgba(0,0,0,0.12)",
        border: "2px solid #fff"
    },
    nickName: {
        width: "200px",
        margin: "auto",
        textAlign: "center",
        marginTop: "1px",
        fontSize: "25px",
        color: "#ffffff",
        opacity: "0.81"
    },
    th: {
        minWidth: "106px"
    },
    mobileHide: {
        [theme.breakpoints.down("md")]: {
            display: "none"
        }
    },
    tableLink: {
        cursor: "pointer"
    },
    navigator: {
        padding: theme.spacing(2)
    },
    pageInfo: {
        marginTop: "14px",
        marginLeft: "23px"
    },
    infoItem: {
        paddingLeft: "46px!important",
        paddingBottom: "20px!important"
    },
    infoContainer: {
        marginTop: "30px"
    },
    tableContainer: {
        overflowX: "auto"
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

function ProfileComponent(props) {
    const { t } = useTranslation();
    const history = useHistory();
    const [state, setState] = useState({
        listType: 0,
        shareList: [],
        page: 1,
        user: null,
        total: 0
    });

    function loadList(page, order) {
        API.get(
            "/user/profile/" +
            props.match.params.id +
            "?page=" +
            page +
            "&type=" +
            order
        )
            .then((response) => {
                setState({
                    ...state,
                    shareList: response.data.items,
                    user: response.data.user,
                    total: response.data.total
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

    function handleChange(event, listType) {
        setState({ ...state, listType });
        if (listType === 1) {
            loadList(1, "hot");
        } else if (listType === 0) {
            loadList(1, "default");
        }
    }

    useEffect(() => {
        loadList(1, "default");
    }, []);

    const { classes } = props;

    return (
        <div className={classes.layout}>
            {state.user === null && <div />}
            {state.user !== null && (
                <Paper square>
                    <div className={classes.userNav}>
                        <div>
                            <Avatar
                                className={classes.avatarContainer}
                                src={
                                    "/api/v3/user/avatar/" +
                                    state.user.id +
                                    "/l"
                                }
                            />
                        </div>
                        <div>
                            <Typography className={classes.nickName} noWrap>
                                {state.user.nick}
                            </Typography>
                        </div>
                    </div>
                    <Tabs
                        value={state.listType}
                        indicatorColor="primary"
                        textColor="primary"
                        onChange={handleChange}
                        centered
                    >
                        <Tab label={t("Share all")} />
                        <Tab label={t("Popular Shares")} />
                        <Tab label={t("personal information")} />
                    </Tabs>
                    {state.listType === 2 && (
                        <div className={classes.infoContainer}>
                            <Grid container spacing={24}>
                                <Grid
                                    item
                                    md={4}
                                    xs={12}
                                    className={classes.infoItem}
                                >
                                    <Typography
                                        color="textSecondary"
                                        variant="h6"
                                    >
                                        UID
                                    </Typography>
                                    <Typography>
                                        {state.user.id}
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    md={4}
                                    xs={12}
                                    className={classes.infoItem}
                                >
                                    <Typography
                                        color="textSecondary"
                                        variant="h6"
                                    >
                                        {t("Nickname")}
                                    </Typography>
                                    <Typography>
                                        {state.user.nick}
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    md={4}
                                    xs={12}
                                    className={classes.infoItem}
                                >
                                    <Typography
                                        color="textSecondary"
                                        variant="h6"
                                    >
                                        {t("User group")}
                                    </Typography>
                                    <Typography>
                                        {state.user.group}
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    md={4}
                                    xs={12}
                                    className={classes.infoItem}
                                >
                                    <Typography
                                        color="textSecondary"
                                        variant="h6"
                                    >
                                        {t("Total Shares")}
                                    </Typography>
                                    <Typography>
                                        {state.total}
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    md={4}
                                    xs={12}
                                    className={classes.infoItem}
                                >
                                    <Typography
                                        color="textSecondary"
                                        variant="h6"
                                    >
                                        {t("Registration Date")}
                                    </Typography>
                                    <Typography>
                                        {state.user.date}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </div>
                    )}
                    {(state.listType === 0 ||
                        state.listType === 1) && (
                        <div>
                            <div className={classes.tableContainer}>
                                <Table className={classes.table}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t("File name")}</TableCell>
                                            <TableCell
                                                className={
                                                    classes.mobileHide
                                                }
                                            >
                                                {t("Share Date")}
                                            </TableCell>
                                            <TableCell
                                                className={[
                                                    classes.th,
                                                    classes.mobileHide
                                                ]}
                                            >
                                                {t("download times")}
                                            </TableCell>
                                            <TableCell
                                                className={[
                                                    classes.th,
                                                    classes.mobileHide
                                                ]}
                                            >
                                                {t("Views")}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {state.shareList.map(
                                            (row, id) => (
                                                <TableRow
                                                    key={id}
                                                    className={
                                                        classes.tableLink
                                                    }
                                                    onClick={() =>
                                                        history.push(
                                                            "/s/" + row.key
                                                        )
                                                    }
                                                >
                                                    <TableCell>
                                                        <Typography>
                                                            {row.source
                                                                ? row.source
                                                                    .name
                                                                : t("[expired]")}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell
                                                        nowrap={"nowrap"}
                                                        className={
                                                            classes.mobileHide
                                                        }
                                                    >
                                                        {row.create_date}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.mobileHide
                                                        }
                                                    >
                                                        {row.downloads}
                                                    </TableCell>
                                                    <TableCell
                                                        className={
                                                            classes.mobileHide
                                                        }
                                                    >
                                                        {row.views}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            {state.shareList.length !== 0 &&
                                state.listType === 0 && (
                                    <div className={classes.navigator}>
                                        <Pagination
                                            count={Math.ceil(
                                                state.total / 10
                                            )}
                                            onChange={(e, v) =>
                                                loadList(
                                                    v,
                                                    state.listType ===
                                                    0
                                                        ? "default"
                                                        : "hot"
                                                )
                                            }
                                            color="secondary"
                                        />
                                    </div>
                                )}
                        </div>
                    )}
                </Paper>
            )}
        </div>
    );
}

const Profile = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(ProfileComponent)));

export default Profile;

import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import SearchIcon from "@material-ui/icons/Search";
import { fade } from "@material-ui/core/styles/colorManipulator";
import FileIcon from "@material-ui/icons/InsertDriveFile";
import ShareIcon from "@material-ui/icons/Share";
import { connect } from "react-redux";
import { searchMyFile } from "../../actions";

import {
    withStyles,
    InputBase,
    Popper,
    Fade,
    Paper,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography
} from "@material-ui/core";
import pathHelper from "../../utils/page";
import { HotKeys, configure } from "react-hotkeys";
import { useHistory, useLocation } from "react-router-dom";

configure({
    ignoreTags: []
});

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        searchMyFile: (keywords) => {
            dispatch(searchMyFile(keywords));
        }
    };
};

const styles = (theme) => ({
    search: {
        [theme.breakpoints.down("sm")]: {
            display: "none"
        },
        position: "relative",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        "&:hover": {
            backgroundColor: fade(theme.palette.common.white, 0.25)
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: "100%",
        [theme.breakpoints.up("sm")]: {
            marginLeft: theme.spacing(7.2),
            width: "auto"
        }
    },
    searchIcon: {
        width: theme.spacing(9),
        height: "100%",
        position: "absolute",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    inputRoot: {
        color: "inherit",
        width: "100%"
    },
    inputInput: {
        paddingTop: theme.spacing(1),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(7),
        transition: theme.transitions.create("width"),
        width: "100%",
        [theme.breakpoints.up("md")]: {
            width: 200,
            "&:focus": {
                width: 300
            }
        }
    },
    suggestBox: {
        zIndex: "9999",
        width: 364
    }
});

const keyMap = {
    SEARCH: "enter"
};

function SearchBarComponent(props) {
    const location = useLocation();
    const history = useHistory();
    const { t } = useTranslation();
    const [state, setState] = useState({
        anchorEl: null,
        input: ""
    });

    function searchMyFile() {
        props.searchMyFile("keywords/" + state.input);
    }

    function searchShare() {
        history.push(
            "/search?keywords=" + encodeURIComponent(state.input)
        );
    }

    const handlers = {
        SEARCH: (e) => {
            if (pathHelper.isHomePage(location.pathname)) {
                searchMyFile();
            } else {
                searchShare();
            }
            e.target.blur();
        }
    };

    function handleChange(event) {
        const { currentTarget } = event;
        setState({
            anchorEl: currentTarget,
            input: event.target.value
        });
    }

    function cancelSuggest() {
        setState({
            ...state,
            input: ""
        });
    }

    const { classes } = props;
    const { anchorEl } = state;
    const id = state.input !== "" ? "simple-popper" : null;
    const isHomePage = pathHelper.isHomePage(location.pathname);

    return (
        <div className={classes.search}>
            <div className={classes.searchIcon}>
                <SearchIcon />
            </div>
            <HotKeys keyMap={keyMap} handlers={handlers}>
                <InputBase
                    placeholder={t("search...")}
                    classes={{
                        root: classes.inputRoot,
                        input: classes.inputInput
                    }}
                    onChange={handleChange}
                    onBlur={cancelSuggest}
                    value={state.input}
                />
            </HotKeys>
            <Popper
                id={id}
                open={state.input !== ""}
                anchorEl={anchorEl}
                className={classes.suggestBox}
                transition
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={350}>
                        <Paper square={true}>
                            {isHomePage && (
                                <MenuItem onClick={searchMyFile}>
                                    <ListItemIcon className={classes.icon}>
                                        <FileIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        classes={{
                                            primary: classes.primary
                                        }}
                                        primary={
                                            <Typography noWrap>
                                                {t("Search in my files")}{" "}
                                                <strong>
                                                    {state.input}
                                                </strong>
                                            </Typography>
                                        }
                                    />
                                </MenuItem>
                            )}

                            <MenuItem onClick={searchShare}>
                                <ListItemIcon className={classes.icon}>
                                    <ShareIcon />
                                </ListItemIcon>
                                <ListItemText
                                    classes={{ primary: classes.primary }}
                                    primary={
                                        <Typography noWrap>
                                            {t("Search in site-wide sharing")}{" "}
                                            <strong>
                                                {state.input}
                                            </strong>
                                        </Typography>
                                    }
                                />
                            </MenuItem>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </div>
    );
}

const SearchBar = connect(
    mapStateToProps,
    mapDispatchToProps
)((withStyles(styles)(SearchBarComponent)));

export default SearchBar;

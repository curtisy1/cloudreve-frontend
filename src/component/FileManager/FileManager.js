import React, { useEffect } from "react";
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";
import {
    closeAllModals,
    navigateTo,
    setSelectedTarget,
    toggleSnackbar
} from "../../actions";
import { changeSubTitle } from "../../redux/viewUpdate/action";
import pathHelper from "../../utils/page";
import DragLayer from "./DnD/DragLayer";
import Explorer from "./Explorer";
import Modals from "./Modals";
import Navigator from "./Navigator/Navigator";
import SideDrawer from "./Sidebar/SideDrawer";

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => {
    return {
        changeSubTitle: (text) => {
            dispatch(changeSubTitle(text));
        },
        setSelectedTarget: (targets) => {
            dispatch(setSelectedTarget(targets));
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        closeAllModals: () => {
            dispatch(closeAllModals());
        },
        navigateTo: (path) => {
            dispatch(navigateTo(path));
        }
    };
};

function FileManager(props) {
    const location = useLocation();

    useEffect(() => {
        if (pathHelper.isHomePage(location.pathname)) {
            props.changeSubTitle(null);
        }

        return function cleanup() {
            props.setSelectedTarget([]);
            props.closeAllModals();
            props.navigateTo("/");
        };
    }, []);

    return (
        <div>
            <DndProvider backend={HTML5Backend}>
                <Modals share={props.share} />
                <Navigator
                    isShare={props.isShare}
                    share={props.share}
                />
                <Explorer share={props.share} />
                <DragLayer />
            </DndProvider>
            <SideDrawer />
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FileManager);

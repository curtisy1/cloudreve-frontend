import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { baseURL } from "../../middleware/Api";
import { showImgPreivew } from "../../actions/index";
import { imgPreviewSuffix } from "../../config";
import { withStyles } from "@material-ui/core";
import pathHelper from "../../utils/page";
import { PhotoSlider } from "react-photo-view";
import "react-photo-view/dist/index.css";
import * as explorer from "../../redux/explorer/reducer";
import { useLocation } from "react-router-dom";

const styles = () => ({});

const mapStateToProps = (state) => {
    return {
        first: state.explorer.imgPreview.first,
        other: state.explorer.imgPreview.other
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        showImgPreivew: (first) => {
            dispatch(showImgPreivew(first));
        }
    };
};

function ImagePreviewComponent(props) {
    const location = useLocation();
    const [state, setState] = useState({
        items: [],
        photoIndex: 0,
        isOpen: false
    });

    useEffect(() => {
        const items = [];
        let firstOne = 0;
        if (props.first.id !== "") {
            if (
                pathHelper.isSharePage(location.pathname) &&
                !props.first.path
            ) {
                const newImg = {
                    intro: props.first.name,
                    src: baseURL + "/share/preview/" + props.first.key
                };
                firstOne = 0;
                items.push(newImg);
                setState({
                    photoIndex: firstOne,
                    items: items,
                    isOpen: true
                });
                return;
            }
            // eslint-disable-next-line
            props.other.map((value) => {
                const fileType = value.name.split(".").pop().toLowerCase();
                if (imgPreviewSuffix.indexOf(fileType) !== -1) {
                    let src;
                    if (pathHelper.isSharePage(location.pathname)) {
                        src = baseURL + "/share/preview/" + value.key;
                        src =
                            src +
                            "?path=" +
                            encodeURIComponent(
                                value.path === "/"
                                    ? value.path + value.name
                                    : value.path + "/" + value.name
                            );
                    } else {
                        src = baseURL + "/file/preview/" + value.id;
                    }
                    const newImg = {
                        intro: value.name,
                        src: src
                    };
                    if (
                        value.path === props.first.path &&
                        value.name === props.first.name
                    ) {
                        firstOne = items.length;
                    }
                    items.push(newImg);
                }
            });
            setState({
                photoIndex: firstOne,
                items: items,
                isOpen: true
            });
        }
    }, [props]);

    function handleClose() {
        props.showImgPreivew(explorer.initState.imgPreview.first);
        setState({
            ...state,
            isOpen: false
        });
    }

    const { photoIndex, isOpen, items } = state;

    return (
        <div>
            {isOpen && (
                <PhotoSlider
                    images={items}
                    visible={isOpen}
                    onClose={() => handleClose()}
                    index={photoIndex}
                    onIndexChange={(n) =>
                        setState({
                            ...state,
                            photoIndex: n
                        })
                    }
                />
            )}
        </div>
    );
}

const ImgPreview = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(ImagePreviewComponent));

export default ImgPreview;

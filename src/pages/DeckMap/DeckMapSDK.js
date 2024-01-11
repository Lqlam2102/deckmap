/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { Deck } from '@deck.gl/core';
// import { HexagonLayer } from '@deck.gl/aggregation-layers';
// import * as d3 from 'd3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleDown,
    faChevronLeft,
    faChevronRight,
    faHouse,
    faLayerGroup,
    faSpinner,
    faToolbox,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Matrix4 } from '@math.gl/core';
import styles from './DeckMapSDK.module.scss';
import classNames from 'classnames/bind';
import images from '~/assets/image';
// import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { PolygonLayer } from '@deck.gl/layers';
import cookies from 'react-cookies';
import Apis from '~/configs/Apis';
import { Fade, IconButton } from '@mui/material';
import Slide from '@mui/material/Slide';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { useSnackbar } from 'notistack';

const cx = classNames.bind(styles);

function createDeckContainer() {
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
    });

    return container;
}
function getViewState(map, mapContainer) {
    const camera = map.getCamera();
    const width = mapContainer.offsetWidth;
    const height = mapContainer.offsetHeight;
    const fovy = 30;
    const near = 0.1;
    const far = 1000;
    const aspect = height ? width / height : 1;

    const projectionMatrix = new Matrix4().perspective({
        fovy: (fovy * Math.PI) / 180,
        aspect,
        near,
        far,
    });
    const focalDistance = 0.5 * projectionMatrix[5];

    const viewState = {
        longitude: ((camera.target.lng + 540) % 360) - 180,
        latitude: camera.target.lat,
        zoom: camera.getZoom() - 1,
        bearing: camera.getBearing(),
        pitch: camera.getTilt(),
        altitude: focalDistance,
        projectionMatrix,
    };

    return viewState;
}
// const COLOR_LAYER = 'rgb(60,140,0)';
const MAP_TYPE = ['roadMap', 'raster', 'satellite'];
export default function DeckMap() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapType, setMapType] = useState(1);
    const [yearFilter, setYearFilter] = useState(2017);
    const [opacityLayer, setOpacityLayer] = useState(1);
    const [showDetail, setShowDetail] = useState(false);
    const [fetchData, setFetchData] = useState(false);
    const [showLayer, setShowLayer] = useState(true);
    const [showToolbox, setShowToolbox] = useState(true);
    const [layers, setLayers] = useState([]);
    const [layerCurrent, setLayerCurrent] = useState();
    const [dataLayer, setDataLayer] = useState(null);
    const data_layer = useRef(null);
    const data_layer_const = useRef(null);
    const deck = useRef(null);
    const mapContainer = useRef(null);
    const mapMain = useRef(null);
    const access_token = cookies.load('access_token');
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const action = (key) => (
        <IconButton size="small" aria-label="close" color="inherit" onClick={() => closeSnackbar(key)}>
            <FontAwesomeIcon icon={faXmark} beat />
        </IconButton>
    );
    // Load init map
    useEffect(() => {
        mapContainer.current = document.getElementsByClassName('App')[0];
        mapContainer.current.setAttribute('style', 'height: 100vh');
        // Sử dụng biến từ URL SDK
        async function getData() {
            try {
                let layers = await Apis.get('api/lmhtx/layer/?all&folder=dfc0d9e9-57f5-4598-bca9-e7df8910d547', {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });
                if (layers.data.results) {
                    setLayers(layers.data.results);
                    setLayerCurrent(layers.data.results[0].model);
                    let data = await Apis.get(`api/lmhtx/geo/${layers.data.results[0].model.toLowerCase()}/`, {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    });
                    data_layer_const.current = data.data[0][0];
                    data_layer.current = data.data[0][0];
                }
                setIsLoading(false);
            } catch (err) {
                if (err.response.status === 401) {
                    // alert('Bạn phải đăng nhập để sử dụng chức năng biểu diễn dữ liệu');
                    enqueueSnackbar('Bạn phải đăng nhập để sử dụng chức năng biểu diễn dữ liệu!', {
                        variant: 'warning',
                        action,
                    });
                    setShowToolbox(false);
                }
                setIsLoading(false);
                setError(error);
                console.log(err);
            }
        }
        getData();
    }, []);
    useEffect(() => {
        // Khởi tạo map
        const map4d = window.map4d;
        if (!isLoading) {
            const deckContainer = createDeckContainer();
            function appendDeckContainer() {
                const deckOverlayContainer = document.createElement('div');
                deckOverlayContainer.setAttribute('id', 'deck-overlay');
                deckOverlayContainer.appendChild(deckContainer);
                mapContainer.current.appendChild(deckOverlayContainer);
                updateDeckContainerSize();
            }
            function updateDeckContainerSize() {
                if (mapContainer.current && deckContainer) {
                    const clientWidth = mapContainer.current.offsetWidth;
                    const clientHeight = mapContainer.current.offsetHeight;
                    Object.assign(deckContainer.style, {
                        width: `${clientWidth}px`,
                        height: `${clientHeight}px`,
                    });
                }
            }
            window.initMap = () => {
                /** Map View */
                mapMain.current = new map4d.Map(mapContainer.current, {
                    center: [104.751262038, 8.632767707],
                    tilt: 30,
                    zoom: 13,
                    maxZoom: 19,
                    // controls: true,
                    mapType: 'roadmap',
                    bearing: 0,
                });

                deck.current = new Deck({
                    parent: deckContainer,
                    getTooltip: ({ object }) => object && `${object.properties.dtuong}`,
                    // effects: [lightingEffect],
                    onClick: deckOnClick,
                    viewState: getViewState(mapMain.current, mapContainer.current),
                });
                const webGLOverlay = new map4d.WebGLOverlayView({
                    onAdd: (map, gl) => {
                        appendDeckContainer();
                    },
                    onDraw: (gl) => {
                        deck.current.setProps({ viewState: getViewState(mapMain.current, mapContainer.current) });
                        if (deck.current.isInitialized) {
                            deck.current.redraw();
                        }
                    },
                });
                webGLOverlay.setMap(mapMain.current);
                renderLayer();
                /** Map Events */
                mapMain.current.addListener('click', (args) => handleMouseEvent(deck.current, 'click', args));
                mapMain.current.addListener('dblClick', (args) => handleMouseEvent(deck.current, 'dblClick', args));
                function handleMouseEvent(_deck, type, args) {
                    const deck = _deck;
                    if (!deck.isInitialized) {
                        return;
                    }
                    const mockEvent = {
                        type,
                        offsetCenter: args.pixel,
                        srcEvent: args.xa,
                    };
                    switch (type) {
                        case 'click':
                            mockEvent.type = 'click';
                            mockEvent.tapCount = 1;
                            deck._onPointerDown(mockEvent);
                            deck._onEvent(mockEvent);
                            // let marker = new map4d.Marker({
                            //     position: { lat: args.location.lat, lng: args.location.lng },
                            //     zIndex: 999,
                            // });
                            // marker.setMap(mapMain.current);
                            break;
                        case 'dblClick':
                            mockEvent.type = 'click';
                            mockEvent.tapCount = 2;
                            deck._onEvent(mockEvent);
                            break;
                        default:
                            return;
                    }
                }
            };
            window.initMap();
            renderLayer();
        }
    }, [isLoading]);
    useEffect(() => {
        if (!isLoading) {
            if (data_layer.current !== null) {
                try {
                    data_layer.current = data_layer_const.current.filter(
                        (obj) => obj.properties.ngayht.indexOf(yearFilter) !== -1,
                    );
                } catch (err) {
                    // alert('Oops dữ liệu của bạn đã bị hỏng vui lòng chọn dữ liệu khác!');
                    enqueueSnackbar('Oops dữ liệu của bạn đã bị hỏng vui lòng chọn dữ liệu khác!', {
                        variant: 'error',
                        action,
                        preventDuplicate: true,
                    });
                }
            } else {
                enqueueSnackbar('Không có dữ liệu bản đồ!', {
                    variant: 'error',
                    action,
                    preventDuplicate: true,
                });
            }
            renderLayer();
        }
    }, [opacityLayer, yearFilter, showLayer]);
    // Load layer
    useEffect(() => {
        async function getData() {
            try {
                let data = await Apis.get(`api/lmhtx/geo/${layerCurrent.toLowerCase()}/`, {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                });
                data_layer_const.current = data.data[0][0];
                data_layer.current = data.data[0][0];
                setFetchData(false);
                data = data.data[0][0];
                if (showLayer && data[0]?.properties?.dtich && data[0]?.geometry?.coordinates) {
                    try {
                        data = data.filter((obj) => obj.properties.ngayht.indexOf(yearFilter) !== -1);
                        deck.current.setProps({
                            layers: [
                                // hexagonLayer,
                                new PolygonLayer({
                                    id: 'PolygonLayer',
                                    data: data,

                                    /* props from PolygonLayer class */
                                    opacity: opacityLayer,
                                    // elevationScale: 1,
                                    extruded: true,
                                    filled: true,
                                    getElevation: (d) => d.properties.dtich,
                                    getFillColor: (d) => [d.properties.dtich * 2.55, 140, 0],
                                    getLineColor: [80, 80, 80],
                                    getLineWidth: (d) => 1,
                                    getPolygon: (d) => {
                                        return d.geometry.coordinates;
                                    },
                                    // lineJointRounded: false,
                                    // lineMiterLimit: 4,
                                    // lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
                                    lineWidthMinPixels: 1,
                                    // lineWidthScale: 1,
                                    // lineWidthUnits: 'meters',
                                    // material: true,
                                    stroked: true,
                                    wireframe: true,
                                    pickable: true,
                                }),
                            ],
                        });
                    } catch (err) {
                        // alert('Oops dữ liệu của bạn đã bị hỏng vui lòng chọn dữ liệu khác!');
                        enqueueSnackbar('Oops dữ liệu của bạn đã bị hỏng vui lòng chọn dữ liệu khác!', {
                            variant: 'error',
                            action,
                            preventDuplicate: true,
                        });
                    }
                } else {
                    deck.current.setProps({
                        layers: [],
                    });
                }
            } catch (err) {
                setFetchData(false);
                console.log(err.message);
            }
        }
        if (!isLoading) {
            setFetchData(true);
            deck.current.setProps({
                layers: [],
            });
            getData();
        }
    }, [layerCurrent]);
    function renderLayer() {
        // console.log(data_layer.current);
        if (showLayer) {
            deck.current.setProps({
                layers: [
                    // hexagonLayer,
                    new PolygonLayer({
                        id: 'PolygonLayer',
                        data: data_layer.current,

                        /* props from PolygonLayer class */
                        opacity: opacityLayer,
                        // elevationScale: 1,
                        extruded: true,
                        filled: true,
                        getElevation: (d) => d?.properties?.dtich,
                        getFillColor: (d) => [d?.properties?.dtich * 2.55, 140, 0],
                        getLineColor: [80, 80, 80],
                        getLineWidth: (d) => 1,
                        getPolygon: (d) => {
                            return d?.geometry?.coordinates;
                        },
                        // lineJointRounded: false,
                        // lineMiterLimit: 4,
                        // lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
                        lineWidthMinPixels: 1,
                        // lineWidthScale: 1,
                        // lineWidthUnits: 'meters',
                        // material: true,
                        stroked: true,
                        wireframe: true,
                        autoHighlight: true,
                        pickable: true,
                    }),
                ],
            });
        } else {
            deck.current.setProps({
                layers: [],
            });
        }
    }
    const deckOnClick = (e) => {
        if (e?.object?.properties !== undefined) {
            setDataLayer(e.object.properties);
            setShowDetail(true);
        } else {
            setShowDetail(false);
        }
    };
    function handleChangValueDeckMap(e, type) {
        if (data_layer.current !== null) {
            // eslint-disable-next-line no-eval
            eval(`set${type}(${e.target.value})`);
        } else {
            enqueueSnackbar('Không có dữ liệu bản đồ!', {
                variant: 'error',
                action,
                preventDuplicate: true,
            });
        }
    }

    function handleChangeMapType() {
        if (mapType < 2) {
            setMapType(mapType + 1);
        } else {
            setMapType(0);
        }
        mapMain.current.setMapType(MAP_TYPE[mapType]);
    }
    return isLoading ? (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <span>Đang tải bản đồ</span>
            <FontAwesomeIcon icon={faSpinner} spin size="2xl" style={{ color: '#2f3642' }} />
        </div>
    ) : error ? (
        <div>{'Oops! Đã có lỗi xảy ra.'}</div>
    ) : (
        <>
            <div className={cx('control')}>
                <Slide direction="right" in={showToolbox} mountOnEnter unmountOnExit>
                    <div id={cx('control-panel')}>
                        <div
                            className={cx('btn-tb')}
                            onClick={(e) => {
                                setShowToolbox(!showToolbox);
                            }}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </div>
                        <label className={cx('lb')}>Phổ màu</label>
                        <div className={cx('color-layout', 'w-100')}>
                            <div className={cx('color-range', 'w-100')}>
                                <div
                                    className={cx('color-layout-1', 'color-layout-child')}
                                    style={{ backgroundColor: `rgb(51,140,0)` }}
                                ></div>
                                <div
                                    className={cx('color-layout-2', 'color-layout-child')}
                                    style={{ backgroundColor: `rgb(102,140,0)` }}
                                ></div>
                                <div
                                    className={cx('color-layout-3', 'color-layout-child')}
                                    style={{ backgroundColor: `rgb(153,140,0)` }}
                                ></div>
                                <div
                                    className={cx('color-layout-4', 'color-layout-child')}
                                    style={{ backgroundColor: `rgb(204,140,0)` }}
                                ></div>
                                <div
                                    className={cx('color-layout-5', 'color-layout-child')}
                                    style={{ backgroundColor: `rgb(255,140,0)` }}
                                ></div>
                            </div>
                            <div className={cx('sub-color')}>
                                <div>10%</div>
                                <div>100%</div>
                            </div>
                        </div>
                        <div className={cx('panel-changeOption')}>
                            <span style={{ paddingLeft: '0px' }}>Độ trong suốt</span>
                            <input
                                id="opacityLayer"
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={opacityLayer}
                                onInput={(e) => handleChangValueDeckMap(e, 'OpacityLayer')}
                            ></input>
                            <span id="opacityLayer-value">{opacityLayer}</span>
                        </div>
                        <div className={cx('panel-changeOption')}>
                            <span style={{ paddingLeft: '0px' }}>Mốc thời gian</span>
                            <input
                                id="yearFilter"
                                type="range"
                                min="2016"
                                max="2023"
                                step="1"
                                value={yearFilter}
                                onInput={(e) => handleChangValueDeckMap(e, 'YearFilter')}
                            ></input>
                            <span id="yearFilter-value">{yearFilter}</span>
                        </div>
                        <div className={cx('select-data')}>
                            <InputLabel id="demo-simple-select-label">Lớp dữ liệu</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id={cx('simple-select')}
                                label="Lớp dữ liệu"
                                value={layerCurrent}
                                onChange={(e) => {
                                    setLayerCurrent(e.target.value);
                                }}
                            >
                                {layers.map((layer) => (
                                    <MenuItem key={layer.id} value={layer.model}>
                                        {layer.name_display}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fetchData && (
                                <div className={cx('loading-deck')}>
                                    Đang tải lại dữ liệu <FontAwesomeIcon icon={faSpinner} spin />
                                </div>
                            )}
                        </div>
                    </div>
                </Slide>
                <Fade in={!showToolbox}>
                    <div
                        className={cx('btn-tb-open')}
                        onClick={(e) => {
                            setShowToolbox(!showToolbox);
                        }}
                    >
                        <FontAwesomeIcon icon={faChevronRight} beatFade />
                    </div>
                </Fade>
                <div className={cx('map-type-wrapper')}>
                    <img
                        id="imgBaseMapType"
                        alt="map-type"
                        className={cx('w-100', 'h-100')}
                        title={MAP_TYPE[mapType]}
                        src={images[MAP_TYPE[mapType]]}
                        onClick={handleChangeMapType}
                    ></img>
                </div>
                <div className={cx('nav-tools')}>
                    <div
                        id={cx('tool-map1')}
                        onClick={(e) => {
                            setShowToolbox(!showToolbox);
                        }}
                    >
                        <FontAwesomeIcon icon={faToolbox} />
                    </div>
                    <div
                        id={cx('tool-map2')}
                        onClick={(e) => {
                            setShowLayer(!showLayer);
                            if (showLayer && showDetail) {
                                setShowDetail(!showDetail);
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faLayerGroup} />
                    </div>
                    <div
                        id={cx('tool-map3')}
                        onClick={(e) => {
                            window.open('/', '_blank');
                        }}
                    >
                        <FontAwesomeIcon icon={faHouse} />
                    </div>
                </div>
            </div>
            {/* Modal show chi tiết dữ liệu */}
            <Fade in={showDetail}>
                <div className={cx('position-fixed', 'nav-pc-mobie')}>
                    <div className={cx('main-card')}>
                        <div className={cx('card', 'h-100')}>
                            <div className={cx('card-header', 'py-2', 'mt-1')}>
                                <button
                                    onClick={() => setShowDetail(!showDetail)}
                                    type="button"
                                    className={cx('btn-close', 'float-end', 'fs-12', 'ms-2')}
                                ></button>
                                <h6 className={cx('card-title', 'mb-0', 'fs-14')}>Chi tiết lớp dữ liệu</h6>
                            </div>
                            <div className={cx('card-body')}>
                                <div className={cx('w-100', 'h-95')}>
                                    <div
                                        className={cx('card')}
                                        style={{ marginBottom: '12px', border: '1px solid rgb(41, 156, 219)' }}
                                    >
                                        {/* <div className={cx('card-head', 'px-2', 'head-show', 'text-bg-primary')}>
                                                <h6 class="text-white card-title mb-0 ellipsis fs-14">Test</h6>
                                                <FontAwesomeIcon
                                                    icon={faAngleDown}
                                                    style={{ transition: 'all 0.3s linear 0s', fontStyle: '18px' }}
                                                />
                                            </div> */}
                                        <div className={cx('card-body')}>
                                            <ul style={{ padding: 0 }}>
                                                <table>
                                                    <tbody>
                                                        {dataLayer &&
                                                            Object.entries(dataLayer).map(([key, value]) => {
                                                                return (
                                                                    <tr key={key}>
                                                                        <td>
                                                                            <b>{key}:</b>
                                                                        </td>
                                                                        <td>{value}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                    </tbody>
                                                </table>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Fade>
        </>
    );
}

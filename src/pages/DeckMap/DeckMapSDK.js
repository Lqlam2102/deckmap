/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { Deck } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import * as d3 from 'd3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Matrix4 } from '@math.gl/core';
import styles from './DeckMapSDK.module.scss';
import classNames from 'classnames/bind';
import images from '~/assets/image';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';

const cx = classNames.bind(styles);
const COLOR_RANGE = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78],
];
const ambientLight = new AmbientLight({
    color: [255, 255, 255],
    intensity: 1.0,
});

const pointLight1 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
    color: [255, 255, 255],
    intensity: 0.8,
    position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight1, pointLight2 });

const material = {
    ambient: 0.64,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [51, 51, 51],
};

function getTooltip({ object }) {
    if (!object) {
        return null;
    }
    const lat = object.position[1];
    const lng = object.position[0];
    const count = object.points.length;

    return `\
      latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
      longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
      ${count} Accidents`;
}

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

const MAP_TYPE = ['roadMap', 'raster', 'satellite'];
export default function DeckMap() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [radius, setRadius] = useState(1000);
    const [coverage, setCoverage] = useState(1);
    const [mapType, setMapType] = useState(1);
    const [upperPercentile, setUpperPercentile] = useState(100);
    const data_layer = useRef(null);
    const deck = useRef(null);
    const mapContainer = useRef(null);
    const mapMain = useRef(null);
    useEffect(() => {
        // Sử dụng biến từ URL SDK
        mapContainer.current = document.getElementsByClassName('App')[0];
        mapContainer.current.setAttribute('style', 'height: 100vh');
        d3.csv('https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv')
            .then((data) => {
                setIsLoading(false);
                data_layer.current = data;
                // renderLayer();
            })
            .catch((error) => {
                setIsLoading(false);
                setError(error);
                console.log(error);
            });
    }, []);
    useEffect(() => {
        if (!isLoading) {
            renderLayer();
        }
    }, [radius, upperPercentile, coverage]);
    useEffect(() => {
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
                    center: [-1.4157, 52.2324],
                    tilt: 30,
                    zoom: 7,
                    maxZoom: 13,
                    // controls: true,
                    mapType: 'roadmap',
                    bearing: 0,
                });
                deck.current = new Deck({
                    parent: deckContainer,
                    controller: true,
                    getTooltip: getTooltip,
                    effects: [lightingEffect],
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
            };
            window.initMap();
        }
    }, [isLoading]);
    // function handleDeckMap() {
    //     deck.current.setProps({
    //         layers: [],
    //     });
    // }
    function renderLayer() {
        const hexagonLayer = new HexagonLayer({
            id: 'heatmap',
            colorRange: COLOR_RANGE,
            data: data_layer.current,
            elevationRange: [0, 1000],
            elevationScale: 250,
            extruded: true,
            getPosition: (d) => [Number(d.lng), Number(d.lat)],
            opacity: 1,
            radius,
            fp64: true,
            coverage,
            upperPercentile,
            material,
            pickable: true,
            transitions: {
                elevationScale: 1000,
            },
        });
        deck.current.setProps({
            layers: [hexagonLayer],
        });
    }

    function handleChangValueDeckMap(e, type) {
        // eslint-disable-next-line no-eval
        eval(`set${type}(${e.target.value})`);
        // mapMain.current.setMapType('raster');
    }
    function handleChangeMapType() {
        if (mapType < 2) {
            setMapType(mapType + 1);
        } else {
            setMapType(0);
        }
        console.log(MAP_TYPE[mapType]);
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
        <div className={cx('control')}>
            <div id={cx('control-panel')}>
                <div>
                    <label>Bán kính lục giác</label>
                    <input
                        id="radius"
                        type="range"
                        min="1000"
                        max="20000"
                        step="1000"
                        value={radius}
                        onInput={(e) => handleChangValueDeckMap(e, 'Radius')}
                    ></input>
                    <span id="radius-value">{radius}</span>
                </div>
                <div>
                    <label>Độ bao phủ</label>
                    <input
                        id="coverage"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={coverage}
                        onInput={(e) => handleChangValueDeckMap(e, 'Coverage')}
                    ></input>
                    <span id="coverage-value">{coverage}</span>
                </div>
                <div>
                    <label>Phần trăm cao nhất</label>
                    <input
                        id="upperPercentile"
                        type="range"
                        min="1"
                        max="100"
                        step="1"
                        value={upperPercentile}
                        onInput={(e) => handleChangValueDeckMap(e, 'UpperPercentile')}
                    ></input>
                    <span id="upperPercentile-value">{upperPercentile}</span>
                </div>
            </div>
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
        </div>
    );
}

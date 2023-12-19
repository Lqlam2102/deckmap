import React, { useEffect, useRef, useState } from 'react';
import { Deck } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import * as d3 from 'd3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Matrix4 } from '@math.gl/core';

const COLOR_RANGE = [
    [1, 152, 189],
    [73, 227, 206],
    [216, 254, 181],
    [254, 237, 177],
    [254, 173, 84],
    [209, 55, 78],
];
const OPTIONS = {
    radius: 1000,
    coverage: 1,
    upperPercentile: 100,
};

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
export default function DeckMap() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const deck = useRef(null);
    useEffect(() => {
        // Sử dụng biến từ URL SDK
        const map4d = window.map4d;
        const mapContainer = document.getElementsByClassName('App')[0];
        mapContainer.setAttribute('style', 'height: 100vh');
        const deckContainer = createDeckContainer();
        function appendDeckContainer() {
            const deckOverlayContainer = document.createElement('div');
            deckOverlayContainer.setAttribute('id', 'deck-overlay');
            deckOverlayContainer.appendChild(deckContainer);
            mapContainer.appendChild(deckOverlayContainer);
            updateDeckContainerSize();
        }
        function updateDeckContainerSize() {
            if (mapContainer && deckContainer) {
                const clientWidth = mapContainer.offsetWidth;
                const clientHeight = mapContainer.offsetHeight;
                Object.assign(deckContainer.style, {
                    width: `${clientWidth}px`,
                    height: `${clientHeight}px`,
                });
            }
        }
        window.initMap = () => {
            /** Map View */
            const map = new map4d.Map(mapContainer, {
                center: [-1.4157, 52.2324],
                tilt: 30,
                zoom: 7,
                controls: true,
                mapType: 'roadmap',
                bearing: 0,
            });
            deck.current = new Deck({
                parent: deckContainer,
                viewState: getViewState(map, mapContainer),
            });
            const webGLOverlay = new map4d.WebGLOverlayView({
                onAdd: (map, gl) => {
                    appendDeckContainer();
                },
                onDraw: (gl) => {
                    deck.current.setProps({ viewState: getViewState(map, mapContainer) });
                    if (deck.current.isInitialized) {
                        deck.current.redraw();
                    }
                },
            });
            webGLOverlay.setMap(map);

            /** Map Events */
            map.addListener('click', (args) => handleMouseEvent(deck, 'click', args));
            map.addListener('dblClick', (args) => handleMouseEvent(deck, 'dblClick', args));
        };
        d3.csv('https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv')
            .then((data) => {
                setIsLoading(false);
                deck.current.setProps({
                    layers: [
                        new HexagonLayer({
                            id: 'heatmap',
                            colorRange: COLOR_RANGE,
                            data,
                            elevationRange: [0, 1000],
                            elevationScale: 250,
                            extruded: true,
                            getPosition: (d) => [Number(d.lng), Number(d.lat)],
                            opacity: 1,
                            ...OPTIONS,
                        }),
                    ],
                });
                // setLayers([
                //     new HexagonLayer({
                //         id: 'heatmap',
                //         colorRange: COLOR_RANGE,
                //         data,
                //         elevationRange: [0, 1000],
                //         elevationScale: 250,
                //         extruded: true,
                //         getPosition: (d) => [Number(d.lng), Number(d.lat)],
                //         opacity: 1,
                //         ...OPTIONS,
                //     }),
                // ]);
            })
            .catch((error) => {
                setIsLoading(false);
                setError(error);
            });
        window.initMap();
    }, []);
    // console.log(deck.current);
    function handleDeckMap() {
        deck.current.setProps({
            layers: [],
        });
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
        <div style={{ position: 'absolute', zIndex: 1 }} onClick={handleDeckMap}>
            HAHA
        </div>
    );
}

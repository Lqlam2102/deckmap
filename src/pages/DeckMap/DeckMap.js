/* eslint-disable jsx-a11y/no-access-key */
import React, { useEffect, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { MFMap } from 'react-map4d-map';
import { ACCESKEY } from '~/configs/KeyMap';
import * as d3 from 'd3';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
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

export default function DeckMap() {
    const [layers, setLayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeckMap, setShowDeckMap] = useState(false);
    const deck = useRef(null);
    const map4d = useRef(null);
    const mapContainer = useRef(null);
    useEffect(() => {
        const OPTIONS = {
            radius: 1000,
            coverage: 1,
            upperPercentile: 100,
        };
        d3.csv('https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv')
            .then((data) => {
                setIsLoading(false);
                setLayers([
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
                ]);
            })
            .catch((error) => {
                setIsLoading(false);
                setError(error);
            });
    }, []);

    function handlleCameraChanging(e) {
        deck.current.deck.setProps({ viewState: getViewState(map4d.current) });
    }

    function getViewState(map) {
        const camera = map.getCamera();

        const width = mapContainer.current.offsetWidth;
        const height = mapContainer.current.offsetHeight;

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

    function handleMapReady(e) {
        map4d.current = e;
        setShowDeckMap(true);
        e.addListener('click', (args) => handleMouseEvent(deck.current.deck, 'click', args));
        e.addListener('dblClick', (args) => handleMouseEvent(deck.current.deck, 'dblClick', args));
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
        <div id="map" style={{ width: '100vw', height: '100vh' }} ref={mapContainer}>
            <MFMap
                accessKey={ACCESKEY}
                version={'2.6'}
                options={{
                    center: { lat: 52.2324, lng: -1.4157 },
                    zoom: 7,
                    bearing: 6,
                    controls: true,
                    tilt: 40,
                }}
                onMapReady={handleMapReady}
                onCameraChanging={handlleCameraChanging}
            >
                {showDeckMap ? (
                    <DeckGL
                        ref={deck}
                        initialViewState={getViewState(map4d.current)}
                        controller={false}
                        layers={layers}
                        style={{ pointerEvents: 'none' }}
                    ></DeckGL>
                ) : null}
            </MFMap>
        </div>
    );
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

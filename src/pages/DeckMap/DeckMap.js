/* eslint-disable jsx-a11y/no-access-key */
import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { MFMap } from 'react-map4d-map';
import { ACCESKEY } from '~/configs/KeyMap';
import * as d3 from 'd3';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const INITIAL_VIEW_STATE = {
    longitude: -1.4157,
    latitude: 52.2324,
    zoom: 6,
    minZoom: 5,
    maxZoom: 15,
    pitch: 40.5,
};

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
        <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
            <MFMap accessKey={ACCESKEY} version={'2.4'}></MFMap>
        </DeckGL>
    );
}

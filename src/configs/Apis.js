import axios from 'axios';
export let endpoints = {
    login: 'api/login/',
    register: 'api/user/',
    'current-user': 'api/user/current-user/',
};

export default axios.create({
    baseURL: 'http://api-gishub-core.laketech.vn/',
});

import axios from 'axios';
export let endpoints = {
    login: 'api/login/',
    'current-user': 'api/user/current-user/',
};

export default axios.create({
    baseURL: 'http://localhost:8000/',
});

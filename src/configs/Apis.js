import axios from 'axios';
export let endpoints = {
    login: 'login/',
    'current-user': '/user/current-user/',
};

export default axios.create({
    baseURL: 'http://localhost:8000/api/',
});

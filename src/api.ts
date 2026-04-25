const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

export const api = {
    get: (path: string, auth = false) => {
        return fetch(`${BASE_URL}${path}`, {
            headers: auth ? { Authorization: `Bearer ${getToken()}` } : {}
        }).then(res => res.json());
    },

    post: (path: string, body: any, auth = false) => {
        return fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(auth ? { Authorization: `Bearer ${getToken()}` } : {})
            },
            body: JSON.stringify(body)
        }).then(res => res.json());
    },

    put: (path: string, body: any, auth = false) => {
        return fetch(`${BASE_URL}${path}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(auth ? { Authorization: `Bearer ${getToken()}` } : {})
            },
            body: JSON.stringify(body)
        }).then(res => res.json());
    },

    delete: (path: string, auth = false) => {
        return fetch(`${BASE_URL}${path}`, {
            method: 'DELETE',
            headers: auth ? { Authorization: `Bearer ${getToken()}` } : {}
        }).then(res => res.json());
    },

    upload: (path: string, formData: FormData) => {
        return fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
            body: formData
        }).then(res => res.json());
    }
};

import axios from 'axios'


const baseURL = import.meta.env.NODE_ENV === 'production' ? import.meta.env.VITE_BACKEND_API_URL : import.meta.env.VITE_BACKEND_API_URL;

export const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_TOURNAMENT10_PUBLIC_KEY}`
    }
})

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:logout'));
                if (window.location.pathname.includes('/admin')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
)
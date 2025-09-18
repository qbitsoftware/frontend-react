import axios from 'axios'


const baseURL = import.meta.env.NODE_ENV === 'production' ? import.meta.env.VITE_BACKEND_API_URL : import.meta.env.VITE_BACKEND_API_URL;

export const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_TOURNAMENT10_PUBLIC_KEY}`,
        'Content-Type': 'application/json'
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

let activeRequests = 0;

axiosInstance.interceptors.request.use(
    (config) => {
        activeRequests++;
        // console.log("Active requests:", activeRequests);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        activeRequests--;
        // console.log("Active requests:", activeRequests);
        return response;
    },
    (error) => {
        activeRequests--;
        // console.log("Active requests:", activeRequests);
        return Promise.reject(error);
    }
);


// axiosInstance.interceptors.request.use(
//     (config) => {
//         console.log('Active requests:', config.maxRate);
//         return config;
//     }
// );
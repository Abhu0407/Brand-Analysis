export const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

//utils/apiPath.js
export const API_PATH = {
    AUTH: {
        LOGIN: "/api/auth/login",
        SIGNUP: "/api/auth/signup",
        LOGOUT: "/api/auth/logout",
        CHECK_AUTH: "/api/auth/check",
        UPDATE_PROFILE: "/api/auth/update-profile",
    },
    DASHBOARD: {
        GET_DATA: "/dashboard/data",
        GET_REDDIT_ANALYTICS: "/dashboard/reddit",
        GET_YOUTUBE_ANALYTICS: "/dashboard/youtube",
        GET_NEWS_ANALYTICS: "/dashboard/news",
        GET_LATEST_REDDIT: "/dashboard/reddit/latest",
        GET_LATEST_YOUTUBE: "/dashboard/youtube/latest",
        GET_LATEST_NEWS: "/dashboard/news/latest",
    },
    COLLECT: {
        UPDATE_REDDIT: (brand) => `/collect/reddit/update/${brand}`,
        UPDATE_YOUTUBE: "/collect/youtube/update",
        UPDATE_NEWS: "/collect/news/update",
    },
};

export default API_PATH;

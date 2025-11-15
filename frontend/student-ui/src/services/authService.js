import api from "./api";

export const signupApi = (data) => api.post("/auth/signup", data);
export const loginApi = (data) => api.post("/auth/login", data);

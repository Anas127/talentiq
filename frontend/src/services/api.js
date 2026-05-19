import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const analyzeCV = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return API.post("/analyze-cv", formData);
};

export const simulate = (data) => {
  return API.post("/simulate", data);
};

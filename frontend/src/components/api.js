import axios from "axios";

const API_URL = "http://127.0.0.1:5000"; // Update this if deployed

export const fetchPredictions = async (formData) => {
  try {
    console.log("Sending request with:", formData);
    const response = await axios.post(`${API_URL}/tourism/predict`, formData, {
      headers: {
        "method": "POST",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

    console.log("API Response:", response.data); // Debugging
    return response.data;
  } catch (error) {
    console.error("Error fetching predictions:", error.response ? error.response.data : error.message);
    return null;
  }
};

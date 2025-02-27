
import axios from "axios";

const API_URL = "http://127.0.0.1:5000"; // Update this if deployed

export const fetchPredictions = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/predict`, formData,{
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return null;
  }
};

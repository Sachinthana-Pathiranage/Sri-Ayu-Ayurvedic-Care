
import React, { useState } from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCardImage,
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBTypography,
} from "mdb-react-ui-kit";



const PredictionForm = ({ onPredict }) => {
  const [formData, setFormData] = useState({
    forecast_horizon: 5,
    Year: 2025,
    Lag2: 900,
    Rolling_Mean_12: 950,
    Month: 1
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    value = Number(value);

    // Prevent negative forecast horizon values
    if (name === "forecast_horizon" && value < 1) return;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData, Lag1: 1000 }; // Set Lag1 automatically
    onPredict(updatedFormData);
    console.log("Submitting Data:", updatedFormData);
  };

  return (
    <section className="vh-100" >
      <MDBContainer className="h2-100">
        <MDBRow className="justify-content-center align-items-center h-100" style={{width: "90%"}}>
          <MDBCol md="10" lg="8" xl="6" >
            <MDBCard className="bg-dark3 text-white" style={{ borderRadius: "20px" }}>
              <MDBCardHeader className="text-center" style={{ borderRadius: "20px" }}>

                <MDBTypography tag="h4" className="mb-0 text-white"></MDBTypography>
              </MDBCardHeader>
              <MDBCardBody >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <br/>

                  <div>
                    <h2><label className="text-white">Year :<select
                        name="Year"
                        value={formData.Year}
                        onChange={handleChange}
                        className="year"
                    >
                      {[2024, 2025, 2026, 2027].map((year) => (
                          <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    </label></h2>

                  </div>
                  <div className="form" style={{height: "100px"}}>
                    <h2><label className="text-white">Forecast Horizon: <input
                        type="number"
                        name="forecast_horizon"
                        value={formData.forecast_horizon}
                        onChange={handleChange}
                        min="1"
                        max="12"
                        className="months"
                    /></label></h2>

                  </div>


                  <button type="submit" className="button">
                    <h2>Predict</h2>
                  </button>
                </form>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
};

export default PredictionForm;
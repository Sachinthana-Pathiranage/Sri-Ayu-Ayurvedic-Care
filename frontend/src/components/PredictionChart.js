import React from "react";
import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBContainer
} from "mdb-react-ui-kit";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";



const PredictionChart = ({ data }) => {
  if (!data || !data.yearly_predictions) return <p>No data available</p>;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const chartData = Object.keys(data.yearly_predictions).map((year) =>
    Object.entries(data.yearly_predictions[year].monthly_predictions).map(([month, value]) => ({
      name: monthNames[month - 1],  // Convert month number to name
      [`Year ${year}`]: value, // Correct dynamic object key
    }))
  ).flat();

  return (
    <MDBContainer className="mt-4 d-flex justify-content-end"> {/* ⬅️ Move to Left */}
      <MDBCard className="chart-card w-75"> {/* ✅ Adjust width */}
        <MDBCardHeader className="bg-dark text-white text-center">
          <h5>Tourism Forecast Chart</h5>
        </MDBCardHeader>
        <MDBCardBody className="d-flex justify-content-end"> {/* ⬅️ Align Left */}
          <LineChart width={800} height={400} data={chartData}> {/* ⬅️ Reduce Width */}
            <CartesianGrid stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="white" tick={{ fill: "white" }} />
            <YAxis stroke="white" tick={{ fill: "white" }} />
            <Tooltip contentStyle={{ backgroundColor: "black", color: "white" }} />
            <Legend wrapperStyle={{ color: "white" }} />
            {/* Dynamically create the Line components */}
            {Object.keys(data.yearly_predictions).map((year) => {
              const dataKey = `Year ${year}`;
              return <Line key={year} type="bumpX" dataKey={dataKey} stroke="purple" strokeWidth={3} />; // Dynamically set the dataKey
            })}
          </LineChart>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
};

export default PredictionChart;

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
        <div>
            <div className="chart-content fade-in">
          <LineChart width={800} height={400} data={chartData}> {/* ⬅️ Reduce Width */}
            <CartesianGrid stroke="gray" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="black" tick={{ fill: "black" }} />
            <YAxis stroke="black" tick={{ fill: "black" }} />
            <Tooltip contentStyle={{ backgroundColor: "black", color: "black" }} />
            <Legend wrapperStyle={{ color: "black" }} />
            {/* Dynamically create the Line components */}
            {Object.keys(data.yearly_predictions).map((year) => {
              const dataKey = `Year ${year}`;
              return <Line key={year} type="bumpX" dataKey={dataKey} stroke="purple" strokeWidth={2} />; // Dynamically set the dataKey
            })}
          </LineChart>
                </div>
        </div>

  );
};

export default PredictionChart;

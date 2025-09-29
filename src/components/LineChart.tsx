import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";



const CustomTooltip = ({ active, payload, label }:any) => {
    console.log(active,payload,label)
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "4px",
        }}
      >
        <p style={{color:'black'}}><b>Date:</b> {label}</p>
        <p style={{color:'black'}}><b>Uptime:</b> {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function UptimeChart({chartData}:any) {
  return (
    <LineChart width={1000} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" tickFormatter={(day) => day.slice(0, 5)} />
      <YAxis />
      <Tooltip content={<CustomTooltip />}/>
      <Line type="monotone" dataKey="uptime" stroke="#8884d8" />
    </LineChart>
  );
}

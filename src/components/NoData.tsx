import { MdOutlineDataUsage } from "react-icons/md"; // or any icon you like

function NoData() {
  return (
    <div style={{ textAlign: "center",position:'absolute',top:'50%',left:'50%', padding: "20px", color: "#888" }}>
      <MdOutlineDataUsage size={50} />
      <p>No Data Available</p>
    </div>
  );
}
export default NoData;

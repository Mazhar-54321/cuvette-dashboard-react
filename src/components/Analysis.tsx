import axios from "axios";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import UptimeChart from "./LineChart";
import Loader from "./Loader";
import NoData from "./NoData";
import { toast } from "react-toastify";
const labels: any = {
  averageResponseTime: "Average Response Time",
  errorRate: "Error Rate",
  lastDowntimeTimestamp: "Last Downtime",
  mostCommonError: "Most Common Error",
  totalRequestVolume: "Total Request Volume",
  uptimePercentage: "Uptime Percentage",
};
const Analysis = () => {
  const [analysisData, setAnalysisData] = useState({});
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  useEffect(() => {
    fetchAnalysisData();
  }, []);
  async function fetchAnalysisData() {
    setLoading(true);
    try {
      const data = await axios.get(`${import.meta.env.VITE_BASE_URL}/analysis`, {
        headers: {
          "x-api-key": localStorage.getItem("api-key"),
        },
        timeout: 10000,
      });
      if (data?.data) {
        toast.info("Analysis fetched successfully",{autoClose:500});

        if (data?.data?.data?.totalRequestVolume > 0)
          setAnalysisData(formatAalysisData(data?.data?.data));
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          toast.error("Connection timed out",{autoClose:500});
        } else {
          toast.error(err?.response?.data ?? "Internal Server error",{autoClose:500});
        }
      } else {
        toast.error("Unknown error",{autoClose:500});
      }
    } finally {
      setLoading(false);
    }
  }
  function formatAalysisData(data: any) {
    if (data["lastDowntimeTimestamp"]) {
      data["lastDowntimeTimestamp"] = format(
        new Date(data["lastDowntimeTimestamp"]),
        "dd/MM/yyyy hh:mm:ss"
      );
    }
    if (data["formattedChartData"]) {
      setChartData(data["formattedChartData"]);
      delete data["formattedChartData"];
    }
    return data;
  }
  return (
    <div style={{ padding: "1rem" }}>
      <h3
        style={{
          fontSize: "32px",
          padding: "0px",
          margin: "0px",
          marginBottom: "1rem",
        }}
      >
        Analysis
      </h3>
      {loading ? (
        <Loader />
      ) : (
        <div>
          {Boolean(Object.keys(analysisData)?.length) ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                {Object.keys(analysisData)?.map((key: string) => (
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#1A1F37",
                      borderRadius: "0.5rem",
                      width: "15rem",
                    }}
                  >
                    <h4 style={{ padding: 0, margin: 0 }}>{labels[key]}</h4>
                    <h3 style={{ padding: 0, margin: 0 }}>
                      {analysisData[key] ?? "N.A"}
                    </h3>
                  </div>
                ))}
              </div>
              <h2>Uptime Percentage Over time</h2>
              <UptimeChart chartData={chartData} />
            </>
          ) : (
            <NoData />
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;

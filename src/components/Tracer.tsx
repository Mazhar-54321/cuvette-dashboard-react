import axios from "axios";
import  { useEffect, useState } from "react";
import Loader from "./Loader";
import { format } from "date-fns";
import Tracerblock from "./Tracerblock";
import NoData from "./NoData";
import { toast } from "react-toastify";

const Tracer = ({tick}:any) => {
  const [loading, setLoading] = useState(false);
  const [formattedLogs,setFormattedLogs]=useState<any>({});
  const [show,setShow]=useState<any>();
  useEffect(() => {
    getAllLogs();
  }, [tick]);
  async function getAllLogs() {
    setLoading(true);
    try {
      const data = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/log`,
        {
          headers: {
            "x-api-key": localStorage.getItem("api-key"),
          },
          timeout: 10000,
        }
      );
      if (data?.data) {
       formatLogs(data?.data?.data)
        toast.info('Logs fetched successfully',{autoClose:500})
       
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
   function formatLogs(logsArray:any){
    let map:any ={};
    let showExpandMap:any={}
    logsArray?.forEach((log:any)=>{
      const date = format(new Date(log.timestamp),"dd MMM yyyy").toString();
      map[date]=[...map[date]??[],log];
      showExpandMap[date]=false;
    })
    console.log(map);
    setShow(showExpandMap);
    setFormattedLogs(map);
  }
  return (
    <div style={{ padding: "1.5rem",overflowX:'hidden',maxWidth:'100%', }}>
      <h3 style={{ fontSize: "32px", padding: "0px", margin: "0px",marginBottom:'1rem' }}>
        API Trace Logs
      </h3>
      {loading?<Loader />:
      <div style={{overflowX:'hidden',maxWidth:'100%'}}>
        {Object.keys(formattedLogs)?.map((el:any)=><Tracerblock onShow={(key:string)=>{console.log(key);setShow((prev:any)=>({...prev,[key]:!prev[key]}))}} show={show[el]} key={el} blockDate={el} blockData={formattedLogs[el]} />)}
        </div>}
        {!Boolean(Object.keys(formattedLogs)?.length) && !loading && <NoData />}
    </div>
  );
};

export default Tracer;

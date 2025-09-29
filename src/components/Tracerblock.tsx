import { format } from 'date-fns';
import TodaysIcon from '../assets/Today.png'
import YesterdaysIcon from '../assets/Yesterday.png'
import { colorObj } from './Home';
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
const Tracerblock = ({ blockDate, blockData,show,onShow }: any) => {
  const getBlockHeader = ()=>{
    const todaysDate =format(new Date(),"dd MMM yyyy").toString();
    const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
    const yesterdaysDate =format(yesterday,"dd MMM yyyy").toString();
     if(blockDate===todaysDate){
        return <img src={TodaysIcon} />
     }
     if(blockDate ===yesterdaysDate){
        return <img src={YesterdaysIcon} />
     }
     return <b>{blockDate}</b>
  }  
  
  return (
    <div style={{ marginTop: "1rem" }}>
      <div style={{display:'flex',alignItems:'center',paddingLeft:'1rem',paddingRight:'1rem'}}>
        <h2 style={{width:'60%', marginLeft: "0.5rem" }}>{getBlockHeader()}</h2>
        <h3 style={{width:'20%',padding:0,margin:0,fontWeight:'lighter'}}>Logs({blockData?.length})</h3>
       <div  onClick={()=>{onShow(blockDate)}} style={{textAlign:'right',flexGrow:1,cursor:'pointer'}}>{show?<FaMinusCircle />:<FaPlusCircle />}</div> 
      </div>
      {show&& blockData?.map((log: any) => (
        <div
          style={{
            padding: "1rem",
            display: "flex",
            gap: "0.25rem",
            maxHeight: "200px",
            backgroundColor: "#1A1F37",
            overflow: "auto",
            scrollbarWidth:'none',
            marginTop:'1rem',
            flexDirection: "column",
            borderRadius:'0.5rem'
          }}
        >
          <div style={{color:'#6B6B6B',fontWeight:'bold'}}>
            <span style={{ marginRight: "0.25rem" }}>[{log?.traceId}]</span>
            <span style={{ marginRight: "0.25rem" }}>{"->"}</span>
            <span style={{ marginRight: "0.25rem" }}>{log?.method}</span>
            <span style={{ marginRight: "0.25rem" }}>{log?.apiName}</span>
          </div>
          {log?.logs?.map((el: any) => (
            <p style={{padding:0,margin:0}}>{el?.message}</p>
          ))}
          <span style={{color:colorObj[`${log?.statusCode}`[0]]}}>{log?.statusCode}</span>
          <span style={{color:'#008000',fontWeight:'bold'}}>({log?.responseTimeMs}ms)</span>
        </div>
      ))}
    </div>
  );
};

export default Tracerblock;

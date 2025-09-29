import { ThreeDots } from "react-loader-spinner";

const Loader = () => {
  return(
<div style={{position:'absolute',top:'0',right:'0', width:'100%',height:'100%',display:'grid',placeItems:'center',backgroundColor:'transparent',zIndex:100}}>
      <ThreeDots height="80" width="80" color="white" ariaLabel="loading" />
    </div>
  
)
   
};

export default Loader;

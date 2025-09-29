import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
const Pagination = ({ list,handlePagination }: any) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(()=>{
     setSelectedIndex(0)
  },[list])
  const getPaginationText = (index: number) => {
   
    const monthsObj: any = {
      0: "Jan",
      1: "Feb",
      2: "Mar",
      3: "Apr",
      4: "May",
      5: "Jun",
      6: "Jul",
      7: "Aug",
      8: "Sep",
      9: "Oct",
      10: "Nov",
      11: "Dec",
    };
    return `${monthsObj[list[index]["month"]]} ${list[index]["year"]}`;
  };
  const nextHandler = ()=>{
    setSelectedIndex(prev=>prev+1);
    handlePagination(list[selectedIndex+1]?.month+1,list[selectedIndex+1]?.year);
  }
  const prevHandler = ()=>{
    setSelectedIndex(prev=>prev-1);
    handlePagination(list[selectedIndex-1]?.month+1,list[selectedIndex-1]?.year);
  }
  return (
    <div style={{ display: "flex" }}>
        
      <div>
        <button  disabled={selectedIndex===0} onClick={prevHandler} style={{ cursor: "pointer",backgroundColor: "transparent",
            color: "white",
            outline: "none",
            opacity:selectedIndex===0?0.3:1,
            borderColor: "transparent" }}>
          <FaChevronLeft />
        </button>
      </div>
      <div style={{display:'flex',alignItems:'center'}}>{getPaginationText(selectedIndex)}</div>
      <div>
        <button  disabled={selectedIndex===list?.length-1} onClick={nextHandler} style={{ cursor: "pointer",backgroundColor: "transparent",
            color: "white",
            outline: "none",
            opacity:selectedIndex===list?.length-1?0.3:1,
            borderColor: "transparent" }}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

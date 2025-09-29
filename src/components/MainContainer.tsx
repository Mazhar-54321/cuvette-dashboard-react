import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import Home from "./Home";
import Tracer from "./Tracer";
import Analysis from "./Analysis";
import Configuration from "./Configuration";
import { FaBullseye, FaChartLine, FaCog, FaHome } from "react-icons/fa";
import LoginPage from "./LoginPage";
const sideBarData = [
  { name: "Home", id: 0, icon: <FaHome size={16} /> },
  { name: "Tracer", id: 1, icon: <FaBullseye size={16} /> },
  { name: "Analysis", id: 2, icon: <FaChartLine size={16} /> },
  { name: "Configuration", id: 3, icon: <FaCog size={16} /> },
];
const MainContainer = () => {
  const [tab, setTab] = useState<Number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<Boolean>(false);
  const changeTab = (tabIndex: Number) => {
    setTab(tabIndex);
  };
  const getMainLayout = (tab: Number) => {
    switch (tab) {
      case 0:
        return <Home />;
      case 1:
        return <Tracer />;
      case 2:
        return <Analysis />;
      case 3:
        return <Configuration />;
    }
  };
  const onLoggedIn = (apiKey:string)=>{
   localStorage.setItem("api-key",apiKey); 
   setIsLoggedIn(true);
  }
  return (
    <div
      style={{
        display: "flex",
        minWidth: "99vw",
        maxWidth: "99vw",
        minHeight: "100vh",
        overflowX: "hidden",
        overflowY: "hidden",
        color: "white",
      }}
    >
      {isLoggedIn ? (
        <>
          <div
            style={{
              width: "20%",
              backgroundColor: "#1A1F37",
              textAlign: "center",
              paddingTop: "1rem",
            }}
          >
            <Sidebar
              changeTab={changeTab}
              data={sideBarData}
              selectedTab={tab}
            />
          </div>
          <div
            style={{
              width: "80%",
              overflowX: "hidden",
              position: "relative",
              maxWidth: "80%",
              backgroundColor: "#060B26",
            }}
          >
            {getMainLayout(tab)}
          </div>
        </>
      ) : (
        <LoginPage onLoggedIn={onLoggedIn}/>
      )}
    </div>
  );
};

export default MainContainer;

export const Sidebar = ({ changeTab, data,selectedTab }: any) => {
    
  return (
    <div>
      <h2>API Management</h2>
      <div
        style={{
          width: "90%",
          height: "1px",
          backgroundColor: "white",
          margin: "0.5rem",
        }}
      ></div>
      <ul style={{ listStyleType: "none", textAlign: "left",margin:'0px',padding:'0px',paddingLeft:'0.5rem',paddingRight:'0.5rem' }}>
        {data?.map((el: any) => (
          <li
            onClick={() => {
              changeTab(el?.id);
            }}
            style={{ marginBottom: "0.5rem",padding:'0.5rem', cursor: "pointer",display:'flex',alignItems:'center', backgroundColor:selectedTab===el?.id?'#060B26':'transparent',borderRadius:'0.5rem' }}
          >
           <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}> <span style={{marginRight:'0.5rem', color:selectedTab===el?.id?'white':'#060B26'}}>{el?.icon}</span></div>{el?.name}
          </li>
        ))}
      </ul>
      <div
        style={{
          width: "90%",
          height: "1px",
          backgroundColor: "white",
          margin: "0.5rem",
        }}
      ></div>
    </div>
  );
};

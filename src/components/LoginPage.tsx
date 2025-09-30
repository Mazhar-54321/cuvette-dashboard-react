import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import Loader from "./Loader";

function LoginPage({onLoggedIn}:any) {
  const [activeTab, setActiveTab] = useState("guide");
  const [apiKey, setApiKey] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [loading,setLoading]=useState(false);

  const generateApiKey = async() => {
      setLoading(true);
    try {
      const data = await axios.get(`${import.meta.env.VITE_BASE_URL}/apiKey`, {
        timeout: 10000,
      });
      if (data?.data) {
        setGeneratedKey(data?.data?.data?.key)
      }
    } catch (err) {
      toast.error('Error creating api key',{autoClose:1000})
    } finally {
      setLoading(false);
    }
  };
  const login = async() => {
    if(apiKey?.trim()?.length<16){
        toast.error('Api key must be of 16 chars');
        return;
    }
      setLoading(true);
    try {
      const data = await axios.post(`${import.meta.env.VITE_BASE_URL}/apiKey`,{apiKey:apiKey}, {
        timeout: 10000,
      });
      
      if (data?.data) {
        onLoggedIn(apiKey);
      }
    } catch (err) {
      toast.error(err?.response?.data??'Network error',{autoClose:1000})
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "2rem",
        fontFamily: "sans-serif",
        backgroundColor: "#1A1F37",
      }}
    >
      {loading && <Loader />}
      <div style={{ display: "flex" ,maxWidth:'500px' }}>
        <p
          onClick={() => setActiveTab("guide")}
          style={{
            flex: 1,
            padding: "10px",
            borderBottom:
              activeTab === "guide" ? "2px solid  #767676" : "transparent",
            fontWeight: activeTab === "guide" ? "900" : "100",
            cursor: "pointer",
            textAlign: "center",
            color:activeTab === "guide"?'#767676':'#737373'
          }}
        >
          Guide
        </p>
        <p
          onClick={() => setActiveTab("login")}
          style={{
            flex: 1,
            padding: "10px",
            borderBottom:
              activeTab === "login" ? "2px solid  #767676" : "transparent",
            fontWeight: activeTab === "login" ? "900" : "100",
            cursor: "pointer",
            textAlign: "center",
            color:activeTab === "login"?'#767676':'#737373'
          }}
        >
          Login
        </p>
        <p
          onClick={() => setActiveTab("create")}
          style={{
            flex: 1,
            padding: "10px",
            borderBottom:
              activeTab === "create" ? "2px solid  #767676" : "transparent",
            fontWeight: activeTab === "create" ? "900" : "100",
            cursor: "pointer",
            textAlign: "center",
            color:activeTab === "create"?'#767676':'#737373'
          }}
        >
          Create API Key
        </p>
      </div>

      <div
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          margin:'2rem'
        }}
      >
        {activeTab === "guide" && (
          <div style={{ padding: "20px", textAlign: "left" }}>
            <h1 style={{ color: "#767676" }}>Guide to use Cuvette Api Logger</h1>
            <h2 style={{ color: "#737373" }}>
              Step 1: npm i cuvette-api-tracer
            </h2>
            <h2 style={{ color: "#737373" }}>
              {" "}
              Step 2: import logger from 'cuvette-api-tracer' in index.js file
            </h2>
            <h2 style={{ color: "#737373" }}>Step 3 : app.use(logger())</h2>
            <h2 style={{ color: "#737373" }}>
              Step 4 : Attach api-key in req headers x-api-key attribute
            </h2>
            <h3>Note: We follow 24 hours time format and  Always check configuration tab if data is not found</h3>
          </div>
        )}

        {/* Login Tab */}
        {activeTab === "login" && (
          <div
            style={{
              padding: "20px",
              width: "500px",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API Key"
              style={{
                padding: "0.5rem",
                borderRadius: "4px",
                outline: "none",
                borderColor: "transparent",
                border: "2px solid #767676",
                backgroundColor: "transparent",
                color: "#737373",
                flexGrow: 1,
              }}
            />
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => {login()}}
                style={{
                  padding: "0.5rem 3rem",
                  backgroundColor: "#5284D9",
                  color: "white",
                }}
              >
                Login
              </button>
            </div>
          </div>
        )}

        {/* Create API Key Tab */}
        {activeTab === "create" && (
          <div style={{ padding: "20px" }}>
            <button
                onClick={() => {generateApiKey()}}
                style={{
                  padding: "0.5rem 3rem",
                  backgroundColor: "#5284D9",
                  color: "white",
                }}
              >
                Generate API Key
              </button>
            {generatedKey && (
              <p style={{ marginTop: "10px" }}>Generated Key: {generatedKey}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;

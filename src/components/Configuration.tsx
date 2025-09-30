import axios from "axios";
import {  useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import "./Configuration.css";
import { format } from "date-fns";
import { MdMoreVert } from "react-icons/md";
import Switch from "react-switch";
import { FaCalendarAlt } from "react-icons/fa";
import {  Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { toast } from "react-toastify";

const Configuration = ({tick}:any) => {
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState([]);
  const [control, setControl] = useState<any>({});
  const [selectedControl, setSelectedControl] = useState<any>({});
  const [controlErrors, setControlErrors] = useState<any>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [background,setBackground]=useState({});
  const ref = useRef<any>(null);
  const calendarRef = useRef<any>(null);
  const controlref = useRef<any>(null);
  useEffect(() => {
    fetchConfigData();
  }, [tick]);
  useEffect(() => {
    function handleOutsideClick(event: any) {
      if (
        control &&
        !showCalendar &&
        Object.keys(control).length > 0 &&
        ref.current &&
        !ref.current.contains(event.target) &&
        ref.current != event.target
      ) {
        setControl({});
      }
    }
    if (Object.keys(control)?.length)
      document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [control, showCalendar]);
  async function fetchConfigData() {
    setLoading(true);
    try {
      const data = await axios.get(`${import.meta.env.VITE_BASE_URL}/config`, {
        headers: {
          "x-api-key": localStorage.getItem("api-key"),
        },
        timeout: 10000,
      });
      if (data?.data) {
        setConfigData(data?.data?.data);
        let selectedControlData: any = {};
        data?.data?.data?.forEach((el: any) => {
          selectedControlData[el?.apiName] = {
            "API Name": { show: true, value: el?.aliasName },
            Tracer: {
              show: el?.enabled,
              value: { start: el?.startDate ?? new Date().toISOString() },
            },
            Limit: {
              show: el?.enabled,
              value: { request: el?.numberOfRequest, limit: el?.rate },
            },
            "Schedule On/Off": {
              show: el?.enabled,
              value: {
                start: { hh: getPaddedNumber(el?.startTime?.hh), mm: getPaddedNumber(el?.startTime?.mm), ss: getPaddedNumber(el?.startTime?.ss) },
                end: { hh: getPaddedNumber(el?.endTime?.hh), mm: getPaddedNumber(el?.endTime?.mm), ss: getPaddedNumber(el?.endTime?.ss) },
              },
            },
          };
        });
        setSelectedControl(selectedControlData);
        toast.info("Config data fetched successfully", { autoClose: 500 });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          toast.error("Connection timed out", { autoClose: 500 });
        } else {
          toast.error(err?.message, { autoClose: 500 });
        }
      } else {
        toast.error("Internal Server error", { autoClose: 500 });
      }
    } finally {
      setLoading(false);
    }
  }
  function updateStartAndEndTime(
    apiName: string,
    controlName: string,
    value: string,
    key: string,
    subKey: string
  ) {
    setControlErrors((prev: any) => ({ ...prev, [apiName]: {} }));
    setSelectedControl((prev: any) => ({
      ...prev,
      [apiName]: {
        ...(prev[apiName] ?? {}),
        [controlName]: {
          ...prev[apiName]?.[controlName],
          value: {
            ...prev[apiName]?.[controlName]?.["value"],
            [key]: {
              ...prev[apiName]?.[controlName]?.["value"][key],
              [subKey]: value,
            },
          },
        },
      },
    }));
  }
  function getLayout(apiName: string, controlName: string, aliasName: string) {
    switch (controlName) {
      case "API Name":
        return (
          <input
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
            type="text"
            onChange={(event: any) => {
              if (controlErrors?.[apiName] !== undefined) {
                setControlErrors((prev: any) => ({ ...prev, [apiName]: {} }));
              }
              setSelectedControl((prev: any) => ({
                ...prev,
                [apiName]: {
                  ...(prev[apiName] ?? {}),
                  [controlName]: {
                    ...prev[apiName]?.[controlName],
                    value: event.target.value,
                  },
                },
              }));
            }}
            value={
              selectedControl[apiName]?.["API Name"]?.["value"] ?? aliasName
            }
          />
        );
      case "Tracer":
        return (
          <div
            style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
          >
            {/* <div style={{ textAlign: "right", margin: 0, padding: 0 }}>
              <button
                onClick={() => setShowCalendar((prev) => !prev)}
                style={{
                  cursor: "pointer",
                  padding: "0.5rem",
                  fontSize: "1rem",
                  backgroundColor: "transparent",
                  color: "white",
                  outline: "none",
                  borderColor: "transparent",
                }}
              >
                <FaCalendarAlt />
              </button>
            </div> */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexGrow: 1,
              }}
            >
              <div style={{ display: "flex", width: "50%" }}>
                <label
                  htmlFor="startTime"
                  style={{ color: "#737373", fontSize: "14px" }}
                >
                  Start Date:
                </label>
                <input
                  disabled
                  style={{
                    borderRadius: "4px",
                    border: "2px solid #767676",
                    width: "70px",
                    outline: "none",
                    fontSize: "12px",
                    backgroundColor: "transparent",
                    color: "#737373",
                    flexGrow: 1,
                  }}
                  id="startTime"
                  value={getFormattedDateForSchedule(
                    selectedControl[apiName]?.["Tracer"]?.["value"]?.["start"]
                  )}
                />
              </div>
              <div style={{ textAlign: "right", margin: 0, padding: 0 }}>
              <button
                onClick={() => setShowCalendar((prev) => !prev)}
                style={{
                  cursor: "pointer",
                  padding: "0.5rem",
                  fontSize: "1rem",
                  backgroundColor: "transparent",
                  color: "white",
                  outline: "none",
                  borderColor: "transparent",
                }}
              >
                <FaCalendarAlt />
              </button>
            </div>
            </div>
          </div>
        );
      case "Limit":
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexGrow: 1,
            }}
          >
            <div>
              <label
                htmlFor="requests"
                style={{ color: "#737373", fontSize: "14px" }}
              >
                Number of Request:
              </label>
              <input
                onChange={(event: any) => {
                  setControlErrors((prev: any) => ({ ...prev, [apiName]: {} }));
                  setSelectedControl((prev: any) => ({
                    ...prev,
                    [apiName]: {
                      ...(prev[apiName] ?? {}),
                      [controlName]: {
                        ...prev[apiName]?.[controlName],
                        value: {
                          ...prev[apiName]?.[controlName]?.["value"],
                          request: event.target.value,
                        },
                      },
                    },
                  }));
                }}
                type="number"
                style={{
                  width: "50px",
                  borderRadius: "4px",
                  outline: "none",
                  borderColor: "transparent",
                  border: "2px solid #767676",
                  backgroundColor: "transparent",
                  color: "#737373",
                }}
                id="requests"
                value={
                  selectedControl[apiName]?.["Limit"]?.["value"]?.["request"] ??
                  0
                }
              />
            </div>
            <div>
              <label
                htmlFor="limit"
                style={{ color: "#737373", fontSize: "14px" }}
              >
                Rate:
              </label>
              <select
                onChange={(event: any) => {
                  {
                    setControlErrors((prev: any) => ({
                      ...prev,
                      [apiName]: {},
                    }));
                    setSelectedControl((prev: any) => ({
                      ...prev,
                      [apiName]: {
                        ...(prev[apiName] ?? {}),
                        [controlName]: {
                          ...prev[apiName]?.[controlName],
                          value: {
                            ...prev[apiName]?.[controlName]?.["value"],
                            limit: event.target.value,
                          },
                        },
                      },
                    }));
                  }
                }}
                value={
                  selectedControl[apiName]?.["Limit"]?.["value"]?.["limit"] ?? 0
                }
                style={{
                  width: "70px",
                  borderRadius: "4px",
                  outline: "none",
                  borderColor: "transparent",
                  border: "2px solid #767676",
                  backgroundColor: "transparent",
                  color: "#737373",
                }}
                id="limit"
                name="limit"
              >
                <option value="minute">minute</option>
                <option value="hour">hour</option>
                <option value="day">day</option>
              </select>
            </div>
          </div>
        );
      default:
        return (
          <div
            style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexGrow: 1,
              }}
            >
              <div style={{ display: "flex", width: "50%" }}>
                <label style={{ color: "#737373", fontSize: "14px" }}>
                  Start Time:
                </label>
                <div
                  style={{
                    backgroundColor: "transparent",
                    borderRadius: "4px",
                    display: "flex",
                    border: "2px solid #767676",
                    justifyContent: "center",
                    padding: 0,
                    margin: 0,
                    height: "20px",
                  }}
                >
                  <input
                    value={
                      selectedControl[apiName]?.["Schedule On/Off"]?.[
                        "value"
                      ]?.["start"]?.["hh"]
                    }
                    onChange={(event) => {
                      updateStartAndEndTime(
                        apiName,
                        controlName,
                        event.target.value,
                        "start",
                        "hh"
                      );
                    }}
                    placeholder={"hh"}
                    type="text"
                    style={{
                      textAlign: "center",
                      padding: 0,
                      margin: 0,
                      height: "20px",
                      border: "none",
                      maxWidth: "30px",
                      outline: "none",
                      background: "transparent",
                      color: "#737373",
                      flexGrow: 1,
                    }}
                  />
                  <span style={{ fontSize: "10px", marginTop: "3px" }}>:</span>
                  <input
                    value={
                      selectedControl[apiName]?.["Schedule On/Off"]?.[
                        "value"
                      ]?.["start"]?.["mm"]
                    }
                    onChange={(event) => {
                      updateStartAndEndTime(
                        apiName,
                        controlName,
                        event.target.value,
                        "start",
                        "mm"
                      );
                    }}
                    placeholder={"mm"}
                    type="text"
                    style={{
                      textAlign: "center",
                      padding: 0,
                      margin: 0,
                      border: "none",
                      height: "20px",
                      maxWidth: "30px",
                      outline: "none",
                      background: "transparent",
                      color: "#737373",
                      flexGrow: 1,
                    }}
                  />
                  <span style={{ fontSize: "10px", marginTop: "3px" }}>:</span>
                  <input
                    value={
                      selectedControl[apiName]?.["Schedule On/Off"]?.[
                        "value"
                      ]?.["start"]?.["ss"]
                    }
                    onChange={(event) => {
                      updateStartAndEndTime(
                        apiName,
                        controlName,
                        event.target.value,
                        "start",
                        "ss"
                      );
                    }}
                    placeholder={"ss"}
                    type="text"
                    style={{
                      textAlign: "center",
                      padding: 0,
                      margin: 0,
                      border: "none",
                      height: "20px",
                      maxWidth: "30px",
                      outline: "none",
                      background: "transparent",
                      color: "#737373",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", width: "50%" }}>
                <label style={{ color: "#737373", fontSize: "14px" }}>
                  End time:
                </label>
                <div
                  style={{
                    backgroundColor: "transparent",
                    borderRadius: "4px",
                    display: "flex",
                    border: "2px solid #767676",
                    justifyContent: "center",
                    padding: 0,
                    margin: 0,
                    height: "20px",
                  }}
                >
                  <input
                    value={
                      selectedControl[apiName]?.["Schedule On/Off"]?.[
                        "value"
                      ]?.["end"]?.["hh"]
                    }
                    onChange={(event) => {
                      updateStartAndEndTime(
                        apiName,
                        controlName,
                        event.target.value,
                        "end",
                        "hh"
                      );
                    }}
                    placeholder={"hh"}
                    type="text"
                    style={{
                      textAlign: "center",
                      padding: 0,
                      margin: 0,
                      height: "20px",
                      border: "none",
                      maxWidth: "30px",
                      outline: "none",
                      background: "transparent",
                      color: "#737373",
                      flexGrow: 1,
                    }}
                  />
                  <span style={{ fontSize: "10px", marginTop: "3px" }}>:</span>
                  <input
                    value={
                      selectedControl[apiName]?.["Schedule On/Off"]?.[
                        "value"
                      ]?.["end"]?.["mm"]
                    }
                    onChange={(event) => {
                      updateStartAndEndTime(
                        apiName,
                        controlName,
                        event.target.value,
                        "end",
                        "mm"
                      );
                    }}
                    placeholder={"mm"}
                    type="text"
                    style={{
                      textAlign: "center",
                      padding: 0,
                      margin: 0,
                      border: "none",
                      height: "20px",
                      maxWidth: "30px",
                      outline: "none",
                      background: "transparent",
                      color: "#737373",
                      flexGrow: 1,
                    }}
                  />
                  <span style={{ fontSize: "10px", marginTop: "3px" }}>:</span>
                  <input
                    value={
                      selectedControl[apiName]?.["Schedule On/Off"]?.[
                        "value"
                      ]?.["end"]?.["ss"]
                    }
                    onChange={(event) => {
                      updateStartAndEndTime(
                        apiName,
                        controlName,
                        event.target.value,
                        "end",
                        "ss"
                      );
                    }}
                    placeholder={"ss"}
                    type="text"
                    style={{
                      textAlign: "center",
                      padding: 0,
                      margin: 0,
                      border: "none",
                      height: "20px",
                      maxWidth: "30px",
                      outline: "none",
                      background: "transparent",
                      color: "#737373",
                      flexGrow: 1,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  }
  function getPaddedNumber(num:any=0){
    return (num+"").padStart(2,"0")
  }
  function validateControl() {
    const currentControlName = Object.keys(control)[0];
    const selectedControlData = selectedControl[currentControlName];
    console.log(selectedControl, "last check");
    const apiName = selectedControlData["API Name"];
    const tracer = selectedControlData["Tracer"];
    const limit = selectedControlData["Limit"];
    const schedule = selectedControlData["Schedule On/Off"];
    const errorMessages = { "API Name": "", Limit: "", "Schedule On/Off": "","Tracer":"" };
    let isErrorFree = true;
    if (
      apiName?.show &&
      apiName?.value !== undefined &&
      !apiName?.value?.trim()
    ) {
      errorMessages["API Name"] = "Api Name cant be empty";
      isErrorFree = false;
    }
    
    if (limit?.show && limit?.value?.request === undefined) {
      errorMessages["Limit"] = "Request rate cant be zero";
      isErrorFree = false;
    }
    if (
      limit?.show &&
      limit?.value?.request !== undefined &&
      !limit?.value?.request
    ) {
      errorMessages["Limit"] = "Request rate cant be empty";
      isErrorFree = false;
    }
    if (limit?.show && limit?.value?.request && limit?.value?.request < 1) {
      errorMessages["Limit"] = "Request rate can only be positive numbers";
      isErrorFree = false;
    }
    if (schedule?.show && schedule?.value !== undefined) {
        const {valid:value,reason}:any=validateTimeRange(schedule?.value?.start,schedule?.value?.end);
        console.log(value,reason)
      if(!value){
        errorMessages["Schedule On/Off"] = reason;
        isErrorFree=false
      }
    }
    if (isErrorFree) {
      const apiObj: any = {
        apiName: currentControlName,
        aliasName: undefined,
        numberOfRequest: undefined,
        rate: undefined,
        enabled: undefined,
        startDate:undefined
      };
      if(tracer?.show){
        apiObj.startDate =tracer?.value?.start;
      }
      if (apiName?.show) {
        apiObj.aliasName = apiName?.value?.trim();
      }
      if (schedule?.show) {
        const {start,end}=schedule?.value;
        apiObj.startTime = {hh:Number(start?.hh),mm:Number(start?.mm),ss:Number(start?.ss)}
        apiObj.endTime = {hh:Number(end?.hh),mm:Number(end?.mm),ss:Number(end?.ss)}
        apiObj.enabled = true;
      } else {
        apiObj.enabled = false;
      }
      if (limit?.show) {
        apiObj.numberOfRequest = limit?.value?.request;
        apiObj.rate = limit?.value?.limit ?? "minute";
      }
      setControl({
        [currentControlName]: !control[currentControlName],
      });
      saveConfigData(apiObj);
      console.log(selectedControl);
      setControlErrors({});
    } else {
      setControlErrors({ [currentControlName]: errorMessages });
    }
  }
  async function saveConfigData(apiObj: any) {
    setLoading(true);
    try {
      const data = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/config`,
        apiObj,
        {
          headers: {
            "x-api-key": localStorage.getItem("api-key"),
          },
          timeout: 10000,
        }
      );
      setConfigData((prev: any) =>
        prev.map((el: any) => {
          if (el?.apiName === data?.data?.data?.apiName) {
            let selectedControlData = { ...selectedControl };
            const updatedConfig = data?.data?.data;
            selectedControlData[el?.apiName] = {
              "API Name": { show: true, value: updatedConfig?.aliasName },
              "Tracer":{show:true,value:{start:updatedConfig?.startDate}},
              "Limit": {
                show: updatedConfig?.enabled,
                value: {
                  request: updatedConfig?.numberOfRequest,
                  limit: updatedConfig?.rate,
                },
              },
              "Schedule On/Off": {
                show: updatedConfig?.enabled,
                value: {
                  start: {hh:getPaddedNumber(updatedConfig?.startTime?.hh),mm:getPaddedNumber(updatedConfig?.startTime?.mm),ss:getPaddedNumber(updatedConfig?.startTime?.ss)},
                  end: {hh:getPaddedNumber(updatedConfig?.endTime?.hh),mm:getPaddedNumber(updatedConfig?.endTime?.mm),ss:getPaddedNumber(updatedConfig?.endTime?.ss)},
                },
              },
            };
            setSelectedControl(selectedControlData);
            return data?.data?.data;
          }
          return el;
        })
        
      );
      setBackground(apiObj?.apiName);
      setTimeout(()=>{
setBackground('');
      },200)
      toast.info("Config updated successfully", { autoClose: 500 });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          toast.error("Connection timed out", { autoClose: 500 });
        } else {
          toast.error(err?.response?.data ?? "Internal Server error", {
            autoClose: 500,
          });
        }
      } else {
        toast.error("Unknown error", { autoClose: 500 });
      }
    } finally {
      setLoading(false);
    }
  }
  const handleSelect = (startDate: any) => {
    const startDateString = startDate.toString();
    const controlName = "Tracer";
    const apiName = Object.keys(control)[0];
    setControlErrors((prev: any) => ({ ...prev, [apiName]: {} }));
    setSelectedControl((prev: any) => ({
      ...prev,
      [apiName]: {
        ...(prev[apiName] ?? {}),
        [controlName]: {
          ...prev[apiName]?.[controlName],
          value: {
            start: startDateString,
          },
        },
      },
    }));
    setSelectedDate(startDate);
    setShowCalendar(false);
  };
  function getFormattedDateForSchedule(dateString = "") {
    console.log(dateString, "lallalalal");
    return dateString?.length ? format(dateString, "dd/MM/yyyy") : dateString;
  }
  function isButtonDisable() {
    const currentControlName = Object.keys(control)[0];
    const selectedControlData = selectedControl[currentControlName];
    console.log(currentControlName, selectedControlData);
    if (!selectedControlData) {
      return true;
    }
    const apiName = selectedControlData["API Name"];
    const limit = selectedControlData["Limit"];
    const schedule = selectedControlData["Schedule On/Off"];
    return (
      apiName?.value === undefined &&
      limit?.value === undefined &&
      schedule?.value === undefined
    );
  }
  function getScheduleDates(config: any) {
    if (config?.enabled) {
      const startDate = `${getPaddedNumber(config?.startTime?.hh)}:${getPaddedNumber(config?.startTime?.mm)}:${getPaddedNumber(config?.startTime?.ss)}`;
      const endDate =  `${getPaddedNumber(config?.endTime?.hh)}:${getPaddedNumber(config?.endTime?.mm)}:${getPaddedNumber(config?.endTime?.ss)}`;
      return `${startDate} - ${endDate}`;
    } else {
      return "Off";
    }
  }
  function getRequestLimit(config: any) {
    if (config?.enabled) {
      return `${config?.numberOfRequest}/${config?.rate}`;
    } else {
      return "N.A";
    }
  }
  function isValidTime( hh:string, mm:string, ss:string ) {
  const h = Number(hh);
  const m = Number(mm);
  const s = Number(ss);

  if ([h, m, s].some((n) => isNaN(n))) return false;
  if (h < 0 || h > 23) return false;
  if (m < 0 || m > 59) return false;
  if (s < 0 || s > 59) return false;

  return true;
}

function toSeconds(hh:string, mm:string, ss:string ) {
  console.log(hh,mm,ss)
  console.log(Number(hh) * 3600 + Number(mm) * 60 + Number(ss))
  return Number(hh) * 3600 + Number(mm) * 60 + Number(ss);
}
function validateTimeRange(start:object, end:object) {
  if (!isValidTime(start.hh,start.mm,start.ss)) return { valid: false, reason: "Invalid start time" };
  if (!isValidTime(end.hh,end.mm,end.ss)) return { valid: false, reason: "Invalid end time" };

  if (toSeconds(start.hh,start.mm,start.ss) >= toSeconds(end.hh,end.mm,end.ss)) {
    return { valid: false, reason: "Start time must be before end time" };
  }

  return { valid: true };
}
  return (
    <div style={{ padding: "1.5rem" }}>
      {loading && <Loader />}
      {showCalendar && (
        <div
          ref={calendarRef}
          style={{
            position: "absolute",
            zIndex: 1000,
            top: "2.5rem",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          <Calendar
            date={selectedDate}
            onChange={(date) => {
              handleSelect(date);
              setShowCalendar(false);
            }}
            minDate={new Date()}
          />
        </div>
      )}
      <h3
        style={{
          fontSize: "32px",
          padding: "0px",
          margin: "0px",
          marginBottom: "1rem",
        }}
      >
        API List
      </h3>
      <>
        {Boolean(configData?.length) && (
          <table
            style={{
              width: "100%",
              borderRadius: "12px",
              border: "2px solid #1A1F37",
              borderCollapse: "separate",
              borderSpacing: 0,
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", backgroundColor: "#5284D9" }}>
                <th style={{ borderTopLeftRadius: "12px" }}>API Name</th>
                <th>Start Date</th>
                <th>Scheduling</th>
                <th>Request Limit</th>
                <th style={{ borderTopRightRadius: "12px" }}></th>
              </tr>
            </thead>
            <tbody>
              {configData?.map((config: any, index: number) => (
                <tr style={{ backgroundColor: background===config?.apiName?'#767676':"#1A1F37" }}>
                  <td
                    style={{
                      borderBottomLeftRadius:
                        index === configData?.length - 1 ? "10px" : "0px",
                    }}
                  >
                    {config?.aliasName}
                  </td>
                  <td>{config?.startDate?format(config?.startDate, "dd/MM/yyyy"):'N.A'}</td>
                  <td>{getScheduleDates(config)}</td>
                  <td>{getRequestLimit(config)}</td>
                  <td
                    style={{
                      borderBottomRightRadius:
                        index === configData?.length - 1 ? "10px" : "0px",
                      position: "relative",
                    }}
                  >
                    <MdMoreVert
                      onClick={(event) => {
                        event.stopPropagation();
                        setControl({
                          [config?.apiName]: !control[config?.apiName],
                        });
                        controlref.current = config?.apiName;
                      }}
                      size={24}
                      style={{ cursor: "pointer" }}
                      color="#fff"
                    />
                    {control[config?.apiName] && (
                      <div
                        ref={ref}
                        style={{
                          position: "absolute",
                          top: "80%",
                          right: "50%",
                          zIndex: 10,
                          minHeight: "10rem",
                          minWidth: "24rem",
                          border: "1px solid #1A1F37",
                          backgroundColor: "#1A1F37",
                          borderRadius: "20px",
                        }}
                      >
                        <div
                          style={{
                            height: "2rem",
                            backgroundColor: "#5284D9",
                            borderRadius: "18px 18px 0px 0px",
                            paddingLeft: "1rem",
                            fontWeight: "bold",
                          }}
                        >
                          Controls
                        </div>
                        {["API Name", "Tracer", "Limit", "Schedule On/Off"].map(
                          (el) => (
                            <>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  padding: "0px 1rem",
                                  alignItems: "center",
                                  margin: 0,
                                }}
                              >
                                <p>{el}</p>
                                <Switch
                                  checked={
                                    selectedControl[config.apiName]?.[el]?.show
                                  }
                                  onChange={(flag) => {
                                    setSelectedControl((prev: any) => ({
                                      ...prev,
                                      [config?.apiName]: {
                                        ...prev[config?.apiName],
                                        [el]: {
                                          ...prev[config?.apiName]?.[el],
                                          show: flag,
                                        },
                                      },
                                    }));
                                  }}
                                  onColor="#5284D9"
                                  offColor="#DDDDDD"
                                  handleDiameter={20}
                                  uncheckedIcon={false}
                                  checkedIcon={false}
                                />
                              </div>
                              {selectedControl[config.apiName]?.[el]?.show && (
                                <div
                                  style={{
                                    display: "flex",
                                    padding: "0.25rem 1rem",
                                  }}
                                >
                                  {getLayout(
                                    config?.apiName,
                                    el,
                                    config?.aliasName
                                  )}
                                </div>
                              )}
                              {controlErrors?.[config.apiName]?.[el] && (
                                <p
                                  style={{
                                    color: "red",
                                    margin: 0,
                                    padding: 0,
                                    marginLeft: "1rem",
                                  }}
                                >
                                  {controlErrors[config.apiName]?.[el]}
                                </p>
                              )}
                            </>
                          )
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "end",
                            padding: "1rem",
                          }}
                        >
                          <button
                            disabled={isButtonDisable()}
                            onClick={() => {
                              validateControl();
                            }}
                            style={{
                              padding: "0.5rem 3rem",
                              backgroundColor: "#5284D9",
                              color: "white",
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    </div>
  );
};

export default Configuration;

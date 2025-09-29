import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import Loader from "./Loader";
import "./Configuration.css";
import { format } from "date-fns";
import { MdMoreVert } from "react-icons/md";
import Switch from "react-switch";
import { FaCalendarAlt } from "react-icons/fa";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { toast } from "react-toastify";

const Configuration = () => {
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState([]);
  const [control, setControl] = useState<any>({});
  const [selectedControl, setSelectedControl] = useState<any>({});
  const [controlErrors, setControlErrors] = useState<any>();
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date(), // default start
      endDate: new Date(), // default end
      key: "selection",
    },
  ]);
  const ref = useRef<any>(null);
  const calendarRef = useRef<any>(null);
  const controlref = useRef<any>(null);
  useEffect(() => {
    fetchConfigData();
  }, []);
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
            Limit: {
              show: el?.enabled,
              value: { request: el?.numberOfRequest, limit: el?.rate },
            },
            "Schedule On/Off": {
              show: el?.enabled,
              value: { start: el?.schedule?.start, end: el?.schedule?.end },
            },
          };
        });
        setSelectedControl(selectedControlData);
        toast.info("Config data fetched successfully",{autoClose:500});
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          toast.error("Connection timed out",{autoClose:500});
        } else {
          toast.error(err?.message,{autoClose:500});
        }
      } else {
        toast.error("Internal Server error",{autoClose:500});
      }
    } finally {
      setLoading(false);
    }
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
                   border:'2px solid #767676',
                   backgroundColor:'transparent',
                   color:'#737373',
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
              <label htmlFor="requests" style={{color:'#737373',fontSize:'14px'}}>Number of Request:</label>
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
                   border:'2px solid #767676',
                   backgroundColor:'transparent',
                   color:'#737373'
                }}
                id="requests"
                value={
                  selectedControl[apiName]?.["Limit"]?.["value"]?.["request"] ??
                  0
                }
              />
            </div>
            <div>
              <label htmlFor="limit" style={{color:'#737373',fontSize:'14px'}}>Rate:</label>
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
                  borderRadius: "8px",
                  outline: "none",
                  borderColor: "transparent",
                   border:'2px solid #767676',
                   backgroundColor:'transparent',
                   color:'#737373'
                                      

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
            <div style={{ textAlign: "right",margin:0,padding:0 }}>
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexGrow: 1,
              }}
            >
              <div style={{display:'flex',width:'50%'}}>
                <label htmlFor="startTime"  style={{color:'#737373',fontSize:'14px'}}>Start Time:</label>
                <input
                  disabled
                  style={{
                    borderRadius: "8px",
                    border:'2px solid #767676',
                    width:'70px',
                    outline: "none",
                    fontSize:'12px',
                    backgroundColor:'transparent',
                     color:'#737373',
                    flexGrow:1
                  }}
                  id="startTime"
                  value={getFormattedDateForSchedule(
                    selectedControl[apiName]?.["Schedule On/Off"]?.["value"]?.[
                      "start"
                    ]
                  )}
                />
              </div>
              <div style={{display:'flex',width:'50%'}}>
                 <label htmlFor="endTime"  style={{color:'#737373',fontSize:'14px'}}>End Time:</label>
                
                <input
                  disabled
                  style={{
                    borderRadius: "8px",
                    border:'2px solid #767676',
                    width:'70px',
                    outline: "none",
                    fontSize:'12px',
                    flexGrow:1,
                    backgroundColor:'transparent',
                     color:'#737373'
                  }}
                  id="endTime"
                  value={getFormattedDateForSchedule(
                    selectedControl[apiName]?.["Schedule On/Off"]?.["value"]?.[
                      "end"
                    ]
                  )}
                />
              </div>
            </div>
          </div>
        );
    }
  }
  function validateControl() {
    const currentControlName = Object.keys(control)[0];
    const selectedControlData = selectedControl[currentControlName];
    console.log(selectedControl, "last check");
    const apiName = selectedControlData["API Name"];
    const limit = selectedControlData["Limit"];
    const schedule = selectedControlData["Schedule On/Off"];
    const errorMessages = { "API Name": "", Limit: "", "Schedule On/Off": "" };
    let isErrorFree = true;
    console.log(schedule);
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
    if (schedule?.show && schedule?.value === undefined) {
      errorMessages["Schedule On/Off"] = "Please select schedule dates";
      isErrorFree = false;
    }
    if (isErrorFree) {
      const apiObj: any = {
        apiName: currentControlName,
        aliasName: undefined,
        schedule: { start: undefined, end: undefined },
        numberOfRequest: undefined,
        rate: undefined,
        enabled: undefined,
      };
      if (apiName?.show) {
        apiObj.aliasName = apiName?.value?.trim();
      }
      if (schedule?.show) {
        apiObj.schedule = {
          start: new Date(schedule?.value?.start),
          end: new Date(schedule?.value?.end),
        };
        apiObj.enabled = true;
      } else {
        apiObj.schedule = undefined;
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
      const data = await axios.post(`${import.meta.env.VITE_BASE_URL}/config`, apiObj, {
        headers: {
          "x-api-key": localStorage.getItem("api-key"),
        },
        timeout: 10000,
      });
      setConfigData((prev: any) =>
        prev.map((el: any) => {
          if (el?.apiName === data?.data?.data?.apiName) {
            let selectedControlData = { ...selectedControl };
            const updatedConfig = data?.data?.data;
            selectedControlData[el?.apiName] = {
              "API Name": { show: true, value: updatedConfig?.aliasName },
              Limit: {
                show: updatedConfig?.enabled,
                value: {
                  request: updatedConfig?.numberOfRequest,
                  limit: updatedConfig?.rate,
                },
              },
              "Schedule On/Off": {
                show: updatedConfig?.enabled,
                value: {
                  start: updatedConfig?.schedule?.start,
                  end: updatedConfig?.schedule?.end,
                },
              },
            };
            setSelectedControl(selectedControlData);
            return data?.data?.data;
          }
          return el;
        })
      );
      toast.info("Config updated successfully",{autoClose:500});
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
  const handleSelect = (ranges: any) => {
    setRange([ranges.selection]);
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate && startDate.getTime() !== endDate.getTime()) {
      const startDateString = startDate.toString();
      const endDateString = endDate.toString();
      console.log(startDateString, endDateString);
      const controlName = "Schedule On/Off";
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
              end: endDateString,
            },
          },
        },
      }));
      setShowCalendar(false);
    }
  };
  function getFormattedDateForSchedule(dateString = "") {
    console.log(dateString, "lallalalal");
    return dateString?.length
      ? format(dateString, "dd : MM : yyyy")
      : dateString;
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
      const startDate = format(config?.schedule?.start, "dd/MM/yyyy");
      const endDate = format(config?.schedule?.end, "dd/MM/yyyy");
      return `${startDate} -- ${endDate}`;
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
          <DateRange
            ranges={range}
            onChange={handleSelect}
            months={2}
            direction={"horizontal"}
            minDate={new Date()}
            editableDateInputs={true}
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
                <tr style={{ backgroundColor: "#1A1F37" }}>
                  <td
                    style={{
                      borderBottomLeftRadius:
                        index === configData?.length - 1 ? "10px" : "0px",
                    }}
                  >
                    {config?.aliasName}
                  </td>
                  <td>{format(config?.startDate, "dd/MM/yyyy")}</td>
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
                          minWidth: "22rem",
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
                        {["API Name", "Limit", "Schedule On/Off"].map((el) => (
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
                              <p >{el}</p>
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
                              <div style={{ display: "flex", padding: "0.25rem 1rem" }}>
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
                        ))}
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

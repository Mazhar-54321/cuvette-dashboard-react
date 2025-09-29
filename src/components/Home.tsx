import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style
import "react-date-range/dist/theme/default.css";
import { FaCheckCircle } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import Pagination from "./Pagination";
import NoData from "./NoData";
import Loader from "./Loader";
import { toast } from "react-toastify";
export const colorObj: any = {
  1: "yellow",
  2: "green",
  3: "orange",
  4: "red",
  5: "red",
};
const Home = () => {
  const [systemStatus, setSystemStatus] = useState<any>({});
  const [showCalendar, setShowCalendar] = useState(false);
  const [paginationList, setPaginationList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPagination, setSelectedPagination] = useState({});
  const [range, setRange] = useState([
    {
      startDate: new Date(), // default start
      endDate: new Date(), // default end
      key: "selection",
    },
  ]);
  const handleSelect = (ranges: any) => {
    setRange([ranges.selection]);
    const { startDate, endDate } = ranges.selection;
    if (startDate && endDate && startDate.getTime() !== endDate.getTime()) {
      let startMonth = Number(startDate.getMonth());
      let startYear = Number(startDate.getFullYear());
      const endMonth = Number(endDate.getMonth());
      const endYear = Number(endDate.getFullYear());
      let paginationArray: any = [];
      paginationArray.push({ month: startMonth, year: startYear });
      while (`${startMonth}${startYear}` !== `${endMonth}${endYear}`) {
        if (startMonth === 11) {
          startMonth = 0;
          startYear++;
        } else {
          startMonth++;
        }
        paginationArray.push({ month: startMonth, year: startYear });
      }
      setPaginationList(paginationArray);
      getSystemStatus(paginationArray[0].month + 1, paginationArray[0].year);
      setShowCalendar(false);
    }
  };
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>([]);
  const popupRef = useRef<any>(null);
  const [apisCurrentPage, setApisCurrentPage] = useState<any>([]);
  const [loader, setLoader] = useState<any>([]);
  useEffect(() => {
    getSystemStatus(new Date().getMonth() + 1, new Date().getFullYear());
    setPaginationList([
      { month: new Date().getMonth(), year: new Date().getFullYear() },
    ]);
    setSelectedPagination({
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
    });
  }, []);
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setShowCalendar(false);
    }
  }, []);

  useEffect(() => {
    if (showCalendar) {
      document.addEventListener("click", handleOutsideClick, true);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick, true);
    };
  }, [showCalendar, handleOutsideClick]);
  async function getSystemStatus(month: number, year: number) {
    setLoading(true);

    try {
      const data = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api?month=${(month + "").padStart(
          2,
          "0"
        )}&year=${year}`,
        {
          headers: {
            "x-api-key": localStorage.getItem("api-key"),
          },
          timeout: 10000,
        }
      );
      if (data?.data) {
        setLoader(
          Object.keys(data?.data?.data)?.map((el: any) => ({
            api: el,
            loading: false,
          }))
        );
        setApisCurrentPage(
          Object.keys(data?.data?.data)?.map((el: any) => ({
            api: el,
            currentPage: 1,
            totalPages: data?.data?.data[el]?.pagination?.totalPages,
          }))
        );
        setSystemStatus(data?.data?.data);
        toast.info("Api status fetched successfully",{autoClose:500});
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
  async function getApiPaginatedData(apiName: string, page: number) {
    const { year, month }: any = selectedPagination;
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const paddedMonth = (month + 1 + "").padStart(2, "0");
    const formattedFromDate = `${year}/${paddedMonth}/01`;
    const formattedEndDate = `${year}/${paddedMonth}/${lastDayOfMonth}`;
    const queryParams = `/status?from=${formattedFromDate}&to=${formattedEndDate}&page=${page}`;
    const encodedApiName = btoa(apiName);
    const url = `${import.meta.env.VITE_BASE_URL}/api/${encodedApiName}${queryParams}`;
    try {
      const data = await axios.get(url, {
        headers: {
          "x-api-key": localStorage.getItem("api-key"),
        },
      });
      setSystemStatus((prev: any) => ({
        ...prev,
        [apiName]: {
          ...prev[apiName],
          data: prev[apiName]["data"].concat(data?.data?.data),
        },
      }));
      setApisCurrentPage((prev: any) =>
        prev.map((el: any) => {
          if (el.api === apiName) {
            el.currentPage = page;
          }
          return el;
        })
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === "ECONNABORTED") {
          toast.error("Connection timed out",{autoClose:500});
        } else {
          toast.error(err?.message,{autoClose:500});
        }
      } else {
        toast.error(err?.response?.data ?? "Internal Server error",{autoClose:500});
      }
    } finally {
      setTimeout(() => {
        setLoader((prev: any) =>
          prev.map((el: any) => {
            if (el.api === apiName) {
              el.loading = false;
            }
            return el;
          })
        );
      }, 1000);
    }
  }
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const apiName: any = entry.target.getAttribute("data-api-name");

            const { api, currentPage, totalPages } = apisCurrentPage.find(
              (el: any) => el.api === apiName
            );
            if (
              currentPage < totalPages &&
              !loader?.find((el: any) => el.api === apiName)?.loading
            ) {
              setLoader((prev: any) =>
                prev.map((el: any) => {
                  if (el.api === apiName) {
                    el.loading = true;
                  }
                  return el;
                })
              );
              getApiPaginatedData(apiName, currentPage + 1);
            }
          }
        });
      },
      {
        root: null,
        threshold: 0.1,
      }
    );

    Object.values(itemRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      Object.values(itemRefs.current).forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  });
  function showIntersectionObserver(apiName: string) {
    const { currentPage, totalPages } = apisCurrentPage?.find(
      (el: any) => el?.api === apiName
    );
    return currentPage !== totalPages;
  }
  function handlePagination(month: number, year: number) {
    setSelectedPagination({ month: month, year: year });
    getSystemStatus(month, year);
  }
  function getLatestStatusIndicator(statusCode: number) {
    const statusCodeFirstChar = `${statusCode}`[0];
    return (
      <div
        style={{
          textAlign: "center",
          color: colorObj[statusCodeFirstChar],
          height: "1rem",
          width: "1rem",
        }}
      >
        {["4", "5"].includes(statusCodeFirstChar) ? (
          <FaTimes size={16} />
        ) : (
          <FaCheckCircle size={16} />
        )}
      </div>
    );
  }
  function getFormattedApiName(apiName: string) {
    return apiName
      .split("/")
      .filter((el) => el != "")
      .join("-");
  }
  return (
    <>
      <div style={{ padding: "1.5rem", overflowX: "hidden" }}>
        {showCalendar && (
          <div
            ref={popupRef}
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
              maxDate={new Date()}
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
          Home
        </h3>
        <div style={{ display: "flex", alignItems: "center" }}>
          <p>System status</p>
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
          {paginationList?.length && (
            <Pagination
              list={paginationList}
              handlePagination={handlePagination}
            />
          )}
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div style={{ maxWidth: "80%", overflowX: "hidden" }}>
            {Object.keys(systemStatus)?.map((el: any, index: number) => (
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <span>
                    {index + 1}{" "}
                    <b
                      style={{
                        marginLeft: "1rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {getFormattedApiName(systemStatus[el]?.apiName)}
                    </b>
                  </span>
                  <span>
                    {getLatestStatusIndicator(
                      systemStatus[el]?.data?.[
                        systemStatus[el]?.data?.length - 1
                      ]?.statusCode
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    overflowX: "auto",
                    flexWrap: "nowrap",
                    scrollbarWidth: "none",
                  }}
                >
                  {systemStatus[el]?.data?.map((data: any, index: number) => (
                    <>
                      {!["4", "5"].includes(`${data?.statusCode}`[0]) ? (
                        <div
                          style={{
                            borderRadius: "0.5rem",
                            minWidth: "2.5rem",
                            minHeight: "2rem",
                            backgroundColor: colorObj[`${data?.statusCode}`[0]],
                          }}
                          title={`${data?.statusCode}(${data?.method})(${data?.timestamp})`}
                        ></div>
                      ) : (
                        <div
                          style={{
                            minWidth: "2.5rem",
                            minHeight: "2rem",
                            borderBottom: "2px solid red",
                          }}
                          title={`${data?.statusCode}(${data?.method})(${data?.timestamp})`}
                        ></div>
                      )}
                      {systemStatus[el]?.data?.length >= 20 &&
                        index === systemStatus[el]?.data?.length - 1 &&
                        showIntersectionObserver(systemStatus[el].apiName) && (
                          <div
                            style={{
                              borderRadius: "0.5rem",
                              minWidth: "2rem",
                              minHeight: "2rem",
                            }}
                            data-api-name={systemStatus[el].apiName}
                            ref={(elRef) => {
                              itemRefs.current[systemStatus[el].apiName] =
                                elRef;
                            }}
                          ></div>
                        )}

                      {loader?.find((el: any) => data?.apiName === el?.api)
                        ?.loading &&
                        index === systemStatus[el]?.data?.length - 1 && (
                          <span>Loading...</span>
                        )}
                    </>
                  ))}
                </div>
              </div>
            ))}
            {!Boolean(Object.keys(systemStatus)?.length) && <NoData />}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;

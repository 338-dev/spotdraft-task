import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../HomePage/Header.component";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PDFViewer = () => {
  const location = useLocation();
  const paramsData = location.state?.data;
  const navigate = useNavigate();

  const pathname = window.location.pathname.split("/")[2];
  const [pdfData, setPdfData] = useState({});

  useEffect(() => {
    if (pathname) {
      fetch(`https://pdf-keeper-backend.onrender.com/file/view/${pathname}`, {
        headers: {
          jwt: localStorage.getItem("jwt"),
        },
        mode: "cors",
      })
        .then(async (response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setPdfData(data);
        })
        .catch((error) => {
          console.log(error.message);
          toast.error(JSON.parse(error.message).message);
          navigate("/");
        });
    } else {
      if (paramsData?.url) setPdfData(paramsData);
      else navigate("/");
    }
  }, []);

  const styles = {
    position: "absolute",
    height: "100%",
    marginTop: "90px",
  };
  return (
    <>
      <Header />
      {Object.keys(pdfData).length > 0 ? (
        <object
          data={pdfData?.url}
          type="application/pdf"
          width="100%"
          style={styles}
        >
          <p>
            <a href={pdfData?.url}> click to open the PDF!</a>
          </p>
        </object>
      ) : (
        "No PDF to show"
      )}
      <ToastContainer />
    </>
  );
};

export default PDFViewer;

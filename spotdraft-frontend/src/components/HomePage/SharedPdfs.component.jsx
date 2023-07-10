import React, { useEffect, useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import SideBar from "../SideBar/SideBar.component";
import Header from "./Header.component";
import pdfIcon from "../../assets/pdf.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Dropdown, Modal } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import CommentsModal from "./CommentsModal.component";

const SharedPdfs = () => {
  const [pdfData, setPdfData] = useState([]);
  const [isMoreDetailsModalOpen, setIsMoreDetailsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const items = [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            setIsMoreDetailsModalOpen(true);
          }}
        >
          More Details
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div
          onClick={() => {
            setIsCommentsOpen(true);
          }}
        >
          Comments
        </div>
      ),
    },
  ];
  const fetchPDFs = async () => {
    fetch("https://pdf-keeper-backend.onrender.com/file/viewAll/shared", {
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
        navigate("/login");
      });
  };
  useEffect(() => {
    fetchPDFs();
  }, []);

  const navigate = useNavigate();
  return (
    <div>
      <Header />
      <div className="data-sidebar-container">
        <SideBar />
        <div className="data-container">
          {pdfData.length > 0 ? (
            <div className="data-parent">
              {pdfData.map((data, index) => (
                <div key={index} className="pdf-tab-container">
                  <div className="dropdown-icon">
                    <Dropdown
                      menu={{ items }}
                      onOpenChange={() => setSelectedFile(data)}
                    >
                      <MoreOutlined />
                    </Dropdown>
                  </div>
                  <div
                    className="pdf-icon-container"
                    onClick={() => {
                      navigate("/pdf-viewer", { state: { data: data } });
                    }}
                  >
                    <img
                      src={pdfIcon}
                      alt="pdfIcon"
                      width={"80%"}
                      height={"80%"}
                    />
                    <div>
                      {data?.name?.length > 15
                        ? data?.name?.slice(0, 15) + "..."
                        : data?.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <h1 className="no-pdf-found">No PDF Files to be shown</h1>
          )}
          <Modal
            open={isMoreDetailsModalOpen}
            onOk={() => setIsMoreDetailsModalOpen(true)}
            onCancel={() => setIsMoreDetailsModalOpen(false)}
            closable={() => setIsMoreDetailsModalOpen(false)}
            footer={null}
            width={"50%"}
            style={{ maxWidth: "500px" }}
            centered
          >
            <div>Name: {selectedFile?.name}</div>
            <div>Size: {selectedFile?.size / 1024} KB</div>
            {(() => {
              const date = new Date(Number(selectedFile?.lastModified));
              return (
                <div>
                  Last Modified:
                  {" " + String(date)?.split(" ")?.slice(0, 4)?.join(" ")}
                </div>
              );
            })()}
          </Modal>
          <CommentsModal
            isCommentsOpen={isCommentsOpen}
            setIsCommentsOpen={setIsCommentsOpen}
            fileDetails={selectedFile}
            setPdfData={setPdfData}
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SharedPdfs;

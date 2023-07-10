import React, { useEffect, useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import SideBar from "../SideBar/SideBar.component";
import { Button, Checkbox, Dropdown, Input, Modal, Space, Spin } from "antd";
import Header from "./Header.component";
import pdfIcon from "../../assets/pdf.png";
import { MoreOutlined } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CommentsModal from "./CommentsModal.component";
import * as Joi from "joi";

const HomePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoreDetailsModalOpen, setIsMoreDetailsModalOpen] = useState(false);
  const [shareToEmail, setShareToEmail] = useState("");
  const [sharedFileUuid, setSharedFileUuid] = useState("");
  const [shareWithAllAuthenticated, setShareWithAllAuthenticated] =
    useState(false);
  const [shareWithEveryOne, setShareWithEveryOne] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [pdfData, setPdfData] = useState([]);
  const schemaEmail = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
  });

  const items = [
    {
      key: "1",
      label: (
        <div
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Share
        </div>
      ),
    },
    {
      key: "2",
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
      key: "3",
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
    fetch("https://pdf-keeper-backend.onrender.com/file/viewall", {
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
        setLoadingData(false);
        setPdfData(data);
      })
      .catch((error) => {
        console.log(error.message);
        toast.error(JSON.parse(error.message).message);
        setLoadingData(false);
        navigate("/login");
      });
  };
  useEffect(() => {
    fetchPDFs();
  }, []);

  const shareFile = () => {
    const result = schemaEmail.validate({ email: shareToEmail.trim() });

    const { error } = result;
    if (error) {
      toast.error(error.message);
    } else {
      fetch(
        `https://pdf-keeper-backend.onrender.com/file/share/${sharedFileUuid}`,
        {
          method: "PUT",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            jwt: localStorage.getItem("jwt"),
          },
          body: JSON.stringify({
            email: shareToEmail.toLowerCase().trim(),
          }),
        }
      )
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
          toast.success("Shared filed successfully");
          setShareToEmail("");
          setIsModalOpen(false);
        })
        .catch((error) => {
          console.log(error.message);
          toast.error(JSON.parse(error.message).message);
          setShareToEmail("");
          setIsModalOpen(false);
        });
    }
  };

  const shareFileWithTypeOfUser = (obj) => {
    fetch(
      `https://pdf-keeper-backend.onrender.com/file/sharewithType/${sharedFileUuid}`,
      {
        method: "PUT",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          jwt: localStorage.getItem("jwt"),
        },
        body: JSON.stringify(obj),
      }
    )
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
        toast.success("successfully applied setting");
        setPdfData(data);
      })
      .catch((error) => {
        toast.error(JSON.parse(error.message).message);
        console.log(error.message);
      });
  };

  const onDropDownHover = (data) => {
    setSelectedFile(data);
    setSharedFileUuid(data.securedUuid);
    setShareWithAllAuthenticated(data.shareWithAllAuthenticated);
    setShareWithEveryOne(data.shareWithEveryOne);
  };
  const navigate = useNavigate();

  return (
    <div>
      <Header setPdfData={setPdfData} pdfData={pdfData} />
      <div className="data-sidebar-container">
        <SideBar setPdfData={setPdfData} pdfData={pdfData} />
        <div className="data-container">
          {loadingData === true ? (
            <div />
          ) : pdfData.length > 0 ? (
            <div className="data-parent">
              {pdfData.map((data, index) => (
                <div key={index} className="pdf-tab-container">
                  <div className="dropdown-icon">
                    <Dropdown
                      menu={{ items }}
                      onOpenChange={() => onDropDownHover(data)}
                    >
                      <MoreOutlined />
                    </Dropdown>
                  </div>
                  <div
                    className="pdf-icon-container"
                    onClick={() => {
                      setSelectedFile(data.url);
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
            <div>
              Size: {Math.round((selectedFile?.size / 1024) * 100) / 100} KB
            </div>
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
          <Modal
            open={isModalOpen}
            okButtonProps={{ style: { display: "none" } }}
            onCancel={() => setIsModalOpen(false)}
          >
            <div>Share to:</div>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Enter Email"
                onChange={(e) => setShareToEmail(e.target.value)}
                value={shareToEmail}
              />
              <Button type="primary" onClick={() => shareFile()}>
                Share
              </Button>
            </Space.Compact>
            <div className="checkbox-container">
              <Checkbox
                checked={shareWithAllAuthenticated}
                onChange={(e) => {
                  setShareWithAllAuthenticated(e.target.checked);
                  shareFileWithTypeOfUser({
                    shareWithEveryOne: shareWithEveryOne,
                    shareWithAllAuthenticated: e.target.checked,
                  });
                }}
              >
                Share with all authenticated users
              </Checkbox>
              <Checkbox
                checked={shareWithEveryOne}
                onChange={(e) => {
                  setShareWithEveryOne(e.target.checked);
                  shareFileWithTypeOfUser({
                    shareWithEveryOne: e.target.checked,
                    shareWithAllAuthenticated: shareWithAllAuthenticated,
                  });
                }}
              >
                Share with all users
              </Checkbox>
            </div>
            {(shareWithAllAuthenticated || shareWithEveryOne) && (
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  defaultValue={
                    window.location.origin + "/pdf-viewer/" + sharedFileUuid
                  }
                  readOnly
                />
                <Button
                  type="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      window.location.origin + "/pdf-viewer/" + sharedFileUuid
                    );
                  }}
                >
                  Copy
                </Button>
              </Space.Compact>
            )}
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

export default HomePage;

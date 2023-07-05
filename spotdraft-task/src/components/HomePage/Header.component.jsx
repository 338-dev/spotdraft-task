import React, { useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { Dropdown } from "antd";
import { MenuOutlined, UploadOutlined } from "@ant-design/icons";
import { FileUploadModal } from "../SideBar/SideBar.component";
const Header = ({ setPdfData = () => {}, pdfData = [] }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("tokenExpirationTime");
    navigate("/login");
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const items = [
    {
      key: "1",
      label: <div onClick={() => navigate("/")}>My Files</div>,
    },
    {
      key: "2",
      label: <div onClick={() => navigate("/shared-pdfs")}>Shared Files</div>,
    },
    {
      key: "3",
      danger: true,
      label: <div onClick={handleLogout}>Logout</div>,
    },
  ];
  return (
    <header className="header-container">
      <h1 className="header-title">PDF Keeper</h1>
      {localStorage.getItem("jwt") && (
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      )}
      <div className="end-icons-container">
        <div className="upload-icon" onClick={() => setIsModalOpen(true)}>
          <UploadOutlined />
        </div>
        <Dropdown
          menu={{
            items,
          }}
          className="option-dropdown"
        >
          <MenuOutlined />
        </Dropdown>
      </div>
      <FileUploadModal
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        setPdfData={setPdfData}
        pdfData={pdfData}
      />
    </header>
  );
};

export default Header;

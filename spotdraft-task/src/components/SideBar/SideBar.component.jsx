import React, { useState } from "react";
import "./SideBar.css";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../Server/server";
import { Modal, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const FileUploadModal = ({
  setIsModalOpen,
  isModalOpen,
  setPdfData,
  pdfData,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const uploadFileToServer = (file) => {
    fetch("https://pdf-keeper.cyclic.app/file/create", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        jwt: localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        ...file,
      }),
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
        toast.success("file uploaded successfully");
        setPdfData([...pdfData, data]);
        setIsModalOpen(false);
        setUploadProgress(0);
        setSelectedFile("");
      })
      .catch((error) => {
        console.log(error.message);
        toast.error(JSON.parse(error.message).message);
        setIsModalOpen(false);
        setSelectedFile("");
        setUploadProgress(0);
      });
  };

  const allowedFiles = ["application/pdf"];

  const uploadFile = (file) => {
    const storageRef = ref(storage, `/files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setUploadProgress(progress);
      },
      (error) => {
        toast.error("error in uploading the file");
        setUploadProgress(0);
        setIsModalOpen(false);
        setSelectedFile("");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          uploadFileToServer({
            url: downloadURL,
            name: file?.name,
            lastModified: file?.lastModified,
            size: file?.size,
          });

          console.log("Download URL:", downloadURL);
        });
      }
    );
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (!file || !allowedFiles.includes(file.type)) {
      toast.error("Not a valid PDF");
      return;
    }
    setSelectedFile(file);
    uploadFile(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];

    if (!file || !allowedFiles.includes(file.type)) {
      toast.error("Not a valid PDF");
      return;
    }
    setSelectedFile(file);
    uploadFile(file);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      closable={null}
      footer={null}
      style={{ height: "300px" }}
    >
      <div className="file-upload-container">
        <div
          className={`dropzone ${isDragOver ? "drag-over" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragEnter}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <div>
              <h3>uploading {selectedFile.name}</h3>
              {uploadProgress > 0 && <Spin />}
            </div>
          ) : (
            <div>
              <h4>Drag and drop a PDF file here,</h4>{" "}
              <p>or, Browse to upload</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                id="file-input"
                value={selectedFile}
                style={{ display: "none" }}
              />
              <label className="choose-file" for="file-input">
                Choose File
              </label>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const SideBar = ({ setPdfData = () => {}, pdfData = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <div className="tab" onClick={() => setIsModalOpen(true)}>
          Add File
        </div>
        <div className="tab active" onClick={() => navigate("/")}>
          My Files
        </div>
        <div className="tab" onClick={() => navigate("/shared-pdfs")}>
          Shared Files
        </div>
      </div>
      <FileUploadModal
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        setPdfData={setPdfData}
        pdfData={pdfData}
      />
    </div>
  );
};

export default SideBar;

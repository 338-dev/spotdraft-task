import React, { useState } from "react";
import { Modal, Input, Space, Button } from "antd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CommentsModal = ({
  isCommentsOpen,
  setIsCommentsOpen,
  fileDetails,
  setPdfData,
}) => {
  const [comment, setComment] = useState("");

  const postComment = () => {
    if (comment.trim() < 3) {
      toast.error("Comments should be more than 3 letters");
      return;
    }
    fetch(
      `https://pdf-keeper-backend.onrender.com/file/comments/${fileDetails.securedUuid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          jwt: localStorage.getItem("jwt"),
        },
        mode: "cors",
        body: JSON.stringify({
          comment: comment.trim(),
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
        setPdfData(data);
        setComment("");
        toast.success("commented succesfully");
        setIsCommentsOpen(false);
      })
      .catch((error) => {
        console.log(error.message);
        toast.error(JSON.parse(error.message).message);
        setComment("");
        setIsCommentsOpen(false);
      });
  };
  const style = {
    width: "100%",
    padding: "30px 0",
  };
  return (
    <Modal
      open={isCommentsOpen}
      onOk={() => setIsCommentsOpen(true)}
      onCancel={() => setIsCommentsOpen(false)}
      closable={() => setIsCommentsOpen(false)}
      footer={null}
      title="Comments"
      width={"90%"}
      style={{ maxWidth: "500px", padding: "20px" }}
      centered
    >
      <div style={{ maxHeight: 400 }}>
        {fileDetails?.comments &&
          JSON.parse(fileDetails?.comments)?.map((commentData, index) => (
            <div>
              <p style={{ fontSize: "20px" }}>
                {Object.keys(commentData)[0]}:{" "}
              </p>
              <p style={{ margin: "0 10px" }}>
                {commentData[Object.keys(commentData)[0]]}
              </p>
            </div>
          ))}
      </div>
      <Space.Compact style={style}>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter comment"
        />
        <Button
          type="primary"
          onClick={() => {
            postComment();
          }}
        >
          Post
        </Button>
      </Space.Compact>
    </Modal>
  );
};

export default CommentsModal;

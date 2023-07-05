import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Joi from "joi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const schemaLogin = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(8).max(30).required(),
  });

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = schemaLogin.validate({
      email: email.trim(),
      password: password,
    });

    const { error } = result;
    if (error) {
      toast.error(error.message);
    } else {
      fetch("https://pdf-keeper.cyclic.app/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
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
          localStorage.setItem("jwt", data.jwt);
          localStorage.setItem("tokenExpirationTime", data.tokenExpirationTime);
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate("/");
        })
        .catch((error) => {
          console.log(error.message);
          toast.error(JSON.parse(error.message).message);
        });
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            className="form-input"
          />
        </div>
        <div className="form-button" onClick={handleSubmit}>
          Login
        </div>
        <p
          className="navigation-button"
          onClick={() => navigate("/registration")}
        >
          New user? Register
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;

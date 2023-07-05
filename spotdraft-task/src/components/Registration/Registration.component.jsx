import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Registration.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as Joi from "joi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const schemaRegister = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().min(8).max(30).required(),
  });

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = schemaRegister.validate({
      name: name.trim(),
      email: email.trim(),
      password: password,
    });

    const { error } = result;
    if (error) {
      toast.error(error.message);
    } else {
      fetch("https://pdf-keeper.cyclic.app/user/register", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
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
    <div className="registration-container">
      <h1>Registration</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="email"
            value={name}
            onChange={handleNameChange}
            className="form-input"
          />
        </div>
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
        <div onClick={handleSubmit} className="form-button">
          Register
        </div>
        <p className="navigation-button" onClick={() => navigate("/login")}>
          Already a user? Login
        </p>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Register;

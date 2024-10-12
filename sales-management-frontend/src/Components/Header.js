// src/Components/Header.js
import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import Cookies from "js-cookie";

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = !!Cookies.get("access_token");

  const handleLogout = async () => {
    const refreshToken = Cookies.get("refresh_token");
    const accessToken = Cookies.get("access_token");
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/logout/`,
        { refresh_token: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      toast.success("Logout successful!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed");
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Sales Management
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Home
        </Button>
        {isLoggedIn ? (
          <>
            <Button color="inherit" component={Link} to='/invoice'>
              Invoice
            </Button>
            <Button color="inherit" component={Link} to='/dashboard'>
              Dashboard
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
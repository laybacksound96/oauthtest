import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import axios from "axios";

const CLIENT_ID = "1080467945186144308";
const CLIENT_SECRET = "f390G_PMgDbC3vmFQfIunZGpAD4rO751";
const REDIRECT_URI = "http://localhost:3000/callback";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");

    if (token) {
      // Check if token is still valid
      axios
        .get("https://discord.com/api/v8/users/@me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log(res);
          setIsAuthenticated(true);
        })
        .catch(() => {
          sessionStorage.removeItem("access_token");
        });
    }
  }, []);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      axios({
        method: "post",
        url: "https://discord.com/api/oauth2/token",
        data: {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        .then((response) => {
          const access_token = response.data.access_token;
          sessionStorage.setItem("access_token", access_token);
          window.location.href = `/`;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);

  const handleLogin = () => {
    const urlParams = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "identify email",
    });
    window.location.href = `https://discord.com/api/oauth2/authorize?${urlParams}`;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Route exact path="/">
        {isAuthenticated ? (
          <Redirect to="/dashboard" />
        ) : (
          <button onClick={handleLogin}>Login with Discord</button>
        )}
      </Route>
      <Route path="/callback">
        <p>Redirecting...</p>
      </Route>
      <Route path="/dashboard">
        {isAuthenticated ? (
          <div>
            <h1>Welcome to the Dashboard!</h1>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Redirect to="/" />
        )}
      </Route>
    </Router>
  );
}

export default App;

import React, { createContext, useState } from "react";
import { authAPI } from "../services/endpoints";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [CustomerData, setCustomerData] = useState(null);
  const [isAccountCreated, setIsAccountCreated] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const getCustomerData = async () => {
    try {
      const { data } = await authAPI.getProfile();
      if (data.success) {
        setCustomerData(data.data);
        setIsLoggedIn(true);
      } else {
        setCustomerData(null);
        setIsLoggedIn(false);
      }
    } catch (err) {
      console.error("User fetch failed:", err);
      setCustomerData(null);
      setIsLoggedIn(false);
    }
  };

  // NOTE: no mount-time profile fetch here on purpose — AuthContext
  // already hydrates the user on startup. Fetching here too would fire
  // a duplicate GET /auth/profile on every app load. Callers that need
  // a refresh can use getCustomerData() explicitly.

  return (
    <AppContext.Provider
      value={{
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        CustomerData,
        getCustomerData,
        isAccountCreated,
        setIsAccountCreated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;

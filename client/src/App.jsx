import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

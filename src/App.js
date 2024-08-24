import React, { useContext, useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home/Home_Page";
import OperaForm from "./pages/Forms/Opera_Form/Opera_Form";
import FlForm from "./pages/Forms/FL_Form/Fl_Form";
import BayanForm from "./pages/Forms/Bayan_Form/Bayan_Form";
import MicrosForm from "./pages/Forms/Micros_Form/Micros_Form"
import SunMffForm from "./pages/Forms/Sun_Mff_Form/Sun_Mff_Form";
import EmailForm from "./pages/Forms/Email_Form/Email_Form";
import MicrosChangeForm from "./pages/Forms/Micros_Change_Form/Micros_Change_Form";
import UserForm from "./pages/Forms/User_Form/User_Form";
import Login from "./pages/Login/Login_Page";
import Requests from "./pages/Requests/Requests";
import EmployeesPage from "./pages/EmployeesList/Employees_Page";
import UsersPage from "./pages/Users/Users_Page";
import ResetPage from "./pages/Reset Page/Reset_Page";
import { AuthContext } from "./context/AuthContext";
import { Container, Typography } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import MicrosList from "./pages/MicrosList/Micros_List";
import KeysList from "./pages/KeysList/Key_List";
import MasterKeyForm from "./pages/Forms/Master_Key_From/Master_Key_Form";

const NotFound = () => {
  return (
    <Container>
      <Typography variant="h2" align="center" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="h5" align="center" paragraph>
        The page you are looking for might have been removed or doesn't exist.
      </Typography>
    </Container>
  );
};

const NotAllowed = () => {
  return (
    <Container>
      <Typography variant="h2" align="center" gutterBottom>
        Unfortionatly! You do not have permission
      </Typography>
      <Typography variant="h5" align="center" paragraph>
        The page you are looking for is not allowed.
      </Typography>
    </Container>
  );
};

const App = () => {
  const [userRole, setUserRole] = useState("");

  const { currentUser } = useContext(AuthContext);

  const fetchUserRole = async (id) => {
    try {
      const docRef = doc(db, "users", id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const { role } = docSnapshot.data();
        setUserRole(role);
      } else {
        console.log("Document not found");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      fetchUserRole(currentUser.uid);
    }
  }, [currentUser]);  
  
  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      >
        <Route path="/employeesList" element={userRole === "Manager" ? <NotAllowed/> : <EmployeesPage />} />
        <Route path="/microsList" element={userRole === "Manager" ? <NotAllowed/> : <MicrosList />} />
        <Route path="/keysList" element={userRole === "Manager" ? <NotAllowed/> : <KeysList />} />
        <Route path="/usersList" element={userRole === "Manager" || userRole === "Requester" ? <NotAllowed/> : <UsersPage />} />

        {/* Forms */}
        <Route path="/operaForm" element={userRole === "Manager" ? <NotAllowed/> : <OperaForm />} />
        <Route path="/flForm" element={userRole === "Manager" ? <NotAllowed/> : <FlForm />} />
        <Route path="/userForm" element={userRole === "Manager" || userRole === "Requester" ? <NotAllowed/> : <UserForm />} />
        <Route path="/bayanForm" element={userRole === "Manager" ? <NotAllowed/> : <BayanForm />} />
        <Route path="/sunMffForm" element={userRole === "Manager" ? <NotAllowed/> : <SunMffForm />} />
        <Route path="/emailForm" element={userRole === "Manager" ? <NotAllowed/> : <EmailForm />} />
        <Route path="/microsForm" element={userRole === "Manager" ? <NotAllowed/> : <MicrosForm />} />
        <Route path="/microschangeForm" element={userRole === "Manager" ? <NotAllowed/> : <MicrosChangeForm />} />
        <Route path="/masterKeyForm" element={userRole === "Manager" ? <NotAllowed/> : <MasterKeyForm />} />

        <Route path="/requests" element={<Requests />} />

        {/* 404 Error page */}
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/reset" element={<ResetPage />} />
    </Routes>
  );
};

export default App;

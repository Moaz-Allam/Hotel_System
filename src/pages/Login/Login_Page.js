import React, { useState, useContext } from "react";
import {
  Alert,
  AlertTitle,
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Container,
  Typography,
  Stack,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import HotelLogo from "../../assets/hotelLogo.jpg";
import { signInWithEmailAndPassword } from "firebase/auth";
import { AuthContext } from "../../context/AuthContext";
import { auth, db } from "../../firebase";
import { getDoc, doc, query, collection, where, getDocs } from "firebase/firestore";

const defaultTheme = createTheme();

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { dispatch } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Fetch IT Members data
        const itMembersQuery = query(
          collection(db, "users"),
          where("role", "==", "IT Member")
        );
        const itMembersSnapshot = await getDocs(itMembersQuery);

        const itMembersData = itMembersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            fullName: `${data.firstName} ${data.lastName}`,
            hotel: data.hotel,
          };
        });

        // Combine auth user and Firestore user data
        const fullUserData = {
          uid: user.uid,
          email: user.email,
          ...userData,
          itMembers: itMembersData, // Add IT members data here
        };

        // Dispatch the user data to the AuthContext
        dispatch({ type: "LOGIN", payload: fullUserData });

        // Navigate based on user role
        if (userData.role === "Manager") {
          navigate("/requests");
        } else {
          navigate("/employeesList");
        }
      } else {
        console.error("No such document!");
      }
    } catch (err) {
      setIsError(true);
      setError(err.message);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 7,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "#cc0832" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ color: "#cc0832" }}>
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleLogin}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => setEmail(e.target.value)}
              sx={{ color: "#cc0832" }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              sx={{ color: "#cc0832" }}
            />
            <Stack direction="row">
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
                sx={{ color: "#cc0832" }}
              />
              <Box flexGrow={1}></Box>
              <Button
                onClick={() => navigate("/reset")}
                variant="text"
                sx={{ color: "#cc0832" }}
              >
                Forget password
              </Button>
            </Stack>
            {isError && (
              <Alert severity="error" sx={{ color: "#cc0832" }}>
                <AlertTitle>Error</AlertTitle>
                their is an error: {error}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: "#cc0832" }}
            >
              Sign In
            </Button>
            <img src={HotelLogo} alt="Background" />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Login;

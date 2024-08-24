import React, { useState } from "react";
import {
  Alert,
  AlertTitle,
  Avatar,
  Button,
  CssBaseline,
  TextField,
  Box,
  Container,
  Typography,
  Snackbar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

const defaultTheme = createTheme();

const ResetPage = () => {
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async () => {
    console.log("Email to be reset:", email);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      console.log("Email sent!");
      setError(null);
      setIsError(false);
    } catch (err) {
      setIsError(true);
      setError(err.message);
      setResetSent(false);
    }
  };

  const handleClose = () => {
    setResetSent(false);
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Reset Password
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
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
            />
            {isError && (
              <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                their is an error: {error}
              </Alert>
            )}
            <Snackbar
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              open={resetSent}
              autoHideDuration={3000}
              onClose={handleClose}
            >
              <Alert
                onClose={handleClose}
                severity="info"
                sx={{ width: "100%" }}
              >
                Email sent successfully
              </Alert>
            </Snackbar>
            <Button
              onClick={handleResetPassword}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Send Reset link
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ResetPage;

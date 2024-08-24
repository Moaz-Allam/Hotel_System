import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  Alert,
  Button,
  CircularProgress,
  MenuItem,
  Snackbar,
  Grid,
  TextField,
  Backdrop,
  AlertTitle,
  Stack,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { auth, db } from "../../../firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Header from "../../../components/Header";
import { hotels, positions, textFields, roles, departments } from "./data";
import Tabuk from "../../../assets/tabuk.png";
import Gizan from "../../../assets/gizan.png";
import Hail from "../../../assets/hail.png";

const UserForm = () => {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedHotel, setSelectedHotel] = useState("");
  const [selectedHotelImage, setSelectedHotelImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const [position, setPosition] = useState("");
  const [otherPosition, setOtherPosition] = useState("");
  const [rolesList, setRolesList] = useState(roles);

  const [showOtherPosition, setShowOtherPosition] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleClick = () => {
    setOpen(true);
  };

  const setNewPosition = (event) => {
    const selectedValue = event.target.value;
    setPosition(selectedValue);
    setShowOtherPosition(selectedValue === "Others");
  }

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const { email, password, ...userData } = formData;

      // Create user with email and password
      const res = await createUserWithEmailAndPassword(auth, email, password, {
        forceSignIn: false,
      });

      // Store user data in Firestore, including selected role
      await setDoc(doc(db, "users", res.user.uid), {
        email,
        ...userData,
        hotel: selectedHotel,
        role: selectedRole,
        position: showOtherPosition ? otherPosition : position,
        department: selectedDepartment,
        timestamp: serverTimestamp(),
        status: "Active",
      });

      handleClick();

      setIsError(false);
      setSelectedDepartment("");
      setSelectedRole("");
      setSelectedHotel("");
      setShowOtherPosition(false);
      setPosition("");
      setError("");
      // Clear form fields after submission
      Object.keys(formData).forEach((field) => {
        setValue(field, "");
      });
    } catch (err) {
      setIsError(true);
      setError(err.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    if (selectedDepartment === "IT") {
      const updatedRoles = [
        {
          value: "Requester",
          label: "Requester",
        },
        {
          value: "Manager",
          label: "Manager",
        },
        {
          value: "IT admin",
          label: "IT admin",
        },
        {
          value: "IT Member",
          label: "IT Member",
        },
      ];

      setRolesList(updatedRoles);
    } else {
      setRolesList(roles);
    }

    switch (selectedHotel) {
      case "Grand Millennium Tabuk":
        setSelectedHotelImage(Tabuk);
        break;
      case "Grand Millennium Gizan":
        setSelectedHotelImage(Gizan);
        break;
      case "Millennium Hail":
        setSelectedHotelImage(Hail);
        break;
      default:
        setSelectedHotelImage("");
    }
  }, [selectedDepartment, selectedHotel]);

  return (
    <Box>
      <Stack direction="row">
        <Header title="CREATE USER" subTitle="Create a New User Profile" />
        <Box flexGrow={1} />
        {selectedHotelImage && (
          <img
            src={selectedHotelImage}
            alt="Background"
            style={{ width: "120px", marginBottom: "20px" }}
          />
        )}
      </Stack>

      <Box
        onSubmit={handleSubmit(onSubmit)}
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          variant="filled"
          id="hotels"
          select
          label="Hotel"
          value={selectedHotel}
          onChange={(event) => setSelectedHotel(event.target.value)}
        >
          {hotels.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <Grid container rowSpacing={3} columnSpacing={{ xs: 2, sm: 2, md: 2 }}>
          {textFields.map((field) => (
            <Grid item xs={12} sm={6} key={field.name}>
              <TextField
                {...register(field.name, { required: true, minLength: 3 })}
                error={Boolean(errors[field.errorKey])}
                helperText={
                  Boolean(errors[field.errorKey]) ? field.helperText : null
                }
                label={field.label}
                variant="filled"
                fullWidth
                type={field.type || "text"}
              />
            </Grid>
          ))}
        </Grid>

        <TextField
          variant="filled"
          id="position"
          select
          label="Position"
          value={position}
          onChange={setNewPosition}
        >
          {positions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {showOtherPosition && (
        <TextField
          variant="filled"
          label="Other Position"
          value={otherPosition}
          onChange={(event) => setOtherPosition(event.target.value)}
        />
      )}

        <TextField
          variant="filled"
          id="department"
          select
          label="Deprtment"
          value={selectedDepartment}
          onChange={(event) => setSelectedDepartment(event.target.value)}
        >
          {departments.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          variant="filled"
          id="role"
          select
          label="Role"
          value={selectedRole} // Set the selected value
          onChange={(event) => setSelectedRole(event.target.value)} // Update selected role
        >
          {rolesList.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {isError && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            their is an error: {error}
          </Alert>
        )}

        <Box sx={{ textAlign: "left" }}>
          <Button
            type="submit"
            sx={{ textTransform: "capitalize" }}
            variant="contained"
          >
            Create New User
          </Button>

          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
          >
            <Alert onClose={handleClose} severity="info" sx={{ width: "100%" }}>
              Account created successfully
            </Alert>
          </Snackbar>
        </Box>
      </Box>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default UserForm;

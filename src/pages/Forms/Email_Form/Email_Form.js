import React, { useEffect, useState, useContext } from "react";
import Box from "@mui/material/Box";
import {
  Alert,
  AlertTitle,
  Button,
  MenuItem,
  Snackbar,
  Stack,
  Autocomplete,
  TextField,
  Chip,
  Grid,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import Header from "../../../components/Header";
import { departments, hotels, textFields } from "./data";
import { db } from "../../../firebase";
import { serverTimestamp, addDoc, getDoc, doc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from "../../../context/AuthContext";
import AddIcon from "@mui/icons-material/Add";
import Tabuk from "../../../assets/tabuk.png";
import Gizan from "../../../assets/gizan.png";
import Hail from "../../../assets/hail.png";
import emailjs from "emailjs-com";

const EmailForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [open, setOpen] = React.useState(false);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [selectedHotelImage, setSelectedHotelImage] = useState(null);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [managerPositions, setManagerPositions] = useState();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const handleDescriptionChange = (index, value) => {
    setTableRows((prevRows) =>
      prevRows.map((row, i) =>
        i === index ? { ...row, description: value } : row
      )
    );
  };

  const handleRemarksChange = (index, value) => {
    setTableRows((prevRows) =>
      prevRows.map((row, i) => (i === index ? { ...row, remarks: value } : row))
    );
  };

  // fetch managers
  const fetchManagers = async (department, position, hotel) => {
    try {
      const hotelQuery = query(
        collection(db, "users"),
        where("hotel", "==", hotel),
        where("position", "in", position)
      );
      const managerQuery = query(
        collection(db, "users"),
        where("role", "==", "Manager"),
        where("department", "==", department)
      );

      Promise.all([getDocs(hotelQuery), getDocs(managerQuery)]).then(
        (results) => {
          const hotelDocs = results[0];
          const managerDocs = results[1];

          const hotelNames = hotelDocs.docs.map(
            (doc) => `${doc.data().firstName} ${doc.data().lastName}`
          );

          const managerNames = managerDocs.docs.map(
            (doc) => `${doc.data().firstName} ${doc.data().lastName}`
          );

          const combinedNames = [...hotelNames, ...managerNames];
          setManagers(combinedNames);
        }
      );
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    setOpen(true);
  };

  const sendEmailToAdmin = async () => {
    const templateParams = {
      creator_name: `${currentUser.firstName} ${currentUser.lastName}`,
      form_name: "Email Form",
      managers: selectedManagers,
    };

    try {
      const response = await emailjs.send(
        "service_71hathl",
        "template_cktoj4s",
        templateParams,
        "rpJ_jNHsIq4mQScE1"
      );

      console.log("Email sent:", response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const sendEmailToManagers = async (selectedManagers) => {
    for (const manager of selectedManagers) {
      try {
        const q = query(
          collection(db, "users"),
          where("firstName", "==", manager.split(" ")[0])
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();

          const templateParams = {
            to_name: manager,
            to_email: userData.email,
            creator_name: `${currentUser.firstName} ${currentUser.lastName}`,
            form_name: "Email Form",
          };

          const response = await emailjs.send(
            "service_71hathl",
            "template_7la3uz6",
            templateParams,
            "rpJ_jNHsIq4mQScE1"
          );

          console.log(`Email sent to ${manager}:`, response);
        } else {
          console.error(`No user found with the name ${manager}`);
        }
      } catch (error) {
        console.error(`Error sending email to ${manager}:`, error);
      }
    }
  };

  const NotifyITMember = async (employeeData) => {
    try {
      // Ensure selectedHotel and currentUser.itMembers are defined
      if (!selectedHotel || !currentUser.itMembers) {
        throw new Error(
          "selectedHotel or currentUser.itMembers is not defined."
        );
      }

      // Find the IT Member with a matching hotel
      const itMember = currentUser.itMembers.find(
        (member) => member.hotel === selectedHotel
      );

      if (!itMember) {
        console.error("No IT Member found for the selected hotel.");
        return;
      }

      // Get the full name of the IT Member
      const fullName = itMember.fullName;

      // Create a new document in the ItRequests collection
      const docRef = await addDoc(collection(db, "ItRequests"), {
        ...employeeData,
        form: "Email",
        createdAt: serverTimestamp(),
        recievedBy: fullName,
        status: "New",
        preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
        requestID: docRef.id,
      });

      console.log("Document created with ID:", docRef.id);
    } catch (error) {
      console.error("Error creating IT request document:", error);
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const { ...employeeData } = formData;

      // Store user data in Firestore
      const docRef = await addDoc(collection(db, "employees"), {
        ...employeeData,
        hotel: selectedHotel,
        department: selectedDepartment,
        table: tableRows,
        managers: selectedManagers,
        preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
        status: "pending",
        createdAt: serverTimestamp(),
        form: "Email",
      });

      for (const manager of selectedManagers) {
        await addDoc(collection(db, "requests"), {
          ...employeeData,
          form: "Email",
          createdAt: serverTimestamp(),
          recievedBy: manager,
          status: "New",
          preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
          requestID: docRef.id,
        });
      }

      await sendEmailToAdmin();
      await sendEmailToManagers(selectedManagers);

      await NotifyITMember(employeeData);

      handleClick();
      setIsError(false);
      setError("");
      setSelectedHotel("");
      setSelectedDepartment("");
      setSelectedManagers([]);
      setTableRows([]);

      // Clear form fields after submission
      Object.keys(formData).forEach((field) => {
        setValue(field, "");
      });
    } catch (err) {
      setIsError(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHotel) {
      switch (selectedHotel) {
        case "Grand Millennium Tabuk":
          setSelectedHotelImage(Tabuk);
          setManagerPositions(["CDOF", "CGM"]);
          break;
        case "Grand Millennium Gizan":
          setSelectedHotelImage(Gizan);
          setManagerPositions(["FM", "HOM"]);
          break;
        case "Millennium Hail":
          setSelectedHotelImage(Hail);
          setManagerPositions(["FM", "HOM"]);
          break;
        default:
          setSelectedHotelImage("");
          setManagerPositions([]);
      }
    } else {
      setSelectedHotelImage("");
      setManagerPositions([]);
    }
  }, [selectedHotel]);

  useEffect(() => {
    if (selectedHotel && managerPositions.length > 0) {
      fetchManagers(selectedDepartment, managerPositions, selectedHotel);
    } else {
      setManagers([]); // Clear managers if no hotel or positions are selected
    }
  }, [selectedHotel, managerPositions, selectedDepartment]);

  return (
    <Box>
      <Stack direction="row">
        <Header
          title="Email Account Request Form"
          subTitle="Submit a New Request to the system"
        />
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
          {currentUser.role === "Requester" ? (
            <MenuItem key={currentUser.hotel} value={currentUser.hotel}>
              {currentUser.hotel}
            </MenuItem>
          ) : (
            hotels.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))
          )}
        </TextField>

        <Grid container rowSpacing={3} columnSpacing={{ xs: 2, sm: 2, md: 2 }}>
          {textFields.map((field, index) => (
            <Grid key={index} item xs={12} sm={6}>
              <TextField
                {...register(field.name, {
                  required: true,
                  pattern: field.pattern, // Set the pattern here
                })}
                error={Boolean(errors[field.errorKey])}
                helperText={
                  Boolean(errors[field.errorKey])
                    ? "This field is required!"
                    : null
                }
                label={field.label}
                variant="filled"
                type={field.type || "text"}
                fullWidth
              />
            </Grid>
          ))}
        </Grid>

        <TextField
          variant="filled"
          id="department"
          select
          label="Department"
          value={selectedDepartment}
          onChange={(event) => setSelectedDepartment(event.target.value)}
        >
          {departments.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        {/* TableField Component */}
        <Box sx={{ marginTop: 2, marginBottom: 2 }}>
          <Button
            color="primary"
            startIcon={<AddIcon />}
            onClick={() =>
              setTableRows((prevRows) => [
                ...prevRows,
                { id: tableRows.length, description: "", remarks: "" },
              ])
            }
          >
            Add Row
          </Button>
          {tableRows.map((row, index) => (
            <Grid key={row.id} container rowSpacing={2} columnSpacing={2}>
              <Grid item xs={6} sx={{ marginBottom: "10px" }}>
                <TextField
                  label="Description"
                  variant="filled"
                  fullWidth
                  value={row.description}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={6} sx={{ marginBottom: "10px" }}>
                <TextField
                  label="Remarks"
                  variant="filled"
                  fullWidth
                  value={row.remarks}
                  onChange={(e) => handleRemarksChange(index, e.target.value)}
                />
              </Grid>
            </Grid>
          ))}
        </Box>
        {/* End of TableField Component */}

        <Autocomplete
          multiple
          id="tags-filled-2"
          disabled={managers.length === 0}
          options={managers.map((option) => option)}
          value={selectedManagers}
          onChange={(event, newValue) => setSelectedManagers(newValue)} // Update the selected managers array
          freeSolo
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} variant="filled" label="Manager" />
          )}
        />

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
            Submit request
          </Button>

          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            open={open}
            autoHideDuration={3000}
            onClose={handleClose}
          >
            <Alert onClose={handleClose} severity="info" sx={{ width: "100%" }}>
              Form created successfully
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

export default EmailForm;

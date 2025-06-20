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
import { databases, departments, hotels, textFields, data } from "./data";
import { db } from "../../../firebase";
import { serverTimestamp, addDoc, updateDoc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from "../../../context/AuthContext";
import emailjs from "emailjs-com";
import Tabuk from "../../../assets/tabuk.png";
import Gizan from "../../../assets/gizan.png";
import Hail from "../../../assets/hail.png";

const OperaForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [open, setOpen] = useState(false);
  const [selectedDb, setSelectedDb] = useState("");
  const [selectedHotel, setSelectedHotel] = useState("");
  const [selectedHotelImage, setSelectedHotelImage] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedFruit, setSelectedFruit] = useState("");
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [selectedCheckbooks, setSelectedCheckbooks] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [managerPositions, setManagerPositions] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);

  const { currentUser } = useContext(AuthContext);

  const [managers, setManagers] = useState([]);

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

  const handleFruitChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedFruit(selectedValue);

    const selectedFruitData = data.find((item) => item.label === selectedValue);
    if (selectedFruitData) {
      setAutocompleteOptions(selectedFruitData.checkbooks);
    } else {
      setAutocompleteOptions([]);
    }

    // Clear selected checkbooks when changing the fruit
    setSelectedCheckbooks([]);
  };

  const handleAutocompleteChange = (event, newValue) => {
    setSelectedCheckbooks(newValue);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleClick = () => {
    setOpen(true);
  };

  const sendEmailToAdmin = async () => {
    const templateParams = {
      creator_name: `${currentUser.firstName} ${currentUser.lastName}`,
      form_name: "Opera Form",
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
            form_name: "Opera Form",
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

  const NotifyITMember = async (employeeData, requestID) => {
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
        form: "Opera",
        database: selectedDb,
        authorization: selectedFruit,
        authorizationOptuins: selectedCheckbooks,
        createdAt: serverTimestamp(),
        recievedBy: fullName,
        status: "New",
        preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
        requestID: requestID,
      });

      await sendEmailToManagers([fullName]);
    } catch (error) {
      console.error("Error creating IT request document:", error);
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const { ...employeeData } = formData;

      // Store user data in Firestore, including selected role
      const docRef = await addDoc(collection(db, "employees"), {
        ...employeeData,
        hotel: selectedHotel,
        database: selectedDb,
        department: selectedDepartment,
        authorization: selectedFruit,
        authorizationOptuins: selectedCheckbooks,
        managers: selectedManagers,
        preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
        status: "pending",
        createdAt: serverTimestamp(),
        form: "Opera",
      });

      for (const manager of selectedManagers) {
        await addDoc(collection(db, "requests"), {
          ...employeeData,
          form: "Opera",
          database: selectedDb,
          authorization: selectedFruit,
          authorizationOptuins: selectedCheckbooks,
          createdAt: serverTimestamp(),
          recievedBy: manager,
          status: "New",
          preparedBy: `${currentUser.firstName} ${currentUser.lastName}`,
          requestID: docRef.id,
        });
      }

      await sendEmailToAdmin();
      await sendEmailToManagers(selectedManagers);

      await NotifyITMember(employeeData, docRef.id);

      handleClick();
      setIsError(false);
      setError("");
      setSelectedDb("");
      setSelectedDepartment("");
      setSelectedHotel("");
      setSelectedFruit(""); // Clear fruit selection
      setSelectedCheckbooks([]); // Clear checkbook selection
      setSelectedManagers([]);

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
          title="Opera Authorization Form"
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

        <TextField
          variant="filled"
          id="databases"
          select
          label="Databases"
          value={selectedDb} // Set the selected value
          onChange={(event) => setSelectedDb(event.target.value)} // Update selected role
        >
          {databases.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>

        <Stack sx={{ gap: 2 }} direction={"row"}>
          <TextField
            variant="filled"
            id="Authorization"
            select
            label="Authorization"
            value={selectedFruit}
            onChange={handleFruitChange}
            sx={{ flex: 1 }}
          >
            {data.map((option) => (
              <MenuItem key={option.label} value={option.label}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            multiple
            id="tags-filled-1"
            options={autocompleteOptions}
            disabled={!selectedFruit}
            value={selectedCheckbooks} // Set the value to the selected checkbooks array
            onChange={handleAutocompleteChange}
            sx={{ flex: 1 }}
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
              <TextField {...params} variant="filled" label="Checkbooks" />
            )}
          />
        </Stack>

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

export default OperaForm;

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
import { hotels, textFields } from "./data";
import { db } from "../../../firebase";
import { serverTimestamp, addDoc, getDoc, doc } from "firebase/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import { AuthContext } from "../../../context/AuthContext";
import emailjs from "emailjs-com";
import Tabuk from "../../../assets/tabuk.png";
import Gizan from "../../../assets/gizan.png";
import Hail from "../../../assets/hail.png";

const MicrosMenuItemUpdateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const [open, setOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState("");
  const [selectedHotelImage, setSelectedHotelImage] = useState(null);
  const [managerPositions, setManagerPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isError, setIsError] = useState(false);
  const [managers, setManagers] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);

  const { currentUser } = useContext(AuthContext);

  const fetchManagers = async (position, hotel) => {
    try {
      const hotelQuery = query(
        collection(db, "users"),
        where("hotel", "==", hotel),
        where("position", "in", position)
      );

      Promise.all([getDocs(hotelQuery)]).then(
        (results) => {
          const hotelDocs = results[0];

          const hotelNames = hotelDocs.docs.map(
            (doc) => `${doc.data().firstName} ${doc.data().lastName}`
          );

          const combinedNames = [...hotelNames,];
          setManagers(combinedNames);
        }
      );
    } catch (error) {
      console.error("Error fetching managers:", error);
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
      fetchManagers(managerPositions, selectedHotel);
    } else {
      setManagers([]); // Clear managers if no hotel or positions are selected
    }
  }, [selectedHotel, managerPositions]);

  // get user name
  const getUserSpecificValue = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const firstName = userData.firstName;
        const lastName = userData.lastName;
        const fullName = `${firstName} ${lastName}`;

        return fullName;
      } else {
        console.log("Document does not exist");
        return null;
      }
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClick = () => {
    setOpen(true);
  };

  const sendEmailToAdmin = async () => {
    const userId = currentUser.uid;
    const preparedBy = await getUserSpecificValue(userId);

    const templateParams = {
      creator_name: preparedBy,
      form_name: "Micros Change Items Form",
      managers: managers,
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
    const userId = currentUser.uid;
    const preparedBy = await getUserSpecificValue(userId);

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
            creator_name: preparedBy,
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

  const onSubmit = async (formData) => {
    setLoading(true);

    try {
      const { ...employeeData } = formData;
      const userId = currentUser.uid;
      const preparedBy = await getUserSpecificValue(userId);

      // Store user data in Firestore
      const docRef = await addDoc(collection(db, "micros_updates"), {
        ...employeeData,
        hotel: selectedHotel,
        managers: selectedManagers,
        preparedBy: preparedBy,
        status: "pending",
        createdAt: serverTimestamp(),
        form: "Micros Change Items",
      });

      for (const manager of selectedManagers) {
        await addDoc(collection(db, "requests"), {
          ...employeeData,
          form: "Micros Change Items",
          createdAt: serverTimestamp(),
          recievedBy: manager,
          status: "New",
          preparedBy: preparedBy,
          requestID: docRef.id,
        });
      }

      await sendEmailToAdmin();

      await sendEmailToManagers(selectedManagers);

      handleClick();
      setIsError(false);
      setError("");
      setSelectedHotel("");

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

  return (
    <Box>
      <Stack direction="row">
        <Header
          title="Micros Change Items Form"
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
                  type: field.type || "text",
                })}
                error={Boolean(errors[field.errorKey])}
                helperText={
                  Boolean(errors[field.errorKey])
                    ? "This field is required!"
                    : null
                }
                label={field.label}
                variant="filled"
                fullWidth
              />
            </Grid>
          ))}
        </Grid>

        <Autocomplete
          multiple
          id="printers"
          options={[
            "Main Kitchen Printer",
            "Cold Kitchen Printer",
            "Pastry Kitchen Printer",
          ]}
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
            <TextField {...params} variant="filled" label="Printer" />
          )}
        />

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
            There is an error: {error}
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
              Request submitted successfully
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

export default MicrosMenuItemUpdateForm;

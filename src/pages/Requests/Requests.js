import React, { useEffect, useState, useCallback, useContext } from "react";
import Header from "../../components/Header";
import { Box, Tab } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import RequestCard from "../../components/RequestCard";
import { db } from "../../firebase";
import {
  Stack,
  Backdrop,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import {
  getDoc,
  serverTimestamp,
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import emailjs from "emailjs-com";

function Requests() {
  const [value, setValue] = useState("1");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasNewRequests, setHasNewRequests] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [hasRequests, setHasRequests] = useState(false);
  const [allRequests, setAllRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const { currentUser } = useContext(AuthContext);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetchRequests = useCallback(async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Queries to fetch new and all requests
      const qNew = query(
        collection(db, "requests"),
        where(
          "recievedBy",
          "==",
          `${currentUser.firstName} ${currentUser.lastName}`
        ),
        where("status", "==", "New")
      );

      const qAll = query(
        collection(db, "requests"),
        where(
          "recievedBy",
          "==",
          `${currentUser.firstName} ${currentUser.lastName}`
        ),
        where("status", "in", ["Accepted", "Rejected"])
      );

      // Fetch data from Firestore
      const querySnapshotNew = await getDocs(qNew);
      const querySnapshotAll = await getDocs(qAll);

      // Process new requests
      const pendingRequestsData = [];
      querySnapshotNew.forEach((doc) => {
        const request = { id: doc.id, ...doc.data() };
        pendingRequestsData.push(request);
      });

      // Process all requests
      const allRequestsData = [];
      querySnapshotAll.forEach((doc) => {
        const request = { id: doc.id, ...doc.data() };
        allRequestsData.push(request);
      });

      // Update state
      setPendingRequests(pendingRequestsData);
      setHasNewRequests(pendingRequestsData.length > 0);
      setAllRequests(allRequestsData);
      setHasRequests(allRequestsData.length > 0);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateStatus = async (requestID, statusValue, formType) => {
    try {
      let collectionName = "";

      // Determine collection based on form type
      switch (formType) {
        case "Micros Change Items":
          collectionName = "micros_updates";
          break;
        case "Master Key":
          collectionName = "master_keys";
          break;
        default:
          collectionName = "employees";
      }

      // Query the requests collection
      const q = query(
        collection(db, "requests"),
        where("requestID", "==", requestID)
      );
      const querySnapshot = await getDocs(q);

      const allAccepted = querySnapshot.docs.every(
        (doc) => doc.data().status === "Accepted"
      );

      if (allAccepted) {
        const docRef = doc(db, collectionName, requestID);
        await updateDoc(docRef, { status: statusValue });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const sendEmailToAdmin = async (requestID, statusValue, formType) => {
    try {
      const requestRef = doc(db, "requests", requestID);
      const requestDoc = await getDoc(requestRef);

      if (requestDoc.exists()) {
        const { form, preparedBy } = requestDoc.data();
        let collectionName;

        // Determine the collection name based on the form field
        switch (formType) {
          case "Micros Change Items":
            collectionName = "micros_updates";
            break;
          case "Master Key":
            collectionName = "master_keys";
            break;
          default:
            collectionName = "employees";
            break;
        }

        const documentRef = doc(db, collectionName, requestID);
        const documentDoc = await getDoc(documentRef);

        if (documentDoc.exists()) {
          const creatorName = preparedBy;

          const templateParams = {
            manager: `${currentUser.firstName} ${currentUser.lastName}`,
            form_name: form,
            status: statusValue,
            creator_name: creatorName,
          };

          const response = await emailjs.send(
            "service_71hathl",
            "template_ni4c8hy",
            templateParams,
            "rpJ_jNHsIq4mQScE1"
          );

          console.log("Email sent to admin:", response);
        } else {
          console.log("Document not found in the corresponding collection");
        }
      } else {
        console.log("Request document not found");
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const handleClick = async (requestId, statusValue, employeeID, formType) => {
    try {
      const requestRef = doc(db, "requests", requestId);
      await updateDoc(requestRef, {
        status: statusValue,
        checkedAt: serverTimestamp(),
      });

      await updateStatus(employeeID, statusValue, formType);

      await sendEmailToAdmin(employeeID, statusValue, formType);

      fetchRequests();
      handleClose();
    } catch (error) {
      console.error("Error accepting request:", error);
      handleClose();
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

  const handleOpenDialog = (request) => {
    setSelectedRequest(request);
    setOpen(true);
  };

  return (
    <Box>
      <Stack direction="row">
        <Header title="REQUESTS" subTitle="List of forms that requested" />
        <IconButton onClick={fetchRequests} aria-label="delete">
          <Refresh />
        </IconButton>
      </Stack>
      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="New Requests" value="1" />
              <Tab label="All Requests" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
            {loading ? (
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={true}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            ) : hasNewRequests ? (
              pendingRequests.map((request, index) => (
                <div key={index} style={{ marginBottom: "16px" }}>
                  <RequestCard
                    formName={request.form}
                    clockNum={request.clockNum}
                    status={request.status}
                    onAccept={() =>
                      handleClick(
                        request.id,
                        "Accepted",
                        request.requestID,
                        request.form
                      )
                    }
                    onDelete={() => handleOpenDialog(request)}
                    name={request.name}
                    date={
                      request.createdAt &&
                      new Date(request.createdAt.toDate()).toLocaleString()
                    }
                    position={request.position}
                    authorization={request.authorization}
                    special={request.special}
                    preparedBy={request.preparedBy}
                    familyGroup={request.familyGroup}
                    itemCode={request.itemCode}
                    majorGroup={request.majorGroup}
                    menuName={request.menuName}
                    outlet={request.outlet}
                    price={request.price}
                    department={request.department}
                    id={request.keyID}
                    keySerial={request.keySerial}
                    keyType={request.keyType}
                  />
                </div>
              ))
            ) : (
              <p>No new requests.</p>
            )}
          </TabPanel>
          <TabPanel value="2">
            {loading ? (
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={true}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            ) : hasRequests ? (
              allRequests.map((request, index) => (
                <div key={index} style={{ marginBottom: "16px" }}>
                  <RequestCard
                    formName={request.form}
                    clockNum={request.clockNum}
                    status={request.status}
                    onAccept={() =>
                      handleClick(
                        request.id,
                        "Accepted",
                        request.requestID,
                        request.form
                      )
                    }
                    onDelete={() => handleOpenDialog(request)}
                    name={request.name}
                    date={
                      request.createdAt &&
                      new Date(request.createdAt.toDate()).toLocaleString()
                    }
                    position={request.position}
                    authorization={request.authorization}
                    special={request.special}
                    preparedBy={request.preparedBy}
                    familyGroup={request.familyGroup}
                    itemCode={request.itemCode}
                    majorGroup={request.majorGroup}
                    menuName={request.menuName}
                    outlet={request.outlet}
                    price={request.price}
                  />
                </div>
              ))
            ) : (
              <p>No requests.</p>
            )}
          </TabPanel>
        </TabContext>
      </Box>

      {selectedRequest && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Reason for rejection</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To reject this form, please enter your reason here. We will send
              it to the IT admin.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Reason for rejection"
              type="text"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={() =>
                handleClick(
                  selectedRequest.id,
                  "Rejected",
                  selectedRequest.requestID
                )
              }
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default Requests;

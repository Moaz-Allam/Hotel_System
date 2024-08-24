import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
  Button,
  Backdrop,
  Dialog,
  Typography,
  TextField,
  Divider,
  Grid,
} from "@mui/material";
import Header from "../../components/Header";
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Stack } from "@mui/system";
import DownloadIcon from "@mui/icons-material/Download";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";
import { AuthContext } from "../../context/AuthContext";
import HotelLogo from "../../assets/hotelLogo.jpg";
import Tabuk from "../../assets/tabuk.png";
import Gizan from "../../assets/gizan.png";
import Hail from "../../assets/hail.png";

function EmployeesPage() {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [itMembers, setItMembers] = useState([]);
  const [data, setData] = useState({});
  const [hotel, sethotel] = useState("");
  const [FormName, setFormName] = useState("");

  const fieldConfig = {
    hotel: "Hotel",
    clockNum: "Clock Number",
    name: "Name",
    department: "Department",
    position: "Title",
    database: "Database",
    special: "Special",
    authorization: "Authorization",
    authorizationOptuins: "Authorization Optuins",
    form: "Form",
    status: "Status",
  };

  const modalRef = useRef(null);

  const { currentUser } = useContext(AuthContext);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    const modalContent = modalRef.current;
    console.log("Modal Content:", modalContent); // Debugging line
    try {
      const opt = {
        margin: 10,
        filename: `Employee_Details_${
          managers.length > 0 ? managers[0].employeeName : "N/A"
        }.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      const worker = html2pdf().from(modalContent).set(opt);
      await worker.save();
    } catch (error) {
      console.error("Error while generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleView = async (id) => {
    setDialogOpen(true);

    try {
      // displaying employee data
      const docRef = doc(db, "employees", id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        setData(docSnapshot.data());
        const employeeHotel = docSnapshot.data().hotel;
        const employeeFormName = docSnapshot.data().form;
        sethotel(employeeHotel);
        setFormName(employeeFormName);
      } else {
        console.log("Document not found");
      }

      // displaying the managers and dates
      const requestsRef = collection(db, "requests");

      // Create a query to find documents with the specified requestID
      const q = query(requestsRef, where("requestID", "==", id));

      const querySnapshot = await getDocs(q);

      const managersArray = [];

      // Loop through the query results and extract the desired fields
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        managersArray.push({
          name: data.recievedBy,
          position: data.managerPosition,
          employeeName: data.name,
          checkedAt: data.checkedAt,
          createdAt: data.createdAt,
          preparedBy: data.preparedBy,
        });
      });

      // displaying the managers and dates
      const itRequestsRef = collection(db, "ItRequests");

      // Create a query to find documents with the specified requestID
      const itQ = query(itRequestsRef, where("requestID", "==", id));

      const itQuerySnapshot = await getDocs(itQ);

      const itMembersArray = [];

      // Loop through the query results and extract the desired fields
      itQuerySnapshot.forEach((doc) => {
        const data = doc.data();
        itMembersArray.push({
          name: data.recievedBy,
          comment: data.comment,
          checkedAt: data.checkedAt,
          createdAt: data.createdAt,
        });
      });

      setManagers(managersArray);
      setItMembers(itMembersArray);
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "employees", id));
      console.log(`Document with ID ${id} deleted successfully.`);

      const requestsRef = collection(db, "requests");

      // Create a query to find documents with the specified requestId
      const q = query(requestsRef, where("requestID", "==", id));

      const querySnapshot = await getDocs(q);

      // Loop through the query results and delete each document
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
        console.log("Document deleted with ID: ", doc.id);
      });

      console.log("Documents with requestId", id, "deleted successfully");

      // Update the employeeData array to remove the deleted row
      setEmployeeData((prevData) => prevData.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const getTimeDifference = (startDate, endDate) => {
    const diffMs = endDate - startDate; // Difference in milliseconds
    const diffMinutes = Math.floor(diffMs / (1000 * 60)); // Difference in minutes
    const hours = Math.abs(Math.floor(diffMinutes / 60));
    const minutes = Math.abs(diffMinutes % 60);
    return `${hours}h, ${minutes}min`;
  };

  const dialogContent = (
    <div>
      <div ref={modalRef}>
        <Stack direction="row" alignItems="center" sx={{ p: 2 }}>
          <Box>
            <Typography
              sx={{
                fontWeight: "bold",
              }}
              variant="h5"
            >
              {FormName} Form
            </Typography>
            <Typography variant="body1">
              Created at:{" "}
              {managers.length > 0
                ? format(managers[0].createdAt.toDate(), "dd/MM/yyyy HH:mm")
                : "N/A"}
            </Typography>
            <Typography variant="body1">
              Created by: {managers.length > 0 ? managers[0].preparedBy : "N/A"}
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <img
            src={
              hotel === "Grand Millennium Gizan"
                ? Gizan
                : hotel === "Grand Millennium Tabuk"
                ? Tabuk
                : hotel === "Millennium Hail"
                ? Hail
                : HotelLogo
            }
            alt="Logo"
            width="150px"
            loading="lazy"
          />
        </Stack>
        <Divider />

        <Grid container spacing={2} sx={{ p: 2 }}>
          {Object.keys(fieldConfig)
            .filter((key) => data[key] !== undefined) // Filter out keys that do not exist in data
            .map((key, index) => (
              <Grid item xs={6} key={index}>
                <TextField
                  label={fieldConfig[key]} // Use the custom label from the fieldConfig
                  value={data[key]}
                  InputProps={{
                    readOnly: true,
                  }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            ))}
        </Grid>

        <Divider />
        <Stack sx={{ p: 2 }} direction="row">
          {managers.map((item, index) => (
            <Box flex={1} key={index}>
              <Typography>Approved by:</Typography>
              <Typography>{item.name}</Typography>
              <Typography>({item.position})</Typography>
              <Typography>
                At: {format(item.checkedAt.toDate(), "dd/MM/yyyy HH:mm")}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Divider />
        <Stack sx={{ p: 2 }} direction="row">
          {itMembers.map((item, index) => (
            <Box flex={1} key={index}>
              <Typography>{item.comment} by: </Typography>
              <Typography>{item.name}</Typography>
              <Typography>
                At: {format(item.checkedAt.toDate(), "dd/MM/yyyy HH:mm")}
              </Typography>
              <Typography>
                Time Taken: {getTimeDifference(item.checkedAt, item.createdAt)}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Typography>Recieved by:</Typography>
          <Typography>Abduallah</Typography> {/* IT Admin name here */}
          <Typography>(IT Admin)</Typography>
          <Typography>At: {format(new Date(), "dd/MM/yyyy HH:mm")}</Typography>
        </Box>
      </div>
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          endIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          disabled={isDownloading}
        >
          {isDownloading ? <CircularProgress size={24} /> : "Download PDF"}
        </Button>
      </Box>
    </div>
  );

  const columns = [
    { field: "clockNum", headerName: "Clock number", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "hotel", headerName: "Hotel", flex: 1 },
    { field: "position", headerName: "Position", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "form", headerName: "Form Name", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      renderCell: (params) => (
        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => handleView(params.row.id)}
            variant="contained"
            disabled={params.row.status === "pending" ? true : false}
          >
            View
          </Button>
          <Button
            onClick={() => handleDelete(params.row.id)}
            variant="outlined"
            disabled={currentUser.role === "IT admin" ? false : true}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    if (!currentUser) return;

    try {
      let q;
      if (currentUser.role === "IT admin" || currentUser.role === "IT Member") {
        q = collection(db, "employees");
      } else {
        q = query(
          collection(db, "employees"),
          where(
            "preparedBy",
            "==",
            `${currentUser.firstName} ${currentUser.lastName}`
          )
        );
      }

      const querySnapshot = await getDocs(q);
      const employeeDataArray = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employeeDataArray.push({
          id: doc.id || "N/A",
          clockNum: data.clockNum || "N/A",
          name: data.name || "N/A",
          hotel: data.hotel || "N/A",
          position: data.position || "N/A",
          department: data.department || "N/A",
          form: data.form || "N/A",
          status: data.status || "N/A",
        });
      });

      setEmployeeData(employeeDataArray);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Box>
      <Header title="FORMS" subTitle="List of IT forms" />

      <Box sx={{ height: "78vh", mx: "auto" }}>
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
        ) : (
          <DataGrid
            slots={{
              toolbar: GridToolbar,
            }}
            rows={employeeData}
            columns={columns}
            components={{
              Toolbar: GridToolbar,
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 25,
                },
              },
            }}
          />
        )}
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        {dialogContent}
      </Dialog>
    </Box>
  );
}

export default EmployeesPage;

import React, { useContext, useEffect, useState } from "react";
import {
  DataGrid,
  GridToolbar
} from "@mui/x-data-grid";
import {
  Box,
  CircularProgress,
  Button,
  Backdrop,
  Stack,
  Snackbar,
  Alert,
  Typography,
  TextField,
  MenuItem
} from "@mui/material";
import Header from "../../components/Header";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import { getDoc } from "firebase/firestore";

function EmployeesPage() {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [open, setOpen] = useState(false);
  const [userRole, setUserRole] = useState("");

  const { currentUser } = useContext(AuthContext);

  const fetchUserRole = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUserRole(userData.role);
      } else {
        console.log("Document does not exist");
      }
    } catch (error) {
      console.error("Error getting user data:", error);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.uid) {
      fetchUserRole(currentUser.uid);
    }
  }, [currentUser]);

  const columns = [
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "hotel", headerName: "Hotel", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "position", headerName: "Position", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      renderCell: (params) => (
        <Stack direction="row" spacing={2}>
          <Button
            onClick={() => params.row.status === "Active" ?handleDeActivate(params.row.id) : handleActivate(params.row.id)}
            variant="contained"
            disabled={userRole === "IT Member"}
          >
            {params.row.status === "Active" ? "De-Activate" : "Activate"}
          </Button>
          <Button
            onClick={() => handleDelete(params.row.id)}
            variant="outlined"
            disabled={userRole === "IT Member"}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  const fetchData = async () => {
    try {
      const q = query(collection(db, "users"));
      const querySnapshot = await getDocs(q);

      const usersDataArray = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersDataArray.push({
          id: doc.id,
          firstName: data.firstName,
          lastName: data.lastName,
          hotel: data.hotel,
          email: data.email,
          position: data.position,
          role: data.role,
          status: data.status,
        });
      });

      setUsersData(usersDataArray);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const docRef = doc(db, "users", id);
      await deleteDoc(docRef);
      setUsersData((prevData) => prevData.filter((row) => row.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDeActivate = async (id) => {
    try {
      const requestRef = doc(db, "users", id);
      await updateDoc(requestRef, { status: "In-Active" });
      fetchData();
    } catch (error) {
      console.error("Error deactivating document:", error);
    }
  };

  const handleActivate = async (id) => {
    try {
      const requestRef = doc(db, "users", id);
      await updateDoc(requestRef, { status: "Active" });
      fetchData();
    } catch (error) {
      console.error("Error activating document:", error);
    }
  };

  const handleEdit = (row) => {
    setEditingRow(row);
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, "users", editingRow.id);
      await updateDoc(docRef, {
        firstName: editingRow.firstName,
        lastName: editingRow.lastName,
        email: editingRow.email,
        hotel: editingRow.hotel,
        position: editingRow.position,
        role: editingRow.role,
      });

      setEditingRow(null);
      handleOpen();
      fetchData();
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box>
      <Header title="Users" subTitle="List of users for our system" />

      <Box sx={{ height: "78vh", mx: "auto" }}>
        {editingRow ? (
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            noValidate
            autoComplete="off"
          >
            <TextField
              label="First Name"
              value={editingRow.firstName}
              onChange={(e) => setEditingRow({ ...editingRow, firstName: e.target.value })}
            />
            <TextField
              label="Last Name"
              value={editingRow.lastName}
              onChange={(e) => setEditingRow({ ...editingRow, lastName: e.target.value })}
            />
            <TextField
              label="Email"
              value={editingRow.email}
              onChange={(e) => setEditingRow({ ...editingRow, email: e.target.value })}
            />
            <TextField
              label="Hotel"
              value={editingRow.hotel}
              onChange={(e) => setEditingRow({ ...editingRow, hotel: e.target.value })}
              select
            >
              <MenuItem value="Grand Millennium Tabuk">Grand Millennium Tabuk</MenuItem>
              <MenuItem value="Grand Millennium Gizan">Grand Millennium Gizan</MenuItem>
              <MenuItem value="Millennium Hail">Millennium Hail</MenuItem>
            </TextField>
            <TextField
              label="Position"
              value={editingRow.position}
              onChange={(e) => setEditingRow({ ...editingRow, position: e.target.value })}
            />
            <TextField
              label="Role"
              value={editingRow.role}
              onChange={(e) => setEditingRow({ ...editingRow, role: e.target.value })}
              select
            >
              <MenuItem value="Requester">Requester</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
              <MenuItem value="IT admin">IT admin</MenuItem>
              <MenuItem value="IT Member">IT Member</MenuItem>
            </TextField>
            <Stack direction="row" spacing={2}>
              <Button onClick={handleSave} variant="contained">Save</Button>
              <Button onClick={() => setEditingRow(null)} variant="outlined">Cancel</Button>
            </Stack>
          </Box>
        ) : (
          <div>
            {loading ? (
              <Backdrop
                sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={true}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            ) : usersData.length === 0 ? (
              <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                No users
              </Typography>
            ) : (
              <DataGrid
                slots={{ toolbar: GridToolbar }}
                rows={usersData}
                columns={columns}
                disableSelectionOnClick
                onRowDoubleClick={(params) => handleEdit(params.row)}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 25 },
                  },
                }}
              />
            )}
          </div>
        )}
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity="info" sx={{ width: "100%" }}>
            User Data updated successfully!
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default EmployeesPage;

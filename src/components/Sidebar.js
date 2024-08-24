import React, { useState, useContext } from "react";
import {
  List,
  Divider,
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useTheme,
  Typography,
  Tooltip,
  Collapse,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import UsersListIcon from "@mui/icons-material/List";
import KeyListIcon from "@mui/icons-material/Key";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import FoodBankIcon from "@mui/icons-material/FoodBank";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import { useLocation, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { grey } from "@mui/material/colors";
import { AuthContext } from "../context/AuthContext";

const drawerWidth = 240;
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
  // @ts-ignore
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Array1 = [
  {
    text: "Forms List",
    icon: <HomeOutlinedIcon />,
    path: "/employeesList",
  },
  { text: "Micros List", icon: <FoodBankIcon />, path: "/microsList" },
  { text: "Master keys List", icon: <KeyListIcon />, path: "/keysList" },
  { text: "Users List", icon: <UsersListIcon />, path: "/usersList" },
];

const Array2 = [
  { text: "Opera Form", icon: <AddIcon />, path: "/operaForm" },
  { text: "FL Form", icon: <AddIcon />, path: "/flForm" },
  { text: "Bayan Form", icon: <AddIcon />, path: "/bayanForm" },
  { text: "Sun Form", icon: <AddIcon />, path: "/sunMffForm" },
  { text: "Email Request Form", icon: <AddIcon />, path: "/emailForm" },
  { text: "Micros Form", icon: <AddIcon />, path: "/microsForm" },
  {
    text: "Master Key Form",
    icon: <KeyListIcon />,
    path: "/masterKeyForm",
  },
];

const Array3 = [
  {
    text: "Add User",
    icon: <PersonAddAltIcon />,
    path: "/userForm",
  },
  { text: "Requests", icon: <AssignmentIndIcon />, path: "/requests" },
];

const Array5 = [
  {
    text: "Micros Items Change Form",
    icon: <FoodBankIcon />,
    path: "/microschangeForm",
  },
];

const SideBar = ({ open, handleDrawerOpen, handleDrawerClose }) => {
  let location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [openEmployeesForms, setOpenEmployeesForms] = useState(false);
  const [openMicrosForms, setopenMicrosForms] = useState(false);

  const handleClickEmployeesForms = () => {
    setOpenEmployeesForms(!openEmployeesForms);
  };

  const handleClickMicrosForms = () => {
    setopenMicrosForms(!openMicrosForms);
  };

  const { currentUser } = useContext(AuthContext);

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <Box flexGrow={1} />
        {open && (
          <div style={{ padding: 7 }}>
            <Typography
              align="center"
              sx={{ fontSize: 17, transition: "0.25s" }}
            >
              {currentUser.firstName} {currentUser.lastName}
            </Typography>
            <Typography
              align="center"
              sx={{
                fontSize: 15,
                transition: "0.25s",
                color: theme.palette.primary.main,
              }}
            >
              {currentUser.role}
            </Typography>
            <Typography
              align="center"
              sx={{
                fontSize: 12,
                transition: "0.25s",
                color: theme.palette.primary.main,
              }}
            >
              {currentUser.hotel}
            </Typography>
          </div>
        )}
        <Box flexGrow={1} />
      </DrawerHeader>
      <Divider />

      <List>
        {Array1.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? null : item.text} placement="left">
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  bgcolor:
                    location.pathname === item.path
                      ? theme.palette.mode === "dark"
                        ? grey[800]
                        : grey[300]
                      : null,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider />

      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title={open ? null : "Employees Forms"} placement="left">
            <ListItemButton onClick={handleClickEmployeesForms}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                }}
              >
                <AssignmentIcon />
              </ListItemIcon>
              {open ? <ListItemText primary={"Employees Forms"} /> : null}
              {open ? (
                openEmployeesForms ? (
                  <ExpandLess />
                ) : (
                  <ExpandMore />
                )
              ) : null}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <Collapse in={openEmployeesForms} timeout="auto" unmountOnExit>
          <List>
            {Array2.map((item) => (
              <ListItem
                key={item.path}
                disablePadding
                sx={{ display: "block" }}
              >
                <Tooltip title={open ? null : item.text} placement="left">
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      bgcolor:
                        location.pathname === item.path
                          ? theme.palette.mode === "dark"
                            ? grey[800]
                            : grey[300]
                          : null,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>

      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <Tooltip title={open ? null : "Other Forms"} placement="left">
            <ListItemButton onClick={handleClickMicrosForms}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                }}
              >
                <AssignmentIcon />
              </ListItemIcon>
              {open ? <ListItemText primary={"Other Forms"} /> : null}
              {open ? openMicrosForms ? <ExpandLess /> : <ExpandMore /> : null}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        <Collapse in={openMicrosForms} timeout="auto" unmountOnExit>
          <List>
            {Array5.map((item) => (
              <ListItem
                key={item.path}
                disablePadding
                sx={{ display: "block" }}
              >
                <Tooltip title={open ? null : item.text} placement="left">
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      bgcolor:
                        location.pathname === item.path
                          ? theme.palette.mode === "dark"
                            ? grey[800]
                            : grey[300]
                          : null,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>

      <Divider />

      <List>
        {Array3.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
            <Tooltip title={open ? null : item.text} placement="left">
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  bgcolor:
                    location.pathname === item.path
                      ? theme.palette.mode === "dark"
                        ? grey[800]
                        : grey[300]
                      : null,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          position: "absolute",
          bottom: 16,
          right: open ? 16 : -25,
        }}
      >
        <IconButton
          onClick={handleDrawerOpen}
          sx={{ visibility: open ? "hidden" : "visible" }}
        >
          <ChevronRightIcon />
        </IconButton>
        <IconButton
          onClick={handleDrawerClose}
          sx={{ visibility: open ? "visible" : "hidden" }}
        >
          <ChevronLeftIcon />
        </IconButton>
      </Box>
    </Drawer>
  );
};

export default SideBar;

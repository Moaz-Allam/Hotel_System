import * as React from "react";
import {
  useTheme,
  Box,
  IconButton,
  Stack,
  Toolbar,
  styled,
  Menu,
  MenuItem,
  Divider,
  Typography,
  ListItemIcon,
} from "@mui/material";
import {
  Person2Outlined,
  Person2,
  LightModeOutlined,
  DarkModeOutlined,
  NotificationsNoneOutlined,
  LogoutOutlined,
} from "@mui/icons-material";
import MuiAppBar from "@mui/material/AppBar";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
  // @ts-ignore
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const TopBar = ({ open, handleDrawerOpen, setMode }) => {
  const theme = useTheme();

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const { dispatch } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      dispatch({ type: "LOGOUT" });

      // Clear any user-related data from local storage
      localStorage.removeItem("user");

      navigate("/login");
    } catch (error) {
      console.log(error.message);
    }
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" open={open}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          IT Systems Creation Forms
        </Typography>
        <Box flexGrow={1} />
        <Stack direction={"row"}>
          {theme.palette.mode === "light" ? (
            <IconButton
              onClick={() => {
                localStorage.setItem(
                  "currentMode",
                  theme.palette.mode === "dark" ? "light" : "dark"
                );
                setMode((prevMode) =>
                  prevMode === "light" ? "dark" : "light"
                );
              }}
              color="inherit"
              aria-label="delete"
            >
              <LightModeOutlined />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => {
                localStorage.setItem(
                  "currentMode",
                  theme.palette.mode === "dark" ? "light" : "dark"
                );
                setMode((prevMode) =>
                  prevMode === "light" ? "dark" : "light"
                );
              }}
              color="inherit"
              aria-label="dark-mode"
            >
              <DarkModeOutlined />
            </IconButton>
          )}

          <IconButton color="inherit" aria-label="notifications">
            {/* <Badge badgeContent={5} color="error"> */}
              <NotificationsNoneOutlined />
            {/* </Badge> */}
          </IconButton>

          <div>
            {openMenu ? (
              <IconButton
                onClick={handleClick}
                color="inherit"
                aria-label="delete"
              >
                <Person2 />
              </IconButton>
            ) : (
              <IconButton
                onClick={handleClick}
                color="inherit"
                aria-label="delete"
              >
                <Person2Outlined />
              </IconButton>
            )}
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Person2 fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">{currentUser.email}</Typography>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlined fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit">Logout</Typography>
              </MenuItem>
            </Menu>
          </div>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;

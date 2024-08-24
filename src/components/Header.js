import React from "react";
import { Box, Typography } from "@mui/material";

const Header = ({ title, subTitle, isDashboard = false }) => {
  return (
    <Box mb={isDashboard ? 2 : 4}>
      <Typography
        sx={{
          color: "#cc0832",
          fontWeight: "bold",
        }}
        variant="h5"
      >
        {title}
      </Typography>
      <Typography variant="body1">{subTitle}</Typography>
    </Box>
  );
};

export default Header;

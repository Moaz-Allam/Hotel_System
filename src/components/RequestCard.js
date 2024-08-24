import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function RequestCard({
  formName,
  date,
  status,
  onAccept,
  onDelete,
  position,
  preparedBy,
  familyGroup,
  itemCode,
  majorGroup,
  menuName,
  outlet,
  price,
  clockNum,
  name,
  keySerial,
  keyType,
  department,
  id,
  recievedBy,
  requestID,
  createdAt,
}) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  // Determine the card and avatar color based on the status
  const getCardAndAvatarColor = () => {
    switch (status) {
      case "New":
        return {
          avatarBgColor: "#cc0832", // Dark red for "New"
        };
      case "Accepted":
        return {
          avatarBgColor: "#2e7d32", // Dark green for "Accepted"
        };
      case "Rejected":
        return {
          avatarBgColor: "#616161", // Dark grey for "Rejected"
        };
      default:
        return {
          avatarBgColor: "#000000", // Default black for undefined status
        };
    }
  };

  const { avatarBgColor } = getCardAndAvatarColor();

  // Determine the content based on the formName
  const renderFormDetails = () => {
    switch (formName) {
      case "Micros Change Items":
        return (
          <>
            <Typography variant="body1">Family Group: {familyGroup}</Typography>
            <Typography variant="body1">Item Code: {itemCode}</Typography>
            <Typography variant="body1">Major Group: {majorGroup}</Typography>
            <Typography variant="body1">Menu Name: {menuName}</Typography>
            <Typography variant="body1">Outlet: {outlet}</Typography>
            <Typography variant="body1">Price: {price}</Typography>
            <Typography variant="body1">Requested By: {preparedBy}</Typography>
            <Typography variant="body1">Status: {status}</Typography>
          </>
        );
      case "Master Key":
        return (
          <>
            <Typography variant="body1">Department: {department}</Typography>
            <Typography variant="body1">ID: {id}</Typography>
            <Typography variant="body1">Key Serial: {keySerial}</Typography>
            <Typography variant="body1">Key Type: {keyType}</Typography>
            <Typography variant="body1">Name: {name}</Typography>
            <Typography variant="body1">Position: {position}</Typography>
            <Typography variant="body1">Prepared By: {preparedBy}</Typography>
            <Typography variant="body1">Status: {status}</Typography>
          </>
        );
      default:
        return (
          <>
            <Typography variant="body1">Clock Number: {clockNum}</Typography>
            <Typography variant="body1">Employee Name: {name}</Typography>
            <Typography variant="body1">Position: {position}</Typography>
            <Typography variant="body1">Requested By: {preparedBy}</Typography>
            <Typography variant="body1">Status: {status}</Typography>
          </>
        );
    }
  };

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: avatarBgColor }}>
            {formName.charAt(0).toUpperCase()}
          </Avatar>
        }
        action={
          status === "New" ? (
            <CardActions>
              <Button onClick={onAccept} variant="contained">
                Accept
              </Button>
              <Button onClick={onDelete} variant="outlined">
                Reject
              </Button>
              <IconButton
                aria-label="show more"
                onClick={handleExpandClick}
                aria-expanded={expanded}
              >
                <ExpandMoreIcon />
              </IconButton>
            </CardActions>
          ) : (
            <CardActions disableSpacing>
              <IconButton
                aria-label="show more"
                onClick={handleExpandClick}
                aria-expanded={expanded}
              >
                <ExpandMoreIcon />
              </IconButton>
            </CardActions>
          )
        }
        title={formName}
        subheader={date}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{renderFormDetails()}</CardContent>
      </Collapse>
    </Card>
  );
}

export default RequestCard;

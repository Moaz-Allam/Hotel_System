export const textFields = [
  {
    name: "keyID",
    label: "Clock Number",
    errorKey: "id",
  },
  {
    name: "name",
    label: "Name",
    errorKey: "name",
  },
  {
    name: "position",
    label: "Position",
    errorKey: "position",
  },
  {
    name: "keyType",
    label: "Key Type",
    type: "select", // Indicates this is a dropdown/select field
    options: [
      "Master Key",
      "Floor Master Key",
      "Public Area Key",
      "Duty Manager Key",
      "Night Manager Key",
      "GR Manager Key",
      "Emergency Key",
    ],
    errorKey: "keyType",
  },
];

export const hotels = [
  "Grand Millennium Tabuk",
  "Grand Millennium Gizan",
  "Millennium Hail",
];

export const departments = [
  "IT",
  "Executive Office",
  "Finance",
  "Human Resources",
  "Engineering",
  "Front Office",
  "Housekeeping",
  "F&B",
  "Kitchen",
  "Stewarding",
  "SPA",
  "SAL&MKT&RES",
  "Security",
  "Purchasing",
  "Laundry",
  "Revenue",
];

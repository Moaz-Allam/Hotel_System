const regEmail =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+.)+[a-zA-Z]{2,}))$/;

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const passwordPattern =
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{8,}$/;

export const textFields = [
  {
    name: "firstName",
    label: "First Name",
    errorKey: "firstName",
    helperText: "This field is required & min 3 characters",
  },
  {
    name: "lastName",
    label: "Last Name",
    errorKey: "lastName",
    helperText: "This field is required & min 3 characters",
  },
  {
    name: "email",
    label: "Email",
    errorKey: "email",
    helperText: "Please provide a valid email address",
    pattern: regEmail, // No unnecessary escapes here
  },
  {
    name: "password",
    label: "Password",
    errorKey: "password",
    helperText: "Please provide a strong password",
    type: "password", // Set the type to "password"
    pattern: passwordPattern, // No unnecessary escapes here
  },
  {
    name: "clockNumber",
    label: "Clock Number",
    errorKey: "clockNumber",
    helperText: "Please provide a clock number",
  },
  {
    name: "contactNumber",
    label: "Contact Number",
    errorKey: "contactNumber",
    helperText: "Please provide a valid Phone number",
    pattern: phoneRegExp, // No unnecessary escapes here
  },
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

export const roles = [
  {
    value: "Requester",
    label: "Requester",
  },
  {
    value: "Manager",
    label: "Manager",
  },
];

export const hotels = [
  "Grand Millennium Tabuk",
  "Grand Millennium Gizan",
  "Millennium Hail",
];

export const positions = [
  "HOM",
  "CGM",
  "CDOF",
  "FM",
  "Others",
]
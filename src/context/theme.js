export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: "#cc0832", // Set the primary color to #cc0832
    },
    ...(mode === "light"
      ? {
          // palette values for light mode
        }
      : {
          // palette values for dark mode
        }),
  },
});
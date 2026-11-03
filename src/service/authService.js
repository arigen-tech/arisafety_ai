export const clearAuthSession = () => {
  [
    "token",
    "expires_at",
    "user",
    "selectedRoleId",
    "selectedRoleName",
    "selectedMenuKey",
  ].forEach((key) => localStorage.removeItem(key));

  sessionStorage.removeItem("token");
};

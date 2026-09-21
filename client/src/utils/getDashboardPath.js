const getDashboardPath = (role) => {
  if (role === "admin") {
    return "/admin";
  }

  if (role === "staff") {
    return "/staff";
  }

  return "/student";
};

export default getDashboardPath;
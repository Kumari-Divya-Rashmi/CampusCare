const sameId = (firstId, secondId) => {
  if (!firstId || !secondId) {
    return false;
  }

  return (
    firstId.toString() ===
    secondId.toString()
  );
};

const canAccessComplaint = (
  user,
  complaint
) => {
  if (user.role === "admin") {
    return true;
  }

  if (user.role === "student") {
    return sameId(
      complaint.createdBy,
      user._id
    );
  }

  if (user.role === "staff") {
    return sameId(
      complaint.assignedTo,
      user._id
    );
  }

  return false;
};

export default canAccessComplaint;
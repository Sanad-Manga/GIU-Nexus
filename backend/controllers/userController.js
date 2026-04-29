const User = require("../models/User");

// GET /users - Admin gets a paginated list of users (filterable by role/status)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password");

    res.status(200).json({
      success: true,
      total,
      page,
      users,
    });
  } catch (err) {
    next(err);
  }
};

// GET /users/:id - Admin can view a single user's details by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/:id/status - Admin can update a user's status (approve/reject/pending)
exports.updateUserStatus = async (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ["approved", "rejected", "pending"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be 'approved', 'rejected', or 'pending'",
    });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /users/:id - Admin can permanently delete a user account
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted",
    });
  } catch (err) {
    next(err);
  }
};
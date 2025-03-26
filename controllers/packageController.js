const Package = require("../models/Package");
const User = require("../models/User");
const mongoose = require("mongoose");

// @desc Get all packages
// @route GET /packages
// @access Private
const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find()
      .populate(
        "senderId",
        "firstName lastName email phoneNumber roles balance"
      )
      .populate(
        "deliveryPersonId",
        "firstName lastName email phoneNumber roles balance"
      )
      .lean();

    if (!packages.length) {
      return res.status(404).json({ message: "No packages found" });
    }

    res.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get a single package by ID
// @route GET /packages/:id
// @access Private
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid package ID" });
    }

    const package = await Package.findById(id)
      .populate(
        "senderId",
        "firstName lastName email phoneNumber roles balance"
      )
      .populate(
        "deliveryPersonId",
        "firstName lastName email phoneNumber roles balance"
      );

    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json(package);
  } catch (error) {
    console.error("Error fetching package:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Create a new package
// @route POST /packages
// @access Private (Only Customers)
const createPackage = async (req, res) => {
  try {
    const {
      senderId,
      recipientName,
      recipientPhone,
      recipientEmail,
      description,
      deliveryAddress,
      pickupAddress,
      deliveryDate,
      pickupDate,
      priceOffer,
      paymentMethod,
    } = req.body;

    // Validate required fields
    if (
      !senderId ||
      !recipientName ||
      !recipientPhone ||
      !description ||
      !deliveryAddress ||
      !pickupAddress ||
      !priceOffer ||
      !paymentMethod
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Validate senderId
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "Invalid sender ID" });
    }

    // Check if the sender is a Customer
    const sender = await User.findById(senderId);
    if (!sender || !sender.roles.includes("Customer")) {
      return res
        .status(403)
        .json({ message: "Only customers can send packages" });
    }

    // Create package
    const newPackage = await Package.create({
      senderId,
      recipientName,
      recipientPhone,
      recipientEmail,
      description,
      deliveryAddress,
      pickupAddress,
      deliveryDate,
      pickupDate,
      priceOffer,
      paymentMethod,
    });

    res
      .status(201)
      .json({ message: "Package created successfully", package: newPackage });
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update a package
// @route PATCH /packages/:id
// @access Private (Sender or Admin)
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid package ID" });
    }

    const updatedPackage = await Package.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({
      message: "Package updated successfully",
      package: updatedPackage,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Delete a package
// @route DELETE /packages/:id
// @access Private (Sender or Admin)
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid package ID" });
    }

    const deletedPackage = await Package.findByIdAndDelete(id);

    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getPackageById,
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
};

// const Package = require("../models/Package");
// const User = require("../models/User");
// const mongoose = require("mongoose");

// // @desc Get all packages
// // @route GET /packages
// // @access Private
// const getAllPackages = async (req, res) => {
//   try {
//     const packages = await Package.find()
//       .populate(
//         "senderId",
//         "firstName lastName email phoneNumber roles balance"
//       )
//       .populate(
//         "deliveryPersonId",
//         "firstName lastName email phoneNumber roles balance"
//       )
//       .lean();

//     if (!packages.length) {
//       return res.status(404).json({ message: "No packages found" });
//     }

//     res.json(packages);
//   } catch (error) {
//     console.error("Error fetching packages:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Get a single package by ID
// // @route GET /packages/:id
// // @access Private
// const getPackageById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid package ID" });
//     }

//     const package = await Package.findById(id)
//       .populate(
//         "senderId",
//         "firstName lastName email phoneNumber roles balance"
//       )
//       .populate(
//         "deliveryPersonId",
//         "firstName lastName email phoneNumber roles balance"
//       );

//     if (!package) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     res.json(package);
//   } catch (error) {
//     console.error("Error fetching package:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// // @desc Create a new package
// // @route POST /packages
// // @access Private (Only Customers)
// const createPackage = async (req, res) => {
//   try {
//     const {
//       senderId,
//       recipientName,
//       recipientPhone,
//       recipientEmail,
//       description,
//       deliveryAddress,
//       pickupAddress,
//       deliveryDate,
//       pickupDate,
//       priceOffer,
//       paymentMethod,
//     } = req.body;

//     // Validate required fields
//     if (
//       !senderId ||
//       !recipientName ||
//       !recipientPhone ||
//       !description ||
//       !deliveryAddress ||
//       !pickupAddress ||
//       !priceOffer ||
//       !paymentMethod
//     ) {
//       return res
//         .status(400)
//         .json({ message: "All required fields must be provided" });
//     }

//     // Validate senderId
//     if (!mongoose.Types.ObjectId.isValid(senderId)) {
//       return res.status(400).json({ message: "Invalid sender ID" });
//     }

//     // Check if the sender is a Customer
//     const sender = await User.findById(senderId);
//     if (!sender || !sender.roles.includes("Customer")) {
//       return res
//         .status(403)
//         .json({ message: "Only customers can send packages" });
//     }

//     // Create package
//     const newPackage = await Package.create({
//       senderId,
//       recipientName,
//       recipientPhone,
//       recipientEmail,
//       description,
//       deliveryAddress,
//       pickupAddress,
//       deliveryDate,
//       pickupDate,
//       priceOffer,
//       paymentMethod,
//     });

//     res
//       .status(201)
//       .json({ message: "Package created successfully", package: newPackage });
//   } catch (error) {
//     console.error("Error creating package:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Update a package
// // @route PATCH /packages/:id
// // @access Private (Sender or Admin)
// const updatePackage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid package ID" });
//     }

//     // Check if package exists
//     const package = await Package.findById(id);
//     if (!package) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     // Check if user is the sender or admin
//     const user = req.user;
//     if (
//       package.senderId.toString() !== user.id &&
//       !user.roles.includes("Admin")
//     ) {
//       return res.status(403).json({
//         message: "Not authorized to update this package",
//       });
//     }

//     // Prevent updating certain fields
//     const restrictedFields = [
//       "packageId",
//       "senderId",
//       "deliveryPersonId",
//       "deliveryStatus",
//       "paymentStatus",
//     ];
//     for (const field of restrictedFields) {
//       if (updateData[field]) {
//         return res.status(400).json({
//           message: `Cannot update ${field} field through this endpoint`,
//         });
//       }
//     }

//     const updatedPackage = await Package.findByIdAndUpdate(id, updateData, {
//       new: true,
//     });

//     res.json({
//       message: "Package updated successfully",
//       package: updatedPackage,
//     });
//   } catch (error) {
//     console.error("Error updating package:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Delete a package
// // @route DELETE /packages/:id
// // @access Private (Sender or Admin)
// const deletePackage = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid package ID" });
//     }

//     // Check if package exists
//     const package = await Package.findById(id);
//     if (!package) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     // Check if user is the sender or admin
//     const user = req.user;
//     if (
//       package.senderId.toString() !== user.id &&
//       !user.roles.includes("Admin")
//     ) {
//       return res.status(403).json({
//         message: "Not authorized to delete this package",
//       });
//     }

//     await Package.findByIdAndDelete(id);

//     res.json({ message: "Package deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting package:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Allow employee to accept/assign themselves to a package
// // @route PATCH /packages/:id/accept
// // @access Private (Employee only)
// const acceptPackage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     // const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid package ID" });
//     }

//     // Check if package exists
//     const package = await Package.findById(id);
//     if (!package) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     // Verify package isn't already assigned
//     if (package.deliveryPersonId) {
//       return res.status(400).json({
//         message: "Package already assigned to another employee",
//       });
//     }

//     // // Verify user is an employee
//     // const user = await User.findById(userId);
//     // if (!user.roles.includes("Employee")) {
//     //   return res.status(403).json({
//     //     message: "Only employees can accept packages",
//     //   });
//     // }

//     // // Update package
//     // package.deliveryPersonId = userId;
//     package.deliveryStatus = "In Transit";
//     package.updatedAt = new Date();

//     await package.save();

//     res.json({
//       message: "Package accepted successfully",
//       package,
//     });
//   } catch (error) {
//     console.error("Error accepting package:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Update delivery status of a package
// // @route PATCH /packages/:id/status
// // @access Private (Admin, Dispatcher, or assigned Delivery Partner)
// const updateDeliveryStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { deliveryStatus } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid package ID" });
//     }

//     // Validate status
//     const validStatuses = ["Pending", "In Transit", "Delivered", "Cancelled"];
//     if (!validStatuses.includes(deliveryStatus)) {
//       return res.status(400).json({ message: "Invalid delivery status" });
//     }

//     // Check if package exists
//     const package = await Package.findById(id);
//     if (!package) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     // Check if user is authorized
//     const user = req.user;
//     const isAssignedDeliveryPerson =
//       package.deliveryPersonId &&
//       package.deliveryPersonId.toString() === user.id;

//     if (
//       !user.roles.includes("Admin") &&
//       !user.roles.includes("Dispatcher") &&
//       !isAssignedDeliveryPerson
//     ) {
//       return res.status(403).json({
//         message: "Not authorized to update delivery status",
//       });
//     }

//     // Special case for "Delivered" status - update payment status if not already paid
//     if (deliveryStatus === "Delivered" && package.paymentStatus === "Unpaid") {
//       package.paymentStatus = "Paid";
//     }

//     // Update status
//     package.deliveryStatus = deliveryStatus;
//     await package.save();

//     res.json({
//       message: "Delivery status updated successfully",
//       package,
//     });
//   } catch (error) {
//     console.error("Error updating delivery status:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// module.exports = {
//   getAllPackages,
//   getPackageById, // Updated export name
//   createPackage,
//   updatePackage,
//   deletePackage,
//   acceptPackage,
//   updateDeliveryStatus,
// };

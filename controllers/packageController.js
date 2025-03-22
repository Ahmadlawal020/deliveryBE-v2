// const Package = require("../models/Package");
// const User = require("../models/User");

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
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Create a new package
// // @route POST /packages
// // @access Private (Only Customers)
// const createPackage = async (req, res) => {
//   try {
//     const {
//       packageId,
//       senderId,
//       recipientName,
//       recipientPhone,
//       recipientEmail,
//       description,
//       deliveryAddress,
//       pickupAddress,
//       deliveryDate,
//       pickupDate,
//       deliveryPersonId,
//     } = req.body;

//     // Validate required fields
//     if (
//       !packageId ||
//       !senderId ||
//       !recipientName ||
//       !recipientPhone ||
//       !description ||
//       !deliveryAddress ||
//       !pickupAddress ||
//       !deliveryDate ||
//       !pickupDate ||
//       !deliveryPersonId
//     ) {
//       return res
//         .status(400)
//         .json({ message: "All required fields must be provided" });
//     }

//     // Check if the sender is a Customer
//     const sender = await User.findById(senderId);
//     if (!sender || !sender.roles.includes("Customer")) {
//       return res
//         .status(403)
//         .json({ message: "Only customers can send packages" });
//     }

//     // Check if the delivery person is an Employee
//     // const deliveryPerson = await User.findById(deliveryPersonId);
//     // if (!deliveryPerson || !deliveryPerson.roles.includes("Employee")) {
//     //   return res
//     //     .status(400)
//     //     .json({ message: "Only employees can deliver packages" });
//     // }

//     // Check for duplicate package ID
//     const packageExists = await Package.findOne({ packageId }).lean().exec();
//     if (packageExists) {
//       return res.status(409).json({ message: "Package ID already exists" });
//     }

//     // Create package
//     const newPackage = await Package.create({
//       packageId,
//       senderId,
//       recipientName,
//       recipientPhone,
//       recipientEmail,
//       description,
//       deliveryAddress,
//       pickupAddress,
//       deliveryDate,
//       pickupDate,
//       deliveryPersonId,
//     });

//     res
//       .status(201)
//       .json({ message: "Package created successfully", package: newPackage });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Update a package
// // @route PATCH /packages/:id
// // @access Private
// const updatePackage = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateFields = req.body;

//     const updatedPackage = await Package.findByIdAndUpdate(id, updateFields, {
//       new: true,
//       runValidators: true,
//     }).exec();

//     if (!updatedPackage) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     res.json({ message: "Package updated successfully", updatedPackage });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Delete a package
// // @route DELETE /packages/:id
// // @access Private
// const deletePackage = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const packageToDelete = await Package.findById(id).exec();
//     if (!packageToDelete) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     await packageToDelete.deleteOne();
//     res.json({ message: `Package with ID ${id} deleted successfully` });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Assign a delivery person
// // @route PATCH /packages/:id/assign
// // @access Private
// const assignDeliveryPerson = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { deliveryPersonId } = req.body;

//     if (!deliveryPersonId) {
//       return res
//         .status(400)
//         .json({ message: "Delivery person ID is required" });
//     }

//     // Check if the assigned person is an Employee
//     const deliveryPerson = await User.findById(deliveryPersonId);
//     if (!deliveryPerson || !deliveryPerson.roles.includes("Employee")) {
//       return res
//         .status(400)
//         .json({ message: "Only employees can deliver packages" });
//     }

//     const updatedPackage = await Package.findByIdAndUpdate(
//       id,
//       { deliveryPersonId },
//       { new: true }
//     ).exec();

//     if (!updatedPackage) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     res.json({
//       message: "Delivery person assigned successfully",
//       updatedPackage,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // @desc Update delivery status & handle payment
// // @route PATCH /packages/:id/status
// // @access Private
// const updateDeliveryStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { deliveryStatus, paymentStatus } = req.body;

//     if (!deliveryStatus && !paymentStatus) {
//       return res
//         .status(400)
//         .json({ message: "At least one status field is required" });
//     }

//     const packageToUpdate = await Package.findById(id).exec();
//     if (!packageToUpdate) {
//       return res.status(404).json({ message: "Package not found" });
//     }

//     packageToUpdate.deliveryStatus =
//       deliveryStatus || packageToUpdate.deliveryStatus;
//     packageToUpdate.paymentStatus =
//       paymentStatus || packageToUpdate.paymentStatus;

//     // Handle payment when package is delivered
//     if (deliveryStatus === "Delivered") {
//       const deliveryPerson = await User.findById(
//         packageToUpdate.deliveryPersonId
//       );
//       if (deliveryPerson) {
//         deliveryPerson.balance += 80; // Example earning for the delivery person
//         await deliveryPerson.save();
//       }
//     }

//     const updatedPackage = await packageToUpdate.save();
//     res.json({
//       message: "Package status updated successfully",
//       updatedPackage,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// module.exports = {
//   getAllPackages,
//   createPackage,
//   updatePackage,
//   deletePackage,
//   assignDeliveryPerson,
//   updateDeliveryStatus,
// };

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
    } = req.body;

    // Validate required fields
    if (
      !senderId ||
      !recipientName ||
      !recipientPhone ||
      !description ||
      !deliveryAddress ||
      !pickupAddress ||
      !deliveryDate ||
      !pickupDate
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
// @access Private
const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus, paymentStatus, deliveryPersonId } = req.body;

    const allowedUpdates = {
      deliveryStatus,
      paymentStatus,
      deliveryPersonId,
    };

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ message: "Package updated successfully", updatedPackage });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Delete a package
// @route DELETE /packages/:id
// @access Private
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const packageToDelete = await Package.findById(id).exec();
    if (!packageToDelete) {
      return res.status(404).json({ message: "Package not found" });
    }

    await packageToDelete.deleteOne();
    res.json({ message: `Package with ID ${id} deleted successfully` });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Assign a delivery person
// @route PATCH /packages/:id/assign
// @access Private
const assignDeliveryPerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(deliveryPersonId)) {
      return res.status(400).json({ message: "Invalid delivery person ID" });
    }

    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson || !deliveryPerson.roles.includes("Employee")) {
      return res
        .status(400)
        .json({ message: "Only employees can deliver packages" });
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      { deliveryPersonId },
      { new: true }
    ).exec();

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({
      message: "Delivery person assigned successfully",
      updatedPackage,
    });
  } catch (error) {
    console.error("Error assigning delivery person:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update delivery status & handle payment
// @route PATCH /packages/:id/status
// @access Private
const updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus, paymentStatus } = req.body;

    if (!deliveryStatus && !paymentStatus) {
      return res
        .status(400)
        .json({ message: "At least one status field is required" });
    }

    const packageToUpdate = await Package.findById(id).exec();
    if (!packageToUpdate) {
      return res.status(404).json({ message: "Package not found" });
    }

    packageToUpdate.deliveryStatus =
      deliveryStatus || packageToUpdate.deliveryStatus;
    packageToUpdate.paymentStatus =
      paymentStatus || packageToUpdate.paymentStatus;

    // Handle payment when package is delivered
    if (deliveryStatus === "Delivered") {
      const deliveryPerson = await User.findById(
        packageToUpdate.deliveryPersonId
      );
      if (deliveryPerson) {
        deliveryPerson.balance += 80; // Example earning for the delivery person
        await deliveryPerson.save();
      }
    }

    const updatedPackage = await packageToUpdate.save();
    res.json({
      message: "Package status updated successfully",
      updatedPackage,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  assignDeliveryPerson,
  updateDeliveryStatus,
};

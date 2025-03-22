const express = require("express");
const router = express.Router();
const {
  createPackage,
  getAllPackages,
  updatePackage,
  deletePackage,
  assignDeliveryPerson,
  updateDeliveryStatus,
} = require("../controllers/packageController");

const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
// 📌 Package Routes (Customers & Employees)
router
  .route("/")
  .post(createPackage) // Customers create packages
  .get(getAllPackages); // Get all packages (both employees & customers)

router
  .route("/:id")
  .patch(updatePackage) // Update package details
  .delete(deletePackage); // Delete a package

// 📌 Employee Routes
router.patch("/:id/assign", assignDeliveryPerson); // Assign a delivery person
router.patch("/:id/status", updateDeliveryStatus); // Update package delivery status

module.exports = router;

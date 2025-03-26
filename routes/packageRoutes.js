const express = require("express");
const router = express.Router();
const {
  createPackage,
  getAllPackages,
  getPackageById, // Updated import
  updatePackage,
  deletePackage,
} = require("../controllers/packageController");

// const verifyJWT = require("../middleware/verifyJWT");

// router.use(verifyJWT);
// 📌 Package Routes (Customers & Employees)
router
  .route("/")
  .post(createPackage) // Customers create packages
  .get(getAllPackages); // Get all packages (both employees & customers)

router
  .route("/:id")
  .get(getPackageById) // Added GET endpoint for single package
  .patch(updatePackage) // Update package details
  .delete(deletePackage); // Delete a package

module.exports = router;

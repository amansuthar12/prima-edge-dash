import express from "express";
const router = express.Router();

let truckState = {
    engineOn: false,
    speed: 0,
    load: 15,
    fuelLevel: 200,
    temperature: 35,
    tirePressures: [38, 38, 37, 39],
    rainActive: false,
    timestamp: new Date().toISOString(),
};

// Get current truck data
router.get("/state", (req, res) => {
    res.json(truckState);
});

// Update truck data
router.post("/update", (req, res) => {
    truckState = { ...truckState, ...req.body, timestamp: new Date().toISOString() };
    console.log("🚚 Truck state updated:", truckState);
    res.json({ message: "Updated successfully", truckState });
});

export default router;

import express from "express";
import Subscriber from "../models/Subscriber.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const sub = await Subscriber.create(req.body);
  res.json(sub);
});

export default router;
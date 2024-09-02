import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";

const router = Router();

// UNTESTED, ALL OF THEM
router
  .route("/toggleSubscription/:channelId")
  .post(verifyJWT, toggleSubscription);
router.route("/getSubscribers/:channelId").get(getUserChannelSubscribers);
router.route("/getSubscriptions").get(verifyJWT, getSubscribedChannels);

export default router;

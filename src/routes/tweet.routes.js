import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createTweet, getUserTweets, updateTweet, deleteTweet } from "../controllers/tweet.controller";

const router = Router();

router.route("/createTweet").post(verifyJWT, createTweet);
router.route("/getUserTweets").get(verifyJWT, getUserTweets);
router.route("/u/updateTweet").post(verifyJWT, updateTweet);
router.route("/d/deleteTweet/:tweetId").post(verifyJWT, deleteTweet);

export default router;
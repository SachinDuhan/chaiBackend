import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
  getUserVideos,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/getAllVideos").get(getAllVideos);
router.route("/createVideo").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

router.route("/getVideoById/v/:videoId").get(getVideoById);

router.route("/updateVideo/u/:videoId").post(
  verifyJWT,
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  updateVideo
);

router.route("/deleteVideo/d/:videoId").post(verifyJWT, deleteVideo);

router
  .route("/togglePublishStatus/u/:videoId")
  .post(verifyJWT, togglePublishStatus);

router.route("/getUserVideos/:userId").get(getUserVideos);

export default router;

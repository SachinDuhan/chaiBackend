import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const user = req?.user;

  try {
    const exist = await Like.findOne({ video: videoId, likedBy: user?._id });

    if (exist) {
      const deleteLike = await Like.deleteOne({
        video: videoId,
        likedBy: user?._id,
      });

      if (deleteLike.deletedCount === 0) {
        throw new ApiError(404, "Like not found or not deleted");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, deleteLike, "Like deleted successfully"));
    } else if (!exist) {
      const createLike = await Like.create({
        video: videoId,
        likedBy: user._id,
      });

      if (!createLike) {
        throw new ApiError(500, "There was a problem creating the like");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, createLike, "Like created successfully"));
    }
  } catch (error) {
    throw new ApiError(500, error.message, error);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const user = req?.user;

  try {
    const exist = await Like.findOne({
      comment: commentId,
      likedBy: user?._id,
    });

    if (exist) {
      const deleteLike = await Like.deleteOne({
        comment: commentId,
        likedBy: user?._id,
      });

      if (deleteLike.deletedCount === 0) {
        throw new ApiError(404, "Like not found or not deleted");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, deleteLike, "Like deleted successfully"));
    } else if (!exist) {
      const createLike = await Like.create({
        comment: commentId,
        likedBy: user?._id,
      });

      if (!createLike) {
        throw new ApiError(500, "There was a problem creating the like");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, createLike, "Like created successfully"));
    }
  } catch (error) {
    throw new ApiError(500, error.message, error);
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const user = req?.user;

  try {
    const exist = await Like.findOne({ tweet: tweetId, likedBy: user?._id });

    if (exist) {
      const deleteLike = await Like.deleteOne({
        tweet: tweetId,
        likedBy: user?._id,
      });

      if (deleteLike.deletedCount === 0) {
        throw new ApiError(404, "Like not found or not deleted");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, deleteLike, "Like deleted successfully"));
    } else if (!exist) {
      const createLike = await Like.create({
        tweet: tweetId,
        likedBy: user._id,
      });

      if (!createLike) {
        throw new ApiError(500, "There was a problem creating the like");
      }

      return res
        .status(200)
        .json(new ApiResponse(200, createLike, "Like created successfully"));
    }
  } catch (error) {
    throw new ApiError(500, error.message, error);
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = req?.user;

  try {
    const likedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: user?._id, // Filter by the user who liked the video
          video: { $exists: true, $ne: null }, // Ensure the 'video' field exists and is not null
        },
      },
      {
        $lookup: {
          from: "videos", // The name of the collection where video data is stored
          localField: "video", // Field from the Like collection
          foreignField: "_id", // Field from the Video collection
          as: "videoDetails", // Alias for the joined data
        },
      },
      {
        $unwind: "$videoDetails", // Flatten the videoDetails array
      },
      {
        $lookup: {
          from: "users",
          localField: "videoDetails.owner", // Reference to the video's owner
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: "$ownerDetails", // Flatten the ownerDetails array
      },
      {
        $project: {
          videoId: "$videoDetails._id",
          thumbnail: "$videoDetails.thumbnail",
          title: "$videoDetails.title",
          views: "$videoDetails.views",
          createdAt: "$videoDetails.createdAt",
          owner: {
            fullName: "$ownerDetails.fullName",
            username: "$ownerDetails.username",
            avatar: "$ownerDetails.avatar",
          },
        },
      },
    ]);

    if (!likedVideos) {
      throw new ApiError(500, "There was a problem fetching the liked videos");
    }

    if (likedVideos.length == 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "No like videos"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message, error);
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

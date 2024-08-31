import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const user = req?.user;
    const {content} = req.body;
    try {
        if (!content || content.trim() === "") {
            throw new ApiError(400, "Tweet cannot be empty")
        }
        const newTweet = await Tweet.create({
            content,
            owner: user?._id
        })

        if (!newTweet) {
            throw new ApiError(500, "There was a problem creating the tweet")
        }

        return res.status(200).json(new ApiResponse(200, newTweet, "Tweet created successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const user = req?.user;
    try {
        const userTweets = await Tweet.find({owner: user?._id});

        if (!userTweets) {
            throw new ApiError(500, "There was a problem fetching the tweets")
        }

        if (userTweets.length == 0) {
            return res.status(200).json(new ApiResponse(200, userTweets, "No tweets yet"))
        }

        return res.status(200).json(new ApiResponse(200, userTweets, "Tweets fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    try {
        const {content} = req.body;
        const user = req?.user;

        const updateTweet = await Tweet.updateOne({owner: user?._id}, {content});

        if (!updateTweet || updateTweet.modifiedCount == 0) {
            throw new ApiError(500, "There was a problem updating the tweet")
        }

        return res.status(200).json(new ApiResponse(200, updateTweet, "Tweet updated successfully"))
    } catch (error) {
        
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    try {
        const tweetId = req.params;

        const deleteTweet = await Tweet.deleteOne({_id : tweetId});

        if (deleteTweet.deletedCount === 0) {
            throw new ApiError(404, "Tweet not found or not deleted");
        }

        return res.status(200).json(new ApiResponse(200, deleteTweet, "Tweet deleted successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    try {
            const comments = Comment.aggregate([
                {
                    $match: {video: videoId}
                }
            ])
        
            const commentsPaginate = await Comment.aggregatePaginate(comments, {page: parseInt(page), limit: parseInt(limit)})

            if (commentsPaginate.docs.length == 0) {
                return res.status(200).json(new ApiResponse(200, commentsPaginate, "No Comments"))
            }

            if (!commentsPaginate) {
                throw new ApiError(500, "Comments could not be loaded")
            }

            return res.status(200).json(new ApiResponse(200, commentsPaginate, "Comments loaded successfully"));
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
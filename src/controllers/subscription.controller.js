import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    const user = req.user;
    try {
        const exist = await Subscription.findOne({subsciber : user?._id, channel: channelId})
        

        if (exist) {
            const deleteSubscription = await Subscription.deleteOne(exist._id)

            if (!deleteSubscription) {
                throw new ApiError(500, "There was a problem while unsubscribing")
            } else if (deleteSubscription.deletedCount === 0) {
                throw new ApiError(404, "Subscription not found or not deleted");
            }

            return res.status(200).json(new ApiResponse(200, deleteSubscription, "Unsubscribed successfully"))
        } else if (!exist) {
            const createSubscription = await Subscription.create({
                subsciber: user?._id,
                channel: channelId
            })

            if (!createSubscription) {
                throw new ApiError(500, "There was a problem while subscribing")
            }

            return res.status(200).json(new ApiResponse(200, createSubscription, "Subscribed successfully"))
        }
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    try {
        const subscribers = await Subscription.findOne({channel: channelId})

        if (!subscribers) {
            throw new ApiError("There was a problem fetching the subscribers")
        }

        if (subscribers.length == 0) {
            return res.status(200).json(new ApiResponse(200, subscribers, "No subscribers"))
        }

        return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // const { subscriberId } = req.params
    const user = req?.user;
    try {
        const subscribed = await Subscription.findOne({subsciber: user?._id})

        if (!subscribed) {
            throw new ApiError(500, "There was a problem fetching the subscriptions")
        }

        return res.status(200).json(new ApiResponse(200, subscribed, "Subscriptions fetched successfully"))
    } catch (error) {
        throw new ApiError(500, error.message, error)
    }

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
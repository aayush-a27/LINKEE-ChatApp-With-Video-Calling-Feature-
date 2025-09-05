import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        maxlength: 200,
        default: ""
    },
    avatar: {
        type: String,
        default: ""
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member"
        }
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    streamChannelId: {
        type: String,
        required: true,
        unique: true
    }
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);
export default Group;
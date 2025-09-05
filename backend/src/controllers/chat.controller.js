import { generateStreamToken } from "../lib/stream.js";

// Utility function to sanitize log inputs
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[\r\n\t]/g, '_').substring(0, 100);
};

export async function getStreamToken(req,res){
    try {
        const token = generateStreamToken(req.user.id);
        res.status(200).json({token});
    } catch (error) {
        console.log("Error in getStreamToken controller", sanitizeForLog(error.message));
    res.status(500).json({ message: "Internal Server Error" });
    }
}
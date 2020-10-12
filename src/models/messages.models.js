import { Schema, model } from 'mongoose'
const messageSchema = new Schema({
    sender: String,
    message: String,
    timestamp: Number
})
export const Message = model(`Message`, messageSchema)
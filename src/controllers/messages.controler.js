import { Message } from "../models/messages.models";

export const createMessage = async ({ sender, message, timestamp }) => {
    try {
        const someMessage = new Message({ sender: sender, message: message, timestamp: timestamp })
        someMessage.save()
        console.log(`created ${someMessage}`)
    }
    catch (e) {
        console.log(e)
    }
}
export const getMessages = async () => {
    try {
        const messages = await Message.find({})
        // console.log(messages)
        return messages

    }
    catch (e) {
        console.log(e)
    }
}
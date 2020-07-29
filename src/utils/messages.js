

const generateMessage = (text, username) => {
    return {
        text,
        createdAt: new Date(),
        username
    }
}

const generateLocationMessage = (url, username) => {
    return {
        url,
        createdAt: new Date(),
        username
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}
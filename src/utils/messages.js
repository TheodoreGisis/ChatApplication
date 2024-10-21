const generatedMessageWithTimestamp = (username,text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}


const generatedLocationMessageWithTimestamp = (username,url) =>{
    return {
        username,   
        text: url,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generatedMessageWithTimestamp,
    generatedLocationMessageWithTimestamp
}
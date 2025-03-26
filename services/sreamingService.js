const BaseService = require("./BaseService");


class StreamingService extends BaseService {
    getVideoPath = () => {
        return "./public/videos/video.mp4";
    }
}

module.exports = {
    StreamingService
}
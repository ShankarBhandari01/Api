import BaseService from "./BaseService";

class StreamingService extends BaseService {
  getVideoPath = () => {
    return "./public/videos/video.mp4";
  };
}

export default {
  StreamingService,
};

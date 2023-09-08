const { StreamingService } = require('../services/sreamingService');
const streamingService = new StreamingService();

const util = require('util');
const fs = require('fs');
const statAsync = util.promisify(fs.stat);
const createReadStreamAsync = util.promisify(fs.createReadStream);

exports.StartStreaming = async (req, res, next) => {
    try {
        const range = req.headers.range;
        const videoPath = streamingService.getVideoPath();
    
        // Use util.promisify to make fs.stat and fs.createReadStream asynchronous
        const videoSize = await statAsync(videoPath);
    
        if (!range) {
            const headers = {
                'Content-Length': videoSize.size, 
                'Content-Type': 'video/mp4',
            };
            res.writeHead(200, headers);
            fs.createReadStream(videoPath).pipe(res);
        } else {
            const chunkSize = 1 * 1e6;
            const start = Number((range || '').replace(/\D/g, ''));
            const end = Math.min(start + chunkSize, videoSize.size - 1);
            const contentLength = end - start + 1;
    
            const headers = {
                'Content-Range': `bytes ${start}-${end}/${videoSize.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': contentLength,
                'Content-Type': 'video/mp4',
            };
    
            res.writeHead(206, headers);
            const stream =  createReadStreamAsync(videoPath, { start, end });
            stream.pipe(res);
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
    
};

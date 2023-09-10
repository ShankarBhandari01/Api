const { StreamingService } = require('../services/sreamingService');
const streamingService = new StreamingService();

const util = require('util');
const fs = require('fs');
const statAsync = util.promisify(fs.stat);
const createReadStreamAsync = util.promisify(fs.createReadStream);

const videoPath = streamingService.getVideoPath(); 

exports.StartStreaming = async (req, res, next) => {
    try {
        const videoSize = fs.statSync(videoPath);
        const range = req.headers.range || 'bytes=0-';

        const positions = range.replace(/bytes=/, '').split('-');
        const start = parseInt(positions[0], 10);
        const end = positions[1] ? parseInt(positions[1], 10) : videoSize.size - 1;
        const chunksize = (end - start) + 1;

        const headers = {
            'Content-Range': `bytes ${start}-${end}/${videoSize.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, headers);

        // Create a readable stream and use pipe to efficiently stream chunks
        const videoStream = fs.createReadStream(videoPath, { start, end });

        videoStream.on('open', function () {
            videoStream.pipe(res);
        });

        videoStream.on('error', function (err) {
            console.error('Error reading video stream:', err);
            res.statusCode = 500; // Internal Server Error
            res.end();
        });
    } catch (error) {
        next(error);
    }
};


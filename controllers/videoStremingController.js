import { StreamingService } from '../services/sreamingService';
const streamingService = new StreamingService();

import { promisify } from 'util';
import { stat, createReadStream, statSync } from 'fs';
const statAsync = promisify(stat);
const createReadStreamAsync = promisify(createReadStream);

const videoPath = streamingService.getVideoPath(); 

export async function StartStreaming(req, res, next) {
    try {
        const videoSize = statSync(videoPath);
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
        const videoStream = createReadStream(videoPath, { start, end });

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
}


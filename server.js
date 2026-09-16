const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('output')) fs.mkdirSync('output');

app.use(express.static('public'));
app.use('/output', express.static('output'));

app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Fayl yüklənmədi.' });
    }

    const inputPath = req.file.path;
    const outputFileName = `tiktok_4k_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, 'output', outputFileName);

    console.log('4K Video TikTok üçün optimallaşdırılır...');

    ffmpeg(inputPath)
        .outputOptions([
            '-vf scale=2160:3840:force_original_aspect_ratio=decrease,pad=2160:3840:(ow-iw)/2:(oh-oh)/2',
            '-c:v libx264',
            '-crf 18',
            '-preset fast',
            '-c:a aac',
            '-b:a 320k',
            '-movflags +faststart'
        ])
        .save(outputPath)
        .on('end', () => {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            console.log('Optimizasiya uğurla başa çatdı!');
            res.json({ success: true, downloadUrl: `/output/${outputFileName}` });
        })
        .on('error', (err) => {
            console.error('FFmpeg xətası:', err);
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            res.status(500).json({ success: false, message: 'Video emal edilərkən xəta baş verdi.' });
        });
});

app.listen(3000, () => {
    console.log('Server işləyir: http://localhost:3000');
});

const path = require('path');
const fs = require('fs');

const streamAudio = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../../storage', filename);
  
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send('File not found');
      }
  
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
  
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
        };
  
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'audio/mpeg',
        };
  
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    });
  };
  
  const streamImage = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../../storage', filename);
  
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send('File not found');
      }
  
      const head = {
        'Content-Type': 'image/jpeg' // Adjust based on your image format
      };
  
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    });
  };
  
  module.exports = {
    streamAudio,
    streamImage,
  };
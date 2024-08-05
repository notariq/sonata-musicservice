const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicControllers');
const streamController = require('../controllers/streamControllers');

router.get('/music', musicController.getAllMusic);
router.get('/music/:id', musicController.getMusicById);
router.post('/music', musicController.createMusic);
router.put('/music/:id', musicController.updateMusic);
router.delete('/music/:id', musicController.deleteMusic);

router.post('/music/batch', musicController.batchMusic);

//Album
router.get('/music/album', musicController.getAllAlbum);
router.get('/music/album/:id', musicController.getAllAlbum);
router.post('/music/album', musicController.createAlbum);

//Streaming
router.get('/music/stream/audio/:filename', streamController.streamAudio);
router.get('/music/stream/image/:filename', streamController.streamImage);

module.exports = router;
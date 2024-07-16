const express = require('express');
const musicController = require('../controllers/musicControllers');
const router = express.Router();

router.get('/music', musicController.getAllMusic);
router.get('/music/:id', musicController.getMusicById);
router.post('/music', musicController.createMusic);
router.put('/music/:id', musicController.updateMusic);
router.delete('/music/:id', musicController.deleteMusic);
router.post('/music/batch', musicController.batchMusic);
  

module.exports = router;
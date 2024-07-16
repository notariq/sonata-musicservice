const Music = require('../models/music');

exports.getAllMusic = async (req, res) => {
    try {
        const music = await Music.find();
        res.status(200).json(music);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMusicById = async (req, res) => {
    try {
        const music = await Music.findById(req.params.id);
        if (!music) {
            return res.status(404).json({ message: 'Music not found' });
        }
        res.status(200).json(music);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMusic = async (req, res) => {
    const music = new Music(req.body);
    try {
        const savedMusic = await music.save();
        res.status(201).json(savedMusic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateMusic = async (req, res) => {
    try {
        const updatedMusic = await Music.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedMusic) {
            return res.status(404).json({ message: 'Music not found' });
        }
        res.status(200).json(updatedMusic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteMusic = async (req, res) => {
    try {
        const deletedMusic = await Music.findByIdAndDelete(req.params.id);
        if (!deletedMusic) {
            return res.status(404).json({ message: 'Music not found' });
        }
        res.status(200).json({ message: 'Music deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.batchMusic = async (req, res) => {
    const { songIds } = req.body;
    try {
      const songs = await Music .find({ _id: { $in: songIds } });
      res.status(200).json(songs);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching songs' });
    }
};
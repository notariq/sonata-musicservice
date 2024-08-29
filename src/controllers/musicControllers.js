const path = require('path');
const fs = require('fs');
const rabbitmq = require('../rabbitmq')
const { Music, Album } = require('../models/music');

//Music Controllers
exports.getAllMusic = async (req, res) => {
    try {
        const { query } = req.query;
        const searchQuery = query ? {
            $or: [
                { title: new RegExp(query, 'i') },
                { artist: new RegExp(query, 'i') }
            ]
        } : {};

        const musicRecords = await Music.find(searchQuery).populate('album'); // Populate to get album details

        const formattedMusic = musicRecords.map(music => ({
            id: music._id,
            title: music.title,
            artist: music.artist,
            duration: music.duration,
            audioPath: music.audioPath,
            coverPath: music.album ? music.album.coverPath : null,
            album: music.album ? music.album.title : null,
        }));

        res.status(200).json(formattedMusic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMusicById = async (req, res) => {
    try {
        const music = await Music.findById(req.params.id)
            .populate({
                path: 'album',
                select: 'title coverPath'
            }).exec();

        if (!music) {
            return res.status(404).json({ message: 'Music not found' });
        };
        
        const resMusic = {
            id: music._id,
            title: music.title,
            artist: music.artist,
            duration: music.duration,
            audioPath: music.audioPath,
            coverPath: music.album.coverPath,
            album: music.album.title,
        };

        res.status(200).json(resMusic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createMusic = async (req, res) => {
    const music = new Music(req.body);
    try {
        const savedMusic = await music.save();
        rabbitmq.publishToQueue('NEW_MUSIC', savedMusic);
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
    const { id } = req.body;
    try {
        const songs = await Music.find({ _id: { $in: id } })
            .populate({
                path: 'album',
                select: 'title coverPath'
            }).exec();

        const resSongs = songs.map(music => ({
            id: music._id,
            title: music.title,
            artist: music.artist,
            duration: music.duration,
            audioPath: music.audioPath,
            coverPath: music.album?.coverPath || '', 
            album: music.album?.title || '' 
        }));

        res.status(200).json(resSongs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching songs' });
    }
};

//Album Controllers
exports.getAllAlbum = async (req, res) => {
    try {
        const album = await Album.find();
        res.status(200).json(album);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAlbumById = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        };
        res.status(200).json(album);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createAlbum = async (req, res) => {
    const album = new Album(req.body);
    try {
        const savedMusic = await album.save();
        res.status(201).json(savedMusic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const musicSchema = new Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  duration: { type: Number, required: true },
  audioPath: { type: String, required: true, trim: true },
  album: { type: Schema.Types.ObjectId, ref: 'Album' }
});

const albumSchema = new Schema({
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  releaseDate: { type: Date },
  coverPath: { type: String, required: true, trim: true },
  musics: [{ type: Schema.Types.ObjectId, ref: 'Music' }]
});

const Music = mongoose.model('Music', musicSchema);
const Album = mongoose.model('Album', albumSchema);

module.exports = { Music, Album };

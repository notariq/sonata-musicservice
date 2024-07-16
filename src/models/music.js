const mongoose =  require('mongoose');
const { Schema } = mongoose;

const musicSchema = new Schema({
  songTitle: { type: String, required: true, trim: true },
  albumTitle: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  songDuration: { type: String, required: true },
  //songDuration: { type: Number, required: true },
  songPath: { type: String, required: true, trim: true },
  songPicturePath: { type: String, required: true, trim: true }
});

const Music = mongoose.model('Music', musicSchema);

module.exports = Music;

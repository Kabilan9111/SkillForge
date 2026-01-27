const Track = require('../models/Track');
const UserTrack = require('../models/UserTrack');
const Module = require('../models/Module');

class TrackService {
  static async getAllTracks() {
    return await Track.findAll();
  }

  static async getUserTracks(userId) {
    return await UserTrack.getUserTracks(userId);
  }

  static async getActiveTrack(userId) {
    const activeTrack = await UserTrack.getActiveTrack(userId);
    
    if (!activeTrack) {
      throw { status: 404, message: 'No active track found. Please select a track first.' };
    }

    return activeTrack;
  }

  static async selectActiveTrack(userId, trackId) {
    // Verify track exists
    const track = await Track.findById(trackId);
    
    if (!track) {
      throw { status: 404, message: 'Track not found' };
    }

    // Check if user is enrolled, if not enroll them
    const isEnrolled = await UserTrack.isEnrolled(userId, trackId);
    
    if (!isEnrolled) {
      await UserTrack.enrollUser(userId, trackId);
    }

    // Set as active track
    await UserTrack.setActiveTrack(userId, trackId);

    return await UserTrack.getActiveTrack(userId);
  }

  static async enrollInTrack(userId, trackId) {
    // Verify track exists
    const track = await Track.findById(trackId);
    
    if (!track) {
      throw { status: 404, message: 'Track not found' };
    }

    // Enroll user
    await UserTrack.enrollUser(userId, trackId);

    return { message: 'Successfully enrolled in track', track };
  }
}

module.exports = TrackService;

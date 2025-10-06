// /models/AudioMessage.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IAudioMessage extends Document {
  r2Url: string;      
  durationSeconds: number; 
  createdAt: Date;
}

const AudioMessageSchema: Schema = new Schema({
  r2Url: { type: String, required: true, unique: true },
  durationSeconds: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});


export default (mongoose.models.AudioMessage as mongoose.Model<IAudioMessage>) || 
               mongoose.model<IAudioMessage>('AudioMessage', AudioMessageSchema);
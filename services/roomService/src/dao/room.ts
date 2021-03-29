import { Mongoose, Document } from 'mongoose';
const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const RoomSchema = new Schema({
  roomid: {type: String, required: true, index: true},
  password: {type: String},
  roomname: {type: String},
  admins: {type: [String], default: undefined},
  creator: {type: String, required: true}
});

export interface Room extends Document {
    roomid: string;
    passsword?: string;
    roomname?: string;
    admins?: Array<String>;
    creator: string;
}
// This model is mapping to MongoDB 'room' collection
export const RoomModel = model('Room', RoomSchema, 'room');

export const createRoom = async (room_instance: Object) => {
    return await RoomModel.create(room_instance);
}

export const getRoomById = async (id: String) => {
    const filter = { roomid: id };
    return await RoomModel.findOne(filter);
}

export const updateRoomById = async (id: String, updated_info: Object) => {
    const filter = { roomid: id };
    return RoomModel.findOneAndUpdate(filter, updated_info);
}

export const addAdminToRoom = async (roomid: String, admin: String) => {
    getRoomById(roomid).then((room) => {
        let admins = room.admins;
        admins.push(admin);
        updateRoomById(roomid, room);
    });
}

export const removeAdminFromRoom = async (roomid: String, admin: String) => {
    getRoomById(roomid).then((room) => {
        let admins = room.admins;
        let index = admins.indexOf(admin);
        if (index > -1) {
            admins.splice(index, 1);
            updateRoomById(roomid, room);
        }
    });
}

export const deleteRoomById = async (id: String) => {
    return RoomModel.deleteOne({roomid: id});
}


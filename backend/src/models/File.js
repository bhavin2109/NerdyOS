import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['file', 'folder', 'config'], // 'config' for OS state files
            default: 'file',
        },
        content: {
            type: String, // Text content or JSON string for config
            default: '',
        },
        parentId: {
            type: String, // Using String ID from frontend (like 'root' or UUIDs) or ObjectId if strict
            default: 'root',
        },
        meta: {
            type: Object, // Extra metadata (position, size, icon, etc.)
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

const File = mongoose.model('File', fileSchema);

export default File;

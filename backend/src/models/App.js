import mongoose from 'mongoose';

const appSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true,
        },
        version: {
            type: String,
            required: true,
        },
        icon: {
            type: String, // URL or asset path
            required: true,
        },
        downloadUrl: {
            type: String, // URL or Internal App ID like 'nerdy-files'
            required: true,
        },
        publisher: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            default: 0
        },
        category: {
            type: String,
            default: 'Utility'
        }
    },
    {
        timestamps: true,
    }
);

const App = mongoose.model('App', appSchema);

export default App;

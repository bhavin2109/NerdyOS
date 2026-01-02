import App from '../models/App.js';
import User from '../models/User.js';

// @desc    Get all apps
// @route   GET /api/apps
// @access  Public
export const getApps = async (req, res) => {
    try {
        const apps = await App.find({});
        res.status(200).json(apps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my installed apps
// @route   GET /api/apps/my
// @access  Private
export const getMyApps = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('installedApps');
        res.status(200).json(user.installedApps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Install an app
// @route   POST /api/apps/install/:id
// @access  Private
export const installApp = async (req, res) => {
    try {
        const appId = req.params.id;

        // Check if app exists
        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }

        const user = await User.findById(req.user.id);

        if (user.installedApps.includes(appId)) {
            return res.status(400).json({ message: 'App already installed' });
        }

        user.installedApps.push(appId);
        await user.save();

        res.status(200).json({ message: `App ${app.name} installed` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove an app
// @route   DELETE /api/apps/install/:id
// @access  Private
export const removeApp = async (req, res) => {
    try {
        const appId = req.params.id;
        const user = await User.findById(req.user.id);

        user.installedApps = user.installedApps.filter(
            (id) => id.toString() !== appId
        );
        await user.save();

        res.status(200).json({ message: 'App removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Seed some initial apps (Dev helper)
// @route   POST /api/apps/seed
// @access  Public (should be protected in prod)
export const seedApps = async (req, res) => {
    try {
        await App.deleteMany({});

        const apps = [
            {
                name: 'NerdyFiles',
                description: 'File Manager',
                version: '1.0.0',
                icon: 'folder',
                downloadUrl: 'nerdy-files',
                publisher: 'NerdyOS'
            },
            {
                name: 'NerdySettings',
                description: 'System Settings',
                version: '1.0.0',
                icon: 'settings',
                downloadUrl: 'nerdy-settings',
                publisher: 'NerdyOS'
            },
            {
                name: 'Calculon',
                description: 'Calculator App',
                version: '0.9.0',
                icon: 'calculator',
                downloadUrl: 'calculon',
                publisher: 'Third Party'
            }
        ];

        await App.insertMany(apps);
        res.status(201).json({ message: 'Apps seeded' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

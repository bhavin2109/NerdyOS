import File from '../models/File.js';

// @desc    Get user files by parentId (optional)
// @route   GET /api/files
// @access  Private
export const getFiles = async (req, res) => {
    try {
        const { parentId } = req.query;
        const query = { user: req.user.id };

        if (parentId) {
            query.parentId = parentId;
        }

        const files = await File.find(query);
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a file or folder
// @route   POST /api/files
// @access  Private
export const createFile = async (req, res) => {
    try {
        const { name, type, content, parentId, meta } = req.body;

        const file = await File.create({
            user: req.user.id,
            name,
            type,
            content,
            parentId: parentId || 'root',
            meta: meta || {},
        });

        res.status(201).json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update file
// @route   PUT /api/files/:id
// @access  Private
export const updateFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the file user
        if (file.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedFile = await File.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json(updatedFile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
export const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the file user
        if (file.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await file.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sync OS State (Save/Get config)
// @route   POST /api/files/sync
// @access  Private
export const syncState = async (req, res) => {
    // This is a helper to quickly get/set a config file named '.os_state'
    try {
        const { content, meta } = req.body;

        let stateFile = await File.findOne({ user: req.user.id, type: 'config', name: '.os_state' });

        if (!stateFile) {
            stateFile = await File.create({
                user: req.user.id,
                name: '.os_state',
                type: 'config',
                content: content || '{}',
                meta: meta || {}
            });
        } else {
            stateFile = await File.findByIdAndUpdate(stateFile._id, {
                content: content || stateFile.content,
                meta: meta || stateFile.meta
            }, { new: true });
        }

        res.status(200).json(stateFile);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

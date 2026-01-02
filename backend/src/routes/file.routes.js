import express from 'express';
import { getFiles, createFile, updateFile, deleteFile, syncState } from '../controllers/file.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
    .get(getFiles)
    .post(createFile);

router.route('/:id')
    .put(updateFile)
    .delete(deleteFile);

router.post('/sync', syncState);

export default router;

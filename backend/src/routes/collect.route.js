import express from 'express';
import {
  saveAnalysis,
  updateAnalysis,
  deleteAnalysis
} from '../controllers/youtube.controller.js';
import {
  saveRedditPosts,
  updateRedditPosts,
  deleteByBrand as deleteRedditByBrand,
  deleteById as deleteRedditById
} from '../controllers/reddit.controller.js';
import {
  saveNews,
  deleteNews,
  updateNews
} from '../controllers/news.controller.js';

const router = express.Router();

// ========================
// YOUTUBE ROUTES
// ========================
router.post('/youtube/save', saveAnalysis);
router.put('/youtube/update', updateAnalysis);
delete('/youtube/:id', deleteAnalysis);

// ========================
// REDDIT ROUTES
// ========================
router.post('/reddit/save/:brand', saveRedditPosts);
router.put('/reddit/update/:brand', updateRedditPosts);
router.delete('/reddit/brand/:brand', deleteRedditByBrand);
router.delete('/reddit/:id', deleteRedditById);

// ========================
// NEWS ROUTES
// ========================
router.post('/news/save', saveNews);
router.put('/news/update', updateNews);
router.delete('/news/:id', deleteNews);

export default router;
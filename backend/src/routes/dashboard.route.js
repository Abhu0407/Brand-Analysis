import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getDashboardData,
  getRedditAnalytics,
  getYoutubeAnalytics,
  getNewsAnalytics,
  getLatestRedditPosts,
  getLatestYoutubePosts,
  getLatestNewsPosts,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// All dashboard routes require authentication
router.use(protectRoute);

// Get all dashboard data (all three sources)
router.get("/data", getDashboardData);

// Get individual source analytics
router.get("/reddit", getRedditAnalytics);
router.get("/youtube", getYoutubeAnalytics);
router.get("/news", getNewsAnalytics);

// Get latest posts for each source
router.get("/reddit/latest", getLatestRedditPosts);
router.get("/youtube/latest", getLatestYoutubePosts);
router.get("/news/latest", getLatestNewsPosts);

export default router;


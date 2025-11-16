import { Types } from "mongoose";
import RedditPost from "../models/reddit.model.js";
import YouTubeAnalysis from "../models/youtube.model.js";
import NewsMention from "../models/news.model.js";


// =========================
// Internal Logic Functions (Return data, don't send response)
// =========================

const fetchRedditData = async (brand) => {
    try {
        if (!brand) {
            throw new Error('Brand name is required');
        }

        // Get posts by brand
        const posts = await RedditPost.find({
            brand
        });

        if (posts.length === 0) {
            return {
                totalPosts: 0,
                averageLikes: 0,
                averageDislikes: 0,
                averageComments: 0,
                sentimentDistribution: {
                    positive: 0,
                    neutral: 0,
                    negative: 0
                },
                postsByDate: []
            };
        }

        // Calculate metrics
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
        const totalDislikes = posts.reduce((sum, post) => sum + (post.dislikes || 0), 0);
        const totalComments = posts.reduce((sum, post) => sum + (post.num_comments || 0), 0);

        const sentimentCount = posts.reduce((acc, post) => {
            acc[post.sentiment || 'neutral'] = (acc[post.sentiment || 'neutral'] || 0) + 1;
            return acc;
        }, { positive: 0, neutral: 0, negative: 0 });

        // Aggregate posts by date for charts
        // Use createdAt if date string is not parseable
        const postsByDate = posts.reduce((acc, post) => {
            let dateStr;
            try {
                // Try to parse the date string, fallback to createdAt
                if (post.date) {
                    const parsedDate = new Date(post.date);
                    if (!isNaN(parsedDate.getTime())) {
                        dateStr = parsedDate.toISOString().split('T')[0];
                    } else {
                        dateStr = new Date(post.createdAt).toISOString().split('T')[0];
                    }
                } else {
                    dateStr = new Date(post.createdAt).toISOString().split('T')[0];
                }
            } catch (e) {
                dateStr = new Date(post.createdAt).toISOString().split('T')[0];
            }

            const found = acc.find(d => d.date === dateStr);
            if (found) {
                found.count++;
            } else {
                acc.push({ date: dateStr, count: 1 });
            }
            return acc;
        }, []);

        return {
            totalPosts: posts.length,
            averageLikes: Math.round(totalLikes / posts.length),
            averageDislikes: Math.round(totalDislikes / posts.length),
            averageComments: Math.round(totalComments / posts.length),
            sentimentDistribution: {
                positive: Math.round((sentimentCount.positive / posts.length) * 100),
                neutral: Math.round((sentimentCount.neutral / posts.length) * 100),
                negative: Math.round((sentimentCount.negative / posts.length) * 100)
            },
            postsByDate: postsByDate.sort((a, b) => new Date(a.date) - new Date(b.date)),
        };
    } catch (error) {
        console.error('Error in fetchRedditData:', error);
        throw new Error('Server error while fetching Reddit data');
    }
};

const fetchYoutubeData = async (brand) => {
    try {
        if (!brand) {
            throw new Error('Brand name is required');
        }
        const analysis = await YouTubeAnalysis.findOne({ brand });

        if (!analysis || !analysis.videos || analysis.videos.length === 0) {
            return {
                totalVideos: 0,
                averageLikes: 0,
                averageComments: 0,
                sentimentDistribution: {
                    positive: 0,
                    neutral: 0,
                    negative: 0
                },
                postsByDate: []
            };
        }

        const filteredVideos = analysis.videos;

        // Calculate metrics
        const totalLikes = filteredVideos.reduce((sum, video) => sum + (video.likeCount || 0), 0);
        const totalComments = filteredVideos.reduce((sum, video) => sum + (video.commentCount || 0), 0);

        const sentimentCount = filteredVideos.reduce((acc, video) => {
            if (video.sentimentSummary) {
                const maxSentiment = Object.entries(video.sentimentSummary).reduce(
                    (max, [key, value]) => (value > max.value ? { key, value } : max),
                    { key: 'neutral', value: -1 }
                );
                acc[maxSentiment.key] = (acc[maxSentiment.key] || 0) + 1;
            } else {
                acc.neutral = (acc.neutral || 0) + 1;
            }
            return acc;
        }, { positive: 0, neutral: 0, negative: 0 });

        // Aggregate videos by date for charts
        const postsByDate = filteredVideos.reduce((acc, video) => {
            const date = new Date(video.publishedAt).toISOString().split('T')[0];
            const found = acc.find(d => d.date === date);
            if (found) {
                found.count++;
            } else {
                acc.push({ date, count: 1 });
            }
            return acc;
        }, []);

        return {
            totalVideos: filteredVideos.length,
            averageLikes: Math.round(totalLikes / filteredVideos.length),
            averageComments: Math.round(totalComments / filteredVideos.length),
            sentimentDistribution: {
                positive: Math.round((sentimentCount.positive / filteredVideos.length) * 100),
                neutral: Math.round((sentimentCount.neutral / filteredVideos.length) * 100),
                negative: Math.round((sentimentCount.negative / filteredVideos.length) * 100)
            },
            postsByDate: postsByDate.sort((a, b) => new Date(a.date) - new Date(b.date)),
        };
    } catch (error) {
        console.error('Error in fetchYoutubeData:', error);
        throw new Error('Server error while fetching YouTube data');
    }
};

const fetchNewsData = async (brand) => {
    try {
        if (!brand) {
            throw new Error('Brand name is required');
        }
        const newsMentions = await NewsMention.find({
            brand
        });

        if (newsMentions.length === 0) {
            return {
                totalMentions: 0,
                sentimentDistribution: {
                    positive: 0,
                    neutral: 0,
                    negative: 0
                },
                sentimentScores: {
                    average: 0,
                    min: 0,
                    max: 0
                },
                topSources: [],
                postsByDate: []
            };
        }

        // Calculate sentiment distribution
        const sentimentCount = newsMentions.reduce((acc, mention) => {
            acc[mention.sentiment] = (acc[mention.sentiment] || 0) + 1;
            return acc;
        }, { positive: 0, neutral: 0, negative: 0 });

        // Calculate sentiment scores
        const sentimentScores = newsMentions.map(m => m.sentimentScore || 0);
        const averageScore = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;

        // Get top sources
        const sourceCounts = newsMentions.reduce((acc, mention) => {
            acc[mention.site] = (acc[mention.site] || 0) + 1;
            return acc;
        }, {});

        const topSources = Object.entries(sourceCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([source, count]) => ({ source, count }));

        // Aggregate mentions by date for charts
        const postsByDate = newsMentions.reduce((acc, mention) => {
            const date = new Date(mention.publishedAt).toISOString().split('T')[0];
            const found = acc.find(d => d.date === date);
            if (found) {
                found.count++;
            } else {
                acc.push({ date, count: 1 });
            }
            return acc;
        }, []);

        return {
            totalMentions: newsMentions.length,
            sentimentDistribution: {
                positive: Math.round((sentimentCount.positive / newsMentions.length) * 100),
                neutral: Math.round((sentimentCount.neutral / newsMentions.length) * 100),
                negative: Math.round((sentimentCount.negative / newsMentions.length) * 100)
            },
            sentimentScores: {
                average: Math.round(averageScore),
                min: Math.round(Math.min(...sentimentScores)),
                max: Math.round(Math.max(...sentimentScores))
            },
            topSources,
            postsByDate: postsByDate.sort((a, b) => new Date(a.date) - new Date(b.date)),
        };
    } catch (error) {
        console.error('Error in fetchNewsData:', error);
        throw new Error('Server error while fetching news data');
    }
};

// =========================
// API Endpoint Controllers (Call logic functions and send response)
// =========================

export const getRedditAnalytics = async (req, res) => {
    try {
        const { brand } = req.query;
        const data = await fetchRedditData(brand);
        res.json(data);
    } catch (error) {
        console.error('Error in getRedditAnalytics controller:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export const getYoutubeAnalytics = async (req, res) => {
    try {
        const { brand } = req.query;
        const data = await fetchYoutubeData(brand);
        res.json(data);
    } catch (error) {
        console.error('Error in getYoutubeAnalytics controller:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export const getNewsAnalytics = async (req, res) => {
    try {
        const { brand } = req.query;
        const data = await fetchNewsData(brand);
        res.json(data);
    } catch (error) {
        console.error('Error in getNewsAnalytics controller:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

export const getDashboardData = async (req, res) => {
    try {
        const brand = req.query.brand || req.user?.brandName;

        if (!brand) {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        // Get analytics from all sources in parallel
        const [redditAnalytics, youtubeAnalytics, newsAnalytics] = await Promise.all([
            fetchRedditData(brand),
            fetchYoutubeData(brand),
            fetchNewsData(brand)
        ]);

        // Rename keys for frontend consistency
        youtubeAnalytics.totalPosts = youtubeAnalytics.totalVideos;
        delete youtubeAnalytics.totalVideos;

        newsAnalytics.totalPosts = newsAnalytics.totalMentions;
        delete newsAnalytics.totalMentions;

        res.json({
            reddit: redditAnalytics,
            youtube: youtubeAnalytics,
            news: newsAnalytics,
        });
    } catch (error) {
        console.error('Error in getDashboardData:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard data' });
    }
};

// =========================
// Latest Posts Endpoints
// =========================

export const getLatestRedditPosts = async (req, res) => {
    try {
        const brand = req.query.brand || req.user?.brandName;
        const limit = parseInt(req.query.limit) || 5;

        if (!brand) {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        // Get posts by brand, sorted by createdAt
        const posts = await RedditPost.find({
            brand
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('title content url date likes dislikes num_comments sentiment author createdAt')
            .lean();

        res.json(posts);
    } catch (error) {
        console.error('Error in getLatestRedditPosts:', error);
        res.status(500).json({ message: 'Server error while fetching latest Reddit posts' });
    }
};

export const getLatestYoutubePosts = async (req, res) => {
    try {
        const brand = req.query.brand || req.user?.brandName;
        const limit = parseInt(req.query.limit) || 5;

        if (!brand) {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        const analysis = await YouTubeAnalysis.findOne({ brand });

        if (!analysis || !analysis.videos || analysis.videos.length === 0) {
            return res.json([]);
        }

        const filteredVideos = analysis.videos
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, limit)
            .map(video => ({
                videoId: video.videoId,
                videoTitle: video.videoTitle,
                url: video.url,
                publishedAt: video.publishedAt,
                likeCount: video.likeCount,
                commentCount: video.commentCount,
                sentimentSummary: video.sentimentSummary
            }));

        res.json(filteredVideos);
    } catch (error) {
        console.error('Error in getLatestYoutubePosts:', error);
        res.status(500).json({ message: 'Server error while fetching latest YouTube posts' });
    }
};

export const getLatestNewsPosts = async (req, res) => {
    try {
        const brand = req.query.brand || req.user?.brandName;
        const limit = parseInt(req.query.limit) || 5;

        if (!brand) {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        const news = await NewsMention.find({
            brand
        })
            .sort({ publishedAt: -1 })
            .limit(limit)
            .select('site snippet publishedAt sentiment sentimentScore')
            .lean();

        res.json(news);
    } catch (error) {
        console.error('Error in getLatestNewsPosts:', error);
        res.status(500).json({ message: 'Server error while fetching latest news posts' });
    }
};

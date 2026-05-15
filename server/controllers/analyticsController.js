import Media from "../models/Media.js";

export const getAnalytics = async (req, res) => {
  try {
    const totalMedia = await Media.countDocuments();

    const totalViewsAgg = await Media.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    const totalDownloadsAgg = await Media.aggregate([
      { $group: { _id: null, total: { $sum: "$downloads" } } },
    ]);

    res.json({
      totalMedia,
      totalViews: totalViewsAgg[0]?.total || 0,
      totalDownloads: totalDownloadsAgg[0]?.total || 0,
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    res.status(500).json({ msg: "Failed to fetch analytics" });
  }
};
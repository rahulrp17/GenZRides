import * as historyService from "../services/history.service.js";

/* ===========================================================
   CUSTOMER RIDE HISTORY
=========================================================== */

export const getRideHistory = async (req, res) => {
  try {
    const result = await historyService.getRideHistory(
      req.user._id,
      {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        status: req.query.status || "",
        search: req.query.search || "",
        from: req.query.from || "",
        to: req.query.to || "",
        sort: req.query.sort || "newest",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Ride history fetched successfully.",
      data: result.rides,
      pagination: result.pagination,
      summary: result.summary,
    });
  } catch (error) {
    console.error("Ride History Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
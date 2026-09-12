import { generateInvoice } from "../services/invoice.service.js";

/* ===========================================================
   DOWNLOAD INVOICE
=========================================================== */

export const downloadInvoice = async (req, res) => {
  try {
    const pdf = await generateInvoice(
      req.params.bookingId,
      req.user
    );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${req.params.bookingId}.pdf`
    );

    pdf.pipe(res);
  } catch (error) {
    console.error("Invoice Error:", error);

    const isAuthError = /unauthor|not authorized|forbidden/i.test(error.message);
    return res.status(isAuthError ? 403 : 400).json({
      success: false,
      message: error.message,
    });
  }
};
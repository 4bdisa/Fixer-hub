import Report from '../models/Report.js';

// @desc   Create a new report
// @route  POST /api/reports
// @access Private (example - adjust as needed)
const createReport = async (req, res) => {
    try {
        const { requestId, reporterId, reportType, comment } = req.body;

        // Validation (example)
        if (!requestId || !reporterId || !reportType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const report = new Report({
            requestId,
            reporterId,
            reportType,
            comment: comment || ''
        });

        const savedReport = await report.save();
        res.status(201).json(savedReport);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating report', error: error.message });
    }
};

export { createReport };
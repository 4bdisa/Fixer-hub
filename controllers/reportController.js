import Report from '../models/Report.js';
import ServiceRequest from '../models/ServiceRequest.js';


const createReport = async (req, res) => {
    try {
        const { requestId, reporterId, reportType, comment } = req.body;

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

// @desc   Get all reports with relevant details, including the provider being reported and reporter info from ServiceRequest.customer
// @route  GET /api/reports
const getReports = async (req, res) => {
    try {
        // Find all reports, newest first, and populate requestId (ServiceRequest) and its customer (User) and providerId (User)
        const reports = await Report.find({})
            .sort({ createdAt: -1 }) // <-- Newest first
            .populate({
                path: "requestId",
                model: ServiceRequest,
                select: "category providerId description customer",
                populate: [
                    {
                        path: "customer",
                        model: "User",
                        select: "name email"
                    },
                    {
                        path: "providerId",
                        model: "User",
                        select: "name email"
                    }
                ]
            });

        // Build the response
        const reportsWithProvider = reports.map(report => {
            const request = report.requestId;
            const provider = request?.providerId;
            const customer = request?.customer;
            return {
                _id: report._id,
                requestId: request?._id,
                providerId: provider?._id || provider || null,
                providerName: provider?.name || 'Unknown',
                providerEmail: provider?.email || 'Unknown',
                reporterId: customer?._id || customer || null,
                reporterName: customer?.name || 'Unknown',
                reporterEmail: customer?.email || 'Unknown',
                reportType: report.reportType,
                comment: report.comment,
                createdAt: report.createdAt,
                requestCategory: request?.category,
                requestDescription: request?.description,
            };
        });

        
        res.status(200).json(reportsWithProvider);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching reports', error: error.message });
    }
};

// Check if a request has been reported by a user
export const checkIfReported = async (req, res) => {
    try {
        const { requestId, reporterId } = req.body;
        if (!requestId || !reporterId) {
            return res.status(400).json({ reported: false, message: "Missing requestId or reporterId" });
        }
        const report = await Report.findOne({ requestId, reporterId });
        res.status(200).json({ reported: !!report });
    } catch (error) {
        res.status(500).json({ reported: false, message: "Server error", error: error.message });
    }
};

export const deleteReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const report = await Report.findByIdAndDelete(reportId);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting report', error: error.message });
    }
};

export { createReport, getReports };
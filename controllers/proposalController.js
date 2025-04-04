import Proposal from "../models/Proposal.js";

// Send Proposal
export const sendProposal = async (req, res) => {
  const proposal = await Proposal.create({ serviceProvider: req.user.userId, ...req.body });
  res.status(201).json(proposal);
};

// Get Proposals by Service ID
export const getProposalsByService = async (req, res) => {
  const proposals = await Proposal.find({ service: req.params.serviceId }).populate("serviceProvider", "name");
  res.status(200).json(proposals);
};

// Accept Proposal
export const acceptProposal = async (req, res) => {
  const proposal = await Proposal.findByIdAndUpdate(req.params.proposalId, { status: "accepted" }, { new: true });
  res.status(200).json(proposal);
};

// Reject Proposal
export const rejectProposal = async (req, res) => {
  const proposal = await Proposal.findByIdAndUpdate(req.params.proposalId, { status: "rejected" }, { new: true });
  res.status(200).json(proposal);
};

// Mark Proposal as Completed
export const completeProposal = async (req, res) => {
  const proposal = await Proposal.findByIdAndUpdate(req.params.proposalId, { status: "completed" }, { new: true });
  res.status(200).json(proposal);
};

import Service from "../models/Service.js";

// Create Service
export const createService = async (req, res) => {
  const service = await Service.create({ provider: req.user.userId, ...req.body });
  res.status(201).json(service);
};

// Get All Services
export const getAllServices = async (req, res) => {
  const services = await Service.find().populate("provider", "name email");
  res.status(200).json(services);
};

// Get Service by ID
export const getServiceById = async (req, res) => {
  const service = await Service.findById(req.params.serviceId).populate("provider", "name email");
  res.status(200).json(service);
};

// Update Service
export const updateService = async (req, res) => {
  const updatedService = await Service.findByIdAndUpdate(req.params.serviceId, req.body, { new: true });
  res.status(200).json(updatedService);
};

// Delete Service
export const deleteService = async (req, res) => {
  await Service.findByIdAndDelete(req.params.serviceId);
  res.status(200).json({ message: "Service deleted successfully" });
};

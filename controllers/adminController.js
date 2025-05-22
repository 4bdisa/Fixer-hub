import Admin from "../models/adminModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Hash the password before saving

        const newAdmin = new Admin({ name, email, password });
        await newAdmin.save();

        res.status(201).json({ message: "Admin created successfully", newAdmin });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const loginAdmin = async (req, res) => {

    try {
        const { email, password } = req.body;

        // Find admin by email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare provided password with the hashed password stored in DB
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        // Create JWT token
        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET, // Ensure this environment variable is set
            { expiresIn: '1d' } // Token expires in 1 day
        );

        // Return successful response with token and admin details

        res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        console.error("Error logging in admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const getAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ data: admin });
    } catch (error) {
        console.error("Error fetching admin:", error);
        res.status(500).json({ message: "Server error" });
    }
};


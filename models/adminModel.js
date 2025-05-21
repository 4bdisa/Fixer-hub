import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin"],
        default: "admin",
    },
});

// Password comparison method
adminSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

// Pre-save middleware to hash password
adminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;

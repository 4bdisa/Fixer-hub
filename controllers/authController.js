import { generateToken } from "../utils/jwt.js";

// Handle Google OAuth Login Success
export const googleOAuthCallback = (req, res) => {
  const token = generateToken(req.user._id, req.user.role);
  res.json({ token, user: req.user }); // Send token and user details to frontend
};

// Logout User
export const logoutUser = (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "User logged out" });
  });
};


// export const handleGoogleCallback = async (req, res, next) => {
//   try {
//     const { email, name, picture } = req.user._json || {};

//     // Check if user exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
//     }

//     // Generate temporary JWT token (valid for 5 minutes)
//     const tempToken = jwt.sign(
//       { email, name, profileImage: picture },
//       process.env.JWT_SECRET,
//       { expiresIn: '5m' }
//     );

//     // Redirect to role selection page
//     res.redirect(`${process.env.CLIENT_URL}/select-role?token=${tempToken}`);
//   } catch (err) {
//     next(err);
//   }
// };









// Complete Service Provider Registration
export const completeServiceProvider = async (req, res) => {
  try {
    const { token, password, skills, location, workDays, experienceYears } = req.body;
    
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check for existing user
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new service provider
    const user = await User.create({
      ...decoded,
      role: 'service_provider',
      password: await bcrypt.hash(password, 10),
      skills: skills.split(',').map(skill => skill.trim()),
      location: {
        type: 'Point',
        coordinates: location
      },
      workDays,
      experienceYears
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Complete Client Registration
export const completeClient = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check for existing user
    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new client
    const user = await User.create({
      ...decoded,
      role: 'client',
      password: await bcrypt.hash(password, 10)
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
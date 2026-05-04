//getProfile
//createProfile
//updateProfile
//changePassword
import bcrypt from 'bcrypt';
import userModel from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();


export const getProfile = async (req, res) => {
    try {        const userId = req.user._id;
        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve profile', error: error.message });
    }
};

export const createProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }
    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({ name, email: normalizedEmail, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ message: 'Profile created successfully', user: { name: newUser.name, email: newUser.email } });
  }
    catch (error) {
    return res.status(500).json({ message: 'Failed to create profile', error: error.message });
  }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (name) user.name = name;
        if (email) user.email = email;
        await user.save();
        return res.status(200).json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email } });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

export const changePassword = async (req, res) => {
    try{
        const userId = req.user._id;
        const {currentPassword,newPassword} =req.body;
        const user = await userModel.findById(userId); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password); 
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save(); 
        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to change password', error: error.message });



    }
};





import { Request, Response } from 'express';
import { Advocate, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

// Add Advocate (Admin Only)
export const addAdvocate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name, phone, email, enrollmentNumber, enrollmentDate,
      specialization, court, city, state, experience,
      photo, bio, address, availability
    } = req.body;

    if (!name || !phone || !email || !enrollmentNumber || !enrollmentDate || !specialization || !court || !city || !state || !experience) {
      return res.status(400).json({ success: false, message: 'All primary advocate fields are required.' });
    }

    const newAdvocate = await Advocate.create({
      name,
      phone,
      email,
      enrollmentNumber,
      enrollmentDate,
      specialization,
      court,
      city,
      state,
      experience: Number(experience),
      photo: photo || '',
      bio: bio || '',
      address: address || '',
      availability: availability || 'Available',
      isVerified: false // Default to unverified until approved
    });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: 'Admin',
      action: 'ADVOCATE_CREATED',
      ip: req.ip || '127.0.0.1',
      details: `Created advocate profile: ${name} (Enrollment: ${enrollmentNumber})`
    });

    return res.status(201).json({
      success: true,
      message: 'Advocate profile added successfully. Awaiting validation.',
      advocate: newAdvocate
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error adding advocate.' });
  }
};

// Search, Filter & Sort Advocates
export const getAdvocates = async (req: Request, res: Response) => {
  try {
    const { search, state, court, practiceArea, enrollmentYear, minExperience, sortBy } = req.query;

    let query: any = {};

    // Global Search matching multiple fields
    if (search) {
      const searchRegex = { $regex: String(search), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { city: searchRegex },
        { enrollmentNumber: searchRegex },
        { enrollmentDate: searchRegex }, // Match year inside dates
        { specialization: searchRegex },
        { court: searchRegex }
      ];
    }

    // Individual Filters
    if (state) query.state = String(state);
    if (court) query.court = { $regex: String(court), $options: 'i' };
    if (practiceArea) query.specialization = { $regex: String(practiceArea), $options: 'i' };
    if (enrollmentYear) {
      query.enrollmentDate = { $regex: String(enrollmentYear), $options: 'i' };
    }
    
    let advocates = await Advocate.find(query);

    if (minExperience) {
      advocates = advocates.filter((a: any) => a.experience >= Number(minExperience));
    }

    // Sorting logic
    if (sortBy) {
      const sortStr = String(sortBy);
      advocates.sort((a: any, b: any) => {
        if (sortStr === 'Alphabetically') {
          return a.name.localeCompare(b.name);
        } else if (sortStr === 'Experience') {
          return b.experience - a.experience;
        } else if (sortStr === 'City') {
          return a.city.localeCompare(b.city);
        } else {
          // Default: Recently Added
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        }
      });
    }

    return res.status(200).json({
      success: true,
      count: advocates.length,
      advocates
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving advocate list.' });
  }
};

// Get Single Advocate details
export const getAdvocateById = async (req: Request, res: Response) => {
  try {
    const advocate = await Advocate.findById(req.params.id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
    }
    return res.status(200).json({ success: true, advocate });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching advocate details.' });
  }
};

// Verify Advocate credentials (Admin only)
export const verifyAdvocate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // true = verified, false = unverified

    const advocate = await Advocate.findById(id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate not found.' });
    }

    const updated = await Advocate.findByIdAndUpdate(id, { isVerified: status === true }, { new: true });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: 'Admin',
      action: 'ADVOCATE_VERIFIED',
      ip: req.ip || '127.0.0.1',
      details: `${status === true ? 'Approved' : 'Revoked'} credentials for advocate: ${advocate.name}`
    });

    return res.status(200).json({
      success: true,
      message: `Advocate verification status updated successfully to ${status === true ? 'Verified' : 'Unverified'}.`,
      advocate: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error verifying credentials.' });
  }
};

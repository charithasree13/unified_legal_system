import { Request, Response } from 'express';
import { Advocate, User, AuditLog } from '../models/Schemas';
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
      const sanitized = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (sanitized) {
        const searchRegex = { $regex: sanitized, $options: 'i' };
        query.$or = [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { city: searchRegex },
          { state: searchRegex },
          { enrollmentNumber: searchRegex },
          { enrollmentDate: searchRegex },
          { specialization: searchRegex },
          { court: searchRegex }
        ];
      }
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

// Update Advocate details (Admin Only)
export const updateAdvocate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const advocate = await Advocate.findById(id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
    }

    const {
      name, phone, email, enrollmentNumber, enrollmentDate,
      specialization, court, city, state, experience,
      photo, bio, address, availability, isVerified
    } = req.body;

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (phone !== undefined) updatedData.phone = phone;
    if (email !== undefined) updatedData.email = email;
    if (enrollmentNumber !== undefined) updatedData.enrollmentNumber = enrollmentNumber;
    if (enrollmentDate !== undefined) updatedData.enrollmentDate = enrollmentDate;
    if (specialization !== undefined) updatedData.specialization = specialization;
    if (court !== undefined) updatedData.court = court;
    if (city !== undefined) updatedData.city = city;
    if (state !== undefined) updatedData.state = state;
    if (experience !== undefined) updatedData.experience = Number(experience);
    if (photo !== undefined) updatedData.photo = photo;
    if (bio !== undefined) updatedData.bio = bio;
    if (address !== undefined) updatedData.address = address;
    if (availability !== undefined) updatedData.availability = availability;
    if (isVerified !== undefined) updatedData.isVerified = isVerified === true || isVerified === 'true';

    const updatedAdvocate = await Advocate.findByIdAndUpdate(id, updatedData, { new: true });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: 'Admin',
      action: 'ADVOCATE_UPDATED',
      ip: req.ip || '127.0.0.1',
      details: `Updated advocate profile details for ${advocate.name}`
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate details updated successfully.',
      advocate: updatedAdvocate
    });
  } catch (error) {
    console.error('Error updating advocate:', error);
    return res.status(500).json({ success: false, message: 'Internal server error updating advocate.' });
  }
};

// Delete Advocate profile (Admin Only)
export const deleteAdvocate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const advocate = await Advocate.findById(id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
    }

    await Advocate.findByIdAndDelete(id);

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: 'Admin',
      action: 'ADVOCATE_DELETED',
      ip: req.ip || '127.0.0.1',
      details: `Deleted advocate profile: ${advocate.name} (Enrollment: ${advocate.enrollmentNumber || 'N/A'})`
    });

    return res.status(200).json({
      success: true,
      message: `Advocate profile for ${advocate.name} deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting advocate:', error);
    return res.status(500).json({ success: false, message: 'Internal server error deleting advocate.' });
  }
};

// Advocate Onboarding - Self-Service Directory Profile Completion
export const selfOnboardAdvocateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'Advocate') {
      return res.status(403).json({ success: false, message: 'Only advocate accounts can submit advocate profile details.' });
    }

    const {
      name, phone, email, enrollmentNumber, enrollmentDate,
      specialization, court, city, state, experience,
      photo, bio, address
    } = req.body;

    if (!name || !phone || !email || !enrollmentNumber || !enrollmentDate || !specialization || !court || !city || !state) {
      return res.status(400).json({ success: false, message: 'Please provide all required advocate profile details.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanEnrollment = enrollmentNumber.trim();

    // Check if advocate record exists
    let advocate = await Advocate.findOne({
      $or: [
        { email: cleanEmail },
        { phone: cleanPhone },
        ...(cleanEnrollment ? [{ enrollmentNumber: cleanEnrollment }] : [])
      ]
    });

    if (advocate) {
      advocate = await Advocate.findByIdAndUpdate(advocate._id, {
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        enrollmentNumber: cleanEnrollment,
        enrollmentDate: enrollmentDate.trim(),
        specialization: Array.isArray(specialization) ? specialization.join(', ') : String(specialization),
        court: Array.isArray(court) ? court.join(', ') : String(court),
        city: city.trim(),
        state: state.trim(),
        experience: Number(experience || 1),
        photo: photo || advocate.photo || '',
        bio: bio ? bio.trim() : '',
        address: address ? address.trim() : '',
        isVerified: false // Unverified initially - requires Admin verification
      }, { new: true });
    } else {
      advocate = await Advocate.create({
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        enrollmentNumber: cleanEnrollment,
        enrollmentDate: enrollmentDate.trim(),
        specialization: Array.isArray(specialization) ? specialization.join(', ') : String(specialization),
        court: Array.isArray(court) ? court.join(', ') : String(court),
        city: city.trim(),
        state: state.trim(),
        experience: Number(experience || 1),
        photo: photo || '',
        bio: bio ? bio.trim() : '',
        address: address ? address.trim() : '',
        availability: 'Available',
        isVerified: false // Unverified initially - requires Admin verification
      });
    }

    // Update User record to mark profile completed
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
      hasCompletedProfile: true,
      enrollmentNumber: cleanEnrollment,
      phone: cleanPhone,
      email: cleanEmail,
      name: name.trim()
    }, { new: true });

    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name,
      role: 'Advocate',
      action: 'ADVOCATE_ONBOARDING_COMPLETED',
      ip: req.ip || '127.0.0.1',
      details: `Advocate submitted directory profile: ${name} (Enrollment: ${cleanEnrollment}). Awaiting Admin verification.`
    });

    return res.status(200).json({
      success: true,
      message: 'Advocate profile details published successfully! Your profile has been added to the directory and is pending Administrator verification.',
      advocate,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        enrollmentNumber: updatedUser.enrollmentNumber,
        hasCompletedProfile: true
      }
    });
  } catch (error: any) {
    console.error('Error in selfOnboardAdvocateProfile:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit advocate directory profile.' });
  }
};

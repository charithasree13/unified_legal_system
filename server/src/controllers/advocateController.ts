import { Request, Response } from 'express';
import { Advocate, User, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

// Add Advocate (Admin or Advocate Authorized)
export const addAdvocate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name, phone, email, enrollmentNumber, enrollmentDate,
      specialization, court, city, state, experience,
      photo, bio, address, availability
    } = req.body;

    if (!name || !phone || !email || !enrollmentNumber || !enrollmentDate || !specialization || !court) {
      return res.status(400).json({ success: false, message: 'Primary advocate details (name, phone, email, enrollment, specialization, court) are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();
    const cleanEnrollment = String(enrollmentNumber).trim();

    // Check if advocate profile with same enrollment, email or phone already exists
    let existing = await Advocate.findOne({
      $or: [
        { email: cleanEmail },
        { phone: cleanPhone },
        ...(cleanEnrollment ? [{ enrollmentNumber: cleanEnrollment }] : [])
      ]
    });

    if (existing) {
      existing = await Advocate.findByIdAndUpdate(existing._id, {
        name: String(name).trim(),
        phone: cleanPhone,
        email: cleanEmail,
        enrollmentNumber: cleanEnrollment,
        enrollmentDate: String(enrollmentDate).trim(),
        specialization: Array.isArray(specialization) ? specialization.join(', ') : String(specialization),
        court: Array.isArray(court) ? court.join(', ') : String(court),
        city: String(city || 'National Practice').trim(),
        state: String(state || 'All India').trim(),
        experience: Number(experience || 1),
        photo: photo || existing.photo || '',
        bio: bio ? String(bio).trim() : existing.bio || '',
        address: address ? String(address).trim() : existing.address || '',
        availability: availability || existing.availability || 'Available',
        isVerified: true
      }, { new: true });

      return res.status(200).json({
        success: true,
        message: `Advocate profile updated successfully.`,
        advocate: existing
      });
    }

    const newAdvocate = await Advocate.create({
      name: String(name).trim(),
      phone: cleanPhone,
      email: cleanEmail,
      enrollmentNumber: cleanEnrollment,
      enrollmentDate: String(enrollmentDate).trim(),
      specialization: Array.isArray(specialization) ? specialization.join(', ') : String(specialization),
      court: Array.isArray(court) ? court.join(', ') : String(court),
      city: String(city || 'National Practice').trim(),
      state: String(state || 'All India').trim(),
      experience: Number(experience || 1),
      photo: photo || '',
      bio: bio ? String(bio).trim() : '',
      address: address ? String(address).trim() : '',
      availability: availability || 'Available',
      isVerified: true // Admin-added/indexed profiles are verified automatically
    });

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: req.user?.role || 'Admin',
      action: 'ADVOCATE_CREATED',
      ip: req.ip || '127.0.0.1',
      details: `Created advocate profile: ${name} (Enrollment: ${cleanEnrollment})`
    });

    return res.status(201).json({
      success: true,
      message: 'Advocate profile added and published successfully to the directory.',
      advocate: newAdvocate
    });
  } catch (error: any) {
    console.error('Error adding advocate:', error);
    return res.status(500).json({ success: false, message: 'Internal server error adding advocate.' });
  }
};

// Search, Filter & Sort Advocates (Fetches from MongoDB Atlas Advocates & Users collections)
export const getAdvocates = async (req: Request, res: Response) => {
  try {
    const { search, state, court, practiceArea, enrollmentYear, minExperience, sortBy } = req.query;

    // Fetch from advocates collection in MongoDB Atlas
    const rawAdvocates = await Advocate.find({});

    // Fetch from users collection for Advocate role accounts or accounts with enrollment numbers
    const advocateUsers = await User.find({
      $or: [
        { role: 'Advocate' },
        { enrollmentNumber: { $exists: true, $ne: '' } }
      ]
    });

    const map = new Map<string, any>();

    // Helper function to normalize advocate data objects from MongoDB
    const normalize = (doc: any) => {
      const obj = doc.toObject ? doc.toObject() : { ...doc };
      const emailKey = String(obj.email || '').toLowerCase().trim();
      const phoneKey = String(obj.phone || '').trim();
      const enrollKey = String(obj.enrollmentNumber || '').trim();
      const idKey = String(obj._id || emailKey || phoneKey || enrollKey);

      return {
        _id: obj._id ? String(obj._id) : idKey,
        name: obj.name || 'Practicing Advocate',
        phone: obj.phone || 'N/A',
        email: obj.email || 'N/A',
        enrollmentNumber: obj.enrollmentNumber || (obj.enrollmentYear ? `BAR/${obj.enrollmentYear}` : 'AP/298/1998'),
        enrollmentDate: obj.enrollmentDate || (obj.enrollmentYear ? `${obj.enrollmentYear}-01-01` : '1998-03-05'),
        specialization: obj.specialization || 'Civil Litigation, Notary, Bank legal advisors',
        court: obj.court || 'Senior civil judges court, Junior civil Judges court, High Court',
        city: obj.city || 'Madanapalle',
        state: obj.state || 'Andhra Pradesh',
        experience: Number(obj.experience || 15),
        photo: obj.profilePhoto || obj.photo || '',
        bio: obj.bio || 'Verified legal practitioner registered with Bar Council.',
        address: obj.address || 'Chamber / Court Complex',
        availability: obj.availability || 'Available',
        isVerified: obj.isVerified !== false, // default true so all MongoDB records display
        createdAt: obj.createdAt || new Date().toISOString()
      };
    };

    // 1. Map documents from Advocates collection
    for (const item of rawAdvocates) {
      const norm = normalize(item);
      const key = (norm.email && norm.email !== 'N/A' ? norm.email : norm.phone) || norm._id;
      map.set(key, norm);
    }

    // 2. Map & merge advocate accounts from Users collection
    for (const u of advocateUsers) {
      const norm = normalize(u);
      const key = (norm.email && norm.email !== 'N/A' ? norm.email : norm.phone) || norm._id;
      if (!map.has(key)) {
        map.set(key, norm);
      } else {
        const existing = map.get(key);
        map.set(key, { ...norm, ...existing });
      }
    }

    // 3. Fallback auto-seed if database collection is empty
    if (map.size === 0) {
      const defaults = [
        {
          name: "P V Prasad",
          phone: "9247253096",
          email: "pvprasadvmpl@gmail.com",
          enrollmentNumber: "AP/298/1998",
          enrollmentDate: "1998-03-05",
          specialization: "Civil Litigation, Notary, Bank legal advisors",
          court: "Senior civil judges court, Junior civil Judges court, Judicial magistrate of 1st class",
          city: "Madanapalle",
          state: "Andhra Pradesh",
          experience: 28,
          bio: "Advocate, Notary, Bank Panel Advocate, Verification of legal title",
          address: "Vasavi Bhavan Street, Madanapalle",
          availability: "Available",
          isVerified: true
        },
        {
          name: "Bestha Sreenivasulu  Advocate",
          phone: "9441135084",
          email: "bsreenivasadv@gmail.com",
          enrollmentNumber: "AP/32/2008",
          enrollmentDate: "2008-01-24",
          specialization: "Civil Litigation",
          court: "Senior civil judges court",
          city: "Madanapalle",
          state: "Andhra Pradesh",
          experience: 16,
          bio: "Verified legal practitioner registered with Bar Council.",
          address: "2-245-8-B-7, Madanapalle",
          availability: "Available",
          isVerified: true
        }
      ];

      for (const d of defaults) {
        try {
          const created = await Advocate.create(d);
          const norm = normalize(created);
          map.set(norm.email, norm);
        } catch (e) {
          const norm = normalize(d);
          map.set(norm.email, norm);
        }
      }
    }

    let advocatesList = Array.from(map.values());

    // Apply global search query filter
    if (search) {
      const s = String(search).toLowerCase().trim();
      advocatesList = advocatesList.filter((a: any) =>
        String(a.name || '').toLowerCase().includes(s) ||
        String(a.email || '').toLowerCase().includes(s) ||
        String(a.phone || '').toLowerCase().includes(s) ||
        String(a.city || '').toLowerCase().includes(s) ||
        String(a.state || '').toLowerCase().includes(s) ||
        String(a.enrollmentNumber || '').toLowerCase().includes(s) ||
        String(a.specialization || '').toLowerCase().includes(s) ||
        String(a.court || '').toLowerCase().includes(s)
      );
    }

    // Apply State filter
    if (state && String(state).trim() !== '' && String(state) !== 'State (All)') {
      const st = String(state).toLowerCase().trim();
      advocatesList = advocatesList.filter((a: any) => 
        String(a.state || '').toLowerCase().includes(st) || st.includes(String(a.state || '').toLowerCase())
      );
    }

    // Apply Court filter
    if (court && String(court).trim() !== '' && String(court) !== 'Court (All)') {
      const crt = String(court).toLowerCase().trim();
      advocatesList = advocatesList.filter((a: any) => String(a.court || '').toLowerCase().includes(crt));
    }

    // Apply Specialization filter
    if (practiceArea && String(practiceArea).trim() !== '' && String(practiceArea) !== 'Specialization (All)') {
      const pa = String(practiceArea).toLowerCase().trim();
      advocatesList = advocatesList.filter((a: any) => String(a.specialization || '').toLowerCase().includes(pa));
    }

    // Apply Minimum Experience filter
    if (minExperience) {
      advocatesList = advocatesList.filter((a: any) => Number(a.experience || 0) >= Number(minExperience));
    }

    // Apply Sorting
    if (sortBy) {
      const sortStr = String(sortBy);
      advocatesList.sort((a: any, b: any) => {
        if (sortStr === 'Alphabetically') {
          return String(a.name || '').localeCompare(String(b.name || ''));
        } else if (sortStr === 'Experience') {
          return Number(b.experience || 0) - Number(a.experience || 0);
        } else if (sortStr === 'City') {
          return String(a.city || '').localeCompare(String(b.city || ''));
        } else {
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        }
      });
    }

    return res.status(200).json({
      success: true,
      count: advocatesList.length,
      advocates: advocatesList
    });
  } catch (error: any) {
    console.error('Error retrieving advocate list:', error);
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

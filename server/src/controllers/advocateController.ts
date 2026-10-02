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

// Search, Filter & Sort Advocates (Public Advocate Directory - Approved Advocates ONLY)
export const getAdvocates = async (req: Request, res: Response) => {
  try {
    const { search, state, court, practiceArea, minExperience, sortBy } = req.query;

    // Fetch from advocates collection in MongoDB Atlas
    const rawAdvocates = await Advocate.find({ isVerified: true });

    // Fetch from users collection for Advocate role accounts that are approved/verified
    const advocateUsers = await User.find({
      role: 'Advocate',
      isVerified: true
    });

    const map = new Map<string, any>();

    // Helper function to normalize advocate data objects from MongoDB
    const normalize = (doc: any) => {
      const obj = doc.toObject ? doc.toObject() : { ...doc };
      const emailKey = String(obj.email || '').toLowerCase().trim();
      const phoneKey = String(obj.phone || '').trim();
      const enrollKey = String(obj.enrollmentNumber || '').trim();
      const idKey = String(obj._id || emailKey || phoneKey || enrollKey);

      const enrollDateStr = String(obj.enrollmentDate || obj.enrollmentNumber || '');
      const currentYear = new Date().getFullYear();
      let calculatedExp = Number(obj.experience || 0);

      const match = enrollDateStr.match(/\b(19\d\d|20\d\d)\b/);
      if (match) {
        const enrollYear = parseInt(match[1], 10);
        if (enrollYear > 0 && enrollYear <= currentYear) {
          calculatedExp = Math.max(0, currentYear - enrollYear);
        }
      }

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
        experience: calculatedExp || Number(obj.experience || 15),
        photo: obj.profilePhoto || obj.photo || '',
        bio: obj.bio || 'Verified legal practitioner registered with Bar Council.',
        address: obj.address || 'Chamber / Court Complex',
        availability: obj.availability || 'Available',
        isVerified: obj.isVerified === true,
        verificationStatus: obj.verificationStatus || 'APPROVED',
        createdAt: obj.createdAt || new Date().toISOString()
      };
    };

    // 1. Map documents from Advocates collection
    for (const item of rawAdvocates) {
      if (item.isVerified === true && item.verificationStatus !== 'PENDING' && item.verificationStatus !== 'REJECTED') {
        const norm = normalize(item);
        const key = (norm.email && norm.email !== 'N/A' ? norm.email : norm.phone) || norm._id;
        map.set(key, norm);
      }
    }

    // 2. Map & merge advocate accounts from Users collection
    for (const u of advocateUsers) {
      if (u.isVerified === true && u.verificationStatus !== 'PENDING' && u.verificationStatus !== 'REJECTED') {
        const norm = normalize(u);
        const key = (norm.email && norm.email !== 'N/A' ? norm.email : norm.phone) || norm._id;
        if (!map.has(key)) {
          map.set(key, norm);
        } else {
          const existing = map.get(key);
          map.set(key, { ...norm, ...existing });
        }
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
          isVerified: true,
          verificationStatus: "APPROVED"
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
          isVerified: true,
          verificationStatus: "APPROVED"
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

    // STRICT CHECK: Ensure directory output contains ONLY approved/verified advocates
    advocatesList = advocatesList.filter((a: any) => a.isVerified === true && a.verificationStatus !== 'PENDING' && a.verificationStatus !== 'REJECTED');

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

// Get Pending Advocate Applications (Admin Only)
export const getPendingAdvocates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    }

    const pendingAdvocates = await Advocate.find({
      $or: [
        { isVerified: false },
        { verificationStatus: 'PENDING' }
      ]
    });

    const pendingUsers = await User.find({
      role: 'Advocate',
      isVerified: false
    });

    const map = new Map<string, any>();
    for (const item of pendingAdvocates) {
      if (item.verificationStatus !== 'APPROVED') {
        const obj = item.toObject ? item.toObject() : { ...item };
        const key = obj.email || obj.phone || String(obj._id);
        map.set(key, obj);
      }
    }

    for (const u of pendingUsers) {
      if (u.verificationStatus !== 'APPROVED') {
        const obj = u.toObject ? u.toObject() : { ...u };
        const key = obj.email || obj.phone || String(obj._id);
        if (!map.has(key)) {
          map.set(key, {
            _id: obj._id,
            name: obj.name,
            email: obj.email,
            phone: obj.phone,
            enrollmentNumber: obj.enrollmentNumber || 'Pending Submission',
            isVerified: false,
            verificationStatus: 'PENDING',
            authProvider: obj.authProvider || 'LOCAL',
            createdAt: obj.createdAt
          });
        }
      }
    }

    const pendingList = Array.from(map.values());
    pendingList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.status(200).json({
      success: true,
      count: pendingList.length,
      advocates: pendingList
    });
  } catch (error) {
    console.error('Error fetching pending advocates:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch pending advocate applications.' });
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

// Verify/Approve or Reject Advocate credentials (Admin only)
export const verifyAdvocate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Only Admins can approve or reject Advocate verification requests.' });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const advocate = await Advocate.findById(id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
    }

    const isApproved = status === true || status === 'true' || status === 'APPROVED' || status === 'approved';
    const isRejected = status === false || status === 'false' || status === 'REJECTED' || status === 'rejected';

    const newVerificationStatus = isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'PENDING');
    const newIsVerified = isApproved;

    const updated = await Advocate.findByIdAndUpdate(id, {
      isVerified: newIsVerified,
      verificationStatus: newVerificationStatus,
      rejectionReason: isRejected ? (rejectionReason || 'Application details did not meet Bar Council verification standards.') : undefined,
      verifiedAt: new Date(),
      verifiedBy: req.user?.id || 'system'
    }, { new: true });

    // Update associated User account if one exists
    try {
      await User.updateMany(
        { $or: [{ email: advocate.email.toLowerCase() }, { phone: advocate.phone }, { googleSub: advocate.googleSub }] },
        {
          isVerified: newIsVerified,
          verificationStatus: newVerificationStatus
        }
      );
    } catch (uErr) { }

    await AuditLog.create({
      userId: req.user?.id || 'system',
      userName: req.user?.name || 'Administrator',
      role: 'Admin',
      action: isApproved ? 'ADVOCATE_APPROVED' : 'ADVOCATE_REJECTED',
      ip: req.ip || '127.0.0.1',
      details: `${isApproved ? 'Approved' : 'Rejected'} verification for advocate: ${advocate.name} (Enrollment: ${advocate.enrollmentNumber})`
    });

    return res.status(200).json({
      success: true,
      message: isApproved 
        ? 'Advocate verified successfully. The Advocate is now visible in the Advocate Directory.' 
        : 'Advocate registration has been rejected.',
      advocate: updated
    });
  } catch (error) {
    console.error('Error in verifyAdvocate:', error);
    return res.status(500).json({ success: false, message: 'Error updating advocate verification status.' });
  }
};

// Update Advocate details (Admin or Advocate OWN profile ONLY)
export const updateAdvocate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'advocate') {
      return res.status(403).json({ success: false, message: 'Normal users cannot edit advocate information.' });
    }

    const { id } = req.params;
    const advocate = await Advocate.findById(id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
    }

    // Ownership Security Check for Advocates
    if (roleLower === 'advocate') {
      const userEmail = (req.user.email || '').toLowerCase().trim();
      const userPhone = (req.user.phone || '').trim();
      const advEmail = (advocate.email || '').toLowerCase().trim();
      const advPhone = (advocate.phone || '').trim();

      const isOwner = (userEmail && userEmail === advEmail) || 
                      (userPhone && userPhone === advPhone) ||
                      (req.user.googleSub && req.user.googleSub === advocate.googleSub) ||
                      (String(req.user.id) === String(advocate._id));

      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'You are not authorized to modify this Advocate profile.' });
      }
    }

    const {
      name, phone, email, enrollmentNumber, enrollmentDate,
      specialization, court, city, state, experience,
      photo, bio, address, availability, isVerified, verificationStatus
    } = req.body;

    const updatedData: any = {};
    if (name !== undefined) updatedData.name = name;
    if (phone !== undefined) updatedData.phone = phone;
    if (email !== undefined) updatedData.email = email;
    if (enrollmentNumber !== undefined) updatedData.enrollmentNumber = enrollmentNumber;
    if (enrollmentDate !== undefined) updatedData.enrollmentDate = enrollmentDate;
    if (specialization !== undefined) updatedData.specialization = Array.isArray(specialization) ? specialization.join(', ') : String(specialization);
    if (court !== undefined) updatedData.court = Array.isArray(court) ? court.join(', ') : String(court);
    if (city !== undefined) updatedData.city = city;
    if (state !== undefined) updatedData.state = state;
    if (experience !== undefined) updatedData.experience = Number(experience);
    if (photo !== undefined) updatedData.photo = photo;
    if (bio !== undefined) updatedData.bio = bio;
    if (address !== undefined) updatedData.address = address;
    if (availability !== undefined) updatedData.availability = availability;

    // ONLY Admins can modify verification status directly
    if (roleLower === 'admin') {
      if (isVerified !== undefined) updatedData.isVerified = isVerified === true || isVerified === 'true';
      if (verificationStatus !== undefined) updatedData.verificationStatus = verificationStatus;
    }

    const updatedAdvocate = await Advocate.findByIdAndUpdate(id, updatedData, { new: true });

    await AuditLog.create({
      userId: req.user.id || 'system',
      userName: req.user.name || 'User',
      role: req.user.role,
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

// Delete Advocate profile (ONLY Admin Can Delete)
export const deleteAdvocate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only Admins can delete Advocate profiles.' });
    }

    const { id } = req.params;
    const advocate = await Advocate.findById(id);
    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
    }

    await Advocate.findByIdAndDelete(id);

    await AuditLog.create({
      userId: req.user.id || 'system',
      userName: req.user.name || 'Administrator',
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

// Advocate Onboarding - Self-Service Directory Profile Completion (Submits details & sets status to PENDING)
export const selfOnboardAdvocateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (!req.user || (roleLower !== 'advocate' && roleLower !== 'admin')) {
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

    // Check if advocate record exists by enrollment, email or phone
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
        enrollmentDate: String(enrollmentDate).trim(),
        specialization: Array.isArray(specialization) ? specialization.join(', ') : String(specialization),
        court: Array.isArray(court) ? court.join(', ') : String(court),
        city: city.trim(),
        state: String(state).trim(),
        experience: Number(experience || 1),
        photo: photo || advocate.photo || '',
        bio: bio ? String(bio).trim() : '',
        address: address ? String(address).trim() : '',
        googleSub: (req.user as any).googleSub || advocate.googleSub,
        isVerified: advocate.isVerified === true, // Keep existing verification state if already approved
        verificationStatus: advocate.verificationStatus || (advocate.isVerified ? 'APPROVED' : 'PENDING')
      }, { new: true });
    } else {
      advocate = await Advocate.create({
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        enrollmentNumber: cleanEnrollment,
        enrollmentDate: String(enrollmentDate).trim(),
        specialization: Array.isArray(specialization) ? specialization.join(', ') : String(specialization),
        court: Array.isArray(court) ? court.join(', ') : String(court),
        city: city.trim(),
        state: String(state).trim(),
        experience: Number(experience || 1),
        photo: photo || '',
        bio: bio ? String(bio).trim() : '',
        address: address ? String(address).trim() : '',
        availability: 'Available',
        googleSub: (req.user as any).googleSub,
        isVerified: false, // Unverified initially - requires Admin verification
        verificationStatus: 'PENDING'
      });
    }

    // Update User record to mark profile completed and set PENDING status
    let updatedUser: any = null;
    try {
      if (req.user.id) {
        updatedUser = await User.findByIdAndUpdate(req.user.id, {
          hasCompletedProfile: true,
          enrollmentNumber: cleanEnrollment,
          phone: cleanPhone,
          email: cleanEmail,
          name: name.trim(),
          isVerified: advocate.isVerified === true,
          verificationStatus: advocate.verificationStatus || 'PENDING'
        }, { new: true });
      }
    } catch (uErr) { }

    try {
      await AuditLog.create({
        userId: req.user.id || 'system',
        userName: req.user.name || name.trim(),
        role: req.user.role || 'Advocate',
        action: 'ADVOCATE_ONBOARDING_COMPLETED',
        ip: req.ip || '127.0.0.1',
        details: `Advocate submitted directory profile: ${name} (Enrollment: ${cleanEnrollment}). Awaiting Admin verification.`
      });
    } catch (aErr) { }

    return res.status(200).json({
      success: true,
      message: 'Your Advocate registration has been submitted successfully and is pending verification by the Admin.',
      advocate,
      user: {
        id: updatedUser ? updatedUser._id : req.user.id,
        name: updatedUser ? updatedUser.name : name.trim(),
        email: updatedUser ? updatedUser.email : cleanEmail,
        role: updatedUser ? updatedUser.role : req.user.role,
        phone: updatedUser ? updatedUser.phone : cleanPhone,
        enrollmentNumber: cleanEnrollment,
        hasCompletedProfile: true,
        isVerified: advocate.isVerified === true,
        verificationStatus: advocate.verificationStatus || 'PENDING'
      }
    });
  } catch (error: any) {
    console.error('Error in selfOnboardAdvocateProfile:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to submit advocate directory profile.' });
  }
};

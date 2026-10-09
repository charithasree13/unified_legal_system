import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Advocate, User, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlegaljwttokenkey12345!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecretlegalrefreshjwttokenkey67890!';

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

    // 3. Fallback auto-seed if database collection is empty and no advocate deletion has taken place
    if (map.size === 0) {
      const deletedLogsCount = await AuditLog.countDocuments({ action: 'ADVOCATE_DELETED' });
      if (deletedLogsCount === 0) {
        const defaults = [
          {
            name: "Mr. P. V. Prasad",
            designation: "Advocate, Notary and Bank Panel Advocate",
            phone: "+91 9247253096",
            email: "pvprasadvmpl@gmail.com",
            enrollmentNumber: "AP/298/1998",
            enrollmentDate: "1998-03-05",
            specialization: "Title Verification, Property Laws, Civil Matters",
            court: "Senior civil judges court, High Court",
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
            name: "Mr. M. Chaitanya Kumar",
            designation: "Advocate",
            phone: "+91 9440046533",
            email: "kumarchaitanya1970@gmail.com",
            enrollmentNumber: "AP/142/1995",
            enrollmentDate: "1995-06-12",
            specialization: "Criminal Cases",
            court: "Senior civil judges court, High Court",
            city: "Madanapalle",
            state: "Andhra Pradesh",
            experience: 31,
            bio: "Criminal Defense Advocate",
            address: "Madanapalle",
            availability: "Available",
            isVerified: true,
            verificationStatus: "APPROVED"
          },
          {
            name: "Mr. B. Sreenivasulu",
            designation: "Advocate",
            phone: "+91 9441135084",
            email: "bsreenivasadv@gmail.com",
            enrollmentNumber: "AP/32/2008",
            enrollmentDate: "2008-01-24",
            specialization: "MVOP Cases, Civil Litigation",
            court: "Senior civil judges court",
            city: "Madanapalle",
            state: "Andhra Pradesh",
            experience: 18,
            bio: "Verified legal practitioner registered with Bar Council.",
            address: "2-245-8-B-7, Madanapalle",
            availability: "Available",
            isVerified: true,
            verificationStatus: "APPROVED"
          },
          {
            name: "Mrs. J. Sailaja Naidu",
            designation: "Advocate",
            phone: "+91 9959249779",
            email: "sailajaadv18@gmail.com",
            enrollmentNumber: "AP/518/2018",
            enrollmentDate: "2018-05-15",
            specialization: "Deals with All Types of Cases",
            court: "Senior civil judges court",
            city: "Madanapalle",
            state: "Andhra Pradesh",
            experience: 8,
            bio: "Civil and Commercial Litigation Advocate",
            address: "Madanapalle",
            availability: "Available",
            isVerified: true,
            verificationStatus: "APPROVED"
          },
          {
            name: "Mr. R. Shajahan",
            designation: "Advocate",
            phone: "+91 9494740180",
            email: "shajahanadv@gmail.com",
            enrollmentNumber: "AP/812/2010",
            enrollmentDate: "2010-08-20",
            specialization: "N.I. Act Cases",
            court: "Judicial magistrate of 1st class",
            city: "Madanapalle",
            state: "Andhra Pradesh",
            experience: 16,
            bio: "N.I. Act and Commercial Litigation Practitioner",
            address: "Madanapalle",
            availability: "Available",
            isVerified: true,
            verificationStatus: "APPROVED"
          },
          {
            name: "Mr. N. Reddinagulu",
            designation: "Advocate",
            phone: "+91 9440958757",
            email: "reddinaguluadv@gmail.com",
            enrollmentNumber: "AP/405/2005",
            enrollmentDate: "2005-11-10",
            specialization: "Revenue Laws",
            court: "Senior civil judges court",
            city: "Madanapalle",
            state: "Andhra Pradesh",
            experience: 21,
            bio: "Revenue Laws and Land Disputes Advocate",
            address: "Madanapalle",
            availability: "Available",
            isVerified: true,
            verificationStatus: "APPROVED"
          },
          {
            name: "Advocate Jane Doe",
            designation: "Advocate",
            phone: "+91 98765 43210",
            email: "jane.advocate@court.org",
            enrollmentNumber: "TS/888/2012",
            enrollmentDate: "2012-04-10",
            specialization: "Civil & Constitutional Law",
            court: "High Court",
            city: "Hyderabad",
            state: "Telangana",
            experience: 14,
            bio: "High Court Legal Practitioner",
            address: "Hyderabad",
            availability: "Available",
            isVerified: true,
            verificationStatus: "APPROVED"
          },
          {
            name: "Mr. CVLN Murthy",
            designation: "Advocate, High Court of Telangana, Hyderabad",
            phone: "+91 98480 55798",
            email: "cvlnassociates@gmail.com",
            enrollmentNumber: "TS/1042/2004",
            enrollmentDate: "2004-06-15",
            specialization: "Digital Evidence, Cyber Laws",
            court: "High Court of Telangana",
            city: "Hyderabad",
            state: "Telangana",
            experience: 22,
            bio: "Advocate, High Court of Telangana, Hyderabad specializing in Digital Evidence and Cyber Laws.",
            address: "High Court Premises, Hyderabad, Telangana",
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
      return res.status(403).json({ success: false, message: 'Only Admins can verify Advocate registrations.' });
    }

    const allAdvocates = await Advocate.find({});
    const allUsers = await User.find({ role: 'Advocate' });

    const map = new Map<string, any>();

    // 1. Process Advocates collection documents
    for (const item of allAdvocates) {
      const obj = item.toObject ? item.toObject() : { ...item };
      const isApproved = obj.isVerified === true && obj.verificationStatus === 'APPROVED';
      if (!isApproved) {
        const emailKey = String(obj.email || '').toLowerCase().trim();
        const phoneKey = String(obj.phone || '').trim();
        const key = emailKey || phoneKey || String(obj._id);
        map.set(key, {
          ...obj,
          verificationStatus: obj.verificationStatus || 'PENDING',
          isVerified: false
        });
      }
    }

    // 2. Process Users collection with Advocate role
    for (const u of allUsers) {
      const obj = u.toObject ? u.toObject() : { ...u };
      const isApproved = obj.isVerified === true && obj.verificationStatus === 'APPROVED';
      if (!isApproved) {
        const emailKey = String(obj.email || '').toLowerCase().trim();
        const phoneKey = String(obj.phone || '').trim();
        const key = emailKey || phoneKey || String(obj._id);
        if (!map.has(key)) {
          map.set(key, {
            _id: obj._id,
            name: obj.name,
            email: obj.email || 'N/A',
            phone: obj.phone || 'N/A',
            enrollmentNumber: obj.enrollmentNumber || 'Pending Submission',
            enrollmentDate: new Date().toISOString().split('T')[0],
            specialization: 'Civil Litigation, Notary',
            court: 'Senior civil judges court',
            city: 'Madanapalle',
            state: 'Andhra Pradesh',
            isVerified: false,
            verificationStatus: 'PENDING',
            authProvider: obj.authProvider || 'LOCAL',
            createdAt: obj.createdAt || new Date().toISOString()
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
      return res.status(403).json({ success: false, message: 'Only Admins can verify Advocate registrations.' });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const isApproved = status === true || status === 'true' || status === 'APPROVED' || status === 'approved';
    const isRejected = status === false || status === 'false' || status === 'REJECTED' || status === 'rejected';

    const newVerificationStatus = isApproved ? 'APPROVED' : (isRejected ? 'REJECTED' : 'PENDING');
    const newIsVerified = isApproved;

    let advocate = await Advocate.findById(id);

    if (!advocate) {
      const userObj = await User.findById(id);
      if (userObj) {
        advocate = await Advocate.create({
          name: userObj.name,
          email: userObj.email || `${userObj.phone}@court.org`,
          phone: userObj.phone || 'N/A',
          enrollmentNumber: userObj.enrollmentNumber || `BAR/${new Date().getFullYear()}`,
          enrollmentDate: new Date().toISOString().split('T')[0],
          specialization: 'Civil Litigation, Notary, Bank legal advisors',
          court: 'Senior civil judges court, Junior civil Judges court, High Court',
          city: 'Madanapalle',
          state: 'Andhra Pradesh',
          experience: 15,
          isVerified: newIsVerified,
          verificationStatus: newVerificationStatus,
          googleSub: userObj.googleSub
        });
      }
    } else {
      advocate = await Advocate.findByIdAndUpdate(id, {
        isVerified: newIsVerified,
        verificationStatus: newVerificationStatus,
        rejectionReason: isRejected ? (rejectionReason || 'Application details did not meet Bar Council verification standards.') : undefined,
        verifiedAt: new Date(),
        verifiedBy: req.user?.id || 'system'
      }, { new: true });
    }

    if (!advocate) {
      return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
    }

    // Update associated User account if one exists
    try {
      await User.updateMany(
        {
          $or: [
            ...(advocate.email ? [{ email: advocate.email.toLowerCase() }] : []),
            ...(advocate.phone ? [{ phone: advocate.phone }] : []),
            ...(advocate.googleSub ? [{ googleSub: advocate.googleSub }] : []),
            { _id: id }
          ]
        },
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
      details: `${isApproved ? 'Approved' : 'Rejected'} verification for advocate: ${advocate.name} (Enrollment: ${advocate.enrollmentNumber || 'N/A'})`
    });

    return res.status(200).json({
      success: true,
      message: isApproved 
        ? 'Advocate verified successfully. The Advocate is now visible in the Advocate Directory.' 
        : 'Advocate registration has been rejected.',
      advocate
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
    let advocate = await Advocate.findById(id);

    if (!advocate) {
      const userAdv = await User.findById(id);
      if (userAdv) {
        advocate = await Advocate.create({
          name: userAdv.name,
          email: userAdv.email || `${userAdv.phone}@court.org`,
          phone: userAdv.phone || 'N/A',
          enrollmentNumber: userAdv.enrollmentNumber || `BAR/${new Date().getFullYear()}`,
          enrollmentDate: new Date().toISOString().split('T')[0],
          specialization: 'Civil Litigation',
          court: 'Senior civil judges court',
          city: 'Madanapalle',
          state: 'Andhra Pradesh',
          experience: 15,
          isVerified: userAdv.isVerified ?? true,
          verificationStatus: userAdv.verificationStatus || 'APPROVED'
        });
      } else {
        return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
      }
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

    const updatedAdvocate = await Advocate.findByIdAndUpdate(advocate._id, updatedData, { new: true });

    // Sync updates to associated User record if present
    if (advocate.email || advocate.phone) {
      try {
        await User.updateMany(
          {
            $or: [
              ...(advocate.email ? [{ email: advocate.email.toLowerCase() }] : []),
              ...(advocate.phone ? [{ phone: advocate.phone }] : []),
              { _id: id }
            ]
          },
          {
            ...(updatedData.name ? { name: updatedData.name } : {}),
            ...(updatedData.phone ? { phone: updatedData.phone } : {}),
            ...(updatedData.email ? { email: updatedData.email.toLowerCase() } : {}),
            ...(updatedData.enrollmentNumber ? { enrollmentNumber: updatedData.enrollmentNumber } : {}),
            ...(updatedData.isVerified !== undefined ? { isVerified: updatedData.isVerified } : {}),
            ...(updatedData.verificationStatus ? { verificationStatus: updatedData.verificationStatus } : {})
          }
        );
      } catch (uErr) { }
    }

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

// Delete Advocate profile (ONLY Admin Can Delete Permanently)
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
    let advocate = await Advocate.findById(id);
    let advocateName = '';
    let advocateEnrollment = '';
    let advocateEmail = '';
    let advocatePhone = '';

    if (advocate) {
      advocateName = advocate.name;
      advocateEnrollment = advocate.enrollmentNumber || 'N/A';
      advocateEmail = advocate.email || '';
      advocatePhone = advocate.phone || '';

      await Advocate.findByIdAndDelete(id);

      // Clean up matching user account if one exists
      if (advocateEmail || advocatePhone) {
        await User.deleteMany({
          $or: [
            ...(advocateEmail ? [{ email: advocateEmail.toLowerCase() }] : []),
            ...(advocatePhone ? [{ phone: advocatePhone }] : []),
            { _id: id }
          ]
        });
      }
    } else {
      // Check User collection if not found in Advocates collection
      const userAdv = await User.findById(id);
      if (userAdv && (userAdv.role === 'Advocate' || userAdv.role === 'advocate')) {
        advocateName = userAdv.name;
        advocateEnrollment = userAdv.enrollmentNumber || 'N/A';
        advocateEmail = userAdv.email || '';
        advocatePhone = userAdv.phone || '';

        await User.findByIdAndDelete(id);

        if (advocateEmail || advocatePhone) {
          await Advocate.deleteMany({
            $or: [
              ...(advocateEmail ? [{ email: advocateEmail.toLowerCase() }] : []),
              ...(advocatePhone ? [{ phone: advocatePhone }] : [])
            ]
          });
        }
      } else {
        return res.status(404).json({ success: false, message: 'Advocate profile not found.' });
      }
    }

    await AuditLog.create({
      userId: req.user.id || 'system',
      userName: req.user.name || 'Administrator',
      role: 'Admin',
      action: 'ADVOCATE_DELETED',
      ip: req.ip || '127.0.0.1',
      details: `Permanently deleted advocate profile: ${advocateName} (Enrollment: ${advocateEnrollment})`
    });

    return res.status(200).json({
      success: true,
      message: `Advocate profile for ${advocateName} permanently deleted successfully.`
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

    const tokenPayload = {
      id: updatedUser ? updatedUser._id : req.user.id,
      email: updatedUser ? updatedUser.email : cleanEmail,
      role: 'Advocate',
      name: updatedUser ? updatedUser.name : name.trim(),
      phone: updatedUser ? updatedUser.phone : cleanPhone
    };
    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    const refreshTokenStr = jwt.sign(tokenPayload, JWT_REFRESH_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
      success: true,
      message: 'Your Advocate account has been created successfully. Your profile is pending verification for inclusion in the Advocate Directory.',
      accessToken,
      refreshToken: refreshTokenStr,
      advocate,
      user: {
        id: updatedUser ? updatedUser._id : req.user.id,
        name: updatedUser ? updatedUser.name : name.trim(),
        email: updatedUser ? updatedUser.email : cleanEmail,
        role: 'Advocate',
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

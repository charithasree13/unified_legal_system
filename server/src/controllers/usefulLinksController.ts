import { Response } from 'express';
import mongoose from 'mongoose';
import { UsefulLinkCategory, AuditLog } from '../models/Schemas';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Controller: Useful Links Module
 * Strict Role-Based Access Control:
 * - Read (GET): Admin & Advocate ONLY
 * - Write/Modify/Delete (POST, PUT, DELETE): Admin ONLY
 * - Client / Public / Unauthenticated: Denied with 401 / 403
 */

// ------------------------------------------------------------------
// URL VALIDATION HELPER
// Enforces HTTP or HTTPS protocol, rejects malformed and unsafe protocols
// ------------------------------------------------------------------
export const isValidHttpUrl = (urlString: string): boolean => {
  if (typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed) return false;

  // Explicitly reject dangerous or unsupported schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:') ||
    lower.startsWith('blob:')
  ) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const generateLinkId = (): string => {
  return new mongoose.Types.ObjectId().toString();
};

// ------------------------------------------------------------------
// 1. GET ALL CATEGORIES & THEIR ASSOCIATED LINKS (Admin & Advocate ONLY)
// ------------------------------------------------------------------
export const getCategories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to access Useful Links.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Useful Links module is restricted exclusively to Administrators and Advocates.'
      });
    }

    const categories = await UsefulLinkCategory.find({});
    const categoriesArray = Array.isArray(categories)
      ? categories.map((cat: any) => (cat.toObject ? cat.toObject() : cat))
      : [];

    // Sort chronologically (newest created first)
    categoriesArray.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return res.status(200).json({
      success: true,
      categories: categoriesArray
    });
  } catch (error: any) {
    console.error('Error fetching Useful Link Categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve link categories. Please try again later.'
    });
  }
};

// ------------------------------------------------------------------
// 2. GET SINGLE CATEGORY BY ID (Admin & Advocate ONLY)
// ------------------------------------------------------------------
export const getCategoryById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to view this category.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin' && roleLower !== 'advocate') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Useful Links module is restricted exclusively to Administrators and Advocates.'
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required.'
      });
    }

    const category = await UsefulLinkCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Useful links category not found.'
      });
    }

    const formatted = category.toObject ? category.toObject() : category;

    return res.status(200).json({
      success: true,
      category: formatted
    });
  } catch (error: any) {
    console.error('Error fetching Useful Link Category by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category details.'
    });
  }
};

// ------------------------------------------------------------------
// 3. CREATE CATEGORY WITH OPTIONAL MULTIPLE LINKS (Admin ONLY)
// ------------------------------------------------------------------
export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only administrators have permission to add Useful Links categories.'
      });
    }

    const { title, links } = req.body;

    // Field A Validation: Title
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Category title is required and cannot be empty or whitespace.'
      });
    }

    const cleanTitle = title.trim();

    // Field B Validation: Links (optional array upon category creation)
    const processedLinks: Array<{ _id: string; title: string; url: string; createdAt: Date; updatedAt: Date }> = [];
    if (links && Array.isArray(links)) {
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (!link || typeof link !== 'object') continue;

        const linkTitle = typeof link.title === 'string' ? link.title.trim() : '';
        const linkUrl = typeof link.url === 'string' ? link.url.trim() : '';

        // If user submitted an empty row, ignore or validate
        if (!linkTitle && !linkUrl) {
          continue;
        }

        if (!linkTitle) {
          return res.status(400).json({
            success: false,
            message: `Link #${i + 1} requires a valid display name or title.`
          });
        }

        if (!isValidHttpUrl(linkUrl)) {
          return res.status(400).json({
            success: false,
            message: `Link "${linkTitle}" has an invalid URL. Only valid HTTP or HTTPS URLs are supported.`
          });
        }

        processedLinks.push({
          _id: link._id || generateLinkId(),
          title: linkTitle,
          url: linkUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    const newCategory = await UsefulLinkCategory.create({
      title: cleanTitle,
      links: processedLinks,
      createdBy: req.user.name || 'System Admin',
      createdById: req.user.id || '',
      updatedBy: req.user.name || 'System Admin'
    });

    const formatted = newCategory.toObject ? newCategory.toObject() : newCategory;

    // Log in AuditLog
    await AuditLog.create({
      userId: req.user.id || 'admin',
      userName: req.user.name || 'System Administrator',
      role: 'Admin',
      action: 'USEFUL_LINK_CATEGORY_CREATED',
      ip: req.ip || '127.0.0.1',
      details: `Created Useful Links category "${cleanTitle}" with ${processedLinks.length} initial link(s).`
    }).catch((err: any) => console.error('AuditLog error:', err));

    return res.status(201).json({
      success: true,
      message: 'Useful links category created successfully.',
      category: formatted
    });
  } catch (error: any) {
    console.error('Error creating Useful Link Category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create category. Please check your parameters and try again.'
    });
  }
};

// ------------------------------------------------------------------
// 4. UPDATE CATEGORY (Title and/or full links array) (Admin ONLY)
// ------------------------------------------------------------------
export const updateCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only administrators have permission to update Useful Links categories.'
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required.'
      });
    }

    const existingCategory = await UsefulLinkCategory.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Useful links category not found.'
      });
    }

    const { title, links } = req.body;
    const updatePayload: any = {
      updatedBy: req.user.name || 'System Administrator',
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Category title cannot be empty or whitespace.'
        });
      }
      updatePayload.title = title.trim();
    }

    if (links !== undefined && Array.isArray(links)) {
      const processedLinks: Array<{ _id: string; title: string; url: string; createdAt: Date; updatedAt: Date }> = [];
      for (let i = 0; i < links.length; i++) {
        const link = links[i];
        if (!link || typeof link !== 'object') continue;

        const linkTitle = typeof link.title === 'string' ? link.title.trim() : '';
        const linkUrl = typeof link.url === 'string' ? link.url.trim() : '';

        if (!linkTitle && !linkUrl) continue;

        if (!linkTitle) {
          return res.status(400).json({
            success: false,
            message: `Link #${i + 1} requires a valid display name or title.`
          });
        }

        if (!isValidHttpUrl(linkUrl)) {
          return res.status(400).json({
            success: false,
            message: `Link "${linkTitle}" has an invalid URL. Only valid HTTP or HTTPS URLs are supported.`
          });
        }

        processedLinks.push({
          _id: link._id || generateLinkId(),
          title: linkTitle,
          url: linkUrl,
          createdAt: link.createdAt ? new Date(link.createdAt) : new Date(),
          updatedAt: new Date()
        });
      }
      updatePayload.links = processedLinks;
    }

    const updatedCategory = await UsefulLinkCategory.findByIdAndUpdate(id, updatePayload, { new: true });
    const formatted = updatedCategory.toObject ? updatedCategory.toObject() : updatedCategory;

    // Audit log
    await AuditLog.create({
      userId: req.user.id || 'admin',
      userName: req.user.name || 'System Administrator',
      role: 'Admin',
      action: 'USEFUL_LINK_CATEGORY_UPDATED',
      ip: req.ip || '127.0.0.1',
      details: `Updated Useful Links category "${formatted.title || id}".`
    }).catch((err: any) => console.error('AuditLog error:', err));

    return res.status(200).json({
      success: true,
      message: 'Useful links category updated successfully.',
      category: formatted
    });
  } catch (error: any) {
    console.error('Error updating Useful Link Category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update category. Please try again.'
    });
  }
};

// ------------------------------------------------------------------
// 5. DELETE CATEGORY AND ASSOCIATED LINKS (Admin ONLY)
// Cascades deletion of category and all associated child links
// ------------------------------------------------------------------
export const deleteCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only administrators have permission to delete Useful Links categories.'
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required.'
      });
    }

    const categoryToDelete = await UsefulLinkCategory.findById(id);
    if (!categoryToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Useful links category not found.'
      });
    }

    const categoryTitle = categoryToDelete.title || id;
    const linksCount = (categoryToDelete.links || []).length;

    await UsefulLinkCategory.findByIdAndDelete(id);

    // Audit log
    await AuditLog.create({
      userId: req.user.id || 'admin',
      userName: req.user.name || 'System Administrator',
      role: 'Admin',
      action: 'USEFUL_LINK_CATEGORY_DELETED',
      ip: req.ip || '127.0.0.1',
      details: `Deleted Useful Links category "${categoryTitle}" and its ${linksCount} associated link(s).`
    }).catch((err: any) => console.error('AuditLog error:', err));

    return res.status(200).json({
      success: true,
      message: `Category "${categoryTitle}" and all ${linksCount} associated link(s) deleted successfully.`
    });
  } catch (error: any) {
    console.error('Error deleting Useful Link Category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category.'
    });
  }
};

// ------------------------------------------------------------------
// 6. ADD INDIVIDUAL LINK TO CATEGORY (Admin ONLY)
// ------------------------------------------------------------------
export const addLinkToCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only administrators have permission to add links.'
      });
    }

    const { categoryId } = req.params;
    const { title, url } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required.'
      });
    }

    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Link title/display name is required and cannot be empty.'
      });
    }

    if (!isValidHttpUrl(url)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website URL. Only valid HTTP or HTTPS URLs are supported.'
      });
    }

    const category = await UsefulLinkCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Useful links category not found.'
      });
    }

    const cleanTitle = title.trim();
    const cleanUrl = url.trim();

    const newLink = {
      _id: generateLinkId(),
      title: cleanTitle,
      url: cleanUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const currentLinks = Array.isArray(category.links) ? [...category.links] : [];
    currentLinks.push(newLink);

    const updatedCategory = await UsefulLinkCategory.findByIdAndUpdate(
      categoryId,
      {
        links: currentLinks,
        updatedBy: req.user.name || 'System Administrator',
        updatedAt: new Date().toISOString()
      },
      { new: true }
    );

    const formatted = updatedCategory.toObject ? updatedCategory.toObject() : updatedCategory;

    // Audit log
    await AuditLog.create({
      userId: req.user.id || 'admin',
      userName: req.user.name || 'System Administrator',
      role: 'Admin',
      action: 'USEFUL_LINK_ADDED',
      ip: req.ip || '127.0.0.1',
      details: `Added link "${cleanTitle}" (${cleanUrl}) to category "${category.title}".`
    }).catch((err: any) => console.error('AuditLog error:', err));

    return res.status(201).json({
      success: true,
      message: 'Useful link added successfully.',
      category: formatted,
      link: newLink
    });
  } catch (error: any) {
    console.error('Error adding link to category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add link to category.'
    });
  }
};

// ------------------------------------------------------------------
// 7. EDIT INDIVIDUAL LINK IN CATEGORY (Admin ONLY)
// ------------------------------------------------------------------
export const updateLinkInCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only administrators have permission to edit links.'
      });
    }

    const { categoryId, linkId } = req.params;
    const { title, url } = req.body;

    if (!categoryId || !linkId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID and Link ID are required.'
      });
    }

    const category = await UsefulLinkCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Useful links category not found.'
      });
    }

    const currentLinks = Array.isArray(category.links) ? [...category.links] : [];
    const linkIndex = currentLinks.findIndex((l: any) => String(l._id) === String(linkId));

    if (linkIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Specified link not found in this category.'
      });
    }

    const targetLink = { ...currentLinks[linkIndex] };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Link title/display name cannot be empty.'
        });
      }
      targetLink.title = title.trim();
    }

    if (url !== undefined) {
      if (!isValidHttpUrl(url)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid website URL. Only valid HTTP or HTTPS URLs are supported.'
        });
      }
      targetLink.url = url.trim();
    }

    targetLink.updatedAt = new Date();
    currentLinks[linkIndex] = targetLink;

    const updatedCategory = await UsefulLinkCategory.findByIdAndUpdate(
      categoryId,
      {
        links: currentLinks,
        updatedBy: req.user.name || 'System Administrator',
        updatedAt: new Date().toISOString()
      },
      { new: true }
    );

    const formatted = updatedCategory.toObject ? updatedCategory.toObject() : updatedCategory;

    // Audit log
    await AuditLog.create({
      userId: req.user.id || 'admin',
      userName: req.user.name || 'System Administrator',
      role: 'Admin',
      action: 'USEFUL_LINK_UPDATED',
      ip: req.ip || '127.0.0.1',
      details: `Updated link "${targetLink.title}" in category "${category.title}".`
    }).catch((err: any) => console.error('AuditLog error:', err));

    return res.status(200).json({
      success: true,
      message: 'Useful link updated successfully.',
      category: formatted,
      link: targetLink
    });
  } catch (error: any) {
    console.error('Error updating link in category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update link.'
    });
  }
};

// ------------------------------------------------------------------
// 8. DELETE INDIVIDUAL LINK FROM CATEGORY (Admin ONLY)
// ------------------------------------------------------------------
export const deleteLinkFromCategory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const roleLower = (req.user.role || '').toLowerCase();
    if (roleLower !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only administrators have permission to delete links.'
      });
    }

    const { categoryId, linkId } = req.params;
    if (!categoryId || !linkId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID and Link ID are required.'
      });
    }

    const category = await UsefulLinkCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Useful links category not found.'
      });
    }

    const currentLinks = Array.isArray(category.links) ? [...category.links] : [];
    const linkToDelete = currentLinks.find((l: any) => String(l._id) === String(linkId));

    if (!linkToDelete) {
      return res.status(404).json({
        success: false,
        message: 'Specified link not found in this category.'
      });
    }

    const filteredLinks = currentLinks.filter((l: any) => String(l._id) !== String(linkId));

    const updatedCategory = await UsefulLinkCategory.findByIdAndUpdate(
      categoryId,
      {
        links: filteredLinks,
        updatedBy: req.user.name || 'System Administrator',
        updatedAt: new Date().toISOString()
      },
      { new: true }
    );

    const formatted = updatedCategory.toObject ? updatedCategory.toObject() : updatedCategory;

    // Audit log
    await AuditLog.create({
      userId: req.user.id || 'admin',
      userName: req.user.name || 'System Administrator',
      role: 'Admin',
      action: 'USEFUL_LINK_DELETED',
      ip: req.ip || '127.0.0.1',
      details: `Removed link "${linkToDelete.title}" from category "${category.title}".`
    }).catch((err: any) => console.error('AuditLog error:', err));

    return res.status(200).json({
      success: true,
      message: `Link "${linkToDelete.title}" removed successfully.`,
      category: formatted
    });
  } catch (error: any) {
    console.error('Error deleting link from category:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete link.'
    });
  }
};

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { LIMITATION_ARTICLES, LimitationArticle } from '../data/limitationArticles';
import { calculateLimitation, LimitationCalculationInput } from '../services/limitationEngine';
import { validateLimitationDataset } from '../utils/limitationValidator';

/**
 * Controller for Limitation Act Calculator API
 * Enforces strict Role-Based Access Control: Admin or Enrolled Advocate required
 */

export const getArticles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (!req.user || (roleLower !== 'admin' && roleLower !== 'advocate')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access. The Limitation Act Calculator is available only to Admins and authorized Advocates.'
      });
    }

    const { category, division, search } = req.query;
    let articles: LimitationArticle[] = [...LIMITATION_ARTICLES];

    if (division && typeof division === 'string') {
      articles = articles.filter(a => a.division.toLowerCase().includes(division.toLowerCase()));
    }

    if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      articles = articles.filter(a =>
        a.articleNumber.toLowerCase().includes(q) ||
        (a.subArticle && a.subArticle.toLowerCase().includes(q)) ||
        a.category.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.startingPoint.toLowerCase().includes(q) ||
        a.part.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: articles.length,
      totalCount: LIMITATION_ARTICLES.length,
      articles
    });
  } catch (error: any) {
    console.error('❌ Error fetching limitation articles:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve limitation articles.',
      error: error.message
    });
  }
};

export const getArticleById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (!req.user || (roleLower !== 'admin' && roleLower !== 'advocate')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access. This tool is available only to Admins and authorized Advocates.'
      });
    }

    const { id } = req.params;
    const article = LIMITATION_ARTICLES.find(
      a => a.id.toLowerCase() === id.toLowerCase() || a.articleNumber.toLowerCase() === id.toLowerCase()
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: `Limitation Article with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      article
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching article details.',
      error: error.message
    });
  }
};

export const calculate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (!req.user || (roleLower !== 'admin' && roleLower !== 'advocate')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access. The Limitation Act Calculator is available only to Admins and authorized Advocates.'
      });
    }

    const inputData: LimitationCalculationInput = req.body;
    if (!inputData || !inputData.articleId || !inputData.startingDate) {
      return res.status(400).json({
        success: false,
        message: 'Please select an article and enter the starting date from which limitation period begins.'
      });
    }

    const result = calculateLimitation(inputData);

    return res.status(200).json({
      success: true,
      message: 'Limitation calculation completed successfully.',
      data: result
    });
  } catch (error: any) {
    console.error('❌ Limitation Calculation Error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to process limitation calculation.'
    });
  }
};

export const validateDataset = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const roleLower = (req.user?.role || '').toLowerCase();
    if (!req.user || (roleLower !== 'admin' && roleLower !== 'advocate')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access. Validation test endpoint restricted to authorized users.'
      });
    }

    const report = validateLimitationDataset();

    if (!report.isValid) {
      return res.status(422).json({
        success: false,
        message: 'Dataset validation failed! Duplicate entries or missing fields detected.',
        report
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Automated dataset duplicate check passed successfully. All schedule entries are unique.',
      report
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Error running limitation dataset validation.',
      error: error.message
    });
  }
};

import app from '../server/src/index';

export default function handler(req: any, res: any) {
  // Normalize req.url to ensure /api routes match
  const rawUrl = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'] || req.originalUrl || req.url;
  if (typeof rawUrl === 'string' && rawUrl.length > 0) {
    if (!rawUrl.startsWith('/api')) {
      req.url = '/api' + (rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl);
    } else {
      req.url = rawUrl;
    }
  }
  return app(req, res);
}

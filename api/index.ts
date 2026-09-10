import app from '../server/src/index';

export default function handler(req: any, res: any) {
  let url = req.headers['x-forwarded-uri'] || req.headers['x-original-uri'] || req.originalUrl || req.url;
  if (typeof url === 'string' && url.length > 0) {
    if (!url.startsWith('/api')) {
      req.url = '/api' + (url.startsWith('/') ? url : '/' + url);
    } else {
      req.url = url;
    }
  }
  return app(req, res);
}




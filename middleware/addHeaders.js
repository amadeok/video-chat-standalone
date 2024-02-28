export default function addHeaders(req, res, next) {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
  }
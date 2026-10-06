export function sendJson(res: any, statusCode: number, data: any): void {
  try {
    if (typeof res.status === 'function') {
      const s = res.status(statusCode);
      if (s && typeof s.json === 'function') {
        s.json(data);
        return;
      }
    }
    if (typeof res.json === 'function') {
      res.statusCode = statusCode;
      res.json(data);
      return;
    }
    res.statusCode = statusCode;
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
    }
    if (typeof res.end === 'function') {
      res.end(JSON.stringify(data));
    }
  } catch (e) {
    console.warn('[sendJson error]:', e);
  }
}

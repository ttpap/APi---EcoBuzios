module.exports = async function handler(req, res) {
  const projetos = req.query.projetos || '';
  const apiUrl = projetos
    ? `https://ixgujnhdjrgoakqzdkgx.supabase.co/functions/v1/public-stats-api?projetos=${projetos}`
    : 'https://ixgujnhdjrgoakqzdkgx.supabase.co/functions/v1/public-stats-api';

  try {
    const response = await fetch(apiUrl, {
      headers: { 'x-api-key': 'c04248b422b59e718e8115a66286b1f9a56f5f447b44354128ad7406ebb50752' }
    });
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(502).json({ ok: false, error: err.message });
  }
};

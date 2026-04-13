// Lemon Squeezy webhook handler
// LS sends webhooks to /api/checkout/ls?webhook=1
// This file handles the legacy /api/checkout/callback path (unused)
const { corsHeaders } = require('../_lib/openai');

module.exports = (req, res) => {
    corsHeaders(res, req);
    res.redirect('/?checkout=fail&msg=Ödeme+sistemi+güncellendi');
};

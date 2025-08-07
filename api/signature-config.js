module.exports = async (req, res) => {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    console.log('Loading signature configuration...');
    
    const config = {
      name: process.env.SIGNATURE_NAME || 'Your Name',
      title: process.env.SIGNATURE_TITLE || 'Your Title',
      company: process.env.SIGNATURE_COMPANY || 'Your Company',
      email: process.env.SIGNATURE_EMAIL || 'your.email@company.com',
      phone: process.env.SIGNATURE_PHONE || '+1 (555) 123-4567',
      mobile: process.env.SIGNATURE_MOBILE || '',
      website: process.env.SIGNATURE_WEBSITE || 'https://yourwebsite.com',
      address: {
        street: process.env.SIGNATURE_ADDRESS_STREET || '',
        postalCode: process.env.SIGNATURE_ADDRESS_POSTAL_CODE || '',
        city: process.env.SIGNATURE_ADDRESS_CITY || '',
        country: process.env.SIGNATURE_ADDRESS_COUNTRY || '',
      },
    };

    console.log('Signature config loaded successfully');
    res.setHeader('Cache-Control', 'public, s-maxage=86400'); // Cache for 24 hours
    res.status(200).json(config);
  } catch (error) {
    console.error('Error in signature-config API:', error);
    res.status(500).json({
      error: 'Failed to get signature configuration',
      details: error.message,
      stack: error.stack,
    });
  }
};

// If you encounter CORS issues, replace the WORKDECK_BASE_URL in the main component with:

// Option 1: Use a public CORS proxy
const WORKDECK_BASE_URL = 'https://cors-anywhere.herokuapp.com/https://test-api.workdeck.com';

// Option 2: Use allorigins proxy
const WORKDECK_BASE_URL_ALT = 'https://api.allorigins.win/get?url=' + encodeURIComponent('https://test-api.workdeck.com');

// Option 3: Create your own Netlify/Vercel proxy function
// Deploy this as a serverless function:

// netlify/functions/workdeck-proxy.js
exports.handler = async (event, context) => {
  const { path, method = 'GET', body, headers = {} } = JSON.parse(event.body || '{}');
  
  try {
    const response = await fetch(`https://test-api.workdeck.com${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Then update your API request function to use the proxy:
const apiRequest = async (endpoint, options = {}) => {
  try {
    // For Netlify function proxy:
    const response = await fetch('/.netlify/functions/workdeck-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: endpoint,
        method: options.method || 'GET',
        body: options.body ? JSON.parse(options.body) : undefined,
        headers: options.headers || {}
      })
    });
    
    const data = await response.json();
    return data.result || data;
  } catch (error) {
    console.error('Proxy request failed:', error);
    throw error;
  }
};

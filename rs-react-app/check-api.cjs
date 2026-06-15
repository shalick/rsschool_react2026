const https = require('https');
const url = 'https://restcountries.com/v3.1/all?fields=name,flags,capital,region,population,cca3';
https.get(url, (res) => {
  const chunks = [];
  res.on('data', (chunk) => chunks.push(chunk));
  res.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    console.log('status', res.statusCode);
    console.log('bodyStart', body.slice(0, 200));
    try {
      const json = JSON.parse(body);
      console.log('isArray', Array.isArray(json));
      if (Array.isArray(json)) console.log('length', json.length);
      else console.log('type', typeof json, JSON.stringify(json).slice(0,100));
    } catch (error) {
      console.error('parse error', error.message);
    }
  });
}).on('error', (err) => {
  console.error('err', err.message);
});

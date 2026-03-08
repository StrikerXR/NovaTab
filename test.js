fetch('https://api.weatherapi.com/v1/current.json?key=42712cd7a2ad47ed98131312260803&q=London&aqi=no&_cb=' + Date.now(), {
  headers: { 'Origin': 'https://example.com' }
}).then(r => {
  console.log('Headers:', Array.from(r.headers.entries()));
  console.log('Status:', r.status);
});

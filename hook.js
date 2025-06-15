// ...existing code...
fetch('your-api-endpoint')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      throw new Error('Received non-JSON response');
    }
  })
  .then(data => {
    // handle your JSON data here
    console.log('Dashboard data:', data);
  })
  .catch(error => {
    console.error('Error fetching dashboard data:', error);
  });
// ...existing code...

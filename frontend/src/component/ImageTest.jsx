import React from 'react';

const ImageTest = () => {
  const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_LOCAL_URL || 'http://localhost:5001';
  const testImageUrl = `${baseUrl}/uploads/posts/images-1756657900319-203604821.png`;
  
  console.log('Testing image URL:', testImageUrl);
  
  return (
    <div className="p-4 border rounded">
      <h3>Image Test</h3>
      <p>Base URL: {baseUrl}</p>
      <p>Full URL: {testImageUrl}</p>
      <img 
        src={testImageUrl} 
        alt="Test" 
        className="w-32 h-32 object-cover border"
        onLoad={() => console.log('Image loaded successfully')}
        onError={(e) => console.error('Image failed to load:', e)}
      />
    </div>
  );
};

export default ImageTest;
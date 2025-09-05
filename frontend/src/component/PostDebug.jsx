import React from 'react';

const PostDebug = ({ posts }) => {
  return (
    <div className="bg-gray-100 p-4 rounded mb-4">
      <h3 className="font-bold mb-2">Debug: Posts Data</h3>
      <pre className="text-xs overflow-auto max-h-40">
        {JSON.stringify(posts, null, 2)}
      </pre>
    </div>
  );
};

export default PostDebug;
import React from 'react';
import { Video } from 'lucide-react';

const BlogVideos: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex items-center mb-8">
          <Video className="mr-4 text-emerald-500" size={40} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Vídeos
          </h1>
        </div>
        <p>Página de Vídeos em construção</p>
      </div>
    </div>
  );
};

export default BlogVideos; 
import React from 'react';
import { Podcast } from 'lucide-react';

const BlogPodcasts: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto">
        <div className="flex items-center mb-8">
          <Podcast className="mr-4 text-emerald-500" size={40} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Podcasts
          </h1>
        </div>
        <p>Página de Podcasts em construção</p>
      </div>
    </div>
  );
};

export default BlogPodcasts; 
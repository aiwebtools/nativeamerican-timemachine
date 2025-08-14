import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const RecommendedTools: React.FC = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-black/50 to-purple-900/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary-purple to-secondary-pink bg-clip-text text-transparent">
          You May Also Like
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-black/40 border-primary-purple/30 hover:border-primary-purple/60 transition-all duration-300 group">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src="/lovable-uploads/0c215238-24db-49ab-952b-642075810a4b.png" 
                  alt="Black History Matters Time Machine of Truth - AI time travel tool for exploring Black history"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="text-xl font-bold text-light-gray mb-3">
                Black History Time Machine
              </CardTitle>
              <CardDescription className="text-medium-gray mb-4 line-clamp-3">
                Explore the rich tapestry of Black history through immersive AI-powered time travel. Discover untold stories, celebrate achievements, and learn from the past to inspire the future.
              </CardDescription>
              <Button 
                asChild 
                className="w-full rainbow-button-glow text-white font-semibold"
              >
                <a 
                  href="https://blackhistorymattersgpt.lovable.app/?via=aiwebtools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  Explore Black History
                  <ExternalLink size={16} />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RecommendedTools;

import React, { lazy, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';

// Lazy load below-the-fold components
const HowItWorks = lazy(() => import('@/components/HowItWorks'));
const Testimonials = lazy(() => import('@/components/Testimonials'));
const FAQ = lazy(() => import('@/components/FAQ'));
const Disclaimer = lazy(() => import('@/components/Disclaimer'));
const RecommendedTools = lazy(() => import('@/components/RecommendedTools'));
const DreamCatcher = lazy(() => import('@/components/DreamCatcher'));
const RainbowElement = lazy(() => import('@/components/RainbowElement'));

const LoadingFallback = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary-purple border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-grow relative pt-16 md:pt-20">
        {/* Decorative Dream Catchers - Lazy loaded */}
        <Suspense fallback={null}>
          <DreamCatcher 
            size="lg" 
            color="purple" 
            className="fixed -top-12 -left-12 opacity-30 z-10" 
            position="top-0 left-0"
          />
          <DreamCatcher 
            size="md" 
            color="blue" 
            className="fixed top-1/3 -right-12 opacity-20 z-10" 
            position="top-1/3 right-0"
          />
          <DreamCatcher 
            size="sm" 
            color="pink" 
            className="fixed bottom-1/4 -left-8 opacity-30 z-10" 
            position="bottom-1/4 left-0"
          />
          <DreamCatcher 
            size="lg" 
            color="orange" 
            className="fixed -bottom-16 -right-16 opacity-25 z-10" 
            position="bottom-0 right-0"
          />
          
          {/* Rainbow Elements */}
          <RainbowElement 
            size="lg"
            speed="slow"
            className="fixed -top-24 -left-24 opacity-40 z-5"
          />
          <RainbowElement 
            size="md"
            speed="medium"
            className="fixed top-1/2 -right-16 opacity-30 z-5"
          />
          <RainbowElement 
            size="lg"
            speed="fast"
            className="fixed -bottom-24 left-1/4 opacity-25 z-5"
          />
        </Suspense>
        
        <HeroSection />
        
        <Suspense fallback={<LoadingFallback />}>
          <HowItWorks />
          <Testimonials />
          <RecommendedTools />
          <FAQ />
          <Disclaimer />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;

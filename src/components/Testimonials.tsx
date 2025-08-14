
import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah J.",
      role: "History Teacher",
      quote: "This tool shattered everything I thought I knew about indigenous history. The authentic stories revealed truths that textbooks censored. My students now understand how historical lies maintain injustice and how truth empowers change.",
      stars: 5
    },
    {
      name: "Michael T.",
      role: "Cultural Researcher",
      quote: "Finally, an honest portrayal of indigenous resistance and survival. This doesn't romanticize or sanitize—it shows the brutal reality and the extraordinary resilience. Truth like this is what sets us free to build a better world.",
      stars: 5
    },
    {
      name: "Elena R.",
      role: "Student",
      quote: "I was raised on false narratives about 'discovery' and 'civilization.' This experience opened my eyes to genocide, resistance, and survival. Now I have the moral compass to challenge racism and fight for justice.",
      stars: 4
    },
    {
      name: "David K.",
      role: "History Enthusiast",
      quote: "The future scenarios based on indigenous wisdom show what healing looks like. It's not just about learning the past—it's about applying ancestral knowledge to solve today's crises and create regenerative change.",
      stars: 5
    }
  ];

  return (
    <section className="py-16 bg-charcoal/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-glow mb-6">
          What Time Travelers Say
        </h2>
        
        <p className="text-center text-light-gray max-w-3xl mx-auto mb-12">
          Discover how truth liberates minds and transforms perspectives. Hear from those who have experienced the awakening power of authentic Native American history and found their moral compass for creating meaningful change.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="cyberpunk-card p-6 flex flex-col"
            >
              <div className="flex mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonial.stars ? 'text-primary-purple fill-primary-purple' : 'text-gray-400'}`} 
                  />
                ))}
              </div>
              
              <blockquote className="text-light-gray italic mb-4">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="mt-auto">
                <div className="font-semibold text-primary-purple">
                  {testimonial.name}
                </div>
                <div className="text-sm text-light-gray/70">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import React from 'react';
import { TESTIMONIALS } from '../data/mockData';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export default function TestimonialSection() {
  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100/80 px-3.5 py-1 rounded-full border border-emerald-300">
            Real Customer Feedback
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-heading mt-3">
            Loved By Local Families
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            See why thousands of customers make Alphonsa Hypermarket their primary weekly shopping store
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(testimonial => (
            <div 
              key={testimonial.id}
              className="bg-white p-7 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl hover:border-emerald-400 transition duration-300 flex flex-col justify-between relative group"
            >
              <Quote className="w-10 h-10 text-emerald-100 absolute top-6 right-6 group-hover:text-emerald-200 transition" />
              
              <div>
                {/* Rating Stars */}
                <div className="flex text-amber-400 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Comment Text */}
                <p className="text-slate-700 text-sm md:text-base font-medium italic leading-relaxed mb-6">
                  "{testimonial.comment}"
                </p>
              </div>

              {/* Customer Info Footer */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-100">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/40" 
                />
                <div>
                  <div className="font-extrabold text-sm text-slate-900 font-heading flex items-center gap-1.5">
                    <span>{testimonial.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">{testimonial.role} • {testimonial.location}</div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

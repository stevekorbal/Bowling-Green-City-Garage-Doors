import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Calendar, User, Clock, ArrowLeft, ArrowRight, Phone, ShieldCheck, Tag, CheckCircle2, Wrench } from 'lucide-react';
import { getPostBySlug, getRelatedPosts } from '../lib/blog';
import Breadcrumbs from './Breadcrumbs';

interface BlogPostViewProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export default function BlogPostView({ slug, onNavigate }: BlogPostViewProps) {
  const post = getPostBySlug(slug);

  if (!post) {
    return (
      <div className="w-full bg-slate-50 font-sans min-h-screen py-16 px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-900 mb-2">Article Not Found</h1>
          <p className="text-xs text-slate-600 mb-6">
            The blog article you are looking for does not exist or may have been moved.
          </p>
          <button
            onClick={() => onNavigate('blog')}
            className="bg-blue-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Articles
          </button>
        </div>
      </div>
    );
  }

  const relatedPosts = getRelatedPosts(post.slug, post.category, 3);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const serviceLinks = [
    { title: 'Garage Door Spring Repair', path: 'garage-door-spring-repair', desc: 'Broken spring replacement & tension balancing' },
    { title: 'Garage Door Opener Repair', path: 'garage-door-opener-repair', desc: 'LiftMaster, Genie & Chamberlain motor fix' },
    { title: 'New Door Installation', path: 'garage-door-installation', desc: 'C.H.I. & Amarr insulated steel doors' },
    { title: 'Emergency Repair Service', path: 'emergency-garage-door-repair', desc: '24/7 immediate dispatch in Bowling Green' },
  ];

  return (
    <div className="w-full bg-slate-50 font-sans min-h-screen">
      <Breadcrumbs
        paths={[
          { label: 'Blog', route: 'blog' },
          { label: post.title }
        ]}
        onNavigate={onNavigate}
      />

      {/* Main Single Column Container */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 flex flex-col gap-8">
        
        {/* Article Header Card */}
        <header className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm">
          {/* Category & Keyword badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.category && (
              <span className="bg-blue-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {post.category}
              </span>
            )}
            {post.primaryKeyword && (
              <span className="bg-amber-100 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-600" />
                {post.primaryKeyword}
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            {post.title}
          </h1>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed mt-4 font-medium border-l-4 border-amber-500 pl-4 py-1 bg-amber-50/50 rounded-r-lg">
            {post.description}
          </p>

          {/* Author & Dates metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-6 pt-6 border-t border-slate-100">
            <span className="flex items-center gap-1.5 font-bold text-slate-700">
              <User className="w-4 h-4 text-blue-900" />
              By {post.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              Published: {formatDate(post.date)}
            </span>
            {post.updatedDate && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Clock className="w-3.5 h-3.5" />
                  Updated: {formatDate(post.updatedDate)}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 max-h-[460px] relative">
            <img
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Markdown Body */}
        <article className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm text-slate-800 leading-relaxed font-sans text-sm md:text-base">
          <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-h2:text-xl prose-h2:md:text-2xl prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-lg prose-h3:md:text-xl prose-h3:text-blue-900 prose-a:text-blue-900 prose-a:font-bold hover:prose-a:text-amber-600 prose-strong:text-slate-900 prose-strong:font-black prose-table:w-full prose-table:text-xs prose-table:md:text-sm prose-th:bg-slate-900 prose-th:text-white prose-th:p-3 prose-td:p-3 prose-td:border prose-td:border-slate-200 prose-blockquote:border-l-4 prose-blockquote:border-blue-900 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>

        {/* Quick Internal Service Navigation Links */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Wrench className="w-4 h-4" />
            Related Garage Services in Bowling Green, KY
          </div>
          <h3 className="text-lg font-black mb-4">
            Need Professional Repair or Replacement Today?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {serviceLinks.map((s) => (
              <button
                key={s.path}
                onClick={() => {
                  onNavigate(s.path);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-slate-800 hover:bg-slate-700 text-left p-3.5 rounded-xl border border-slate-700 transition-colors group flex flex-col gap-0.5 cursor-pointer"
              >
                <span className="font-bold text-xs text-white group-hover:text-amber-400 flex items-center justify-between">
                  {s.title}
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-[11px] text-slate-400">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Local Dispatch & Trust Info Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Local Bowling Green Service Dispatch
          </div>
          <h3 className="text-xl font-black text-slate-900">Bowling Green Garage Door Repair</h3>
          <p className="text-slate-600 text-xs md:text-sm mt-2 leading-relaxed">
            Serving Bowling Green, Smiths Grove, Alvaton, Franklin, Glasgow, and all surrounding Warren County communities with 24/7 same-day overhead door service.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Same-Day Emergency Service</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Licensed, Insured & Bonded</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Upfront Written Pricing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Multi-Year Parts & Labor Warranty</span>
            </div>
          </div>
        </div>

        {/* Related Articles Card */}
        {relatedPosts.length > 0 && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 border-l-4 border-amber-500 pl-3 mb-6">
              More Recommended Articles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <article
                  key={rel.slug}
                  onClick={() => {
                    onNavigate(`blog/${rel.slug}`);
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className="group cursor-pointer flex flex-col justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-blue-900 transition-all hover:shadow-md"
                >
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">
                      {rel.category}
                    </span>
                    <h4 className="text-xs md:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug mt-1">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-blue-900">
                    <span>{formatDate(rel.date)}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Primary CTA Section */}
        <div className="bg-blue-900 text-white rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
              24/7 Emergency Service Available
            </span>
            <h3 className="text-xl md:text-2xl font-black">
              Have Questions or Need a Quick Estimate?
            </h3>
            <p className="text-blue-200 text-xs md:text-sm mt-1">
              Call our licensed Bowling Green repair technicians directly at (423) 555-8240.
            </p>
          </div>
          <a
            href="tel:4235558240"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3.5 px-6 rounded-xl text-xs md:text-sm tracking-wide transition-all border border-amber-600 shrink-0 shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4 fill-current" />
            CALL (423) 555-8240
          </a>
        </div>

        {/* Navigation link back to blog index */}
        <div>
          <button
            onClick={() => {
              onNavigate('blog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-900 transition-colors bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            Back to All Blog Articles
          </button>
        </div>
      </main>
    </div>
  );
}

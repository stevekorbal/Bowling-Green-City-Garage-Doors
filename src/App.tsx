import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import ServiceView from './components/ServiceView';
import CityView from './components/CityView';
import FaqView from './components/FaqView';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import LegalViews from './components/LegalViews';
import ServiceAreasView from './components/ServiceAreasView';
import WhyChooseUsView from './components/WhyChooseUsView';
import BlogIndexView from './components/BlogIndexView';
import BlogPostView from './components/BlogPostView';
import { servicesData } from './data/servicesData';
import { citiesData } from './data/citiesData';
import { getPostBySlug } from './lib/blog';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';
    return path;
  });

  // Google Analytics & Search Console Integration
  useEffect(() => {
    const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    const searchConsoleVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;

    // 1. Google Search Console Verification Tag Update
    if (searchConsoleVerification && searchConsoleVerification !== 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE') {
      let gscMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!gscMeta) {
        gscMeta = document.createElement('meta');
        gscMeta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(gscMeta);
      }
      gscMeta.setAttribute('content', searchConsoleVerification);
    }

    // 2. Google Analytics (GA4) Integration
    if (gaMeasurementId && gaMeasurementId !== 'G-XXXXXXXXXX') {
      if (!document.getElementById('ga-gtag-script')) {
        const script = document.createElement('script');
        script.id = 'ga-gtag-script';
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer?.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', gaMeasurementId);
      } else if (window.gtag) {
        // Send page view event on route change
        const pagePath = currentPath === 'home' || currentPath === '' ? '/' : `/${currentPath}`;
        window.gtag('config', gaMeasurementId, {
          page_path: pagePath,
          page_title: document.title
        });
      }
    }
  }, [currentPath]);

  // Monitor URL history state routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic SEO Tag and Schema Injection
  useEffect(() => {
    // 1. Determine Title & Description based on currentPath
    let title = 'Garage Door Repair Bowling Green KY | 24/7 Same-Day Service';
    let description = 'Premium, fast-loading garage door repair, spring replacement, opener installation, and 24/7 emergency services in Bowling Green, KY and Warren County.';
    let schemaJson: any = null;

    const envDomain = import.meta.env.VITE_SITE_URL || import.meta.env.VITE_DOMAIN;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const isLocalOrDev = origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('run.app');
    const baseDomain = (envDomain || (!isLocalOrDev && origin ? origin : 'https://www.garagedoorrepairbowlinggreenky.com')).replace(/\/+$/, '');
    const canonicalUrl = `${baseDomain}/${currentPath === 'home' || currentPath === '' ? '' : currentPath}`;

    const serviceIds = [
      'garage-door-repair',
      'garage-door-spring-repair',
      'garage-door-opener-repair',
      'garage-door-opener-installation',
      'garage-door-installation',
      'emergency-garage-door-repair'
    ];

    let cleanServiceId = '';
    if (currentPath.startsWith('service/')) {
      cleanServiceId = currentPath.split('/')[1];
    } else if (serviceIds.includes(currentPath)) {
      cleanServiceId = currentPath;
    }

    if (cleanServiceId && servicesData[cleanServiceId]) {
      const service = servicesData[cleanServiceId];
      title = service.metaTitle;
      description = service.metaDescription;

      // Build Service Schema & FAQ Schema
      const mainSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': service.title.split('|')[0].trim(),
        'description': service.shortDesc,
        'provider': {
          '@type': 'LocalBusiness',
          'name': 'Bowling Green Garage Door Repair',
          'telephone': '+13642018889',
          'priceRange': '$$',
          'image': `${baseDomain}/src/assets/images/garage_door_hero_1784628372796.jpg`,
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': '120 E Main Ave',
            'addressLocality': 'Bowling Green',
            'addressRegion': 'KY',
            'postalCode': '42101',
            'addressCountry': 'US'
          }
        },
        'areaServed': [
          { '@type': 'AdministrativeArea', 'name': 'Bowling Green, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Smiths Grove, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Oakland, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Alvaton, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Franklin, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Scottsville, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Glasgow, KY' }
        ]
      };

      if (service.faqs && service.faqs.length > 0) {
        schemaJson = [
          mainSchema,
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': service.faqs.map(faq => ({
              '@type': 'Question',
              'name': faq.question,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
              }
            }))
          }
        ];
      } else {
        schemaJson = mainSchema;
      }
    } else if (currentPath.startsWith('city/')) {
      const cityId = currentPath.split('/')[1];
      if (citiesData[cityId]) {
        const city = citiesData[cityId];
        title = city.metaTitle;
        description = city.metaDescription;

        schemaJson = {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': `Bowling Green Garage Door Repair - ${city.cityName}`,
          'description': city.intro,
          'telephone': '+13642018889',
          'priceRange': '$$',
          'url': canonicalUrl,
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': city.cityName.split(',')[0].trim(),
            'addressRegion': 'KY',
            'addressCountry': 'US'
          }
        };
      }
    } else if (currentPath.startsWith('blog/')) {
      const slug = currentPath.replace(/^blog\//, '');
      const post = getPostBySlug(slug);
      if (post) {
        title = `${post.title} | Bowling Green Garage Door Repair`;
        description = post.description;

        schemaJson = {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': post.title,
          'description': post.description,
          'image': [
            post.featuredImage.startsWith('http')
              ? post.featuredImage
              : `${baseDomain}${post.featuredImage.startsWith('/') ? '' : '/'}${post.featuredImage}`
          ],
          'datePublished': post.date,
          'dateModified': post.updatedDate || post.date,
          'author': {
            '@type': 'Organization',
            'name': post.author
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Bowling Green Garage Door Repair',
            'logo': {
              '@type': 'ImageObject',
              'url': `${baseDomain}/assets/images/garage-door-repair.png`
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': canonicalUrl
          }
        };
      }
    } else {
      switch (currentPath) {
        case 'blog':
          title = 'Blog & Repair Guides | Bowling Green Garage Door Repair';
          description = 'Expert garage door repair guides, spring replacement cost breakdowns, and opener troubleshooting tips for Bowling Green, KY homeowners.';
          break;
        case 'about':
          title = 'About Us | Bowling Green Garage Door Repair KY';
          description = 'Learn about Bowling Green Garage Door Repair in Bowling Green, KY. Licensed, bonded, and insured local overhead door specialists.';
          break;
        case 'why-choose-us':
          title = 'Why Choose Us | Bowling Green Garage Door Repair KY';
          description = 'Discover why homeowners and businesses in Bowling Green, KY trust us for their garage door repairs and installations. Same-day service, clear warranties.';
          break;
        case 'service-areas':
          title = 'Service Areas | Garage Door Repair in Bowling Green & South Central KY';
          description = 'We proudly serve Bowling Green, Smiths Grove, Oakland, Alvaton, Franklin, Scottsville, Glasgow, and surrounding South Central Kentucky communities.';
          break;
        case 'faqs':
          title = 'Frequently Asked Questions | Garage Door Repair Bowling Green KY';
          description = 'Got questions about broken springs, opener issues, or new door installations? Check out our helpful FAQs or call today for immediate help.';
          break;
        case 'contact':
          title = 'Contact Us | Bowling Green Garage Door Repair KY';
          description = 'Get in touch with our local team for emergency repairs or free estimates in Bowling Green, KY. We\'re available 24/7 at 364-201-8889.';
          break;
        case 'privacy-policy':
          title = 'Privacy Policy | Bowling Green Garage Door Repair';
          description = 'Read our privacy policy to understand how we protect your information when you contact us for garage door services.';
          break;
        case 'terms-and-conditions':
          title = 'Terms & Conditions | Bowling Green Garage Door Repair';
          description = 'Review our service terms and conditions for residential and commercial garage door services.';
          break;
        default:
          title = 'Garage Door Repair Bowling Green KY | 24/7 Same-Day Service';
          description = 'Premium, fast-loading garage door repair, spring replacement, opener installation, and 24/7 emergency services in Bowling Green, KY and Warren County.';
          break;
      }

      // Default LocalBusiness Schema for static views / home
      schemaJson = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Bowling Green Garage Door Repair',
        'image': `${baseDomain}/src/assets/images/garage_door_hero_1784628372796.jpg`,
        '@id': `${baseDomain}/`,
        'url': `${baseDomain}/`,
        'telephone': '+13642018889',
        'priceRange': '$$',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '120 E Main Ave',
          'addressLocality': 'Bowling Green',
          'addressRegion': 'KY',
          'postalCode': '42101',
          'addressCountry': 'US'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 36.9903,
          'longitude': -86.4436
        },
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ],
          'opens': '00:00',
          'closes': '23:59'
        },
        'areaServed': [
          { '@type': 'AdministrativeArea', 'name': 'Bowling Green, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Smiths Grove, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Oakland, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Alvaton, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Franklin, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Scottsville, KY' },
          { '@type': 'AdministrativeArea', 'name': 'Glasgow, KY' }
        ]
      };
    }

    // 2. Set Document Title
    document.title = title;

    // 3. Set Description Meta tag
    let metaDescriptionEl = document.querySelector('meta[name="description"]');
    if (!metaDescriptionEl) {
      metaDescriptionEl = document.createElement('meta');
      metaDescriptionEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescriptionEl);
    }
    metaDescriptionEl.setAttribute('content', description);

    // 4. Set Canonical Link tag
    let canonicalLinkEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalLinkEl) {
      canonicalLinkEl = document.createElement('link');
      canonicalLinkEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLinkEl);
    }
    canonicalLinkEl.setAttribute('href', canonicalUrl);

    // 5. Inject/Update Schema JSON-LD script
    let schemaScriptEl = document.getElementById('seo-schema-markup');
    if (schemaScriptEl) {
      schemaScriptEl.remove();
    }
    if (schemaJson) {
      schemaScriptEl = document.createElement('script');
      schemaScriptEl.setAttribute('id', 'seo-schema-markup');
      schemaScriptEl.setAttribute('type', 'application/ld+json');
      schemaScriptEl.textContent = JSON.stringify(schemaJson);
      document.head.appendChild(schemaScriptEl);
    }
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    const targetPath = path === 'home' || path === '' ? '/' : `/${path}`;
    window.history.pushState(null, '', targetPath);
    setCurrentPath(path === 'home' ? 'home' : path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Render correct view based on path
  const renderContent = () => {
    if (currentPath === 'home' || currentPath === '') {
      return <HomeView onNavigate={handleNavigate} />;
    }
    
    const serviceIds = [
      'garage-door-repair',
      'garage-door-spring-repair',
      'garage-door-opener-repair',
      'garage-door-opener-installation',
      'garage-door-installation',
      'emergency-garage-door-repair'
    ];

    if (currentPath.startsWith('service/')) {
      const serviceId = currentPath.split('/')[1];
      return <ServiceView serviceId={serviceId} onNavigate={handleNavigate} />;
    }

    if (serviceIds.includes(currentPath)) {
      return <ServiceView serviceId={currentPath} onNavigate={handleNavigate} />;
    }

    if (currentPath.startsWith('city/')) {
      const cityId = currentPath.split('/')[1];
      return <CityView cityId={cityId} onNavigate={handleNavigate} />;
    }

    if (currentPath === 'blog') {
      return <BlogIndexView onNavigate={handleNavigate} />;
    }

    if (currentPath.startsWith('blog/')) {
      const slug = currentPath.replace(/^blog\//, '');
      return <BlogPostView slug={slug} onNavigate={handleNavigate} />;
    }

    switch (currentPath) {
      case 'about':
        return <AboutView onNavigate={handleNavigate} />;
      case 'why-choose-us':
        return <WhyChooseUsView onNavigate={handleNavigate} />;
      case 'service-areas':
        return <ServiceAreasView onNavigate={handleNavigate} />;
      case 'faqs':
        return <FaqView onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactView onNavigate={handleNavigate} />;
      case 'privacy-policy':
        return <LegalViews type="privacy" onNavigate={handleNavigate} />;
      case 'terms-and-conditions':
        return <LegalViews type="terms" onNavigate={handleNavigate} />;
      default:
        // Default Fallback
        return <HomeView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Dynamic Header */}
      <Header currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Primary Page Content */}
      <main className="flex-grow w-full">
        {renderContent()}
      </main>

      {/* Unified Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

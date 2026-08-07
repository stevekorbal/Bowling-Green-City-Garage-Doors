export interface ServicePage {
  id: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  shortDesc: string;
  intro: string;
  commonProblems: string[];
  signsYouNeedService: string[];
  benefitsOfService: string[];
  whenReplacementIsBetter: string;
  stepByStepProcess: string[];
  faqs: { question: string; answer: string }[];
  imageAlt: string;
}

export interface CityData {
  id: string;
  cityName: string;
  countyName?: string;
  metaTitle: string;
  metaDescription: string;
  heroHeading?: string;
  heroSubheading?: string;
  introText?: string;
  intro?: string;
  repairContent?: string;
  installationContent?: string;
  emergencyContent?: string;
  springsOpenersContent?: string;
  sameDayServiceContent?: string;
  population?: string;
  postalCodes?: string[];
  landmarks?: string[];
  neighborhoods: string[];
  commonDoorTypes?: string[];
  faqs?: { question: string; answer: string }[];
  localTestimonial?: {
    quote: string;
    author: string;
    location?: string;
    neighborhood?: string;
  };
}

export type CityPage = CityData;

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'springs' | 'openers' | 'emergency' | 'maintenance' | 'installation' | 'pricing' | 'general';
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  text: string;
  service: string;
}

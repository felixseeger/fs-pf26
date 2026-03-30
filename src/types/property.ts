export type MarketingType = 'Sale' | 'Rent';

export interface Property {
  id: string;
  title: string;
  address: string;
  street?: string;
  houseNumber?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
  marketingType?: MarketingType;
  propertyType?: string;
  price: number;
  status: 'For Sale' | 'For Rent' | 'Sold' | 'Rented';
  type: 'Residential' | 'Commercial' | 'Land';
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: number;
  sqft: number;
  mainImage: string;
  images: string[];
  lat?: number;
  lng?: number;
  features: string[];
}

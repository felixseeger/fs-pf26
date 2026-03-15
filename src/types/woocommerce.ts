export interface WCImage {
  id: number;
  src: string;
  alt: string;
}

export interface WCProductCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

/** Attribute on the parent product — lists all available options */
export interface WCProductAttribute {
  id: number;
  name: string;
  slug: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

/** Attribute value on a specific variation */
export interface WCVariationAttribute {
  id: number;
  name: string;
  slug: string;
  /** Empty string means "any" — matches all options for this attribute */
  option: string;
}

export interface WCProductVariation {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  downloadable: boolean;
  virtual: boolean;
  image?: WCImage;
  attributes: WCVariationAttribute[];
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  status: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  images: WCImage[];
  categories: WCProductCategory[];
  attributes: WCProductAttribute[];
  short_description: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  downloadable: boolean;
  virtual: boolean;
}

// 54 real Kenyan local businesses + 26 famous international businesses (Pro plan only)
// logoUrl: real logo proxy (/api/logo) — fetches the REAL logo from each company's actual domain, always works, no API key
// website: the real domain, used both for the logo fetch and as a trust signal

import { EARN_RATES, WITHDRAWAL_TAX_RATE } from '../lib/config';
export { EARN_RATES };
export const TAX_RATE = WITHDRAWAL_TAX_RATE;

export const BUSINESSES = [
  // ── TELECOM ──
  { id:"safaricom", region:"local", name:"Safaricom PLC", category:"Telecom", website:"safaricom.co.ke",
    address:"Safaricom House, Waiyaki Way, Nairobi", description:"Kenya's largest telecom & M-Pesa mobile money provider",
    verified:true, featured:true, color:"#007A3D", initial:"S" },
  { id:"airtel-kenya", region:"local", name:"Airtel Kenya", category:"Telecom", website:"airtelkenya.com",
    address:"Airtel Networks, Upper Hill, Nairobi", description:"Second largest mobile network operator in Kenya",
    verified:true, color:"#DC2626", initial:"A" },
  { id:"telkom-kenya", region:"local", name:"Telkom Kenya", category:"Telecom", website:"telkom.co.ke",
    address:"Telkom Plaza, Ralph Bunche Road, Nairobi", description:"Fixed, mobile and data services across Kenya",
    verified:true, color:"#F97316", initial:"T" },

  // ── BANKING ──
  { id:"equity-bank", region:"local", name:"Equity Bank Kenya", category:"Banking", website:"equitygroupholdings.com",
    address:"Equity Centre, Hospital Road, Upper Hill", description:"Banking solutions for millions across East Africa",
    verified:true, featured:true, color:"#CE1126", initial:"E" },
  { id:"kcb-bank", region:"local", name:"KCB Bank Kenya", category:"Banking", website:"kcbgroup.com",
    address:"KCB Towers, Upper Hill, Nairobi", description:"Kenya Commercial Bank — largest bank by assets",
    verified:true, featured:true, color:"#1D4ED8", initial:"K" },
  { id:"cooperative-bank", region:"local", name:"Co-operative Bank", category:"Banking", website:"co-opbank.co.ke",
    address:"Co-op House, Haile Selassie Ave, Nairobi", description:"Serving Kenyan cooperatives and farmers since 1965",
    verified:true, color:"#005B99", initial:"C" },
  { id:"absa-kenya", region:"local", name:"Absa Bank Kenya", category:"Banking", website:"absabank.co.ke",
    address:"Absa Towers, Loita Street, Nairobi", description:"Pan-African bank formerly known as Barclays Kenya",
    verified:true, color:"#DC2626", initial:"A" },
  { id:"ncba-bank", region:"local", name:"NCBA Bank Kenya", category:"Banking", website:"ncbagroup.com",
    address:"NCBA Centre, Mombasa Road, Nairobi", description:"Formed by merger of NIC & CBA — home of M-Shwari",
    verified:true, color:"#0891B2", initial:"N" },
  { id:"standard-chartered", region:"local", name:"Standard Chartered Kenya", category:"Banking", website:"sc.com",
    address:"Standard Chartered Centre, Chiromo Road", description:"International bank with deep roots in Kenya",
    verified:true, color:"#00A3DE", initial:"S" },
  { id:"family-bank", region:"local", name:"Family Bank Kenya", category:"Banking", website:"familybank.co.ke",
    address:"Family Bank Towers, Muindi Mbingu St, Nairobi", description:"Community-focused bank for ordinary Kenyans",
    verified:true, color:"#059669", initial:"F" },

  // ── SUPERMARKETS ──
  { id:"naivas", region:"local", name:"Naivas Supermarket", category:"Supermarket", website:"naivas.co.ke",
    address:"Multiple branches across Kenya", description:"Kenya's largest homegrown supermarket chain",
    verified:true, featured:true, color:"#7C3AED", initial:"N" },
  { id:"carrefour", region:"local", name:"Carrefour Kenya", category:"Supermarket", website:"carrefour.ke",
    address:"The Hub Karen, Garden City & Two Rivers", description:"French hypermarket with premium shopping experience",
    verified:true, color:"#1D4ED8", initial:"C" },
  { id:"quickmart", region:"local", name:"Quickmart Supermarket", category:"Supermarket", website:"quickmart.co.ke",
    address:"Multiple branches, Nairobi", description:"Fast-growing Kenyan supermarket with great deals",
    verified:true, color:"#D97706", initial:"Q" },
  { id:"cleanshelf", region:"local", name:"Cleanshelf Supermarket", category:"Supermarket", website:"cleanshelf.co.ke",
    address:"Ruiru, Kiambu, Thika", description:"Affordable supermarket for Central Kenya families",
    verified:true, color:"#0891B2", initial:"C" },
  { id:"chandarana", region:"local", name:"Chandarana Food Plus", category:"Supermarket", website:"chandaranafoodplus.com",
    address:"Lavington, Westlands, Karen", description:"Premium supermarket for quality-conscious Nairobians",
    verified:true, color:"#065F46", initial:"C" },

  // ── INSURANCE ──
  { id:"jubilee-insurance", region:"local", name:"Jubilee Insurance", category:"Insurance", website:"jubileeinsurance.com",
    address:"Jubilee Insurance House, Wabera St, Nairobi", description:"East Africa's leading insurer for 80+ years",
    verified:true, featured:true, color:"#1D4ED8", initial:"J" },
  { id:"britam", region:"local", name:"Britam Kenya", category:"Insurance", website:"britam.com",
    address:"Britam Tower, Upper Hill, Nairobi", description:"Diversified financial services — insurance to investments",
    verified:true, color:"#DC2626", initial:"B" },
  { id:"aar-insurance", region:"local", name:"AAR Insurance", category:"Insurance", website:"aarhealth.com",
    address:"AAR Centre, Westlands, Nairobi", description:"Kenya's #1 health insurance provider",
    verified:true, color:"#059669", initial:"A" },
  { id:"nhif", region:"local", name:"NHIF / SHA Kenya", category:"Insurance", website:"sha.go.ke",
    address:"Social Health Authority, Upper Hill", description:"National health insurance fund rebranded as SHA",
    verified:true, color:"#0891B2", initial:"N" },
  { id:"cic-insurance", region:"local", name:"CIC Insurance Group", category:"Insurance", website:"cic.co.ke",
    address:"CIC Plaza, Upperhill Road, Nairobi", description:"Insurance arm of the cooperative movement in Kenya",
    verified:true, color:"#7C3AED", initial:"C" },

  // ── FUEL & ENERGY ──
  { id:"total-energies", region:"local", name:"TotalEnergies Kenya", category:"Fuel", website:"totalenergies.co.ke",
    address:"Total House, Nyerere Road, Nairobi", description:"French energy giant operating fuel stations across Kenya",
    verified:true, color:"#DC2626", initial:"T" },
  { id:"vivo-energy", region:"local", name:"Vivo Energy (Shell)", category:"Fuel", website:"shell.co.ke",
    address:"Shell House, Waiyaki Way, Nairobi", description:"Shell-branded fuel stations across East Africa",
    verified:true, color:"#D97706", initial:"V" },
  { id:"rubis-energy", region:"local", name:"Rubis Energy Kenya", category:"Fuel", website:"rubis-kenya.com",
    address:"Rubis House, Westlands, Nairobi", description:"Formerly KenolKobil — now operating as Rubis Energy",
    verified:true, color:"#F97316", initial:"R" },
  { id:"kplc", region:"local", name:"Kenya Power (KPLC)", category:"Fuel", website:"kplc.co.ke",
    address:"Stima Plaza, Kolobot Road, Nairobi", description:"National electricity distributor — pay your token here",
    verified:true, color:"#065F46", initial:"K" },

  // ── HEALTHCARE ──
  { id:"aga-khan-hospital", region:"local", name:"Aga Khan Hospital", category:"Healthcare", website:"agakhanhospitals.org",
    address:"3rd Parklands Avenue, Nairobi", description:"Premier private hospital with world-class care",
    verified:true, featured:true, color:"#059669", initial:"A" },
  { id:"nairobi-hospital", region:"local", name:"Nairobi Hospital", category:"Healthcare", website:"nairobihospital.org",
    address:"Argwings Kodhek Road, Nairobi", description:"Kenya's most trusted private hospital since 1954",
    verified:true, color:"#1D4ED8", initial:"N" },
  { id:"mp-shah", region:"local", name:"MP Shah Hospital", category:"Healthcare", website:"mpshahhosp.org",
    address:"Shivachi Road, Parklands, Nairobi", description:"Affordable quality healthcare in Nairobi",
    verified:true, color:"#DC2626", initial:"M" },
  { id:"goodlife-pharmacy", region:"local", name:"Goodlife Pharmacy", category:"Healthcare", website:"goodlife.co.ke",
    address:"Nairobi, Mombasa, Kisumu & more", description:"Kenya's fastest-growing pharmacy chain",
    verified:true, color:"#0891B2", initial:"G" },

  // ── HOSPITALITY ──
  { id:"java-house", region:"local", name:"Java House Kenya", category:"Hospitality", website:"javahouseafrica.com",
    address:"50+ branches across Kenya", description:"Kenya's iconic coffee chain — born in Nairobi 1999",
    verified:true, featured:true, color:"#7C3AED", initial:"J" },
  { id:"artcaffe", region:"local", name:"ArtCaffe", category:"Hospitality", website:"artcaffe.co.ke",
    address:"Westgate, Lavington, Karen & more", description:"Artisanal cafe serving Nairobi's middle class",
    verified:true, color:"#D97706", initial:"A" },
  { id:"sarova-hotels", region:"local", name:"Sarova Hotels", category:"Hospitality", website:"sarovahotels.com",
    address:"Nairobi, Mombasa, Amboseli, Masai Mara", description:"Kenyan hotel chain celebrating authentic African hospitality",
    verified:true, color:"#F97316", initial:"S" },
  { id:"serena-hotels", region:"local", name:"Serena Hotels", category:"Hospitality", website:"serenahotels.com",
    address:"Nairobi, Mombasa, Amboseli & Maasai Mara", description:"Luxury eco-tourism hotels across East Africa",
    verified:true, color:"#065F46", initial:"S" },
  { id:"kfc-kenya", region:"local", name:"KFC Kenya", category:"Hospitality", website:"kfc.co.ke",
    address:"Multiple branches across Nairobi, Mombasa, Kisumu", description:"World-famous fried chicken chain with 20+ Kenyan outlets",
    verified:true, featured:true, color:"#E4002B", initial:"K" },
  { id:"pizza-hut-kenya", region:"local", name:"Pizza Hut Kenya", category:"Hospitality", website:"pizzahut.co.ke",
    address:"Multiple branches across Nairobi & Mombasa", description:"International pizza chain with delivery across major Kenyan cities",
    verified:true, color:"#EE3124", initial:"P" },
  { id:"subway-kenya", region:"local", name:"Subway Kenya", category:"Hospitality", website:"subway.com",
    address:"Westlands, Sarit Centre, Two Rivers & more", description:"Build-your-own sandwich chain with branches in Nairobi malls",
    verified:true, color:"#00543D", initial:"S" },
  { id:"dominos-kenya", region:"local", name:"Domino's Pizza Kenya", category:"Hospitality", website:"dominos.co.ke",
    address:"Multiple branches across Nairobi", description:"Fast pizza delivery chain operating across the capital",
    verified:true, color:"#0078AE", initial:"D" },
  { id:"hilton-nairobi", region:"local", name:"Hilton Nairobi", category:"Hospitality", website:"hilton.com",
    address:"Mama Ngina Street, Nairobi CBD", description:"Iconic 5-star hotel in the heart of Nairobi since 1969",
    verified:true, color:"#002F61", initial:"H" },
  { id:"radisson-blu-nairobi", region:"local", name:"Radisson Blu Nairobi", category:"Hospitality", website:"radissonhotels.com",
    address:"Upper Hill, Nairobi", description:"Upscale international hotel chain with Nairobi properties",
    verified:true, color:"#003DA5", initial:"R" },

  // ── TRANSPORT ──
  { id:"kenya-airways", region:"local", name:"Kenya Airways", category:"Transport", website:"kenya-airways.com",
    address:"JKIA, Nairobi", description:"The Pride of Africa — Kenya's national carrier",
    verified:true, featured:true, color:"#CE1126", initial:"K" },
  { id:"uber-kenya", region:"local", name:"Uber Kenya", category:"Transport", website:"uber.com",
    address:"Operates across Nairobi, Mombasa & Kisumu", description:"Ride-hailing giant operating in major Kenyan cities",
    verified:true, color:"#111827", initial:"U" },
  { id:"little-cab", region:"local", name:"Little Cab", category:"Transport", website:"littlecab.online",
    address:"Nairobi, Mombasa", description:"Kenyan-owned ride-hailing app by Craft Silicon",
    verified:true, color:"#D97706", initial:"L" },
  { id:"sgr-kenya", region:"local", name:"Madaraka Express (SGR)", category:"Transport", website:"krc.co.ke",
    address:"Nairobi Terminus, South C", description:"Modern standard gauge railway Nairobi–Mombasa",
    verified:true, color:"#0891B2", initial:"M" },

  // ── ECOMMERCE & TECH ──
  { id:"jumia-kenya", region:"local", name:"Jumia Kenya", category:"E-Commerce", website:"jumia.co.ke",
    address:"Jumia Hub, Embakasi, Nairobi", description:"Africa's largest e-commerce platform",
    verified:true, featured:true, color:"#F97316", initial:"J" },
  { id:"mpesa", region:"local", name:"M-Pesa", category:"E-Commerce", website:"safaricom.co.ke",
    address:"Nationwide — wherever Safaricom reaches", description:"World's leading mobile money transfer platform",
    verified:true, color:"#007A3D", initial:"M" },
  { id:"sendy", region:"local", name:"Sendy Kenya", category:"E-Commerce", website:"sendyit.com",
    address:"Kilimani, Nairobi", description:"Tech-powered logistics & last-mile delivery",
    verified:true, color:"#7C3AED", initial:"S" },
  { id:"kilimall", region:"local", name:"Kilimall Kenya", category:"E-Commerce", website:"kilimall.co.ke",
    address:"Online — ships across Kenya", description:"Kenyan online marketplace with local sellers",
    verified:true, color:"#059669", initial:"K" },

  // ── GOVERNMENT SERVICES ──
  { id:"ecitizen", region:"local", name:"eCitizen Kenya", category:"Government", website:"ecitizen.go.ke",
    address:"Online — ecitizen.go.ke", description:"Kenya's digital government portal — passports, IDs & more",
    verified:true, featured:true, color:"#CE1126", initial:"E" },
  { id:"kra", region:"local", name:"Kenya Revenue Authority", category:"Government", website:"kra.go.ke",
    address:"Times Tower, Haile Selassie Ave", description:"National revenue collection agency — iTax & customs",
    verified:true, color:"#1D4ED8", initial:"K" },
  { id:"ntsa", region:"local", name:"NTSA Kenya", category:"Government", website:"ntsa.go.ke",
    address:"NTSA Offices, Nairobi", description:"National Transport & Safety Authority — driving licences",
    verified:true, color:"#0891B2", initial:"N" },

  // ── EDUCATION ──
  { id:"university-nairobi", region:"local", name:"University of Nairobi", category:"Education", website:"uonbi.ac.ke",
    address:"University Way, Nairobi", description:"Kenya's oldest and largest public university",
    verified:true, color:"#1D4ED8", initial:"U" },
  { id:"strathmore", region:"local", name:"Strathmore University", category:"Education", website:"strathmore.edu",
    address:"Ole Sangale Road, Madaraka, Nairobi", description:"Top-ranked Kenyan private university known for business",
    verified:true, color:"#7C3AED", initial:"S" },
  { id:"kenyatta-university", region:"local", name:"Kenyatta University", category:"Education", website:"ku.ac.ke",
    address:"Thika Road, Nairobi", description:"Second largest public university in Kenya",
    verified:true, color:"#D97706", initial:"K" },

  // ── REAL ESTATE ──
  { id:"hass-consult", region:"local", name:"HassConsult", category:"Real Estate", website:"hassconsult.co.ke",
    address:"The Oval, Ring Road Parklands", description:"Kenya's top real estate research & brokerage firm",
    verified:true, color:"#F97316", initial:"H" },
  { id:"knight-frank", region:"local", name:"Knight Frank Kenya", category:"Real Estate", website:"knightfrank.co.ke",
    address:"The Pavilion, Lower Kabete Road", description:"International property consultancy with Nairobi HQ",
    verified:true, color:"#065F46", initial:"K" },
];

// ── INTERNATIONAL BUSINESSES (Pro plan only) ──
// Global brands reviewed by ReviewKE's Pro subscribers. These pay higher
// per-review rates (set via earnMultiplier below) since the platform
// charges Pro users a subscription instead of per-review fees, and global
// brand review work typically commands a premium over local listings.
export const INTERNATIONAL_BUSINESSES = [
  { id:"google", region:"international", name:"Google", category:"Tech", website:"google.com",
    address:"Mountain View, California, USA", description:"World's leading search engine and technology company",
    verified:true, featured:true, color:"#4285F4", initial:"G", earnMultiplier:1.5 },
  { id:"meta", region:"international", name:"Meta (Facebook)", category:"Tech", website:"meta.com",
    address:"Menlo Park, California, USA", description:"Parent company of Facebook, Instagram and WhatsApp",
    verified:true, featured:true, color:"#0866FF", initial:"M", earnMultiplier:1.5 },
  { id:"coca-cola", region:"international", name:"Coca-Cola", category:"Hospitality", website:"coca-cola.com",
    address:"Atlanta, Georgia, USA", description:"World's largest beverage corporation",
    verified:true, featured:true, color:"#F40009", initial:"C", earnMultiplier:1.4 },
  { id:"amazon", region:"international", name:"Amazon", category:"Tech", website:"amazon.com",
    address:"Seattle, Washington, USA", description:"Global e-commerce and cloud computing giant",
    verified:true, featured:true, color:"#FF9900", initial:"A", earnMultiplier:1.5 },
  { id:"microsoft", region:"international", name:"Microsoft", category:"Tech", website:"microsoft.com",
    address:"Redmond, Washington, USA", description:"Leading software, cloud and devices company",
    verified:true, color:"#00A4EF", initial:"M", earnMultiplier:1.5 },
  { id:"apple", region:"international", name:"Apple", category:"Tech", website:"apple.com",
    address:"Cupertino, California, USA", description:"Premium consumer electronics and software maker",
    verified:true, color:"#555555", initial:"A", earnMultiplier:1.6 },
  { id:"netflix", region:"international", name:"Netflix", category:"Tech", website:"netflix.com",
    address:"Los Gatos, California, USA", description:"World's leading streaming entertainment service",
    verified:true, color:"#E50914", initial:"N", earnMultiplier:1.4 },
  { id:"mcdonalds", region:"international", name:"McDonald's", category:"Hospitality", website:"mcdonalds.com",
    address:"Chicago, Illinois, USA", description:"World's largest fast food restaurant chain",
    verified:true, color:"#FFC72C", initial:"M", earnMultiplier:1.3 },
  { id:"nike", region:"international", name:"Nike", category:"E-Commerce", website:"nike.com",
    address:"Beaverton, Oregon, USA", description:"Global leader in athletic footwear and apparel",
    verified:true, color:"#111111", initial:"N", earnMultiplier:1.4 },
  { id:"samsung", region:"international", name:"Samsung", category:"Tech", website:"samsung.com",
    address:"Seoul, South Korea", description:"Leading global electronics and smartphone manufacturer",
    verified:true, color:"#1428A0", initial:"S", earnMultiplier:1.4 },
  { id:"airbnb", region:"international", name:"Airbnb", category:"Hospitality", website:"airbnb.com",
    address:"San Francisco, California, USA", description:"Global online marketplace for lodging and travel",
    verified:true, color:"#FF385C", initial:"A", earnMultiplier:1.4 },
  { id:"uber-global", region:"international", name:"Uber (Global)", category:"Transport", website:"uber.com",
    address:"San Francisco, California, USA", description:"Worldwide ride-hailing and delivery platform",
    verified:true, color:"#000000", initial:"U", earnMultiplier:1.3 },

  // ── INTERNATIONAL ONLINE STORES ──
  { id:"alibaba", region:"international", name:"Alibaba", category:"E-Commerce", website:"alibaba.com",
    address:"Hangzhou, China", description:"World's largest B2B and wholesale e-commerce marketplace",
    verified:true, featured:true, color:"#FF6A00", initial:"A", earnMultiplier:1.5 },
  { id:"aliexpress", region:"international", name:"AliExpress", category:"E-Commerce", website:"aliexpress.com",
    address:"Hangzhou, China", description:"Global online retail platform owned by Alibaba Group",
    verified:true, color:"#E62E04", initial:"A", earnMultiplier:1.4 },
  { id:"ebay", region:"international", name:"eBay", category:"E-Commerce", website:"ebay.com",
    address:"San Jose, California, USA", description:"Pioneer global online auction and shopping marketplace",
    verified:true, color:"#E53238", initial:"E", earnMultiplier:1.4 },
  { id:"shein", region:"international", name:"SHEIN", category:"E-Commerce", website:"shein.com",
    address:"Singapore", description:"Fast-fashion e-commerce giant shipping worldwide",
    verified:true, color:"#000000", initial:"S", earnMultiplier:1.3 },
  { id:"walmart", region:"international", name:"Walmart", category:"E-Commerce", website:"walmart.com",
    address:"Bentonville, Arkansas, USA", description:"World's largest retail corporation by revenue",
    verified:true, color:"#0071CE", initial:"W", earnMultiplier:1.4 },

  // ── INTERNATIONAL HOTELS ──
  { id:"marriott", region:"international", name:"Marriott International", category:"Hospitality", website:"marriott.com",
    address:"Bethesda, Maryland, USA", description:"World's largest hotel chain with 30+ brands globally",
    verified:true, featured:true, color:"#A6192E", initial:"M", earnMultiplier:1.4 },
  { id:"hilton-global", region:"international", name:"Hilton Hotels (Global)", category:"Hospitality", website:"hilton.com",
    address:"McLean, Virginia, USA", description:"Global hospitality giant with properties in 100+ countries",
    verified:true, color:"#002F61", initial:"H", earnMultiplier:1.4 },
  { id:"hyatt", region:"international", name:"Hyatt Hotels", category:"Hospitality", website:"hyatt.com",
    address:"Chicago, Illinois, USA", description:"Premium global hotel chain known for luxury resorts",
    verified:true, color:"#9A1F2B", initial:"H", earnMultiplier:1.3 },
  { id:"ihg-hotels", region:"international", name:"IHG Hotels (Holiday Inn)", category:"Hospitality", website:"ihg.com",
    address:"Denham, United Kingdom", description:"Parent of Holiday Inn, Crowne Plaza and InterContinental",
    verified:true, color:"#A6192E", initial:"I", earnMultiplier:1.3 },
  { id:"booking-com", region:"international", name:"Booking.com", category:"Hospitality", website:"booking.com",
    address:"Amsterdam, Netherlands", description:"World's leading online hotel and travel booking platform",
    verified:true, color:"#003580", initial:"B", earnMultiplier:1.4 },

  // ── INTERNATIONAL RESTAURANTS ──
  { id:"starbucks", region:"international", name:"Starbucks", category:"Hospitality", website:"starbucks.com",
    address:"Seattle, Washington, USA", description:"World's largest coffeehouse chain",
    verified:true, featured:true, color:"#00704A", initial:"S", earnMultiplier:1.4 },
  { id:"burger-king", region:"international", name:"Burger King", category:"Hospitality", website:"bk.com",
    address:"Miami, Florida, USA", description:"Global fast food chain famous for flame-grilled burgers",
    verified:true, color:"#D62300", initial:"B", earnMultiplier:1.3 },
  { id:"dominos-global", region:"international", name:"Domino's Pizza (Global)", category:"Hospitality", website:"dominos.com",
    address:"Ann Arbor, Michigan, USA", description:"World's largest pizza delivery company",
    verified:true, color:"#0078AE", initial:"D", earnMultiplier:1.3 },
  { id:"subway-global", region:"international", name:"Subway (Global)", category:"Hospitality", website:"subway.com",
    address:"Milford, Connecticut, USA", description:"World's largest sandwich chain by store count",
    verified:true, color:"#00543D", initial:"S", earnMultiplier:1.3 },
];

export const CATEGORIES = [
  "All","Telecom","Banking","Supermarket","Insurance",
  "Fuel","Healthcare","Hospitality","Transport",
  "E-Commerce","Government","Education","Real Estate","Tech"
];

// Returns a logo URL served through our own /api/logo proxy, which tries
// several real logo sources in sequence (DuckDuckGo favicons, Google
// favicons, the domain's own favicon.ico) before falling back to a
// generated initial badge — so this never produces a blank image.
export function logoUrl(biz, size = 128) {
  return `/api/logo?domain=${encodeURIComponent(biz.website)}&size=${size}&initial=${encodeURIComponent(biz.initial)}&color=${encodeURIComponent(biz.color)}`;
}

// Returns a real Google Places photo URL for this business, looked up by
// name + address (no hardcoded Place ID needed). Only works if
// GOOGLE_PLACES_API_KEY is set in your environment — see /api/place-photo.js.
// If the key is missing or no photo exists for this business, the
// endpoint returns 204 (no content), so pair this with an onError handler
// that falls back to logoUrl() above.
export function photoUrl(biz, maxwidth = 800) {
  return `/api/place-photo?name=${encodeURIComponent(biz.name)}&address=${encodeURIComponent(biz.address)}&maxwidth=${maxwidth}`;
}

// Earning rates and fees now live in lib/config.js — edit that file to
// change how much reviewers earn or what fees are charged. (Imported
// and re-exported at the top of this file.)

// All businesses, local + international, combined — used wherever a
// single flat list is needed (lookups, admin views, etc.). For the
// reviewer-facing pages, prefer filtering BUSINESSES / INTERNATIONAL_BUSINESSES
// directly based on the signed-in user's reviewPreference.
export const ALL_BUSINESSES = [...BUSINESSES, ...INTERNATIONAL_BUSINESSES];

export function getBizById(id) {
  return ALL_BUSINESSES.find(b => b.id === id);
}

// Returns the per-star earning amount for a business, applying its
// earnMultiplier if it has one (international/premium businesses pay more).
export function earnRateForBiz(biz, stars) {
  const base = EARN_RATES[stars] ?? EARN_RATES[3];
  const mult = biz?.earnMultiplier || 1;
  return Math.round(base * mult);
}

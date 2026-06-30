// 50 real Kenyan businesses
// logoUrl: Google's favicon service — fetches the REAL logo from each company's actual domain, always works, no API key
// website: the real domain, used both for the logo fetch and as a trust signal

export const BUSINESSES = [
  // ── TELECOM ──
  { id:"safaricom", name:"Safaricom PLC", category:"Telecom", website:"safaricom.co.ke",
    address:"Safaricom House, Waiyaki Way, Nairobi", description:"Kenya's largest telecom & M-Pesa mobile money provider",
    verified:true, featured:true, color:"#007A3D", initial:"S" },
  { id:"airtel-kenya", name:"Airtel Kenya", category:"Telecom", website:"airtelkenya.com",
    address:"Airtel Networks, Upper Hill, Nairobi", description:"Second largest mobile network operator in Kenya",
    verified:true, color:"#DC2626", initial:"A" },
  { id:"telkom-kenya", name:"Telkom Kenya", category:"Telecom", website:"telkom.co.ke",
    address:"Telkom Plaza, Ralph Bunche Road, Nairobi", description:"Fixed, mobile and data services across Kenya",
    verified:true, color:"#F97316", initial:"T" },

  // ── BANKING ──
  { id:"equity-bank", name:"Equity Bank Kenya", category:"Banking", website:"equitygroupholdings.com",
    address:"Equity Centre, Hospital Road, Upper Hill", description:"Banking solutions for millions across East Africa",
    verified:true, featured:true, color:"#CE1126", initial:"E" },
  { id:"kcb-bank", name:"KCB Bank Kenya", category:"Banking", website:"kcbgroup.com",
    address:"KCB Towers, Upper Hill, Nairobi", description:"Kenya Commercial Bank — largest bank by assets",
    verified:true, featured:true, color:"#1D4ED8", initial:"K" },
  { id:"cooperative-bank", name:"Co-operative Bank", category:"Banking", website:"co-opbank.co.ke",
    address:"Co-op House, Haile Selassie Ave, Nairobi", description:"Serving Kenyan cooperatives and farmers since 1965",
    verified:true, color:"#005B99", initial:"C" },
  { id:"absa-kenya", name:"Absa Bank Kenya", category:"Banking", website:"absabank.co.ke",
    address:"Absa Towers, Loita Street, Nairobi", description:"Pan-African bank formerly known as Barclays Kenya",
    verified:true, color:"#DC2626", initial:"A" },
  { id:"ncba-bank", name:"NCBA Bank Kenya", category:"Banking", website:"ncbagroup.com",
    address:"NCBA Centre, Mombasa Road, Nairobi", description:"Formed by merger of NIC & CBA — home of M-Shwari",
    verified:true, color:"#0891B2", initial:"N" },
  { id:"standard-chartered", name:"Standard Chartered Kenya", category:"Banking", website:"sc.com",
    address:"Standard Chartered Centre, Chiromo Road", description:"International bank with deep roots in Kenya",
    verified:true, color:"#00A3DE", initial:"S" },
  { id:"family-bank", name:"Family Bank Kenya", category:"Banking", website:"familybank.co.ke",
    address:"Family Bank Towers, Muindi Mbingu St, Nairobi", description:"Community-focused bank for ordinary Kenyans",
    verified:true, color:"#059669", initial:"F" },

  // ── SUPERMARKETS ──
  { id:"naivas", name:"Naivas Supermarket", category:"Supermarket", website:"naivas.co.ke",
    address:"Multiple branches across Kenya", description:"Kenya's largest homegrown supermarket chain",
    verified:true, featured:true, color:"#7C3AED", initial:"N" },
  { id:"carrefour", name:"Carrefour Kenya", category:"Supermarket", website:"carrefour.ke",
    address:"The Hub Karen, Garden City & Two Rivers", description:"French hypermarket with premium shopping experience",
    verified:true, color:"#1D4ED8", initial:"C" },
  { id:"quickmart", name:"Quickmart Supermarket", category:"Supermarket", website:"quickmart.co.ke",
    address:"Multiple branches, Nairobi", description:"Fast-growing Kenyan supermarket with great deals",
    verified:true, color:"#D97706", initial:"Q" },
  { id:"cleanshelf", name:"Cleanshelf Supermarket", category:"Supermarket", website:"cleanshelf.co.ke",
    address:"Ruiru, Kiambu, Thika", description:"Affordable supermarket for Central Kenya families",
    verified:true, color:"#0891B2", initial:"C" },
  { id:"chandarana", name:"Chandarana Food Plus", category:"Supermarket", website:"chandaranafoodplus.com",
    address:"Lavington, Westlands, Karen", description:"Premium supermarket for quality-conscious Nairobians",
    verified:true, color:"#065F46", initial:"C" },

  // ── INSURANCE ──
  { id:"jubilee-insurance", name:"Jubilee Insurance", category:"Insurance", website:"jubileeinsurance.com",
    address:"Jubilee Insurance House, Wabera St, Nairobi", description:"East Africa's leading insurer for 80+ years",
    verified:true, featured:true, color:"#1D4ED8", initial:"J" },
  { id:"britam", name:"Britam Kenya", category:"Insurance", website:"britam.com",
    address:"Britam Tower, Upper Hill, Nairobi", description:"Diversified financial services — insurance to investments",
    verified:true, color:"#DC2626", initial:"B" },
  { id:"aar-insurance", name:"AAR Insurance", category:"Insurance", website:"aarhealth.com",
    address:"AAR Centre, Westlands, Nairobi", description:"Kenya's #1 health insurance provider",
    verified:true, color:"#059669", initial:"A" },
  { id:"nhif", name:"NHIF / SHA Kenya", category:"Insurance", website:"sha.go.ke",
    address:"Social Health Authority, Upper Hill", description:"National health insurance fund rebranded as SHA",
    verified:true, color:"#0891B2", initial:"N" },
  { id:"cic-insurance", name:"CIC Insurance Group", category:"Insurance", website:"cic.co.ke",
    address:"CIC Plaza, Upperhill Road, Nairobi", description:"Insurance arm of the cooperative movement in Kenya",
    verified:true, color:"#7C3AED", initial:"C" },

  // ── FUEL & ENERGY ──
  { id:"total-energies", name:"TotalEnergies Kenya", category:"Fuel", website:"totalenergies.co.ke",
    address:"Total House, Nyerere Road, Nairobi", description:"French energy giant operating fuel stations across Kenya",
    verified:true, color:"#DC2626", initial:"T" },
  { id:"vivo-energy", name:"Vivo Energy (Shell)", category:"Fuel", website:"shell.co.ke",
    address:"Shell House, Waiyaki Way, Nairobi", description:"Shell-branded fuel stations across East Africa",
    verified:true, color:"#D97706", initial:"V" },
  { id:"rubis-energy", name:"Rubis Energy Kenya", category:"Fuel", website:"rubis-kenya.com",
    address:"Rubis House, Westlands, Nairobi", description:"Formerly KenolKobil — now operating as Rubis Energy",
    verified:true, color:"#F97316", initial:"R" },
  { id:"kplc", name:"Kenya Power (KPLC)", category:"Fuel", website:"kplc.co.ke",
    address:"Stima Plaza, Kolobot Road, Nairobi", description:"National electricity distributor — pay your token here",
    verified:true, color:"#065F46", initial:"K" },

  // ── HEALTHCARE ──
  { id:"aga-khan-hospital", name:"Aga Khan Hospital", category:"Healthcare", website:"agakhanhospitals.org",
    address:"3rd Parklands Avenue, Nairobi", description:"Premier private hospital with world-class care",
    verified:true, featured:true, color:"#059669", initial:"A" },
  { id:"nairobi-hospital", name:"Nairobi Hospital", category:"Healthcare", website:"nairobihospital.org",
    address:"Argwings Kodhek Road, Nairobi", description:"Kenya's most trusted private hospital since 1954",
    verified:true, color:"#1D4ED8", initial:"N" },
  { id:"mp-shah", name:"MP Shah Hospital", category:"Healthcare", website:"mpshahhosp.org",
    address:"Shivachi Road, Parklands, Nairobi", description:"Affordable quality healthcare in Nairobi",
    verified:true, color:"#DC2626", initial:"M" },
  { id:"goodlife-pharmacy", name:"Goodlife Pharmacy", category:"Healthcare", website:"goodlife.co.ke",
    address:"Nairobi, Mombasa, Kisumu & more", description:"Kenya's fastest-growing pharmacy chain",
    verified:true, color:"#0891B2", initial:"G" },

  // ── HOSPITALITY ──
  { id:"java-house", name:"Java House Kenya", category:"Hospitality", website:"javahouseafrica.com",
    address:"50+ branches across Kenya", description:"Kenya's iconic coffee chain — born in Nairobi 1999",
    verified:true, featured:true, color:"#7C3AED", initial:"J" },
  { id:"artcaffe", name:"ArtCaffe", category:"Hospitality", website:"artcaffe.co.ke",
    address:"Westgate, Lavington, Karen & more", description:"Artisanal cafe serving Nairobi's middle class",
    verified:true, color:"#D97706", initial:"A" },
  { id:"sarova-hotels", name:"Sarova Hotels", category:"Hospitality", website:"sarovahotels.com",
    address:"Nairobi, Mombasa, Amboseli, Masai Mara", description:"Kenyan hotel chain celebrating authentic African hospitality",
    verified:true, color:"#F97316", initial:"S" },
  { id:"serena-hotels", name:"Serena Hotels", category:"Hospitality", website:"serenahotels.com",
    address:"Nairobi, Mombasa, Amboseli & Maasai Mara", description:"Luxury eco-tourism hotels across East Africa",
    verified:true, color:"#065F46", initial:"S" },

  // ── TRANSPORT ──
  { id:"kenya-airways", name:"Kenya Airways", category:"Transport", website:"kenya-airways.com",
    address:"JKIA, Nairobi", description:"The Pride of Africa — Kenya's national carrier",
    verified:true, featured:true, color:"#CE1126", initial:"K" },
  { id:"uber-kenya", name:"Uber Kenya", category:"Transport", website:"uber.com",
    address:"Operates across Nairobi, Mombasa & Kisumu", description:"Ride-hailing giant operating in major Kenyan cities",
    verified:true, color:"#111827", initial:"U" },
  { id:"little-cab", name:"Little Cab", category:"Transport", website:"littlecab.online",
    address:"Nairobi, Mombasa", description:"Kenyan-owned ride-hailing app by Craft Silicon",
    verified:true, color:"#D97706", initial:"L" },
  { id:"sgr-kenya", name:"Madaraka Express (SGR)", category:"Transport", website:"krc.co.ke",
    address:"Nairobi Terminus, South C", description:"Modern standard gauge railway Nairobi–Mombasa",
    verified:true, color:"#0891B2", initial:"M" },

  // ── ECOMMERCE & TECH ──
  { id:"jumia-kenya", name:"Jumia Kenya", category:"E-Commerce", website:"jumia.co.ke",
    address:"Jumia Hub, Embakasi, Nairobi", description:"Africa's largest e-commerce platform",
    verified:true, featured:true, color:"#F97316", initial:"J" },
  { id:"mpesa", name:"M-Pesa", category:"E-Commerce", website:"safaricom.co.ke",
    address:"Nationwide — wherever Safaricom reaches", description:"World's leading mobile money transfer platform",
    verified:true, color:"#007A3D", initial:"M" },
  { id:"sendy", name:"Sendy Kenya", category:"E-Commerce", website:"sendyit.com",
    address:"Kilimani, Nairobi", description:"Tech-powered logistics & last-mile delivery",
    verified:true, color:"#7C3AED", initial:"S" },
  { id:"kilimall", name:"Kilimall Kenya", category:"E-Commerce", website:"kilimall.co.ke",
    address:"Online — ships across Kenya", description:"Kenyan online marketplace with local sellers",
    verified:true, color:"#059669", initial:"K" },

  // ── GOVERNMENT SERVICES ──
  { id:"ecitizen", name:"eCitizen Kenya", category:"Government", website:"ecitizen.go.ke",
    address:"Online — ecitizen.go.ke", description:"Kenya's digital government portal — passports, IDs & more",
    verified:true, featured:true, color:"#CE1126", initial:"E" },
  { id:"kra", name:"Kenya Revenue Authority", category:"Government", website:"kra.go.ke",
    address:"Times Tower, Haile Selassie Ave", description:"National revenue collection agency — iTax & customs",
    verified:true, color:"#1D4ED8", initial:"K" },
  { id:"ntsa", name:"NTSA Kenya", category:"Government", website:"ntsa.go.ke",
    address:"NTSA Offices, Nairobi", description:"National Transport & Safety Authority — driving licences",
    verified:true, color:"#0891B2", initial:"N" },

  // ── EDUCATION ──
  { id:"university-nairobi", name:"University of Nairobi", category:"Education", website:"uonbi.ac.ke",
    address:"University Way, Nairobi", description:"Kenya's oldest and largest public university",
    verified:true, color:"#1D4ED8", initial:"U" },
  { id:"strathmore", name:"Strathmore University", category:"Education", website:"strathmore.edu",
    address:"Ole Sangale Road, Madaraka, Nairobi", description:"Top-ranked Kenyan private university known for business",
    verified:true, color:"#7C3AED", initial:"S" },
  { id:"kenyatta-university", name:"Kenyatta University", category:"Education", website:"ku.ac.ke",
    address:"Thika Road, Nairobi", description:"Second largest public university in Kenya",
    verified:true, color:"#D97706", initial:"K" },

  // ── REAL ESTATE ──
  { id:"hass-consult", name:"HassConsult", category:"Real Estate", website:"hassconsult.co.ke",
    address:"The Oval, Ring Road Parklands", description:"Kenya's top real estate research & brokerage firm",
    verified:true, color:"#F97316", initial:"H" },
  { id:"knight-frank", name:"Knight Frank Kenya", category:"Real Estate", website:"knightfrank.co.ke",
    address:"The Pavilion, Lower Kabete Road", description:"International property consultancy with Nairobi HQ",
    verified:true, color:"#065F46", initial:"K" },
];

export const CATEGORIES = [
  "All","Telecom","Banking","Supermarket","Insurance",
  "Fuel","Healthcare","Hospitality","Transport",
  "E-Commerce","Government","Education","Real Estate"
];

// Returns a logo URL served through our own /api/logo proxy, which tries
// several real logo sources in sequence (DuckDuckGo favicons, Google
// favicons, the domain's own favicon.ico) before falling back to a
// generated initial badge — so this never produces a blank image.
export function logoUrl(biz, size = 128) {
  return `/api/logo?domain=${encodeURIComponent(biz.website)}&size=${size}&initial=${encodeURIComponent(biz.initial)}&color=${encodeURIComponent(biz.color)}`;
}

// Earning rates and fees now live in lib/config.js — edit that file to
// change how much reviewers earn or what fees are charged.
export { EARN_RATES, WITHDRAWAL_TAX_RATE as TAX_RATE } from '../lib/config';

export function getBizById(id) {
  return BUSINESSES.find(b => b.id === id);
}

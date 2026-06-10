import coilLampImg from '../assets/coil_lamp.png';
import nfcTagsImg from '../assets/nfc_tags.png';
import bmwLampImg from '../assets/bmw_lamp.png';

export const categories = ['All', 'Home Decor', 'Accessories', 'Automotive'];

export const products = [
  {
    id: 1,
    name: 'Coil Lamp',
    category: 'Home Decor',
    description:
      'A beautiful, modern spiral-wound lampshade that diffuses light with an elegant glow. Printed in translucent PETG for heat resistance and premium aesthetics. Includes integrated cable routing channel.',
    material: 'Translucent PETG',
    leadTime: '3–5 days',
    image: coilLampImg,
    highlight: true,
    badge: 'Best Seller',
    price: 2499,
  },
  {
    id: 2,
    name: 'NFC Tags',
    category: 'Accessories',
    description:
      'Custom-designed keychains with embedded NFC chips. Program them for link sharing, digital business cards, or smart home automations. Printed in heavy-duty TPU and PLA+ for absolute durability.',
    material: 'Tough PLA+ / TPU',
    leadTime: '1–2 days',
    image: nfcTagsImg,
    highlight: true,
    badge: 'Popular',
    price: 499,
  },
  {
    id: 3,
    name: 'BMW Lamp',
    category: 'Automotive',
    description:
      'An illuminated stand or wall-mount accent light featuring the iconic BMW logo. Perfect garage ornament or bedside lighting. Multi-material print with high-output LEDs pre-installed.',
    material: 'PLA+ / PETG',
    leadTime: '4–6 days',
    image: bmwLampImg,
    highlight: true,
    badge: 'Featured',
    price: 3499,
  },
];

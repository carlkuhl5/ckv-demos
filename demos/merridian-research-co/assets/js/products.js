// Placeholder catalog for the Phase 0 demo.
// In the full build this module is replaced by a fetch from the store back end
// (see BACKEND-NOTES.md). Keep the shape; the UI and the 3D labels read it.
//
// Only KLOW 80MG uses supplied label artwork. Every other product, every price,
// and every specification value below is a placeholder pending client data.

export const PRODUCTS = [
  {
    id: 'bpc-157',
    name: 'BPC-157',
    strength: '10mg',
    category: 'Peptides',
    price: 64,
    stock: 'In stock',
    theme: 'light',
    cap: '#d8d9de',
    puck: '#f4f2ee',
    placeholder: true,
    specs: {
      Form: 'Lyophilized powder',
      Purity: '≥99% (HPLC) · placeholder',
      'CAS no.': 'Pending client data',
      'Mol. weight': 'Pending client data',
      Lot: 'MR-DEMO-0157',
      Storage: '−20 °C · protect from light',
    },
  },
  {
    id: 'klow',
    name: 'KLOW',
    strength: '80mg',
    category: 'Blends',
    price: 129,
    stock: 'In stock',
    theme: 'dark',
    cap: '#6a0a18',
    puck: '#f4f2ee',
    placeholder: false,
    specs: {
      Form: 'Lyophilized powder',
      Purity: '≥99% (HPLC) · placeholder',
      Composition: 'Pending client data',
      'Mol. weight': 'Pending client data',
      Lot: 'MR-DEMO-0080',
      Storage: '−20 °C · protect from light',
    },
  },
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    strength: '50mg',
    category: 'Peptides',
    price: 54,
    stock: 'Low stock',
    theme: 'light',
    cap: '#26262b',
    puck: '#7fa6d9',
    placeholder: true,
    specs: {
      Form: 'Lyophilized powder',
      Purity: '≥99% (HPLC) · placeholder',
      'CAS no.': 'Pending client data',
      'Mol. weight': 'Pending client data',
      Lot: 'MR-DEMO-0050',
      Storage: '−20 °C · protect from light',
    },
  },
  {
    id: 'tb-500',
    name: 'TB-500',
    strength: '10mg',
    category: 'Peptides',
    price: 72,
    stock: 'In stock',
    theme: 'dark',
    cap: '#b9bdc5',
    puck: '#f4f2ee',
    placeholder: true,
    specs: {
      Form: 'Lyophilized powder',
      Purity: '≥99% (HPLC) · placeholder',
      'CAS no.': 'Pending client data',
      'Mol. weight': 'Pending client data',
      Lot: 'MR-DEMO-0500',
      Storage: '−20 °C · protect from light',
    },
  },
  {
    id: 'kpv',
    name: 'KPV',
    strength: '10mg',
    category: 'Peptides',
    price: 48,
    stock: 'Sold out',
    theme: 'light',
    cap: '#6a0a18',
    puck: '#f4f2ee',
    placeholder: true,
    specs: {
      Form: 'Lyophilized powder',
      Purity: '≥99% (HPLC) · placeholder',
      'CAS no.': 'Pending client data',
      'Mol. weight': 'Pending client data',
      Lot: 'MR-DEMO-0010',
      Storage: '−20 °C · protect from light',
    },
  },
];

// The three vials in the hero, in left-to-right order. They land in the
// featured row in this order, and the middle one carries into the spotlight.
export const FEATURED = ['bpc-157', 'klow', 'ghk-cu'];

export const byId = (id) => PRODUCTS.find((p) => p.id === id);

// Search matches with or without hyphens/spaces: "bpc157", "bpc 157", "BPC-157".
export const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface Doctor {
  id: string;
  name: string;
  degree: string;
  dob: string;
  clinic: string;
  phone: string;
  address: string;
  specialty: string;
  notes: string;
  medicalStore: string;
  prescribedProducts: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  composition: string;
  description: string;
  catalogSlide: number;
}

export interface Reminder {
  id: string;
  doctorId: string;
  text: string;
  date: string;
  done: boolean;
}

export interface Visit {
  id: string;
  doctorId: string;
  date: string;
  completed: boolean;
}

export interface Order {
  id: string;
  doctorId: string;
  items: { productId: string; quantity: number }[];
  date: string;
}

const DEFAULT_CATEGORIES = ['Eye Drops', 'Eye Ointment', 'Eye Gel', 'Tablets', 'Capsules'];

const DEFAULT_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Acetolim SR', category: 'Tablets', composition: 'Acetazolamide 250mg (SR)', description: 'Sustained-release carbonic anhydrase inhibitor for glaucoma', catalogSlide: 2 },
  { name: 'Beporiz', category: 'Eye Drops', composition: 'Bepotastine Besilate 1.5%', description: 'Antihistamine for allergic conjunctivitis & itching', catalogSlide: 3 },
  { name: 'Brohit', category: 'Eye Drops', composition: 'Bromfenac Sodium 0.09%', description: 'NSAID for post-cataract surgery inflammation & pain', catalogSlide: 4 },
  { name: 'Brohit-M', category: 'Eye Drops', composition: 'Bromfenac 0.09% + Moxifloxacin 0.5%', description: 'Anti-inflammatory + antibiotic combo for post-surgical care', catalogSlide: 5 },
  { name: 'Catahit', category: 'Eye Drops', composition: 'Sodium Carboxymethylcellulose 1% + Glycerin 0.9% + N-Acetyl Carnosine 1%', description: 'Anti-cataract eye drops for lens clarity', catalogSlide: 6 },
  { name: 'Cycloact', category: 'Eye Drops', composition: 'Cyclopentolate HCl 1%', description: 'Mydriatic & cycloplegic for diagnostic procedures', catalogSlide: 7 },
  { name: 'Difunice', category: 'Eye Drops', composition: 'Difluprednate 0.05%', description: 'Potent corticosteroid for post-operative ocular inflammation & pain', catalogSlide: 8 },
  { name: 'Difunice-MF', category: 'Eye Drops', composition: 'Difluprednate 0.05% + Moxifloxacin 0.5%', description: 'Steroid-antibiotic combination for post-surgical inflammation', catalogSlide: 9 },
  { name: 'Fluroriz', category: 'Eye Drops', composition: 'Fluorometholone 0.1%', description: 'Mild steroid for steroid-responsive inflammatory conditions', catalogSlide: 10 },
  { name: 'Glulare', category: 'Eye Drops', composition: 'Latanoprost 0.005%', description: 'Prostaglandin analogue for open-angle glaucoma & ocular hypertension', catalogSlide: 11 },
  { name: 'Hayuvet', category: 'Eye Drops', composition: 'Sodium Hyaluronate 0.1%', description: 'Lubricant for dry eye syndrome', catalogSlide: 12 },
  { name: 'Hayuvet-5', category: 'Eye Drops', composition: 'Sodium Hyaluronate 0.5%', description: 'Higher concentration lubricant for moderate-severe dry eyes', catalogSlide: 13 },
  { name: 'Hayuvet-D', category: 'Eye Drops', composition: 'Sodium Hyaluronate 0.1% + Dexpanthenol 2%', description: 'Lubricant with healing agent for dry & damaged cornea', catalogSlide: 14 },
  { name: 'Hayuvet Ultra', category: 'Eye Drops', composition: 'Sodium Hyaluronate 0.18%', description: 'Ultra lubricant for dry eye relief', catalogSlide: 15 },
  { name: 'Hayuvet-Max', category: 'Eye Drops', composition: 'Sodium Hyaluronate 0.3%', description: 'Maximum strength lubricant for severe dry eyes', catalogSlide: 16 },
  { name: 'Heltroz', category: 'Eye Drops', composition: 'Loteprednol Etabonate 0.5%', description: 'Soft steroid for post-operative inflammation & allergic conjunctivitis', catalogSlide: 17 },
  { name: 'Homamic', category: 'Eye Drops', composition: 'Homatropine Hydrobromide 2%', description: 'Cycloplegic & mydriatic for refraction & uveitis', catalogSlide: 18 },
  { name: 'Hycotic', category: 'Eye Drops', composition: 'Hydroxypropyl Methylcellulose 2% (HPMC)', description: 'Viscous lubricant for dry eye comfort', catalogSlide: 19 },
  { name: 'LocFresh Eye Drops', category: 'Eye Drops', composition: 'CMC 0.5% + Glycerin 0.9%', description: 'Lubricant for everyday dry eye relief', catalogSlide: 20 },
  { name: 'LocFresh Gel', category: 'Eye Gel', composition: 'CMC 1% + Glycerin 0.9%', description: 'Long-lasting gel lubricant for dry eyes', catalogSlide: 21 },
  { name: 'LocFresh Plus', category: 'Eye Drops', composition: 'CMC 0.5% + Glycerin 0.9% + Stabilized Oxychloro Complex', description: 'Enhanced lubricant with antimicrobial protection', catalogSlide: 22 },
  { name: 'LocFresh Soft', category: 'Eye Drops', composition: 'CMC 0.25% + Glycerin 0.9%', description: 'Gentle lubricant for mild dry eyes', catalogSlide: 23 },
  { name: 'LocFresh Ultra', category: 'Eye Drops', composition: 'CMC 0.5% + Sodium Hyaluronate 0.1%', description: 'Dual-action ultra lubricant', catalogSlide: 24 },
  { name: 'LocFresh Xtra', category: 'Eye Drops', composition: 'CMC 1% + Glycerin 0.9%', description: 'Extra strength lubricant for severe dryness', catalogSlide: 25 },
  { name: 'LocFresh Ointment', category: 'Eye Ointment', composition: 'White Petrolatum + Mineral Oil + Lanolin', description: 'Nighttime ointment for severe dry eyes', catalogSlide: 26 },
  { name: 'Lytonol Eye Drops', category: 'Eye Drops', composition: 'Phenylephrine 5% + Tropicamide 0.8%', description: 'Mydriatic combination for pupil dilation', catalogSlide: 27 },
  { name: 'Lytonol Ointment', category: 'Eye Ointment', composition: 'Phenylephrine 5% + Tropicamide 0.8%', description: 'Ointment form mydriatic', catalogSlide: 28 },
  { name: 'Lytonol LS', category: 'Eye Drops', composition: 'Phenylephrine 2.5% + Tropicamide 0.5%', description: 'Low-strength mydriatic for pediatric use', catalogSlide: 29 },
  { name: 'Myloact', category: 'Eye Drops', composition: 'Cyclosporine 0.05%', description: 'Immunomodulator for chronic dry eye disease', catalogSlide: 30 },
  { name: 'Myloact Gold', category: 'Eye Drops', composition: 'Cyclosporine 0.09%', description: 'Higher-strength immunomodulator for severe dry eye', catalogSlide: 31 },
  { name: 'Myloact Max', category: 'Capsules', composition: 'Cyclosporine 0.1%', description: 'Maximum strength immunomodulator for dry eye', catalogSlide: 32 },
  { name: 'Myloact-M', category: 'Eye Drops', composition: 'Cyclosporine 0.05% + HPMC', description: 'Immunomodulator with enhanced lubrication', catalogSlide: 33 },
  { name: 'Mynapro-D 500', category: 'Capsules', composition: 'Methylcobalamin 1500mcg + Vitamin D3 1000IU + Folic Acid + ALA', description: 'Neuro-ophthalmic nutritional supplement', catalogSlide: 34 },
  { name: 'Myneph+', category: 'Capsules', composition: 'Methylcobalamin + Pregabalin 75mg', description: 'Neuropathic pain management', catalogSlide: 35 },
  { name: 'Natahit', category: 'Eye Drops', composition: 'Natamycin 5%', description: 'Antifungal for fungal keratitis & blepharitis', catalogSlide: 36 },
  { name: 'Nepadot', category: 'Eye Drops', composition: 'Nepafenac 0.1%', description: 'NSAID for post-cataract surgery pain & inflammation', catalogSlide: 37 },
  { name: 'Nepadot-HS', category: 'Eye Drops', composition: 'Nepafenac 0.3%', description: 'High-strength NSAID for post-surgical inflammation', catalogSlide: 38 },
  { name: 'Okafine Gel', category: 'Eye Gel', composition: 'Dexpanthenol 5%', description: 'Corneal repair and ocular surface healing gel', catalogSlide: 84 },
  { name: 'Okamoist', category: 'Eye Drops', composition: 'Hydroxypropyl Methylcellulose 0.3%', description: 'Artificial tears for dry eye comfort', catalogSlide: 39 },
  { name: 'Oxket', category: 'Eye Drops', composition: 'Ofloxacin 0.3%', description: 'Fluoroquinolone antibiotic for bacterial conjunctivitis', catalogSlide: 40 },
  { name: 'Oxket-DX', category: 'Eye Drops', composition: 'Ofloxacin 0.3% + Dexamethasone 0.1%', description: 'Antibiotic-steroid combo for bacterial inflammation', catalogSlide: 41 },
  { name: 'Oxket-MF', category: 'Eye Drops', composition: 'Ofloxacin 0.3% + Fluorometholone 0.1%', description: 'Antibiotic with mild steroid for ocular infections', catalogSlide: 42 },
  { name: 'Oxket-OF', category: 'Eye Ointment', composition: 'Ofloxacin 0.3%', description: 'Antibiotic ointment for bacterial eye infections', catalogSlide: 43 },
  { name: 'Oxket-Plus', category: 'Eye Drops', composition: 'Ofloxacin 0.3% + Prednisolone 1%', description: 'Antibiotic-steroid for steroid-responsive infections', catalogSlide: 44 },
  { name: 'Oxkit', category: 'Eye Drops', composition: 'Ofloxacin 0.3% + Ketorolac 0.5%', description: 'Antibiotic + NSAID for infected inflamed eyes', catalogSlide: 45 },
  { name: 'Polyworth', category: 'Eye Drops', composition: 'Polymyxin B + Chloramphenicol', description: 'Broad-spectrum antibiotic combination', catalogSlide: 47 },
  { name: 'Polyworth-DX', category: 'Eye Drops', composition: 'Polymyxin B + Chloramphenicol + Dexamethasone', description: 'Antibiotic-steroid triple combo', catalogSlide: 48 },
  { name: 'Predohit', category: 'Eye Drops', composition: 'Prednisolone Acetate 1%', description: 'Potent steroid for post-operative & inflammatory conditions', catalogSlide: 49 },
  { name: 'Ralcafit', category: 'Capsules', composition: 'Calcium + Calcitriol + Zinc + Magnesium', description: 'Bone & mineral supplement', catalogSlide: 50 },
  { name: 'Ratroday', category: 'Capsules', composition: 'Retinol + Lutein + Zeaxanthin + Vitamins + Minerals', description: 'Comprehensive eye nutrition supplement', catalogSlide: 51 },
  { name: 'Realgano', category: 'Eye Drops', composition: 'Brimonidine 0.15%', description: 'Alpha-2 agonist for glaucoma & ocular hypertension', catalogSlide: 52 },
  { name: 'Realhyper-5', category: 'Eye Drops', composition: 'Sodium Chloride 5%', description: 'Hypertonic saline for corneal edema', catalogSlide: 53 },
  { name: 'Realhyper-6', category: 'Eye Ointment', composition: 'Sodium Chloride 6%', description: 'Hypertonic ointment for corneal edema', catalogSlide: 53 },
  { name: 'Realmega Gold', category: 'Capsules', composition: 'Omega-3 + Lutein + Zeaxanthin + Astaxanthin + Multivitamins', description: 'Premium eye nutrition & retinal health support', catalogSlide: 54 },
  { name: 'Realmega-I', category: 'Capsules', composition: 'Omega-3 Fatty Acids 1000mg', description: 'Essential fatty acids for dry eye & retinal health', catalogSlide: 55 },
  { name: 'Realmega Plus', category: 'Capsules', composition: 'Omega-3 + Lutein + Zeaxanthin + Vitamins', description: 'Enhanced eye nutrition supplement', catalogSlide: 56 },
  { name: 'Realtravo', category: 'Eye Drops', composition: 'Travoprost 0.004%', description: 'Prostaglandin analogue for glaucoma & IOP reduction', catalogSlide: 57 },
  { name: 'Realtravo-TM', category: 'Eye Drops', composition: 'Travoprost 0.004% + Timolol 0.5%', description: 'Dual-action IOP reduction for glaucoma', catalogSlide: 89 },
  { name: 'Realtob Eye Drops', category: 'Eye Drops', composition: 'Tobramycin 0.3%', description: 'Aminoglycoside antibiotic for bacterial conjunctivitis', catalogSlide: 58 },
  { name: 'Realtob Ointment', category: 'Eye Ointment', composition: 'Tobramycin 0.3%', description: 'Antibiotic ointment for bacterial eye infections', catalogSlide: 59 },
  { name: 'Realtob-DX', category: 'Eye Drops', composition: 'Tobramycin 0.3% + Dexamethasone 0.1%', description: 'Antibiotic-steroid for inflammatory infections', catalogSlide: 60 },
  { name: 'Realtob-F', category: 'Eye Drops', composition: 'Tobramycin 0.3% + Fluorometholone 0.1%', description: 'Antibiotic with mild steroid', catalogSlide: 61 },
  { name: 'Realtob-LP', category: 'Eye Drops', composition: 'Tobramycin 0.3% + Loteprednol 0.5%', description: 'Antibiotic + soft steroid combination', catalogSlide: 62 },
  { name: 'Relzit Eye Drops', category: 'Eye Drops', composition: 'Azithromycin 1%', description: 'Macrolide antibiotic for bacterial conjunctivitis', catalogSlide: 63 },
  { name: 'Relzit Ointment', category: 'Eye Ointment', composition: 'Azithromycin 1%', description: 'Antibiotic ointment for bacterial eye infections', catalogSlide: 64 },
  { name: 'Self-Quin Eye Drops', category: 'Eye Drops', composition: 'Moxifloxacin 0.5%', description: 'Fourth-generation fluoroquinolone for bacterial infections', catalogSlide: 65 },
  { name: 'Self-Quin Ointment', category: 'Eye Ointment', composition: 'Moxifloxacin 0.5%', description: 'Antibiotic ointment for bacterial conjunctivitis', catalogSlide: 66 },
  { name: 'Self-Quin Gel', category: 'Eye Gel', composition: 'Moxifloxacin 0.5%', description: 'Antibiotic gel formulation', catalogSlide: 67 },
  { name: 'Self-Quin D', category: 'Eye Drops', composition: 'Moxifloxacin 0.5% + Dexamethasone 0.1%', description: 'Antibiotic-steroid for steroid-responsive infections', catalogSlide: 68 },
  { name: 'Self-Quin LP', category: 'Eye Drops', composition: 'Moxifloxacin 0.5% + Loteprednol 0.5%', description: 'Antibiotic + soft steroid combination', catalogSlide: 69 },
  { name: 'Self-Quin KT', category: 'Eye Drops', composition: 'Moxifloxacin 0.5% + Ketorolac 0.5%', description: 'Antibiotic + NSAID for infected inflamed eyes', catalogSlide: 70 },
  { name: 'Self-Quin P', category: 'Eye Drops', composition: 'Moxifloxacin 0.5% + Prednisolone 1%', description: 'Antibiotic-steroid for steroid-responsive inflammatory infections', catalogSlide: 71 },
  { name: 'Self-Quin T', category: 'Eye Drops', composition: 'Moxifloxacin 0.5% + Tobramycin 0.3%', description: 'Dual antibiotic for superficial ocular infections', catalogSlide: 72 },
  { name: 'Tacohit', category: 'Eye Ointment', composition: 'Tacrolimus 0.03%', description: 'Immunomodulator ointment for vernal keratoconjunctivitis', catalogSlide: 73 },
  { name: 'Timoriz', category: 'Eye Drops', composition: 'Timolol Maleate 0.5%', description: 'Beta-blocker for open-angle glaucoma & IOP reduction', catalogSlide: 74 },
  { name: 'Timoriz-BM', category: 'Eye Drops', composition: 'Timolol 0.5% + Brimonidine 0.2%', description: 'Dual-action IOP reduction for glaucoma', catalogSlide: 75 },
  { name: 'Troriz-P', category: 'Eye Drops', composition: 'Tropicamide 0.8% + Phenylephrine 5%', description: 'Mydriatic for pupil dilation during diagnostics', catalogSlide: 76 },
  { name: 'Vorisurge', category: 'Eye Drops', composition: 'Voriconazole 1%', description: 'Antifungal for fungal keratitis', catalogSlide: 77 },
  { name: 'Yapat', category: 'Eye Drops', composition: 'Olopatadine 0.1%', description: 'Antihistamine for allergic conjunctivitis', catalogSlide: 80 },
  { name: 'Yapat-KT', category: 'Eye Drops', composition: 'Olopatadine 0.1% + Ketorolac 0.4%', description: 'Anti-allergic + NSAID for allergic conjunctivitis', catalogSlide: 78 },
  { name: 'Yapat-Max', category: 'Eye Drops', composition: 'Olopatadine HCl eq. to Olopatadine 0.7%', description: 'Maximum-strength once-daily anti-allergic', catalogSlide: 79 },
  { name: 'Yapat-OD', category: 'Eye Drops', composition: 'Olopatadine HCl 0.2%', description: 'Once-daily anti-allergic for allergic conjunctivitis', catalogSlide: 80 },
  { name: 'YesFlox Eye Drops', category: 'Eye Drops', composition: 'Gatifloxacin 0.3%', description: 'Fluoroquinolone antibiotic for bacterial conjunctivitis', catalogSlide: 82 },
  { name: 'YesFlox Eye Ointment', category: 'Eye Ointment', composition: 'Gatifloxacin 0.3%', description: 'Antibiotic ointment for bacterial conjunctivitis', catalogSlide: 81 },
  { name: 'YesFlox-HS', category: 'Eye Drops', composition: 'Gatifloxacin 0.5%', description: 'High-strength antibiotic for bacterial conjunctivitis', catalogSlide: 82 },
  { name: 'YesFlox-KT', category: 'Eye Drops', composition: 'Gatifloxacin 0.3% + Ketorolac 0.4%', description: 'Antibiotic + NSAID for bacterial conjunctivitis with inflammation', catalogSlide: 83 },
  { name: 'YesFlox-P', category: 'Eye Drops', composition: 'Gatifloxacin 0.3% + Prednisolone 1%', description: 'Antibiotic-steroid for steroid-responsive infections', catalogSlide: 85 },
  { name: 'Yesflu-10', category: 'Tablets', composition: 'Flunarizine Dihydrochloride 10mg', description: 'Calcium channel blocker for glaucomatous optic neuropathy & migraine', catalogSlide: 86 },
  { name: 'Yesflu-P', category: 'Tablets', composition: 'Flunarizine 10mg + Propranolol 40mg (SR)', description: 'Combination for migraine prophylaxis', catalogSlide: 87 },
  { name: 'Yesflur', category: 'Eye Drops', composition: 'Flurbiprofen 0.03% + HPMC 0.025%', description: 'NSAID for inhibition of intraoperative miosis', catalogSlide: 88 },
  { name: 'Yesflur-GT', category: 'Eye Drops', composition: 'Flurbiprofen 0.03% + Gatifloxacin 0.3%', description: 'NSAID + antibiotic for post-operative inflammation & infection', catalogSlide: 90 },
  { name: 'Oxkit-D', category: 'Eye Drops', composition: 'Ofloxacin 0.3% + Dexamethasone 0.1% + Ketorolac 0.5%', description: 'Triple combo: antibiotic + steroid + NSAID', catalogSlide: 45 },
];

const SEEDED_PRODUCTS: Product[] = DEFAULT_PRODUCTS.map((p, i) => ({ ...p, id: `seed-${i}` }));

interface AppState {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string;
  userPhone: string;
  users: User[];
  doctors: Doctor[];
  products: Product[];
  categories: string[];
  reminders: Reminder[];
  visits: Visit[];
  orders: Order[];
  _seeded: boolean;
  register: (name: string, email: string, phone: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (name: string, phone: string) => void;
  addDoctor: (d: Omit<Doctor, 'id'>) => void;
  updateDoctor: (d: Doctor) => void;
  deleteDoctor: (id: string) => void;
  togglePrescribedProduct: (doctorId: string, productId: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (c: string) => void;
  addReminder: (r: Omit<Reminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
  addVisit: (v: Omit<Visit, 'id'>) => void;
  toggleVisit: (id: string) => void;
  deleteVisit: (id: string) => void;
  addOrder: (o: Omit<Order, 'id'>) => void;
  deleteOrder: (id: string) => void;
}

const uid = () => crypto.randomUUID();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      userName: '',
      userEmail: '',
      userPhone: '',
      users: [],
      doctors: [],
      products: [],
      categories: DEFAULT_CATEGORIES,
      reminders: [],
      visits: [],
      orders: [],
      _seeded: false,
      register: (name: string, email: string, phone: string, password: string) => {
        const existing = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          return { success: false, error: 'An account with this email already exists' };
        }
        const newUser: User = { id: uid(), name, email: email.toLowerCase(), phone, password };
        set((s) => ({
          users: [...s.users, newUser],
          isLoggedIn: true,
          userName: name,
          userEmail: email.toLowerCase(),
          userPhone: phone,
        }));
        return { success: true };
      },
      login: (email: string, password: string) => {
        const user = get().users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!user) {
          return { success: false, error: 'Invalid email or password' };
        }
        set({ isLoggedIn: true, userName: user.name, userEmail: user.email, userPhone: user.phone || '' });
        return { success: true };
      },
      logout: () => set({ isLoggedIn: false, userName: '', userEmail: '', userPhone: '' }),
      updateProfile: (name: string, phone: string) => {
        const email = get().userEmail;
        set((s) => ({
          userName: name,
          userPhone: phone,
          users: s.users.map((u) => u.email === email ? { ...u, name, phone } : u),
        }));
      },
      addDoctor: (d) => set((s) => ({ doctors: [...s.doctors, { ...d, id: uid() }] })),
      updateDoctor: (d) => set((s) => ({ doctors: s.doctors.map((doc) => (doc.id === d.id ? d : doc)) })),
      deleteDoctor: (id) => set((s) => ({ doctors: s.doctors.filter((d) => d.id !== id) })),
      togglePrescribedProduct: (doctorId, productId) => set((s) => ({
        doctors: s.doctors.map((d) => {
          if (d.id !== doctorId) return d;
          const prods = d.prescribedProducts || [];
          return {
            ...d,
            prescribedProducts: prods.includes(productId)
              ? prods.filter((p) => p !== productId)
              : [...prods, productId],
          };
        }),
      })),
      addProduct: (p) => set((s) => ({ products: [...s.products, { ...p, id: uid() }] })),
      updateProduct: (p) => set((s) => ({ products: s.products.map((x) => x.id === p.id ? p : x) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
      addCategory: (c) => set((s) => ({ categories: [...new Set([...s.categories, c])] })),
      addReminder: (r) => set((s) => ({ reminders: [...s.reminders, { ...r, id: uid() }] })),
      deleteReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      toggleReminder: (id) => set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) })),
      addVisit: (v) => set((s) => ({ visits: [...s.visits, { ...v, id: uid() }] })),
      toggleVisit: (id) => set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, completed: !v.completed } : v)) })),
      deleteVisit: (id) => set((s) => ({ visits: s.visits.filter((v) => v.id !== id) })),
      addOrder: (o) => set((s) => ({ orders: [...s.orders, { ...o, id: uid() }] })),
      deleteOrder: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
    }),
    {
      name: 'medrep-storage',
      merge: (persisted: unknown, current: AppState) => {
        const stored = persisted as Partial<AppState> | undefined;
        if (!stored) return { ...current, products: SEEDED_PRODUCTS, categories: DEFAULT_CATEGORIES, _seeded: true };
        const merged = { ...current, ...stored };
        if (!merged._seeded || merged.products.length === 0) {
          merged.products = SEEDED_PRODUCTS;
          merged.categories = DEFAULT_CATEGORIES;
          merged._seeded = true;
        }
        return merged as AppState;
      },
    }
  )
);

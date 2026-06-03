require('dotenv').config();
const mongoose = require('mongoose');
const Policy = require('../models/Policy');
const User = require('../models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mono-insurance');
  console.log('✅ Connected to MongoDB for seeding...');
};

const policies = [
  // ─── CAR INSURANCE ───────────────────────────────────────────────
  {
    name: 'Basic Shield',
    type: 'car',
    description: 'Essential coverage for your vehicle against accidental damage and third-party liability.',
    coverage: 300000,
    premium: 4999,
    duration: '1 Year',
    features: [
      'Third-party liability coverage',
      'Accidental damage protection',
      'Emergency roadside assistance',
      'Personal accident cover up to ₹1,00,000',
    ],
  },
  {
    name: 'Comprehensive Plus',
    type: 'car',
    description: 'All-inclusive vehicle protection with zero depreciation and engine protection.',
    coverage: 700000,
    premium: 9999,
    duration: '1 Year',
    features: [
      'Zero depreciation cover',
      'Engine & gearbox protection',
      'Natural calamity damage',
      'Theft & fire coverage',
      'Cashless repairs at 5000+ garages',
    ],
  },
  {
    name: 'Elite Auto Guard',
    type: 'car',
    description: 'Premium coverage for luxury and high-end vehicles with concierge services.',
    coverage: 1500000,
    premium: 19999,
    duration: '1 Year',
    features: [
      'Agreed value settlement',
      'Luxury car specialist garages',
      'Worldwide driving coverage',
      'Replacement vehicle during repairs',
      'Legal expense coverage',
    ],
  },
  // ─── HEALTH INSURANCE ────────────────────────────────────────────
  {
    name: 'HealthFirst Basic',
    type: 'health',
    description: 'Affordable health coverage for individuals with essential hospitalization benefits.',
    coverage: 300000,
    premium: 5999,
    duration: '1 Year',
    features: [
      'Hospitalization expenses',
      'Pre & post hospitalization cover',
      'Ambulance charges',
      'Day care procedures',
    ],
  },
  {
    name: 'FamilyCare Pro',
    type: 'health',
    description: 'Comprehensive health plan for your entire family with critical illness rider.',
    coverage: 1000000,
    premium: 14999,
    duration: '1 Year',
    features: [
      'Family floater plan (4 members)',
      'Critical illness coverage',
      'Maternity & newborn cover',
      'Annual health check-up',
      'Mental wellness support',
    ],
  },
  {
    name: 'Supreme Health Shield',
    type: 'health',
    description: 'Top-tier health protection with global coverage and no room-rent restrictions.',
    coverage: 5000000,
    premium: 29999,
    duration: '1 Year',
    features: [
      'Global medical coverage',
      'No room-rent restrictions',
      'OPD & wellness benefits',
      'Second medical opinion',
      'Restore benefit on full utilization',
      'AYUSH treatment coverage',
    ],
  },
  // ─── LIFE INSURANCE ──────────────────────────────────────────────
  {
    name: 'SecureLife Term',
    type: 'life',
    description: 'Pure term insurance providing high life coverage at a low premium for your family\'s financial security.',
    coverage: 5000000,
    premium: 7999,
    duration: '20 Years',
    features: [
      'High life cover at low premium',
      'Death benefit payout',
      'Terminal illness benefit',
      'Accidental death benefit rider',
    ],
  },
  {
    name: 'WealthGuard Endowment',
    type: 'life',
    description: 'Combination of life insurance and savings to build long-term wealth while staying protected.',
    coverage: 2000000,
    premium: 24999,
    duration: '15 Years',
    features: [
      'Life cover + savings plan',
      'Guaranteed maturity benefit',
      'Bonus additions annually',
      'Loan against policy',
      'Tax benefits under 80C & 10(10D)',
    ],
  },
  {
    name: 'Legacy ULIP Plan',
    type: 'life',
    description: 'Unit-linked insurance plan that grows your wealth through market investments with life protection.',
    coverage: 3000000,
    premium: 49999,
    duration: '10 Years',
    features: [
      'Market-linked returns',
      'Multiple fund options (equity/debt)',
      'Partial withdrawal after 5 years',
      'Premium waiver on disability',
      'Portfolio switching options',
      'Loyalty additions after 10 years',
    ],
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Policy.deleteMany({});
    await User.deleteMany({ email: 'admin@monoinsurance.com' });
    console.log('🗑️  Cleared existing policies and admin user.');

    // Insert policies
    await Policy.insertMany(policies);
    console.log(`✅ Inserted ${policies.length} policies (3 car, 3 health, 3 life).`);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@monoinsurance.com',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log(`✅ Admin user created: ${admin.email} / Admin@123`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('──────────────────────────────────');
    console.log('Admin Login:');
    console.log('  Email: admin@monoinsurance.com');
    console.log('  Password: Admin@123');
    console.log('──────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();

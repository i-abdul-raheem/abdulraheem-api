const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const User = require('../models/User');

// Sample data
const sampleProjects = [];

const sampleSkills = [];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📦 MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      Project.deleteMany({}),
      Skill.deleteMany({}),
      User.deleteMany({ role: 'admin' })
    ]);

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || 'abdulraheem.arhex@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'hEllfun@0300',
      firstName: 'Abdulraheem',
      lastName: 'Arhex',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('👤 Created admin user');

    // Create projects
    const createdProjects = await Project.insertMany(sampleProjects);
    console.log(`📁 Created ${createdProjects.length} projects`);

    // Create skills
    const createdSkills = await Skill.insertMany(sampleSkills);
    console.log(`🎯 Created ${createdSkills.length} skill categories`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin user: ${adminUser.email}`);
    console.log(`- Projects: ${createdProjects.length}`);
    console.log(`- Skill categories: ${createdSkills.length}`);
    console.log('\n🚀 You can now start the server and access the dashboard!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the seeding
if (require.main === module) {
  connectDB().then(seedDatabase);
}

module.exports = { connectDB, seedDatabase }; 
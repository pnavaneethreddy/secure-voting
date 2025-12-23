const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Election = require('../models/Election');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting_system');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Election.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = new User({
      email: 'chinnugdpl+admin@gmail.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      studentId: 'ADMIN001',
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    await admin.save();
    console.log('Created admin user');

    // Create sample voters
    const voters = [];
    const voterData = [
      { email: 'chinnugdpl@gmail.com', firstName: 'John', lastName: 'Doe', studentId: 'STU001' },
      { email: 'john.doe@university.edu', firstName: 'Jane', lastName: 'Smith', studentId: 'STU002' },
      { email: 'mike.johnson@university.edu', firstName: 'Mike', lastName: 'Johnson', studentId: 'STU003' },
      { email: 'sarah.wilson@university.edu', firstName: 'Sarah', lastName: 'Wilson', studentId: 'STU004' },
      { email: 'david.brown@university.edu', firstName: 'David', lastName: 'Brown', studentId: 'STU005' }
    ];

    for (const voterInfo of voterData) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      const voter = new User({
        ...voterInfo,
        password: hashedPassword,
        role: 'voter',
        isVerified: true,
        isActive: true
      });
      await voter.save();
      voters.push(voter);
    }
    console.log('Created sample voters');

    // Create sample elections
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Active Election 1: Student Council President
    const election1 = new Election({
      title: 'Student Council President Election 2024',
      description: 'Annual election for Student Council President. The president will represent all students and lead various campus initiatives for the academic year 2024-2025.',
      startDate: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Started 2 hours ago
      endDate: tomorrow,
      candidates: [
        {
          name: 'Alex Rodriguez',
          description: 'Computer Science major with 3 years of student government experience. Focused on improving campus technology and student services.',
          voteCount: 0
        },
        {
          name: 'Emily Chen',
          description: 'Business Administration student and current Vice President. Committed to enhancing student life and academic support programs.',
          voteCount: 0
        },
        {
          name: 'Marcus Thompson',
          description: 'Engineering student passionate about sustainability and campus infrastructure improvements.',
          voteCount: 0
        }
      ],
      status: 'active',
      createdBy: admin._id,
      totalVotes: 0,
      isPublic: true
    });
    await election1.save();

    // Active Election 2: Class Representative
    const election2 = new Election({
      title: 'Senior Class Representative Election',
      description: 'Election for Senior Class Representative who will coordinate graduation activities and serve as liaison between students and administration.',
      startDate: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Started 1 hour ago
      endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Ends in 3 days
      candidates: [
        {
          name: 'Jessica Park',
          description: 'Psychology major with strong organizational skills and event planning experience.',
          voteCount: 0
        },
        {
          name: 'Ryan Mitchell',
          description: 'Communications student and former class treasurer. Experienced in student advocacy.',
          voteCount: 0
        }
      ],
      status: 'active',
      createdBy: admin._id,
      totalVotes: 0,
      isPublic: true
    });
    await election2.save();

    // Upcoming Election
    const election3 = new Election({
      title: 'Student Activities Board Election',
      description: 'Choose the next Student Activities Board members who will organize campus events, concerts, and social activities throughout the year.',
      startDate: tomorrow,
      endDate: nextWeek,
      candidates: [
        {
          name: 'Sophia Martinez',
          description: 'Art major with extensive event planning experience and creative vision for campus activities.',
          voteCount: 0
        },
        {
          name: 'James Wilson',
          description: 'Music student and current Activities Board member. Passionate about bringing diverse entertainment to campus.',
          voteCount: 0
        },
        {
          name: 'Olivia Taylor',
          description: 'Marketing major with social media expertise and fresh ideas for student engagement.',
          voteCount: 0
        },
        {
          name: 'Daniel Kim',
          description: 'Sports Management student focused on recreational activities and intramural sports programs.',
          voteCount: 0
        }
      ],
      status: 'active',
      createdBy: admin._id,
      totalVotes: 0,
      isPublic: true
    });
    await election3.save();

    // Draft Election (for admin testing)
    const election4 = new Election({
      title: 'Dormitory Council Election',
      description: 'Election for Dormitory Council representatives who will address housing concerns and organize residence hall activities.',
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000),
      candidates: [
        {
          name: 'Ashley Johnson',
          description: 'Resident Assistant with deep understanding of dormitory life and student needs.',
          voteCount: 0
        },
        {
          name: 'Tyler Davis',
          description: 'Sophomore student committed to improving dormitory facilities and community building.',
          voteCount: 0
        }
      ],
      status: 'draft',
      createdBy: admin._id,
      totalVotes: 0,
      isPublic: true
    });
    await election4.save();

    console.log('Created sample elections');
    console.log('\n🎉 Dummy data seeded successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('👨‍💼 Admin: chinnugdpl+admin@gmail.com / admin123');
    console.log('👥 Voters:');
    console.log('   chinnugdpl@gmail.com / password123 (John Doe - will receive real emails!)');
    voterData.slice(1).forEach(voter => {
      console.log(`   ${voter.email} / password123`);
    });
    console.log('\n🗳️ Elections Created:');
    console.log('✅ Student Council President Election (Active)');
    console.log('✅ Senior Class Representative Election (Active)');
    console.log('⏳ Student Activities Board Election (Upcoming)');
    console.log('📝 Dormitory Council Election (Draft)');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the seeder
if (require.main === module) {
  seedData();
}

module.exports = seedData;
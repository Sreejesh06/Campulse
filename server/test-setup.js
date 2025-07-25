#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing CampusLink server setup...\n');

    // Test 1: Environment variables
    console.log('1. Checking environment variables...');
    const requiredEnvVars = ['JWT_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️  Missing environment variables:', missingVars.join(', '));
      console.log('   Please create a .env file based on .env.example');
    } else {
      console.log('✅ Environment variables configured');
    }

    // Test 2: MongoDB connection
    console.log('\n2. Testing MongoDB connection...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campuslink';
    
    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB connection successful');
      console.log(`   Connected to: ${mongoUri}`);
    } catch (error) {
      console.log('❌ MongoDB connection failed');
      console.log(`   Error: ${error.message}`);
      console.log('   Make sure MongoDB is running or check your connection string');
    }

    // Test 3: Required directories
    console.log('\n3. Checking required directories...');
    const fs = require('fs').promises;
    const path = require('path');
    
    const requiredDirs = [
      'uploads',
      'uploads/announcements',
      'uploads/lost-found',
      'uploads/complaints',
      'uploads/profiles'
    ];

    for (const dir of requiredDirs) {
      try {
        await fs.access(path.join(__dirname, dir));
        console.log(`✅ Directory exists: ${dir}`);
      } catch (error) {
        console.log(`⚠️  Directory missing: ${dir} (will be created automatically)`);
      }
    }

    // Test 4: Core models
    console.log('\n4. Testing core models...');
    try {
      const User = require('./models/User');
      const Announcement = require('./models/Announcement');
      const LostFound = require('./models/LostFound');
      const Timetable = require('./models/Timetable');
      const Complaint = require('./models/Complaint');
      
      console.log('✅ All models loaded successfully');
    } catch (error) {
      console.log('❌ Model loading failed');
      console.log(`   Error: ${error.message}`);
    }

    // Test 5: Server configuration
    console.log('\n5. Server configuration...');
    const port = process.env.PORT || 5000;
    const nodeEnv = process.env.NODE_ENV || 'development';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    
    console.log(`✅ Port: ${port}`);
    console.log(`✅ Environment: ${nodeEnv}`);
    console.log(`✅ Client URL: ${clientUrl}`);

    console.log('\n🎉 Server setup test completed!');
    console.log('\nTo start the server:');
    console.log('  npm run dev    (development with auto-reload)');
    console.log('  npm start      (production)');
    
    console.log('\nAPI will be available at:');
    console.log(`  http://localhost:${port}/api/health`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

testConnection();

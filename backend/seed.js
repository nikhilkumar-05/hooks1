import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Post from './models/Post.js';
import Club from './models/Club.js';
import Event from './models/Event.js';
import Connection from './models/Connection.js';
import Comment from './models/Comment.js';
import Notification from './models/Notification.js';
import LiveSession from './models/LiveSession.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hooks';

async function seedData() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    const isCleanOnly = process.argv.includes('--clean');

    console.log('Clearing existing collections and stale indexes...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Club.deleteMany({}),
      Event.deleteMany({}),
      Connection.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      LiveSession.deleteMany({}),
    ]);

    if (isCleanOnly) {
      console.log('Clean mode finished. No new records inserted.');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('Seeding rich demo data with realistic LPU campus issues & live sessions...');

    // 1. Create sample students
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    const usersData = [
      {
        name: 'Aman Sharma',
        email: 'aman.sharma@lpu.in',
        passwordHash: defaultPasswordHash,
        headline: 'Lead @ Coding Ninjas LPU Chapter | Full-Stack Dev',
        course: 'B.Tech Computer Science & Engineering',
        semester: '6th Semester',
        bio: 'MERN developer, tech enthusiast, and lead organizer at Coding Ninjas Club. Building tools for LPU students.',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Tailwind CSS', 'Docker'],
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
        coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@lpu.in',
        passwordHash: defaultPasswordHash,
        headline: 'Student Council Rep & AI Researcher | Block 33 Hosteler',
        course: 'B.Tech Artificial Intelligence & ML',
        semester: '4th Semester',
        bio: 'Passionate about Deep Learning and student welfare. Pushing for 24x7 library access and better hostel amenities.',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'FastAPI'],
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Rohit Kumar',
        email: 'rohit.kumar@lpu.in',
        passwordHash: defaultPasswordHash,
        headline: 'Captain @ Badminton Club & Robotics Lead',
        course: 'B.Tech Robotics & Automation',
        semester: '8th Semester',
        bio: 'Shuttler on campus and Robotics team captain at LPU. Finalist in Inter-University Badminton 2025.',
        skills: ['C++', 'ROS2', 'Badminton', 'IoT', 'Embedded Systems'],
        profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80',
        coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Sneha Verma',
        email: 'sneha.verma@lpu.in',
        passwordHash: defaultPasswordHash,
        headline: 'Design Lead @ LPU Design Circle & Coding Ninjas Club',
        course: 'B.Des User Experience Design',
        semester: '6th Semester',
        bio: 'Designing campus interfaces, posters, and sports jersey graphics. Figma advocate and design system builder.',
        skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping'],
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
        coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@lpu.in',
        passwordHash: defaultPasswordHash,
        headline: 'Student Coordinator @ E-Cell LPU | Product Strategist',
        course: 'MBA Information Technology',
        semester: '2nd Semester',
        bio: 'Tech product management enthusiast. Bridging engineering rigor with business strategy.',
        skills: ['Agile', 'Product Strategy', 'Jira', 'Data Analytics', 'Roadmapping'],
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
        coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      },
    ];

    const createdUsers = await User.insertMany(usersData);
    console.log(`✓ Inserted ${createdUsers.length} students.`);

    const [aman, priya, rohit, sneha, vikram] = createdUsers;

    // Follow relationships
    aman.following = [priya._id, rohit._id];
    aman.followers = [sneha._id, vikram._id];
    priya.following = [aman._id, sneha._id];
    priya.followers = [aman._id];
    await Promise.all([aman.save(), priya.save()]);

    // 2. Campus Clubs including Coding Ninjas Club
    const clubsData = [
      {
        name: 'Coding Ninjas LPU Chapter',
        description: 'The premier competitive coding and development club at Lovely Professional University hosting weekly coding sprints, hackathons, and sports fixtures.',
        category: 'Technology & Coding',
        members: [aman._id, priya._id, sneha._id, rohit._id],
      },
      {
        name: 'LPU Developers Guild',
        description: 'Open-source campus society building full-stack applications, APIs, and student utility systems.',
        category: 'Technology & Coding',
        members: [aman._id, priya._id, vikram._id],
      },
      {
        name: 'Robotics & AI Society (RAIS)',
        description: 'Building autonomous rovers, quadcopters, and hardware agents for national competitions.',
        category: 'Robotics & Hardware',
        members: [rohit._id, priya._id],
      },
      {
        name: 'LPU Design Circle',
        description: 'Creative collective of UI/UX designers, 3D renderers, and digital visualizers on campus.',
        category: 'Design & Creative Arts',
        members: [sneha._id, aman._id],
      },
      {
        name: 'E-Cell LPU',
        description: 'Startup incubator fostering student ventures and founder mentorship at UniMall.',
        category: 'Entrepreneurship & Business',
        members: [vikram._id, aman._id],
      },
    ];

    const createdClubs = await Club.insertMany(clubsData);
    console.log(`✓ Inserted ${createdClubs.length} campus clubs.`);

    // 3. Campus Events
    const today = new Date();
    const addDays = (days) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        title: 'Intra-Club Badminton Clash: Coding Ninjas vs Tech Guild',
        description: 'Annual inter-club badminton tournament at Shanti Devi Mittal Indoor Stadium. Singles and doubles matches with trophy presentation!',
        venue: 'Shanti Devi Mittal Indoor Sports Complex (SDMA)',
        eventDate: new Date(today.getTime() + 4 * 60 * 60 * 1000), // Today in 4 hours
        organizer: 'Coding Ninjas Club',
        attendees: [rohit._id, aman._id, priya._id, sneha._id],
      },
      {
        title: 'Club Recruitment Drive 2026: Coding Ninjas & Guild',
        description: 'Open recruitment round for 1st, 2nd, and 3rd year students in Web Dev, AI, Design, and Social Media Management.',
        venue: 'Block 34, Hall 102',
        eventDate: addDays(2),
        organizer: 'Coding Ninjas Club',
        attendees: [aman._id, sneha._id, vikram._id],
      },
      {
        title: 'LPU HackNation 2026: 36-Hour Hackathon',
        description: 'Join 500+ student developers across India to build full-stack solutions for campus sustainability and health.',
        venue: 'Baldev Raj Mittal Unipolis',
        eventDate: addDays(5),
        organizer: 'LPU Developers Guild',
        attendees: [aman._id, priya._id, rohit._id],
      },
    ];

    const createdEvents = await Event.insertMany(eventsData);
    console.log(`✓ Inserted ${createdEvents.length} campus events.`);

    // 4. REAL CAMPUS ISSUES & POSTS
    const postsData = [
      {
        author: priya._id,
        content: `URGENT ISSUE: Block 33 3rd floor water cooler needs to be changed immediately! 🚰⚠️\n\nIt has been leaking all over the corridor since yesterday afternoon and the water cooling is completely broken. Students attending classes in Block 33 have to walk all the way down to the ground floor in the heat. Department of Student Welfare (DSW) & Estate Maintenance, please address this ASAP! #LPUCampusIssues #Block33 #StudentVoice`,
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563?auto=format&fit=crop&w=1200&q=80',
        likes: [aman._id, rohit._id, sneha._id, vikram._id],
        moderationStatus: 'APPROVED',
        moderationConfidence: 0.99,
      },
      {
        author: aman._id,
        content: `🚨 COME JOIN THE HIRING: Coding Ninjas Club & LPU Developers Guild are RECRUITING! 🚀💼\n\nAre you looking to build real projects, organize hackathons, and level up your resume? We have open openings for:\n• Web & App Developers (React/Node/Flutter)\n• UI/UX & Graphic Designers (Figma/Canva)\n• Content & Social Media Leads\n• Event Coordinators\n\nNo prior experience required — we value passion to learn! Applications link in comments. Let's build together! 👨‍💻👩‍💻 #CodingNinjasLPU #TechHiring #LPUClubs`,
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        likes: [priya._id, sneha._id, rohit._id],
        moderationStatus: 'APPROVED',
        moderationConfidence: 0.99,
      },
      {
        author: priya._id,
        content: `University Central Library timing should be extended during exam weeks! 📚⏳\n\nCurrently, the central library shuts at 9:00 PM on weekdays. During mid-term and end-term exams, hostel rooms get noisy and we genuinely need a quiet studying environment. We are submitting a formal request to extend the timings till at least 2:00 AM for hostellers. Drop a like if you support extended library hours! 📖✍️ #LPUAcademics #LibraryExtension #ExamPrep`,
        imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
        likes: [aman._id, rohit._id, vikram._id, sneha._id],
        moderationStatus: 'APPROVED',
        moderationConfidence: 0.99,
      },
      {
        author: rohit._id,
        content: `SMASH TIME! Today we have an intense badminton showdown: Coding Ninjas Club vs Tech Guild! 🏸🔥\n\n• Venue: Shanti Devi Mittal Indoor Sports Complex (Court 3)\n• Time: Today at 5:30 PM\n• Format: Best of 3 sets (Singles & Mixed Doubles)\n\nCome cheer for your friends! Refreshments for spectators provided by the sports wing. May the best team take the campus trophy! 🏆⚡ #LPUSports #BadmintonMatch #CodingNinjas`,
        imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
        likes: [aman._id, priya._id, sneha._id],
        moderationStatus: 'APPROVED',
        moderationConfidence: 0.99,
      },
      {
        author: sneha._id,
        content: `Completed the new event badges and club jerseys for Coding Ninjas Club! Love how the campus blue and electric orange combo turned out. Can't wait to see everyone rocking these at the upcoming sports match and tech fest! 🎨👕 #CampusDesign #DesignCircle`,
        imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        likes: [aman._id, priya._id, rohit._id],
        moderationStatus: 'APPROVED',
        moderationConfidence: 0.99,
      },
    ];

    const createdPosts = await Post.insertMany(postsData);
    console.log(`✓ Inserted ${createdPosts.length} real campus posts.`);

    // 5. Threaded Comments on these issues
    const [postWater, postHiring] = createdPosts;

    const commentWater = await Comment.create({
      post: postWater._id,
      author: aman._id,
      content: '100% agreed Priya! Even the tap water pressure on 2nd floor Block 33 has been weak. I have raised a ticket on the university DMS portal too.',
      likes: [priya._id],
    });

    await Comment.create({
      post: postWater._id,
      author: rohit._id,
      content: 'Maintenance team was notified this morning. Hope they replace the compressor unit by evening.',
      parentComment: commentWater._id,
      likes: [aman._id],
    });

    await Comment.create({
      post: postHiring._id,
      author: sneha._id,
      content: 'Design lead here! If you love Figma or branding, definitely apply for our design wing!',
      likes: [aman._id, priya._id],
    });

    console.log(`✓ Inserted threaded comments on campus issues.`);

    // 6. Live Sessions / Rooms (Students coming live)
    const liveSessionsData = [
      {
        title: '🔴 Live Commentary: Coding Ninjas Club vs Tech Guild Badminton Match!',
        host: rohit._id,
        category: 'Sports & Gaming',
        status: 'live',
        viewersCount: 28,
        tags: ['Badminton', 'SportsFest', 'SDMA'],
        coverGradient: 'from-amber-500 to-rose-600',
      },
      {
        title: '🔴 Campus AMA: How to crack Summer Internships & Club Recruitments',
        host: aman._id,
        category: 'Club AMA',
        status: 'live',
        viewersCount: 42,
        tags: ['Hiring', 'CodingNinjas', 'Placements'],
        coverGradient: 'from-blue-600 to-indigo-600',
      },
      {
        title: '🔴 Student Townhall: 24/7 Library Hours & Block 33 Facilities Debate',
        host: priya._id,
        category: 'Campus Discussion',
        status: 'live',
        viewersCount: 35,
        tags: ['DSW', 'Library', 'HostelLife'],
        coverGradient: 'from-purple-600 to-pink-600',
      },
    ];

    const createdLive = await LiveSession.insertMany(liveSessionsData);
    console.log(`✓ Inserted ${createdLive.length} active campus live sessions.`);

    // 7. Connections & Notifications
    await Connection.insertMany([
      { requester: aman._id, recipient: priya._id, status: 'connected' },
      { requester: aman._id, recipient: rohit._id, status: 'connected' },
      { requester: sneha._id, recipient: aman._id, status: 'connected' },
      { requester: vikram._id, recipient: priya._id, status: 'connected' },
    ]);

    await Notification.insertMany([
      {
        recipient: aman._id,
        sender: priya._id,
        type: 'comment',
        post: postHiring._id,
        message: 'Priya Patel supported the club recruitment drive',
        read: false,
      },
      {
        recipient: aman._id,
        sender: rohit._id,
        type: 'like',
        post: postHiring._id,
        message: 'Rohit Kumar liked your club hiring announcement',
        read: false,
      },
    ]);

    console.log('\n=========================================');
    console.log('✓ Seeding complete with real campus posts and live sessions!');
    console.log('=========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exit(1);
  }
}

seedData();

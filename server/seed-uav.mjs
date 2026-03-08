/**
 * seed-uav.mjs — run from: server/
 *   node seed-uav.mjs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // loads server/.env

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

/* ── Inline schemas (mirrors real models, strict:false for safety) ── */
const Course = mongoose.model('Course', new mongoose.Schema({ title: String }, { strict: false }));
const Module = mongoose.model('Module', new mongoose.Schema(
  { courseId: mongoose.Schema.Types.ObjectId, title: String, order: Number },
  { timestamps: true }
));
const Lesson = mongoose.model('Lesson', new mongoose.Schema(
  {
    moduleId: mongoose.Schema.Types.ObjectId,
    title: String,
    videoUrl: String,
    description: String,
    duration: { type: Number, default: 60 },
    order: Number,
  },
  { timestamps: true }
));

/* ── Seed data ── */
const SEED = [
  {
    title: 'Introduction to UAV',
    order: 1,
    lessons: [
      { title: 'What is a UAV',     videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 1, duration: 60 },
      { title: 'History of Drones', videoUrl: 'https://www.w3schools.com/html/movie.mp4',   order: 2, duration: 60 },
    ],
  },
  {
    title: 'UAV Regulations',
    order: 2,
    lessons: [
      { title: 'Drone laws overview', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', order: 1, duration: 60 },
      { title: 'Safety guidelines',   videoUrl: 'https://www.w3schools.com/html/movie.mp4',   order: 2, duration: 60 },
    ],
  },
];

async function run() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected\n');

  const course = await Course.findOne({ title: /UAV Fundamentals/i }).lean();
  if (!course) {
    console.error('❌  Course "UAV Fundamentals" not found in the database.');
    process.exit(1);
  }
  console.log(`✅ Found course: "${course.title}" (${course._id})\n`);

  let mCreated = 0, lCreated = 0;

  for (const modData of SEED) {
    let mod = await Module.findOne({ courseId: course._id, order: modData.order });
    if (mod) {
      console.log(`  ↩  Module already exists: "${mod.title}"`);
    } else {
      mod = await Module.create({ courseId: course._id, title: modData.title, order: modData.order });
      console.log(`  ✅ Module created: "${mod.title}"  (${mod._id})`);
      mCreated++;
    }

    for (const l of modData.lessons) {
      const exists = await Lesson.findOne({ moduleId: mod._id, order: l.order });
      if (exists) {
        console.log(`      ↩  Lesson already exists: "${exists.title}"`);
      } else {
        await Lesson.create({ moduleId: mod._id, ...l });
        console.log(`      ✅ Lesson created: "${l.title}"`);
        lCreated++;
      }
    }
  }

  console.log(`\n🎉  Done — ${mCreated} module(s), ${lCreated} lesson(s) inserted.`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error('❌', err.message); process.exit(1); });

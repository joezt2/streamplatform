const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const Content = require('../models/Content');
const Rating = require('../models/Rating');

const GENRES = ['Azione', 'Commedia', 'Drammatico', 'Thriller', 'Sci-Fi', 'Horror', 'Romantico', 'Animazione', 'Documentario', 'Fantasy'];
const ACTORS = [
  'Leonardo DiCaprio', 'Scarlett Johansson', 'Tom Hanks', 'Meryl Streep', 'Brad Pitt',
  'Jennifer Lawrence', 'Denzel Washington', 'Natalie Portman', 'Robert Downey Jr. ', 'Cate Blanchett',
  'Christian Bale', 'Emma Stone', 'Morgan Freeman', 'Charlize Theron', 'Matt Damon',
  'Anne Hathaway', 'Will Smith', 'Sandra Bullock', 'Ryan Gosling', 'Julia Roberts'
];

async function cleanDatabase() {
  console.log('🧹 Pulizia database...');
  await Content.deleteMany({});
  await Rating.deleteMany({});
  console.log('✅ Database pulito');
}

async function seedContents(count = 500) {
  console.log(`\n📽️  Generazione ${count} contenuti...`);
  const contents = [];

  for (let i = 0; i < count; i++) {
    const genre = GENRES[Math.floor(Math.random() * GENRES. length)];
    const numActors = Math.floor(Math. random() * 4) + 2; // 2-5 attori
    const actors = [];
    
    for (let j = 0; j < numActors; j++) {
      const actor = ACTORS[Math.floor(Math.random() * ACTORS.length)];
      if (!actors.includes(actor)) actors.push(actor);
    }

    contents.push({
      title: faker.company.catchPhrase() + (Math.random() > 0.5 ? ' - Il Film' : ' - La Serie'),
      year: faker.date.between({ from: '1990-01-01', to: '2024-12-31' }). getFullYear(),
      duration: Math.floor(Math.random() * 180) + 60, // 60-240 minuti
      genre,
      actors,
      description: faker.lorem. paragraph(Math.floor(Math.random() * 3) + 2),
      averageRating: 0,
      totalRatings: 0
    });

    if ((i + 1) % 100 === 0) {
      console.log(`  📊 Progresso: ${i + 1}/${count}`);
    }
  }

  const inserted = await Content.insertMany(contents);
  console.log(`✅ ${inserted.length} contenuti creati`);
  return inserted;
}

async function seedRatings(contents, count = 5000) {
  console.log(`\n⭐ Generazione ${count} valutazioni...`);
  const ratings = [];
  const userIds = [];

  // Genera 200 utenti fittizi
  for (let i = 0; i < 200; i++) {
    userIds.push(`user_${faker.string.alphanumeric(8)}`);
  }

  const usedPairs = new Set(); // Per evitare duplicati userId-contentId

  for (let i = 0; i < count; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const content = contents[Math.floor(Math.random() * contents.length)];
    const pair = `${userId}-${content._id}`;

    // Skip se già esiste questa coppia
    if (usedPairs.has(pair)) {
      i--;
      continue;
    }
    usedPairs.add(pair);

    // Distribuzione realistica dei voti (curva normale spostata verso 4)
    const randomRating = () => {
      const gaussian = (Math.random() + Math.random() + Math.random() + Math.random()) / 4;
      const rating = Math.round(gaussian * 4 + 1);
      return Math.max(1, Math.min(5, rating));
    };

    ratings.push({
      userId,
      contentId: content._id,
      rating: randomRating(),
      comment: Math.random() > 0.3 ? faker.lorem.sentence() : '',
      createdAt: faker.date.between({ from: '2023-01-01', to: '2024-12-31' })
    });

    if ((i + 1) % 1000 === 0) {
      console.log(`  📊 Progresso: ${i + 1}/${count}`);
    }
  }

  const inserted = await Rating.insertMany(ratings);
  console.log(`✅ ${inserted.length} valutazioni create`);
  return inserted;
}

async function updateContentStats() {
  console.log('\n🔄 Aggiornamento statistiche contenuti...');
  const contents = await Content.find();
  
  for (let i = 0; i < contents.length; i++) {
    await contents[i].updateRatingStats();
    if ((i + 1) % 100 === 0) {
      console.log(`  📊 Progresso: ${i + 1}/${contents.length}`);
    }
  }
  
  console.log('✅ Statistiche aggiornate');
}

async function seed() {
  try {
    console.log('🌱 SEEDER STREAMPLATFORM\n');
    console.log('🔌 Connessione MongoDB...');
    await mongoose.connect(process.env. MONGODB_URI);
    console.log('✅ Connesso\n');

    // Check argomenti
    const args = process.argv.slice(2);
    const shouldClean = args.includes('--clean');

    if (shouldClean) {
      await cleanDatabase();
    }

    const numContents = parseInt(args. find(arg => arg.startsWith('--contents='))?.split('=')[1]) || 500;
    const numRatings = parseInt(args. find(arg => arg.startsWith('--ratings='))?.split('=')[1]) || 5000;

    const contents = await seedContents(numContents);
    await seedRatings(contents, numRatings);
    await updateContentStats();

    console. log('\n✅ SEEDING COMPLETATO!\n');
    console.log('📊 Statistiche:');
    const totalContents = await Content.countDocuments();
    const totalRatings = await Rating.countDocuments();
    const topQuality = await Content.countDocuments({ averageRating: { $gte: 4.5 }, totalRatings: { $gte: 100 } });
    
    console.log(`  - Contenuti totali: ${totalContents}`);
    console.log(`  - Valutazioni totali: ${totalRatings}`);
    console.log(`  - Contenuti eccellenza: ${topQuality}`);
    console.log('\n');

    await mongoose.disconnect();
    process. exit(0);
  } catch (error) {
    console. error('❌ Errore seeding:', error);
    process. exit(1);
  }
}

seed();
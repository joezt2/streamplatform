const mongoose = require('mongoose');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('🔌 Connessione MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connesso');

    const db = mongoose.connection. db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    console.log('\n📦 Setup collections.. .');

    // Contents collection
    if (!collectionNames.includes('contents')) {
      await db.createCollection('contents');
      console.log('  ✅ Collection "contents" creata');
    } else {
      console.log('  ⏭️  Collection "contents" già esistente');
    }

    // Ratings collection
    if (!collectionNames.includes('ratings')) {
      await db.createCollection('ratings');
      console.log('  ✅ Collection "ratings" creata');
    } else {
      console.log('  ⏭️  Collection "ratings" già esistente');
    }

    console.log('\n🔍 Creazione indici...');

    // Indici Contents
    await db.collection('contents').createIndex({ genre: 1, averageRating: -1 });
    await db.collection('contents').createIndex({ averageRating: -1, totalRatings: -1 });
    await db.collection('contents'). createIndex({ actors: 1 });
    await db.collection('contents').createIndex({ title: 'text', description: 'text' });
    console.log('  ✅ Indici "contents" creati');

    // Indici Ratings
    await db.collection('ratings').createIndex({ contentId: 1, createdAt: -1 });
    await db. collection('ratings').createIndex({ userId: 1, contentId: 1 }, { unique: true });
    await db.collection('ratings').createIndex({ rating: 1 });
    console.log('  ✅ Indici "ratings" creati');

    console.log('\n✅ Database configurato con successo!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error);
    process.exit(1);
  }
}

setupDatabase();
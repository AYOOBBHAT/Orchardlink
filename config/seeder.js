const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('./db');
const Farmer = require('../models/Farmer');
const Tree = require('../models/Tree');

const SAMPLE_APPLE_TREE_IMAGES = [
  'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80',
  'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800&q=80',
  'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80',
];

const farmerRows = [
  {
    name: 'Abdul Rashid',
    location: 'Shopian, Kashmir',
    description:
      'Third-generation apple grower in the Shopian belt, known for high-altitude Red Delicious and Golden Delicious orchards fed by snowmelt streams.',
    image:
      'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
  },
  {
    name: 'Ghulam Nabi',
    location: 'Sopore, Kashmir',
    description:
      'Operates a family orchard near Sopore with integrated grading and cold-storage practices; focuses on crisp, export-grade fruit each harvest.',
    image:
      'https://res.cloudinary.com/demo/image/upload/c_scale,w_800/v1/docs/models-woman.jpg',
  },
  {
    name: 'Yousuf Dar',
    location: 'Pulwama, Kashmir',
    description:
      'Pulwama-based farmer blending traditional canopy management with modern drip irrigation; supplies local mandis and cooperative buyers.',
    image:
      'https://res.cloudinary.com/demo/image/upload/c_scale,w_800/v1/docs/models-man.jpg',
  },
];

function randomPrice() {
  return 2000 + Math.floor(Math.random() * 1001);
}

async function seed() {
  await connectDB();

  await Tree.deleteMany({});
  await Farmer.deleteMany({});

  const insertedFarmers = await Farmer.insertMany(farmerRows);

  const treeDocs = [];
  insertedFarmers.forEach((farmer, index) => {
    const farmNum = index + 1;
    for (let t = 1; t <= 3; t += 1) {
      treeDocs.push({
        farmer: farmer._id,
        treeCode: `F${farmNum}-T${t}`,
        price: randomPrice(),
        expectedYield: '15-20kg',
        status: 'growing',
        isAvailable: true,
        images: [...SAMPLE_APPLE_TREE_IMAGES],
      });
    }
  });

  const insertedTrees = await Tree.insertMany(treeDocs);

  console.log(`Farmers inserted: ${insertedFarmers.length}`);
  console.log(`Trees inserted: ${insertedTrees.length}`);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  mongoose.connection.close().finally(() => process.exit(1));
});

const axios = require('axios');
const User = require('../models/User');
const Wardrobe = require('../models/Wardrobe');
const { Op } = require('sequelize');

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8002';

/**
 * Fetches the real fit score for a single product against user measurements.
 * Falls back to 0.80 if the user has no measurements or the call fails.
 */
async function getFitScore({ user, product }) {
  if (!user.shoulder || !user.chest || !user.waist || !user.hips) {
    return 0.80; // no measurements → use default
  }

  try {
    const payload = {
      product_type:   product.product_type || 't-shirt',
      gender:         user.gender   || 'M',
      height:         user.height   || 170,
      weight:         user.weight   || 70,
      chest:          user.chest    || 90,
      waist:          user.waist    || 80,
      hip:            user.hips     || 95,
      shoulder:       user.shoulder || 42,
      size_chest_min: product.size_chest_min || 0,
      size_chest_max: product.size_chest_max || 0,
      size_waist_min: product.size_waist_min || 0,
      size_waist_max: product.size_waist_max || 0,
      size_hip_min:   product.size_hip_min   || 0,
      size_hip_max:   product.size_hip_max   || 0,
    };

    const response = await axios.post(`${AI_URL}/fit-score`, payload, { timeout: 5000 });
    return response.data.fit_score ?? 0.80;
  } catch (err) {
    console.warn(`[aiProxy] /fit-score failed for product ${product.id}:`, err.message);
    return 0.80; // graceful fallback
  }
}

/**
 * Calculates morpho-similarity score for each product based on what
 * users with similar body measurements have in their wardrobes.
 */
async function getSimilarityScores({ user, products }) {
  const defaultScore = 0.70;
  const k = 5; // number of similar users to find
  
  if (!user.shoulder || !user.chest || !user.waist || !user.hips) {
    return products.map(() => defaultScore);
  }

  try {
    // 1. Fetch all users of the same gender (excluding current user)
    const otherUsers = await User.findAll({
      where: {
        gender: user.gender,
        id: { [Op.ne]: user.id }
      }
    });

    if (otherUsers.length === 0) {
      return products.map(() => defaultScore);
    }

    // 2. Calculate Euclidean distance for each user based on weighted features
    const weights = { height: 1.2, weight: 1.0, chest: 1.2, waist: 1.0, hips: 1.0, shoulder: 0.8 };
    
    const usersWithDistance = otherUsers.map(other => {
      let sumSq = 0;
      for (const [feat, w] of Object.entries(weights)) {
        const diff = (user[feat] || 0) - (other[feat] || 0);
        sumSq += Math.pow(diff * w, 2);
      }
      return { id: other.id, distance: Math.sqrt(sumSq) };
    });

    // 3. Sort by distance (ascending) and get top K
    usersWithDistance.sort((a, b) => a.distance - b.distance);
    const topKUsers = usersWithDistance.slice(0, k);
    const similarUserIds = topKUsers.map(u => u.id);

    // 4. Fetch wardrobes of these similar users
    const wardrobes = await Wardrobe.findAll({
      where: { user_id: similarUserIds }
    });

    // Count product occurrences in similar users' wardrobes
    const productCounts = {};
    for (const w of wardrobes) {
      productCounts[w.product_id] = (productCounts[w.product_id] || 0) + 1;
    }

    // 5. Compute score per product: base 0.5 + up to 0.5 depending on how many similar users own it
    return products.map(p => {
      const count = productCounts[p.id] || 0;
      // if K=5 and count=5, score = 1.0. If count=0, score = 0.5
      return 0.50 + (count / similarUserIds.length) * 0.50;
    });

  } catch (err) {
    console.error('[aiProxy] Error calculating similarity scores:', err.message);
    return products.map(() => defaultScore);
  }
}

/**
 * Fetches real fit scores for all products in parallel, then sends the full
 * enriched payload to FastAPI /recommend.
 */
async function getRecommendations({ user, products, searchQuery }) {
  // Fetch real fit scores for all products in parallel
  const fitScores = await Promise.all(
    products.map(p => getFitScore({ user, product: p }))
  );
  
  // Calculate similarity scores using the real DB
  const similarityScores = await getSimilarityScores({ user, products });

  const payload = {
    user_id:               user.id,
    gender:                user.gender               || 'M',
    total_orders:          user.total_orders         || 0,
    last_category:         user.last_category        || 'casual',
    last_product_type:     user.last_product_type    || 't-shirt',
    days_since_last_order: user.days_since_last_order || 30,
    search_query:          searchQuery               || null,

    // Send body measurements only if the user has them
    user_measurements: user.shoulder ? {
      shoulder: user.shoulder,
      chest:    user.chest,
      waist:    user.waist,
      hips:     user.hips,
    } : null,

    products: products.map((p, i) => ({
      id:               String(p.id),
      category:         p.category     || 'casual',
      product_type:     p.product_type || 't-shirt',
      brand:            p.brand        || 'unknown',
      description:      p.description  || '',
      fit_score:        fitScores[i],         // ← real score from FastAPI /fit-score
      similarity_score: similarityScores[i],  // ← real score computed from PostgreSQL
    })),
  };

  const response = await axios.post(`${AI_URL}/recommend`, payload, { timeout: 15000 });
  return response.data;
}

module.exports = { getRecommendations, getFitScore };

import Product from '../models/Product.js';

// Obtenir tous les produits
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, inStock } = req.query;
    let query = {};

    // Filtres
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des produits',
      error: error.message
    });
  }
};

// Obtenir un produit par ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du produit',
      error: error.message
    });
  }
};

// Créer un nouveau produit
export const createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: savedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création du produit',
      error: error.message
    });
  }
};

// Mettre à jour un produit
export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour du produit',
      error: error.message
    });
  }
};

// Supprimer un produit
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Produit supprimé avec succès',
      data: deletedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du produit',
      error: error.message
    });
  }
};

// Ajouter une review à un produit
export const addReview = async (req, res) => {
  try {
    const { user, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé'
      });
    }
    
    product.reviews.push({ user, rating, comment });
    
    // Calculer la nouvelle note moyenne
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = totalRating / product.reviews.length;
    
    await product.save();
    
    res.json({
      success: true,
      message: 'Review ajoutée avec succès',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la review',
      error: error.message
    });
  }
}; 
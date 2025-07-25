import Transaction from "../models/transaction.js";
import Product from "../models/Product.js";

// Créer une nouvelle transaction
export const createTransaction = async (req, res) => {
  try {
    const { product, quantity, type } = req.body;

    // Vérifier que le produit existe
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    // Vérifier que la quantité est positive
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "La quantité doit être supérieure à 0",
      });
    }

    // Vérifier le stock disponible pour les sorties
    if (type === "sortie" && productExists.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Stock insuffisant pour cette transaction",
        availableStock: productExists.stockQuantity,
        requestedQuantity: quantity,
      });
    }

    // Créer la transaction
    const transaction = new Transaction({
      product,
      quantity,
      type,
    });

    await transaction.save();

    // Mettre à jour le stock du produit
    let newStockQuantity;
    if (type === "entree") {
      newStockQuantity = productExists.stockQuantity + quantity;
    } else if (type === "sortie") {
      newStockQuantity = productExists.stockQuantity - quantity;
    }

    // Mettre à jour le produit
    await Product.findByIdAndUpdate(product, {
      stockQuantity: newStockQuantity,
      inStock: newStockQuantity > 0,
    });

    // Récupérer la transaction avec les détails du produit
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate("product", "name price stockQuantity");

    res.status(201).json({
      success: true,
      message: "Transaction créée avec succès",
      data: populatedTransaction,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la transaction:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
};

// Récupérer toutes les transactions
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, product } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (product) filter.product = product;

    const transactions = await Transaction.find(filter)
      .populate("product", "name price stockQuantity")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
};

// Récupérer une transaction par ID
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id)
      .populate("product", "name price stockQuantity");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction non trouvée",
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de la transaction:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
};

// Mettre à jour une transaction
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { product, quantity, type } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction non trouvée",
      });
    }

    // Vérifier que le produit existe
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Produit non trouvé",
      });
    }

    // Calculer l'impact sur le stock
    let stockImpact = 0;
    
    // Annuler l'impact de l'ancienne transaction
    if (transaction.type === "entree") {
      stockImpact -= transaction.quantity;
    } else if (transaction.type === "sortie") {
      stockImpact += transaction.quantity;
    }

    // Ajouter l'impact de la nouvelle transaction
    if (type === "entree") {
      stockImpact += quantity;
    } else if (type === "sortie") {
      stockImpact -= quantity;
    }

    // Vérifier que le nouveau stock ne sera pas négatif
    const newStockQuantity = productExists.stockQuantity + stockImpact;
    if (newStockQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Cette modification rendrait le stock négatif",
      });
    }

    // Mettre à jour la transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { product, quantity, type },
      { new: true, runValidators: true }
    ).populate("product", "name price stockQuantity");

    // Mettre à jour le stock du produit
    await Product.findByIdAndUpdate(product, {
      stockQuantity: newStockQuantity,
      inStock: newStockQuantity > 0,
    });

    res.status(200).json({
      success: true,
      message: "Transaction mise à jour avec succès",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la transaction:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
};

// Supprimer une transaction
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction non trouvée",
      });
    }

    // Récupérer le produit
    const product = await Product.findById(transaction.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produit associé non trouvé",
      });
    }

    // Calculer l'impact sur le stock (inverser la transaction)
    let stockImpact = 0;
    if (transaction.type === "entree") {
      stockImpact -= transaction.quantity;
    } else if (transaction.type === "sortie") {
      stockImpact += transaction.quantity;
    }

    // Vérifier que la suppression ne rendra pas le stock négatif
    const newStockQuantity = product.stockQuantity + stockImpact;
    if (newStockQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Impossible de supprimer cette transaction car elle rendrait le stock négatif",
      });
    }

    // Supprimer la transaction
    await Transaction.findByIdAndDelete(id);

    // Mettre à jour le stock du produit
    await Product.findByIdAndUpdate(transaction.product, {
      stockQuantity: newStockQuantity,
      inStock: newStockQuantity > 0,
    });

    res.status(200).json({
      success: true,
      message: "Transaction supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la transaction:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
};

// Obtenir les statistiques des transactions
export const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    const totalTransactions = await Transaction.countDocuments(filter);
    const totalEntrees = stats.find(s => s._id === "entree")?.totalQuantity || 0;
    const totalSorties = stats.find(s => s._id === "sortie")?.totalQuantity || 0;

    res.status(200).json({
      success: true,
      data: {
        totalTransactions,
        totalEntrees,
        totalSorties,
        stockNet: totalEntrees - totalSorties,
        details: stats,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur",
      error: error.message,
    });
  }
};

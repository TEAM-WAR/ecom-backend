import Colis from "../models/Colis.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import axios from "axios";

// Fonction pour échapper les caractères spéciaux dans les regex
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Fonction pour parser la désignation et extraire les produits
const parseDesignation = (designation) => {
  // Si la désignation contient des "|", traiter comme une liste de produits
  if (designation.includes("|")) {
    return designation
      .split("|")
      .map((part) => part.trim())
      .map((entry) => {
        const match = entry.match(/(.+?)\s*x\s*(\d+)$/i);
        if (!match) return null;
        return {
          name: match[1].trim(),
          quantity: parseInt(match[2]),
        };
      })
      .filter(Boolean);
  } else {
    // Si pas de "|", traiter comme un seul produit avec quantité 1
    return [
      {
        name: designation.trim(),
        quantity: 1,
      },
    ];
  }
};

// Fonction pour construire le tableau des produits du colis
const buildColisProducts = async (designation) => {
  try {
    const items = parseDesignation(designation);
    const prodcuts = [];

    console.log("Parsed items from designation:", items);

    for (const item of items) {
      try {
        // Strategy 1: Try exact match first
        let product = await Product.findOne({
          name: { $regex: escapeRegex(item.name), $options: "i" },
        });

        // Strategy 2: If no exact match, try partial match with first 3 words
        if (!product) {
          const words = item.name.split(" ").slice(0, 3).join(" ");
          console.log(
            `Trying partial match with: "${words}" for item: "${item.name}"`
          );

          product = await Product.findOne({
            name: { $regex: escapeRegex(words), $options: "i" },
          });
        }

        // Strategy 3: If still no match, try with first 2 words
        if (!product) {
          const words = item.name.split(" ").slice(0, 2).join(" ");
          console.log(
            `Trying 2-word match with: "${words}" for item: "${item.name}"`
          );

          product = await Product.findOne({
            name: { $regex: escapeRegex(words), $options: "i" },
          });
        }

        // Strategy 4: Try matching individual key words
        if (!product) {
          const keyWords = item.name
            .split(" ")
            .filter((word) => word.length > 3);
          console.log(
            `Trying key words match: [${keyWords.join(", ")}] for item: "${
              item.name
            }"`
          );

          for (const keyWord of keyWords) {
            product = await Product.findOne({
              name: { $regex: escapeRegex(keyWord), $options: "i" },
            });
            if (product) break;
          }
        }

        if (product) {
          console.log(
            `✅ Matched product: "${product.name}" (ID: ${product._id}) for item: "${item.name}" with quantity: ${item.quantity}`
          );
          prodcuts.push({
            prodcut_id: product._id,
            quantity: item.quantity,
          });
        } else {
          console.log(
            `❌ No product found for item: "${item.name}" (all strategies failed)`
          );
        }
      } catch (itemError) {
        console.error(
          `Error processing item "${item.name}":`,
          itemError.message
        );
      }
    }

    console.log("Final products array:", prodcuts);

    // Summary logging
    const totalItems = items.length;
    const matchedItems = prodcuts.length;
    console.log(
      `📊 Product matching summary: ${matchedItems}/${totalItems} items matched`
    );

    if (matchedItems < totalItems) {
      console.log(
        "⚠️  Some items could not be matched to products in the database"
      );
    }

    return prodcuts;
  } catch (error) {
    console.error("Error in buildColisProducts:", error.message);
    return [];
  }
};

// Obtenir tous les colis
export const getAllColis = async (req, res) => {
  try {
    const {
      statut,
      search,
      minMontant,
      maxMontant,
      dateDebut,
      dateFin,
      etat,
      payement_mode,
    } = req.query;

    let query = {
      status: req.query.status,
    };

    // Filtres
    if (statut) {
      query.statut = statut;
    }
    if (etat) {
      query.etat = parseInt(etat);
    }
    if (payement_mode) {
      query.payement_mode = payement_mode;
    }
    if (search) {
      query.$or = [
        { nom_destinataire: { $regex: search, $options: "i" } },
        { code_barre: { $regex: search, $options: "i" } },
        { facture: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }
    if (minMontant || maxMontant) {
      query.montant_reception = {};
      if (minMontant) query.montant_reception.$gte = parseFloat(minMontant);
      if (maxMontant) query.montant_reception.$lte = parseFloat(maxMontant);
    }
    if (dateDebut || dateFin) {
      query.date_creation = {};
      if (dateDebut) query.date_creation.$gte = new Date(dateDebut);
      if (dateFin) query.date_creation.$lte = new Date(dateFin);
    }

    const colis = await Colis.find(query)
      .populate("Prodcuts.prodcut_id")
      .sort({ date_creation: -1 });

    res.json({
      success: true,
      count: colis.length,
      data: colis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des colis",
      error: error.message,
    });
  }
};

// Obtenir un colis par ID
export const getColisById = async (req, res) => {
  try {
    const colis = await Colis.findById(req.params.id).populate(
      "Prodcuts.prodcut_id"
    );
    if (!colis) {
      return res.status(404).json({
        success: false,
        message: "Colis non trouvé",
      });
    }
    res.json({
      success: true,
      data: colis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du colis",
      error: error.message,
    });
  }
};

// Obtenir un colis par code-barres
export const getColisByCodeBarre = async (req, res) => {
  try {
    const { codeBarre } = req.params;
    const colis = await Colis.findByCodeBarre(codeBarre).populate(
      "Prodcuts.prodcut_id"
    );

    if (!colis) {
      return res.status(404).json({
        success: false,
        message: "Colis non trouvé avec ce code-barres",
      });
    }

    res.json({
      success: true,
      data: colis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche du colis",
      error: error.message,
    });
  }
};

// Créer un nouveau colis
export const detectColis = async (req, res) => {
  try {
    console.log(req.body);
    const response = await axios.get(
      `https://vi.bestway-delivery.tn/API/tracking/${req.body.code_barre}`
    );
    console.log(response.data.colis);

    const colisData = response.data.colis;

    // Extraire et matcher les produits depuis la désignation
    if (colisData.designation) {
      console.log("Processing designation:", colisData.designation);
      const prodcuts = await buildColisProducts(colisData.designation);
      colisData.Prodcuts = prodcuts;
    }

    // const newColis = new Colis(colisData);
    // const savedColis = await newColis.save();
    console.log(colisData);

    res.status(201).json({
      success: true,
      message: "Colis créé avec succès",
      data: colisData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la création du colis",
      error: error.message,
    });
  }
};

// Mettre à jour un colis
export const updateColis = async (req, res) => {
  try {
    const updatedColis = await Colis.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedColis) {
      return res.status(404).json({
        success: false,
        message: "Colis non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Colis mis à jour avec succès",
      data: updatedColis,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la mise à jour du colis",
      error: error.message,
    });
  }
};

// Supprimer un colis
export const deleteColis = async (req, res) => {
  try {
    const deletedColis = await Colis.findByIdAndDelete(req.params.id);

    if (!deletedColis) {
      return res.status(404).json({
        success: false,
        message: "Colis non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Colis supprimé avec succès",
      data: deletedColis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du colis",
      error: error.message,
    });
  }
};

// Mettre à jour le statut d'un colis
export const updateColisStatus = async (req, res) => {
  try {
    const { statut, commentaires } = req.body;

    const updatedColis = await Colis.findByIdAndUpdate(
      req.params.id,
      {
        statut,
        commentaires,
        last_operation_date: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedColis) {
      return res.status(404).json({
        success: false,
        message: "Colis non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Statut du colis mis à jour avec succès",
      data: updatedColis,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la mise à jour du statut",
      error: error.message,
    });
  }
};

// Rechercher des colis par destinataire
export const searchColisByDestinataire = async (req, res) => {
  try {
    const { nomDestinataire } = req.params;
    const colis = await Colis.findByDestinataire(nomDestinataire);

    res.json({
      success: true,
      count: colis.length,
      data: colis,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la recherche des colis",
      error: error.message,
    });
  }
};

// Obtenir les statistiques des colis
export const getColisStats = async (req, res) => {
  try {
    const stats = await Colis.aggregate([
      {
        $group: {
          _id: "$statut",
          count: { $sum: 1 },
          totalMontant: { $sum: "$montant_reception" },
        },
      },
    ]);

    const totalColis = await Colis.countDocuments();
    const totalMontant = await Colis.aggregate([
      { $group: { _id: null, total: { $sum: "$montant_reception" } } },
    ]);

    res.json({
      success: true,
      data: {
        stats,
        totalColis,
        totalMontant: totalMontant[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: error.message,
    });
  }
};

// Créer plusieurs colis en lot
export const createMultipleColis = async (req, res) => {
  try {
    const { colis } = req.body;

    if (!Array.isArray(colis) || colis.length === 0) {
      return res.status(400).json({
        success: false,
        message: "La liste des colis est requise",
      });
    }

    const savedColis = await Colis.insertMany(colis);

    res.status(201).json({
      success: true,
      message: `${savedColis.length} colis créés avec succès`,
      data: savedColis,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Erreur lors de la création des colis",
      error: error.message,
    });
  }
};

export const createColis = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("createColis controller", req.body);

    // Prepare the colis data with required fields
    const colisData = { ...req.body };

    // Set default etat if not provided (based on etat_str)
    if (!colisData.etat) {
      // Map etat_str to etat number
      const etatMapping = {
        1: "Création étiquette",
        3: "Colis enlevé",
        4: "Réception HUB",
        5: "Planifier pour livraison",
        6: "Anomalie de livraison",
        7: "Colis livré",
        23: "Livré clôturé",
        21: "Clôture pour échange",
        16: "Echange livré",
        22: "Clôture pour retour",
        28: "Retour Livré",
        19: "Anomalie d'enlèvement",
      };

     
    }

    // Convert montant_reception to number if it's a string
    if (typeof colisData.montant_reception === "string") {
      colisData.montant_reception = parseFloat(colisData.montant_reception);
    }

    // Vérifier et mettre à jour le stock des produits
    if (colisData.Prodcuts && colisData.Prodcuts.length > 0) {
      for (const productItem of colisData.Prodcuts) {
        const product = await Product.findById(productItem.prodcut_id).session(
          session
        );

        if (!product) {
          await session.abortTransaction();
          return res.status(404).json({
            success: false,
            message: `Produit avec l'ID ${productItem.prodcut_id} non trouvé`,
          });
        }

        // Vérifier si le stock est suffisant
        if (product.stockQuantity < productItem.quantity) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: `Stock insuffisant pour le produit ${product.name}. Stock disponible: ${product.stockQuantity}, Quantité demandée: ${productItem.quantity}`,
          });
        }

        // Réduire la quantité en stock
        product.stockQuantity -= productItem.quantity;

        // Mettre à jour le statut inStock si nécessaire
        if (product.stockQuantity === 0) {
          product.inStock = false;
        }

        await product.save({ session });
        console.log(
          `Stock mis à jour pour le produit ${product.name}: ${product.stockQuantity} restants`
        );
      }
    }

    const newColis = new Colis(colisData);
    const savedColis = await newColis.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Colis créé avec succès et stock mis à jour",
      data: savedColis,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erreur lors de la création du colis:", error);
    res.status(400).json({
      success: false,
      message: "Erreur lors de la création du colis",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

export const markAsReturned = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const colis = await Colis.findOne({ code_barre: id })
      .populate("Prodcuts.prodcut_id")
      .session(session);
    if (!colis) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Colis non trouvé",
      });
    }

    // Restaurer le stock des produits
    if (colis.Prodcuts && colis.Prodcuts.length > 0) {
      for (const productItem of colis.Prodcuts) {
        const product = await Product.findById(productItem.prodcut_id).session(
          session
        );

        if (product) {
          // Restaurer la quantité en stock
          product.stockQuantity += productItem.quantity;

          // Mettre à jour le statut inStock si nécessaire
          if (product.stockQuantity > 0) {
            product.inStock = true;
          }

          await product.save({ session });
          console.log(
            `Stock restauré pour le produit ${product.name}: ${product.stockQuantity} en stock`
          );
        } else {
          console.log(
            `Produit avec l'ID ${productItem.prodcut_id} non trouvé lors de la restauration du stock`
          );
        }
      }
    }

    // Mettre à jour le statut du colis
    colis.statut = "retourne";
    colis.etat = 3; // Retourné
    colis.etat_str = "Retourné";
    colis.last_operation_date = new Date();
    colis.date_retour = new Date();
    await colis.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Colis marqué comme retourné et stock restauré avec succès",
      data: colis,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Erreur lors du marquage du colis comme retourné:", error);
    res.status(400).json({
      success: false,
      message: "Erreur lors de la mise à jour du statut",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Mettre à jour l'état de tous les colis en attente en récupérant les données depuis l'API Bestway
export const updatePendingColisStatus = async (req, res) => {
  try {
    // Trouver tous les colis avec le statut "en_attente"
    const pendingColis = await Colis.find({ statut: "en_attente" });

    if (pendingColis.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun colis en attente trouvé",
      });
    }

    console.log(`Trouvé ${pendingColis.length} colis en attente à mettre à jour`);

    const results = {
      success: [],
      failed: [],
      totalProcessed: 0
    };

    // Traiter chaque colis individuellement
    for (const colis of pendingColis) {
      try {
        console.log(`Mise à jour du colis avec code-barres: ${colis.code_barre}`);
        
        // Appeler l'API Bestway pour récupérer les nouvelles informations
        const response = await axios.get(
          `https://vi.bestway-delivery.tn/API/tracking/${colis.code_barre}`
        );

        if (!response.data || !response.data.colis) {
          console.log(`Pas de données pour le colis ${colis.code_barre}`);
          results.failed.push({
            code_barre: colis.code_barre,
            reason: "Pas de données retournées par l'API"
          });
          continue;
        }

        const apiData = response.data.colis;
        
        // Mettre à jour le colis avec les nouvelles données de l'API
        const updateData = {
          etat: apiData.etat || colis.etat,
          etat_str: apiData.etat_str || colis.etat_str,
          motif: apiData.motif || colis.motif,
          last_operation_date: apiData.last_operation_date ? new Date(apiData.last_operation_date) : new Date(),
          date_modification: new Date()
        };

        // Mettre à jour le colis dans la base de données
        const updatedColis = await Colis.findByIdAndUpdate(
          colis._id,
          updateData,
          { new: true, runValidators: true }
        );

        if (updatedColis) {
          console.log(`✅ Colis ${colis.code_barre} mis à jour: etat=${updateData.etat}, etat_str="${updateData.etat_str}"`);
          results.success.push({
            code_barre: colis.code_barre,
            oldEtat: colis.etat,
            newEtat: updateData.etat,
            oldEtatStr: colis.etat_str,
            newEtatStr: updateData.etat_str,
            motif: updateData.motif
          });
        } else {
          console.log(`❌ Échec de la mise à jour du colis ${colis.code_barre}`);
          results.failed.push({
            code_barre: colis.code_barre,
            reason: "Échec de la mise à jour en base de données"
          });
        }

        results.totalProcessed++;

        // Petite pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (colisError) {
        console.error(`Erreur lors du traitement du colis ${colis.code_barre}:`, colisError.message);
        results.failed.push({
          code_barre: colis.code_barre,
          reason: colisError.message
        });
        results.totalProcessed++;
      }
    }

    console.log(`Traitement terminé: ${results.success.length} succès, ${results.failed.length} échecs`);

    res.json({
      success: true,
      message: `Mise à jour terminée: ${results.success.length} colis mis à jour avec succès, ${results.failed.length} échecs`,
      data: {
        totalProcessed: results.totalProcessed,
        successCount: results.success.length,
        failedCount: results.failed.length,
        successfulUpdates: results.success,
        failedUpdates: results.failed
      }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour des colis en attente:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour des colis en attente",
      error: error.message,
    });
  }
};

import Colis from "../models/Colis.js";
import axios from "axios";

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

    let query = {};

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

    const colis = await Colis.find(query).sort({ date_creation: -1 });

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
    const colis = await Colis.findById(req.params.id);
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
    const colis = await Colis.findByCodeBarre(codeBarre);

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
export const createColis = async (req, res) => {
  try {
    console.log(req.body);
    const response = await axios.get(
      `https://vi.bestway-delivery.tn/API/tracking/${req.body.code_barre}`
    );
    console.log(response.data.colis);
    const newColis = new Colis(response.data.colis);
    const savedColis = await newColis.save();

    res.status(201).json({
      success: true,
      message: "Colis créé avec succès",
      data: savedColis,
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

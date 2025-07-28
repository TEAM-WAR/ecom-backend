import mongoose from "mongoose";

const colisSchema = new mongoose.Schema(
  {
    nom_destinataire: {
      type: String,
      required: [true, "Le nom du destinataire est requis"],
      trim: true,
      maxlength: [100, "Le nom du destinataire ne peut pas dépasser 100 caractères"],
    },
    adresse_destinataire: {
      type: String,
      required: [true, "L'adresse du destinataire est requise"],
      trim: true,
      maxlength: [200, "L'adresse ne peut pas dépasser 200 caractères"],
    },
    tel_destinataire: {
      type: String,
      required: [true, "Le téléphone du destinataire est requis"],
      trim: true,
      maxlength: [20, "Le numéro de téléphone ne peut pas dépasser 20 caractères"],
    },
    cheque: {
      type: String,
      default: null,
      trim: true,
    },
    facture: {
      type: String,
      required: [true, "Le numéro de facture est requis"],
      trim: true,
    },
    payement_mode: {
      type: String,
      required: [true, "Le mode de paiement est requis"],
      enum: ["1", "2", "3"], // 1: Espèces, 2: Chèque, 3: Virement
    },
    designation: {
      type: String,
      required: [true, "La désignation du colis est requise"],
      trim: true,
      maxlength: [200, "La désignation ne peut pas dépasser 200 caractères"],
    },
    etat: {
      type: Number,
      required: [true, "L'état du colis est requis"],
      min: [0, "L'état ne peut pas être négatif"],
    },
    motif: {
      type: String,
      default: "0",
      trim: true,
    },
    last_operation_date: {
      type: Date,
      default: Date.now,
    },
    code_barre: {
      type: String,
      required: [true, "Le code-barres est requis"],
      unique: true,
      trim: true,
      maxlength: [50, "Le code-barres ne peut pas dépasser 50 caractères"],
    },
    reference: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "La référence ne peut pas dépasser 100 caractères"],
    },
    montant_reception: {
      type: Number,
      required: [true, "Le montant de réception est requis"],
      min: [0, "Le montant ne peut pas être négatif"],
    },
    etat_str: {
      type: String,
      required: [true, "La description de l'état est requise"],
      trim: true,
      maxlength: [100, "La description de l'état ne peut pas dépasser 100 caractères"],
    },
    // Champs additionnels pour la gestion
    date_creation: {
      type: Date,
      default: Date.now,
    },
    date_modification: {
      type: Date,
      default: Date.now,
    },
    statut: {
      type: String,
      enum: ["en_attente", "en_transit", "livre", "retourne", "annule"],
      default: "en_attente",
    },
    commentaires: {
      type: String,
      default: "",
      maxlength: [500, "Les commentaires ne peuvent pas dépasser 500 caractères"],
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  }
);

// Index pour améliorer les performances de recherche
colisSchema.index({ code_barre: 1 });
colisSchema.index({ nom_destinataire: 1 });
colisSchema.index({ tel_destinataire: 1 });
colisSchema.index({ etat: 1 });
colisSchema.index({ statut: 1 });
colisSchema.index({ date_creation: -1 });
colisSchema.index({ facture: 1 });

// Méthode pour mettre à jour la date de dernière opération
colisSchema.methods.updateLastOperation = function() {
  this.last_operation_date = new Date();
  this.date_modification = new Date();
  return this.save();
};

// Méthode statique pour rechercher par code-barres
colisSchema.statics.findByCodeBarre = function(codeBarre) {
  return this.findOne({ code_barre: codeBarre });
};

// Méthode statique pour rechercher par destinataire
colisSchema.statics.findByDestinataire = function(nomDestinataire) {
  return this.find({ 
    nom_destinataire: { $regex: nomDestinataire, $options: 'i' } 
  });
};

// Middleware pre-save pour mettre à jour la date de modification
colisSchema.pre('save', function(next) {
  this.date_modification = new Date();
  next();
});

export default mongoose.model("Colis", colisSchema);

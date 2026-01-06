import { z } from 'zod'

/**
 * Schémas de validation Zod pour MZ ENERGY
 */

// Validation du formulaire Lead (étape 1)
export const leadSchema = z.object({
  prenom: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  ville: z.string().optional(),
})

// Validation du formulaire Simulation (étape 2)
export const simulationSchema = z.object({
  consoAnnuelle: z
    .number({ invalid_type_error: 'Veuillez entrer un nombre' })
    .min(1000, 'La consommation minimale est de 1 000 kWh/an')
    .max(10000000, 'La consommation maximale est de 10 000 000 kWh/an'),
  partJour: z
    .number({ invalid_type_error: 'Veuillez entrer un nombre' })
    .min(10, 'La part jour minimale est de 10%')
    .max(90, 'La part jour maximale est de 90%'),
  surfaceToit: z
    .number({ invalid_type_error: 'Veuillez entrer un nombre' })
    .min(9, 'La surface minimale est de 9 m² (3 panneaux)')
    .max(10000, 'La surface maximale est de 10 000 m²'),
  prixAchatKwh: z
    .number({ invalid_type_error: 'Veuillez entrer un nombre' })
    .min(0.1, 'Le prix minimum est de 0.10 ₪/kWh')
    .max(5, 'Le prix maximum est de 5 ₪/kWh'),
  prixReventeKwh: z
    .number({ invalid_type_error: 'Veuillez entrer un nombre' })
    .min(0.1, 'Le prix minimum est de 0.10 ₪/kWh')
    .max(5, 'Le prix maximum est de 5 ₪/kWh'),
})

// Validation complète (les deux étapes)
export const fullSimulationSchema = leadSchema.merge(simulationSchema)

export type LeadFormValues = z.infer<typeof leadSchema>
export type SimulationFormValues = z.infer<typeof simulationSchema>
export type FullSimulationFormValues = z.infer<typeof fullSimulationSchema>


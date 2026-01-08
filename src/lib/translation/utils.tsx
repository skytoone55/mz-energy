'use client'

import React from 'react'
import { useTranslatedText } from './useTranslation'

/**
 * Helper pour traduire automatiquement les children d'un composant
 * Version améliorée : traduit récursivement TOUS les textes, même dans les éléments React imbriqués
 * Évite de traduire deux fois les éléments déjà traduits (T, TranslatedText)
 */
export function AutoTranslate({ children }: { children: React.ReactNode }): React.ReactNode {
  return translateRecursive(children, 0)
}

/**
 * Fonction récursive pour traduire tous les textes
 */
function translateRecursive(node: React.ReactNode, depth: number): React.ReactNode {
  // Limite de profondeur pour éviter les boucles infinies
  if (depth > 10) return node

  // Si c'est une string (non vide), la traduire si ce n'est pas une donnée
  if (typeof node === 'string') {
    const trimmed = node.trim()
    if (trimmed && !isLikelyData(trimmed)) {
      return <TranslatedText text={node} />
    }
    return node
  }

  // Les nombres, booléens, null, undefined ne sont pas traduits
  if (
    typeof node === 'number' ||
    typeof node === 'boolean' ||
    node === null ||
    node === undefined
  ) {
    return node
  }

  // Si c'est un tableau, traduire chaque élément récursivement
  if (Array.isArray(node)) {
    return node.map((child, index) => {
      const translated = translateRecursive(child, depth + 1)
      // Si c'est un élément React, lui donner une clé
      if (React.isValidElement(translated)) {
        return React.cloneElement(translated as React.ReactElement, { key: translated.key || `auto-${index}` })
      }
      return translated
    })
  }

  // Si c'est un élément React, traduire ses enfants récursivement
  if (React.isValidElement(node)) {
    // Ignorer les composants qui sont déjà traduits
    const componentName = (node.type as any)?.displayName || (node.type as any)?.name
    if (componentName === 'T' || componentName === 'TranslatedText') {
      return node // Déjà traduit, ne pas retraduire
    }

    // Si c'est un fragment React, traduire ses children
    if (node.type === React.Fragment) {
      return React.cloneElement(
        node,
        {},
        translateRecursive(node.props.children, depth + 1)
      )
    }

    // Traduire récursivement les children
    const props = { ...node.props }
    if (props.children !== undefined) {
      props.children = translateRecursive(props.children, depth + 1)
    }

    return React.cloneElement(node, props)
  }

  return node
}

/**
 * Vérifie si un texte est probablement une donnée (email, téléphone, nombre, etc.)
 * et ne devrait pas être traduit
 */
function isLikelyData(text: string): boolean {
  // Emails
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return true
  
  // Numéros de téléphone (commencent par +, 0, ou contiennent des chiffres)
  if (/^[\+\d\s\-\(\)]+$/.test(text) && /\d{6,}/.test(text)) return true
  
  // URLs
  if (/^https?:\/\//.test(text)) return true
  
  // Nombres purs (avec ou sans séparateurs, mais pas de texte)
  if (/^[\d\s,\.]+$/.test(text) && /\d/.test(text) && text.length > 3) return true
  
  // Dates au format numérique (01/01/2024, 2024-01-01)
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(text)) return true
  
  // Codes ou identifiants (UUID, hash, etc.)
  if (/^[A-Z0-9\-_]{10,}$/.test(text)) return true

  // Monnaie ou prix (€, ₪, $ suivis de chiffres)
  if (/^[€₪$]\s?[\d,\.]+$/.test(text)) return true

  // Unités avec nombres (m², kWh, etc.)
  if (/^[\d,\.]+\s*(m²|kWh|kW|V|A|h|min|sec)$/i.test(text)) return true

  return false
}

/**
 * Composant simple pour traduire un texte
 * S'assure que text est bien une string avant de le passer à useTranslatedText
 */
function TranslatedText({ text }: { text: string | number | boolean | null | undefined }) {
  // Convertir en string si ce n'est pas déjà une string
  const textStr = typeof text === 'string' ? text : (text?.toString() || '');
  const translated = useTranslatedText(textStr)
  return <>{translated}</>
}

// Marquer TranslatedText avec displayName pour éviter la double traduction
TranslatedText.displayName = 'TranslatedText'

'use client'

import React from 'react'
import { useTranslatedText } from './useTranslation'

/**
 * Traduit automatiquement TOUS les textes enfants récursivement
 * Y compris les textes dans les éléments React imbriqués
 */
export function AutoTranslateAll({ children }: { children: React.ReactNode }): React.ReactNode {
  return translateRecursive(children)
}

/**
 * Fonction récursive pour traduire tous les textes
 */
function translateRecursive(node: React.ReactNode): React.ReactNode {
  // Si c'est une string (non vide), la traduire
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
      const translated = translateRecursive(child)
      // Si c'est un élément React, lui donner une clé
      if (React.isValidElement(translated)) {
        return React.cloneElement(translated as React.ReactElement, { key: translated.key || index })
      }
      return translated
    })
  }

  // Si c'est un élément React, traduire ses enfants
  if (React.isValidElement(node)) {
    // Ignorer TranslatedText pour éviter la traduction double
    if (node.type === TranslatedText) {
      return node // Déjà traduit
    }
    
    // Ignorer les composants avec displayName TranslatedText ou T
    const nodeType = node.type as { displayName?: string }
    if (typeof node.type === 'function' && nodeType.displayName && (nodeType.displayName === 'TranslatedText' || nodeType.displayName === 'T')) {
      return node
    }

    // Traduire récursivement les children
    const originalProps = node.props as Record<string, unknown>
    const props: Record<string, unknown> = { ...originalProps }
    if (props.children !== undefined) {
      props.children = translateRecursive(props.children as React.ReactNode)
    }

    // Traduire aussi les attributs texte (placeholder, title, alt, etc.)
    const textAttributes = ['placeholder', 'title', 'alt', 'aria-label'] as const
    for (const attr of textAttributes) {
      if (props[attr] && typeof props[attr] === 'string' && !isLikelyData(props[attr] as string)) {
        props[attr] = translateTextSync(props[attr] as string)
      }
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
  if (/^[\+\d\s\-\(\)]+$/.test(text) && /\d/.test(text)) return true
  
  // URLs
  if (/^https?:\/\//.test(text)) return true
  
  // Nombres purs (avec ou sans séparateurs)
  if (/^[\d\s,\.]+$/.test(text) && /\d/.test(text)) return true
  
  // Dates au format numérique
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(text)) return true
  
  // Codes ou identifiants
  if (/^[A-Z0-9\-_]+$/.test(text) && text.length > 5) return true

  return false
}

/**
 * Composant pour traduire un texte
 */
function TranslatedText({ text }: { text: string }) {
  const translated = useTranslatedText(text)
  return <>{translated}</>
}

/**
 * Fonction synchrone pour traduire un texte (pour les attributs)
 * Note: Cette fonction retourne le texte original car la traduction est asynchrone
 * Les attributs seront traduits lors du prochain rendu
 */
function translateTextSync(text: string): string {
  // Pour l'instant, on retourne le texte original
  // La traduction des attributs se fera via useTranslatedAttr dans les composants Input, etc.
  return text
}


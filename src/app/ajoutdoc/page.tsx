'use client'

import React, { useState } from 'react'
import Image from 'next/image'

// Types pour les interfaces
interface FormData {
  titre: string
  auteur: string
  description: string
  source: string
  categorie: string
  thematique: string
  langue: string
  motsCles: string[]
  datePublication: string
  isPublished: boolean
  imageCouverture?: string
}

// Types pour PDF.js
interface PDFDocument {
  numPages: number
  getPage(pageNumber: number): Promise<PDFPage>
}

interface PDFPage {
  getTextContent(): Promise<PDFTextContent>
}

interface PDFTextContent {
  items: PDFTextItem[]
}

interface PDFTextItem {
  str: string
}

declare global {
  interface Window {
    pdfjsLib: {
      getDocument(data: Uint8Array): { promise: Promise<PDFDocument> }
    }
  }
}

const AddDocumentPage = () => {
  const [formData, setFormData] = useState<FormData>({
    titre: '',
    auteur: '',
    description: '',
    source: '',
    categorie: '',
    thematique: '',
    langue: '',
    motsCles: [],
    datePublication: '',
    isPublished: false,
    imageCouverture: '',
  })

  const [file, setFile] = useState<{ name: string; url: string; size: number } | null>(null)
  const [imageCouverture, setImageCouverture] = useState<{
    name: string
    url: string
    size: number
  } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [extractingData, setExtractingData] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [motCleInput, setMotCleInput] = useState('')

  // Options pour les sélecteurs
  const categories = [
    { value: 'rapports', label: 'Rapports' },
    { value: 'etudes', label: 'Études' },
    { value: 'lois', label: 'Lois' },
    { value: 'articles', label: 'Articles' },
    { value: 'outils_pedagogiques', label: 'Outils pédagogiques' },
  ]

  const thematiques = [
    { value: 'protection_contre_violence', label: 'Protection contre la violence' },
    { value: 'education', label: 'Éducation' },
    { value: 'sante', label: 'Santé' },
    { value: 'justice_juvenile', label: 'Justice juvénile' },
  ]

  const langues = [
    { value: 'francais', label: 'Français' },
    { value: 'anglais', label: 'Anglais' },
  ]

  // Fonction pour extraire le texte du PDF
  const extractTextFromPDF = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const typedArray = new Uint8Array(arrayBuffer)

      const pdf: PDFDocument = await window.pdfjsLib.getDocument(typedArray).promise

      const textPromises: Promise<string>[] = []
      for (let i = 1; i <= pdf.numPages; i++) {
        textPromises.push(
          pdf.getPage(i).then((page: PDFPage) => {
            return page.getTextContent().then((textContent: PDFTextContent) => {
              return textContent.items.map((item: PDFTextItem) => item.str).join(' ')
            })
          }),
        )
      }

      const pagesText = await Promise.all(textPromises)
      return pagesText.join('\n')
    } catch (error) {
      console.error("Erreur lors de l'extraction du PDF:", error)
      return ''
    }
  }

  // Fonction pour analyser le contenu avec OpenRouter
  const analyzeContentWithAI = async (text: string) => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization:
            'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-small-3.2-24b-instruct:free',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyse ce document et extrait les informations suivantes au format JSON. Renvoie uniquement le JSON, sans texte supplémentaire.
                  Les champs requis sont:
                  - titre: le titre du document
                  - auteur: l'auteur ou l'organisation
                  - description: un résumé du contenu (max 600 caractères)
                  - source: la source ou l'organisation d'origine
                  - categorie: choisir parmi "rapports", "etudes", "lois", "articles", "outils_pedagogiques"
                  - thematique: choisir parmi "protection_contre_violence", "education", "sante", "justice_juvenile"
                  - langue: "francais" ou "anglais"
                  - motsCles: array de 3-10 mots-clés pertinents
                  - datePublication: date au format YYYY-MM-DD si trouvée

                  Voici le contenu du document:
                  ${text}`,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const result = await response.json()
      let aiResponse = result.choices[0]?.message?.content

      // Supprimer première et dernière ligne de la réponse AI
      if (aiResponse) {
        const lines = aiResponse.split('\n')
        if (lines.length > 2) {
          aiResponse = lines.slice(1, -1).join('\n')
        }
      }

      console.log(aiResponse)

      // Essayer de parser la réponse JSON
      try {
        const parsedData = JSON.parse(aiResponse)
        return parsedData
      } catch {
        // Si ce n'est pas du JSON valide, essayer d'extraire les informations manuellement
        console.warn('Réponse AI non-JSON, extraction manuelle...')
        return null
      }
    } catch (error) {
      console.error("Erreur lors de l'analyse AI:", error)
      return null
    }
  }

  // Gérer l'upload d'image de couverture
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(selectedFile.type)) {
      setMessage({ type: 'error', text: 'Seuls les fichiers JPG, JPEG et PNG sont acceptés.' })
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: "L'image ne doit pas dépasser 5MB." })
      return
    }

    setUploading(true)
    setMessage({ type: '', text: '' })

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedFile)

      const response = await fetch('/api/documents/upload-image', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const imageData = {
          name: result.originalName || selectedFile.name,
          url: result.fileUrl,
          size: result.fileSize || selectedFile.size,
        }
        setImageCouverture(imageData)
        setFormData((prev) => ({
          ...prev,
          imageCouverture: imageData.url,
        }))
        setMessage({ type: 'success', text: 'Image uploadée avec succès!' })
      } else {
        setMessage({ type: 'error', text: result.error || "Erreur lors de l'upload" })
      }
    } catch (error) {
      console.error('Erreur upload image:', error)
      setMessage({ type: 'error', text: "Erreur lors de l'upload de l'image" })
    } finally {
      setUploading(false)
    }
  }

  // Supprimer l'image de couverture
  const removeImage = () => {
    setImageCouverture(null)
    setFormData((prev) => ({
      ...prev,
      imageCouverture: '',
    }))
    const imageInput = document.querySelector(
      'input[type="file"][accept*="image"]',
    ) as HTMLInputElement
    if (imageInput) {
      imageInput.value = ''
    }
  }

  // Gérer les changements de formulaire
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Ajouter un mot-clé
  const ajouterMotCle = () => {
    if (motCleInput.trim() && !formData.motsCles.includes(motCleInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        motsCles: [...prev.motsCles, motCleInput.trim()],
      }))
      setMotCleInput('')
    }
  }

  // Supprimer un mot-clé
  const supprimerMotCle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      motsCles: prev.motsCles.filter((_, i) => i !== index),
    }))
  }

  // Gérer l'upload de fichier
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Seuls les fichiers PDF sont acceptés.' })
      return
    }

    setUploading(true)
    setMessage({ type: '', text: '' })

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedFile)

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('Réponse non-JSON reçue:', textResponse)
        throw new Error("La réponse du serveur n'est pas du JSON valide")
      }

      const result = await response.json()

      if (result.success) {
        const fileData = {
          name: result.originalName || selectedFile.name,
          url: result.fileUrl,
          size: result.fileSize || selectedFile.size,
        }
        setFile(fileData)

        // Extraction automatique et analyse AI
        setExtractingData(true)
        try {
          const extractedText = await extractTextFromPDF(fileData.url)
          if (extractedText) {
            const aiAnalysis = await analyzeContentWithAI(extractedText)
            if (aiAnalysis) {
              // Préremplir les champs avec les données extraites
              setFormData((prev) => ({
                ...prev,
                titre: aiAnalysis.titre || prev.titre,
                auteur: aiAnalysis.auteur || prev.auteur,
                description: aiAnalysis.description || prev.description,
                source: aiAnalysis.source || prev.source,
                categorie: aiAnalysis.categorie || prev.categorie,
                thematique: aiAnalysis.thematique || prev.thematique,
                langue: aiAnalysis.langue || prev.langue,
                motsCles: aiAnalysis.motsCles || prev.motsCles,
                datePublication: aiAnalysis.datePublication || prev.datePublication,
              }))
              setMessage({
                type: 'success',
                text: 'Fichier uploadé et informations extraites automatiquement!',
              })
            }
          }
        } catch (extractError) {
          console.error("Erreur lors de l'extraction:", extractError)
          setMessage({
            type: 'warning',
            text: 'Fichier uploadé mais extraction automatique échouée. Veuillez remplir manuellement.',
          })
        } finally {
          setExtractingData(false)
        }
      } else {
        setMessage({ type: 'error', text: result.error || "Erreur lors de l'upload" })
      }
    } catch (error) {
      console.error('Erreur upload:', error)
      if (error instanceof Error) {
        setMessage({ type: 'error', text: `Erreur: ${error.message}` })
      } else {
        setMessage({ type: 'error', text: "Erreur lors de l'upload du fichier" })
      }
    } finally {
      setUploading(false)
    }
  }

  // Supprimer le fichier uploadé
  const removeFile = () => {
    setFile(null)
    setMessage({ type: '', text: '' })
    setImageCouverture(null)
    // Réinitialiser les champs du formulaire
    setFormData({
      titre: '',
      auteur: '',
      description: '',
      source: '',
      categorie: '',
      thematique: '',
      langue: '',
      motsCles: [],
      datePublication: '',
      isPublished: false,
    })
    // Réinitialiser l'input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation basique
    if (!formData.titre || !formData.auteur || !formData.description || !formData.source) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const documentData = {
        ...formData,
        userId: 1, // À remplacer par l'ID de l'utilisateur connecté
        fichierUrl: file?.url || null,
        imageCouvertureUrl: imageCouverture?.url || null,
        datePublication: formData.datePublication || null,
        isPublished: false,
      }

      console.log('Données envoyées:', documentData)

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      })

      console.log('Statut de la réponse:', response.status)

      const result = await response.json()
      console.log("Résultat de l'API:", result)

      if (response.ok) {
        setMessage({ type: 'success', text: 'Document créé avec succès!' })
        // Réinitialiser le formulaire
        setFormData({
          titre: '',
          auteur: '',
          description: '',
          source: '',
          categorie: '',
          thematique: '',
          langue: '',
          motsCles: [],
          datePublication: '',
          isPublished: false,
          imageCouverture: '',
        } as FormData)
        setImageCouverture(null)
        setFile(null)
        // Réinitialiser l'input file
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de la création' })
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la création du document' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-500 text-white py-8" style={{ backgroundColor: '#1CABE2' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold">Ajouter un document</h1>
              <p className="text-blue-100 mt-1">
                Partagez vos ressources avec la communauté UNICEF
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : message.type === 'warning'
                ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                message.type === 'success'
                  ? 'bg-green-500 text-white'
                  : message.type === 'warning'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {message.type === 'success' ? '✓' : message.type === 'warning' ? '⚠' : '!'}
            </span>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* SECTION IMAGE DE COUVERTURE */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Image de couverture</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {uploading && !file ? (
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-lg font-medium text-gray-900">Upload en cours...</p>
                  </div>
                ) : imageCouverture ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Image
                        src={imageCouverture.url}
                        alt="Couverture"
                        width={128}
                        height={160}
                        className="w-32 h-40 object-cover rounded-lg shadow-md"
                        unoptimized={true}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="font-medium text-gray-900">{imageCouverture.name}</p>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-gray-500 text-2xl">🖼️</span>
                    </div>
                    <label className="cursor-pointer">
                      <span className="text-lg font-medium text-gray-900">
                        Cliquez pour sélectionner une image
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-gray-500 mt-2">JPG, JPEG, PNG (max 5MB)</p>
                  </div>
                )}
              </div>
            </div>
            {/* SECTION FICHIER PDF - MAINTENANT EN PREMIER */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Fichier PDF *</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {uploading || extractingData ? (
                  <div>
                    <div className="w-12 h-12 mx-auto mb-4">
                      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-lg font-medium text-gray-900">
                      {uploading ? 'Upload en cours...' : 'Extraction des informations...'}
                    </p>
                    <p className="text-gray-500 mt-2">
                      {uploading ? 'Veuillez patienter' : 'Analyse du document par IA...'}
                    </p>
                  </div>
                ) : file ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-8 h-10 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      PDF
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-gray-500 font-bold">PDF</span>
                    </div>
                    <label className="cursor-pointer">
                      <span className="text-lg font-medium text-gray-900">
                        Cliquez pour sélectionner un fichier PDF
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading || extractingData}
                      />
                    </label>
                    <p className="text-gray-500 mt-2">Ou glissez-déposez votre fichier ici</p>
                    <p className="text-sm text-blue-600 mt-2">
                      Les informations seront extraites automatiquement après avoir upload
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTIONS SUIVANTES - INCHANGÉES */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations de base</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre du document *
                  </label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Entrez le titre du document"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Auteur *</label>
                  <input
                    type="text"
                    name="auteur"
                    value={formData.auteur}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Nom de l'auteur"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source *</label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Source du document"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                    placeholder="Décrivez le contenu du document"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Classification</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thématique</label>
                  <select
                    name="thematique"
                    value={formData.thematique}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Sélectionner une thématique</option>
                    {thematiques.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                  <select
                    name="langue"
                    value={formData.langue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Sélectionner une langue</option>
                    {langues.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de publication
                </label>
                <input
                  type="date"
                  name="datePublication"
                  value={formData.datePublication}
                  onChange={handleInputChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mots-clés</h2>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={motCleInput}
                  onChange={(e) => setMotCleInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), ajouterMotCle())}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Ajouter un mot-clé"
                />
                <button
                  type="button"
                  onClick={ajouterMotCle}
                  className="px-6 py-3 text-white rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: '#1CABE2' }}
                >
                  Ajouter
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.motsCles.map((motCle, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {motCle}
                    <button
                      type="button"
                      onClick={() => supprimerMotCle(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#1CABE2' }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>Enregistrer le document</>
                )}
              </button>

              <button
                type="button"
                className="px-6 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDocumentPage

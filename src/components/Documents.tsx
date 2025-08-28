"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";

interface Document {
  id: string;
  titre: string;
  auteur: string;
  description: string;
  source: string;
  categorie: string;
  thematique: string;
  langue: string;
  motsCles: string[];
  fichierUrl: string;
  imageCouvertureUrl?: string;
  isPublished: boolean;
  vues: number;
  datePublication: string;
  createdAt: string;
  updatedAt: string;
  createur: string[];
}

interface DocumentsProps {
  selectedCategory: string;
  searchTerm?: string;
  selectedFeaturedDocument?: string | null;
}

interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface PDFPage {
  getTextContent(): Promise<PDFTextContent>;
}

interface PDFTextContent {
  items: PDFTextItem[];
}

interface PDFTextItem {
  str: string;
}

interface PDFDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPage>;
}

interface PDFLib {
  getDocument(data: Uint8Array): { promise: Promise<PDFDocument> };
}

declare global {
  interface Window {
    pdfjsLib: PDFLib;
  }
}

export default function Documents({
  selectedCategory = "all",
  searchTerm = "",
  selectedFeaturedDocument = null,
}: DocumentsProps) {
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { text: string; isUser: boolean }[]
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [pdfContent, setPdfContent] = useState<string>("");
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
  const documentsPerPage = 14; // 2 lignes × 7 colonnes = 14 documents par page

  // Données
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/documents?all=true")
      .then((res) => res.json())
      .then((data: Document[]) => {
        setDocuments(data);
      })
      .catch((err) => {
        console.error("Erreur lors du fetch des documents :", err);
      });
  }, []);

  useEffect(() => {
    if (selectedFeaturedDocument) {
      // Chercher dans tous les documents, pas seulement currentDocuments
      const featuredDoc = documents.find(
        (doc) => doc.id === selectedFeaturedDocument
      );
      if (featuredDoc) {
        setSelectedDocumentId(selectedFeaturedDocument);
        setExpandedRowIndex(-1); // -1 pour indiquer que c'est un document vedette
        setChatMessages([]);
        setPdfContent("");
        // Extraire le PDF et initialiser le chat
        extractTextFromPDF(featuredDoc.fichierUrl).then((content) => {
          setPdfContent(content);
          setChatMessages([
            {
              text: `Salut ! Que souhaitez-vous savoir sur le document "${featuredDoc.titre}"?`,
              isUser: false,
            },
          ]);
        });
      }
    }
  }, [selectedFeaturedDocument, documents]);

  // Mapping des catégories pour la correspondance
  const getCategoryMapping = (categoryId: string): string => {
    const mappings: { [key: string]: string } = {
      study: "etudes",
      reports: "rapports",
      law: "lois",
      tools: "outils_pedagogiques",
    };
    return mappings[categoryId] || categoryId;
  };

  // Filtrage des documents selon la catégorie sélectionnée et recherche globale
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Filtrage par catégorie
    if (selectedCategory === "most-viewed") {
      filtered = filtered.filter((doc) => doc.vues >= 0);
      console.log("Filtrage most-viewed, résultats:", filtered.length);
    } else if (selectedCategory === "latest") {
      filtered = filtered.filter(
        (doc) => new Date(doc.createdAt) >= new Date("2024-01-01")
      );
      console.log("Filtrage latest, résultats:", filtered.length);
    } else if (selectedCategory !== "all") {
      // Utilisation du mapping pour les catégories spécifiques
      const mappedCategory = getCategoryMapping(selectedCategory);
      console.log("Mapping:", selectedCategory, "→", mappedCategory);

      filtered = filtered.filter((doc) => {
        const match = doc.categorie === mappedCategory;
        if (!match) {
          console.log(
            "Document non-match:",
            doc.titre,
            "categorie:",
            doc.categorie
          );
        }
        return match;
      });
      console.log("Filtrage par catégorie, résultats:", filtered.length);
    }

    // Filtrage par terme de recherche du Header
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.auteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.motsCles.some((keyword) =>
            keyword.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          doc.thematique.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortBy === "views") {
        // Correction: 'vues' → 'views'
        return b.vues - a.vues;
      } else if (sortBy === "title") {
        return a.titre.localeCompare(b.titre);
      }
      return 0;
    });

    return filtered;
  }, [documents, selectedCategory, searchTerm, sortBy]);

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);
  const startIndex = (currentPage - 1) * documentsPerPage;
  const currentDocuments = filteredDocuments.slice(
    startIndex,
    startIndex + documentsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      all: "Tous les documents",
      "most-viewed": "Les plus vues",
      latest: "Les plus récents",
      study: "Etude",
      reports: "Rapports",
      law: "Loi",
      tools: "Outils pédagogiques",
    };
    return labels[category] || category;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fonction pour consulter le PDF
  const handleConsulterDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);

    // Incrémenter le nombre de vues
    fetch(`http://localhost:3000/api/documents/${document.id}/view`, {
      method: "POST",
    }).catch((err) =>
      console.error("Erreur lors de l'incrémentation des vues:", err)
    );
  };

  // Fonction pour télécharger le PDF
  const handleTelechargerDocument = async (doc: Document) => {
    try {
      const response = await fetch(doc.fichierUrl);
      if (!response.ok) throw new Error("Erreur lors du téléchargement");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${doc.titre}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      alert("Erreur lors du téléchargement du document");
    }
  };

  const handleDocumentClick = (document: Document, index: number) => {
    const rowIndex = Math.floor(index / 7);

    if (selectedDocumentId === document.id) {
      setSelectedDocumentId(null);
      setExpandedRowIndex(null);
      // Réinitialiser le chat
      setChatMessages([]);
      setPdfContent("");
    } else {
      setSelectedDocumentId(document.id);
      setExpandedRowIndex(rowIndex);
      // Réinitialiser le chat pour le nouveau document
      setChatMessages([]);
      setPdfContent("");
      // Extraire le PDF et initialiser le chat
      extractTextFromPDF(document.fichierUrl).then((content) => {
        setPdfContent(content);
        setChatMessages([
          {
            text: `Salut ! Que souhaitez-vous savoir sur le document "${document.titre}"?`,
            isUser: false,
          },
        ]);
      });
    }
  };

  // Fonction pour fermer la modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const handleSendMessage = async () => {
    // Récupérer le document actuellement sélectionné
    const currentSelectedDocument = documents.find(
      (doc) => doc.id === selectedDocumentId
    );

    if (inputMessage.trim() && currentSelectedDocument && pdfContent) {
      const userMessage = inputMessage.trim();

      // Ajouter le message utilisateur immédiatement
      setChatMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
      setInputMessage("");
      setIsLoadingResponse(true);

      // Préparer les messages pour OpenRouter
      const messages: OpenRouterMessage[] = [
        {
          role: "system",
          content: `Tu es un assistant IA spécialisé dans l'analyse de documents. Tu dois répondre uniquement en te basant sur le contenu du document suivant. Si la question ne peut pas être répondue avec les informations du document, dis-le clairement.

Document: "${currentSelectedDocument.titre}"
Contenu du document:
${pdfContent}

Instructions:
- Réponds uniquement en français
- Bases tes réponses uniquement sur le contenu du document fourni
- Sois précis et concis dans tes réponses
- Donnes les sections, pages ou zones du document si ou tu as trouvé l'information pertinente.`,
        },
      ];

      // Ajouter l'historique des messages (en excluant le message d'accueil initial)
      chatMessages.slice(1).forEach((msg) => {
        messages.push({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        });
      });

      // Ajouter le nouveau message utilisateur
      messages.push({
        role: "user",
        content: userMessage,
      });

      try {
        // Appeler OpenRouter
        const aiResponse = await callOpenRouter(messages);

        // Ajouter la réponse de l'IA
        setChatMessages((prev) => [
          ...prev,
          { text: aiResponse, isUser: false },
        ]);
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        setChatMessages((prev) => [
          ...prev,
          { text: "Désolé, une erreur est survenue.", isUser: false },
        ]);
      } finally {
        setIsLoadingResponse(false);
      }
    } else {
      // Debug pour voir ce qui manque
      console.log("Conditions non remplies:", {
        inputMessage: inputMessage.trim(),
        currentSelectedDocument: !!currentSelectedDocument,
        pdfContent: !!pdfContent,
        selectedDocumentId,
      });
    }
  };

  const extractTextFromPDF = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      const pdf: PDFDocument = await window.pdfjsLib.getDocument(typedArray)
        .promise;

      const textPromises: Promise<string>[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        textPromises.push(
          pdf.getPage(i).then((page: PDFPage) => {
            return page.getTextContent().then((textContent: PDFTextContent) => {
              return textContent.items
                .map((item: PDFTextItem) => item.str)
                .join(" ");
            });
          })
        );
      }

      const pagesText = await Promise.all(textPromises);
      console.log("Texte extrait du PDF:", pagesText.join("\n"));
      return pagesText.join("\n");
    } catch (error) {
      console.error("Erreur lors de l'extraction du PDF:", error);
      return "";
    }
  };

  const callOpenRouter = async (
    messages: OpenRouterMessage[]
  ): Promise<string> => {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer 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",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-small-3.2-24b-instruct:free",
            messages: messages,
          }),
        }
      );

      const result: OpenRouterResponse = await response.json();
      return result.choices[0].message.content;
    } catch (error) {
      console.error("Erreur OpenRouter:", error);
      return "Désolé, une erreur est survenue lors de la génération de la réponse.";
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        {/* En-tête avec titre et filtres */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="font-bold text-2xl text-gray-800 mb-2">
                {getCategoryLabel(selectedCategory)}
              </h2>
              <div className="w-16 h-1 bg-white border border-gray-300 rounded-full"></div>
              <p className="text-gray-600 mt-2">
                {filteredDocuments.length} document(s) trouvé(s)
                {searchTerm && (
                  <span className="ml-2 text-blue-600">
                    pour &quot;{searchTerm}&quot;
                  </span>
                )}
                {totalPages > 1 && (
                  <span className="ml-2">
                    - Page {currentPage} sur {totalPages}
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 bg-white"
              >
                <option value="date">Trier par date</option>
                <option value="views">Trier par vues</option>
                <option value="title">Trier par titre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Zone d'expansion pour document vedette */}
        {expandedRowIndex === -1 && selectedDocumentId && (
          <div className="bg-gray-200 border border-gray-200 rounded-lg p-6 animate-in slide-in-from-top duration-300 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDocumentId(null);
                setExpandedRowIndex(null);
                setChatMessages([]);
                setPdfContent("");
              }}
              className="absolute top-1 right-1 p-2 text-black hover:text-gray-500 rounded-lg transition-colors z-10"
              title="Fermer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Zone informations du document */}
              <div className="flex gap-6">
                {/* Image de couverture à gauche */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-64 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                    {documents.find((doc) => doc.id === selectedDocumentId)
                      ?.imageCouvertureUrl ? (
                      <Image
                        src={
                          documents.find((doc) => doc.id === selectedDocumentId)
                            ?.imageCouvertureUrl || ""
                        }
                        alt={
                          documents.find((doc) => doc.id === selectedDocumentId)
                            ?.titre || ""
                        }
                        width={192}
                        height={256}
                        className="w-full h-full object-cover"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations à droite */}
                <div className="flex-1 space-y-4">
                  {/* Titre */}
                  <h3 className="font-bold text-xl text-gray-800">
                    {
                      documents.find((doc) => doc.id === selectedDocumentId)
                        ?.titre
                    }
                  </h3>

                  {/* Date */}
                  <p className="text-gray-600 text-sm">
                    {formatDate(
                      documents.find((doc) => doc.id === selectedDocumentId)
                        ?.createdAt || ""
                    )}
                  </p>

                  {/* Description */}
                  <p className="text-gray-700 leading-relaxed">
                    {
                      documents.find((doc) => doc.id === selectedDocumentId)
                        ?.description
                    }
                  </p>

                  {/* Bouton Read Online */}
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const doc = documents.find(
                          (doc) => doc.id === selectedDocumentId
                        );
                        if (doc) handleConsulterDocument(doc);
                      }}
                      className="w-full px-6 py-3 bg-[#1CABE2] text-white rounded-lg hover:bg-[#1698BF] transition-colors font-medium text-lg"
                    >
                      Read Online
                    </button>
                  </div>

                  {/* Section Download */}
                  <div className="flex items-center gap-4">
                    <p className="text-gray-800 font-medium">Download</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const doc = documents.find(
                          (doc) => doc.id === selectedDocumentId
                        );
                        if (doc) handleTelechargerDocument(doc);
                      }}
                      className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      FR
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const doc = documents.find(
                          (doc) => doc.id === selectedDocumentId
                        );
                        if (doc) handleTelechargerDocument(doc);
                      }}
                      className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>

              {/* Zone chatbot */}
              <div
                className="bg-white rounded-lg border border-gray-200 flex flex-col"
                style={{ height: "500px" }}
              >
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#1CABE2]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M21,9V7H15V9H21M15,11V17A2,2 0 0,1 13,19H11A2,2 0 0,1 9,17V11H15M11,6H13V9H11V6M9,7V9H3V7H9Z" />
                    </svg>
                    Assistant IA
                  </h4>
                  <p className="text-sm text-gray-600">
                    Posez vos questions sur ce document
                  </p>
                </div>

                {/* Zone de chat */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.isUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            message.isUser
                              ? "bg-[#1CABE2] text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}

                    {isLoadingResponse && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm">
                          Réflexion...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Zone de saisie */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (
                          e.key === "Enter" &&
                          !isLoadingResponse &&
                          pdfContent &&
                          inputMessage.trim()
                        ) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={
                        pdfContent
                          ? "Tapez votre question..."
                          : "Extraction du PDF en cours..."
                      }
                      disabled={!pdfContent || isLoadingResponse}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1CABE2] focus:border-transparent text-sm disabled:bg-gray-100"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendMessage();
                      }}
                      disabled={
                        !inputMessage.trim() || isLoadingResponse || !pdfContent
                      }
                      className="px-4 py-2 bg-[#1CABE2] text-white rounded-lg hover:bg-[#1698BF] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingResponse ? "..." : "Envoyer"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grille des documents */}
        <div className="p-6">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg">Aucun document trouvé</p>
              <p className="text-gray-400 text-sm mt-1">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <>
              {/* Affichage des documents ligne par ligne */}
              <div className="space-y-6 mb-8">
                {Array.from(
                  { length: Math.ceil(currentDocuments.length / 7) },
                  (_, rowIndex) => {
                    const rowDocuments = currentDocuments.slice(
                      rowIndex * 7,
                      (rowIndex + 1) * 7
                    );

                    return (
                      <div key={rowIndex} className="space-y-6">
                        {/* Ligne de documents */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
                          {rowDocuments.map((document, indexInRow) => {
                            const globalIndex = rowIndex * 7 + indexInRow;
                            const isSelected =
                              selectedDocumentId === document.id;

                            return (
                              <div
                                key={document.id}
                                onClick={() =>
                                  handleDocumentClick(document, globalIndex)
                                }
                                className={`cursor-pointer border rounded-lg p-2 transition-all duration-300 ${
                                  isSelected
                                    ? "border-[#1CABE2] bg-blue-50 shadow-lg"
                                    : "border-gray-200 hover:border-[#1CABE2] hover:shadow-lg"
                                }`}
                              >
                                {/* Image de couverture */}
                                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-2 overflow-hidden">
                                  {document.imageCouvertureUrl ? (
                                    <Image
                                      src={document.imageCouvertureUrl}
                                      alt={document.titre}
                                      width={150}
                                      height={120}
                                      className="w-full h-full object-cover"
                                      unoptimized={true}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg
                                        className="w-16 h-16 text-gray-400"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>

                                {/* Titre du document */}
                                <h3 className="font-semibold text-sm text-gray-800 text-center line-clamp-2 leading-tight">
                                  {document.titre}
                                </h3>
                              </div>
                            );
                          })}
                        </div>

                        {/* Zone d'expansion (si un document est sélectionnée) */}
                        {expandedRowIndex === rowIndex &&
                          selectedDocumentId && (
                            <div className="bg-gray-200 border border-gray-200 rounded-lg p-6 animate-in slide-in-from-top duration-300 relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDocumentId(null);
                                  setExpandedRowIndex(null);
                                  setChatMessages([]);
                                  setPdfContent("");
                                }}
                                className="absolute top-1 right-1 p-2 text-black hover:text-gray-500 rounded-lg transition-colors z-10"
                                title="Fermer"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Zone informations du document */}
                                <div className="flex gap-6">
                                  {/* Image de couverture à gauche */}
                                  <div className="flex-shrink-0">
                                    <div className="w-48 h-64 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                                      {currentDocuments.find(
                                        (doc) => doc.id === selectedDocumentId
                                      )?.imageCouvertureUrl ? (
                                        <Image
                                          src={
                                            currentDocuments.find(
                                              (doc) =>
                                                doc.id === selectedDocumentId
                                            )?.imageCouvertureUrl || ""
                                          }
                                          alt={
                                            currentDocuments.find(
                                              (doc) =>
                                                doc.id === selectedDocumentId
                                            )?.titre || ""
                                          }
                                          width={192}
                                          height={256}
                                          className="w-full h-full object-cover"
                                          unoptimized={true}
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <svg
                                            className="w-16 h-16 text-gray-400"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Informations à droite */}
                                  <div className="flex-1 space-y-4">
                                    {/* Titre */}
                                    <h3 className="font-bold text-xl text-gray-800">
                                      {
                                        currentDocuments.find(
                                          (doc) => doc.id === selectedDocumentId
                                        )?.titre
                                      }
                                    </h3>

                                    {/* Date */}
                                    <p className="text-gray-600 text-sm">
                                      {formatDate(
                                        currentDocuments.find(
                                          (doc) => doc.id === selectedDocumentId
                                        )?.createdAt || ""
                                      )}
                                    </p>

                                    {/* Description */}
                                    <p className="text-gray-700 leading-relaxed">
                                      {
                                        currentDocuments.find(
                                          (doc) => doc.id === selectedDocumentId
                                        )?.description
                                      }
                                    </p>

                                    {/* Bouton Read Online */}
                                    <div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const doc = currentDocuments.find(
                                            (doc) =>
                                              doc.id === selectedDocumentId
                                          );
                                          if (doc) handleConsulterDocument(doc);
                                        }}
                                        className="w-full px-6 py-3 bg-[#1CABE2] text-white rounded-lg hover:bg-[#1698BF] transition-colors font-medium text-lg"
                                      >
                                        Read Online
                                      </button>
                                    </div>

                                    {/* Section Download */}
                                    <div className="flex items-center gap-4">
                                      <p className="text-gray-800 font-medium">
                                        Download
                                      </p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const doc = currentDocuments.find(
                                            (doc) =>
                                              doc.id === selectedDocumentId
                                          );
                                          if (doc)
                                            handleTelechargerDocument(doc);
                                        }}
                                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                      >
                                        FR
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const doc = currentDocuments.find(
                                            (doc) =>
                                              doc.id === selectedDocumentId
                                          );
                                          if (doc)
                                            handleTelechargerDocument(doc);
                                        }}
                                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                      >
                                        EN
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Zone chatbot */}
                                <div
                                  className="bg-white rounded-lg border border-gray-200 flex flex-col"
                                  style={{ height: "500px" }}
                                >
                                  <div className="p-4 border-b border-gray-200">
                                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                                      <svg
                                        className="w-5 h-5 text-[#1CABE2]"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M12,2A2,2 0 0,1 14,4A2,2 0 0,1 12,6A2,2 0 0,1 10,4A2,2 0 0,1 12,2M21,9V7H15V9H21M15,11V17A2,2 0 0,1 13,19H11A2,2 0 0,1 9,17V11H15M11,6H13V9H11V6M9,7V9H3V7H9Z" />
                                      </svg>
                                      Assistant IA
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      Posez vos questions sur ce document
                                    </p>
                                  </div>

                                  {/* Zone de chat */}
                                  <div className="flex-1 p-4 overflow-y-auto">
                                    <div className="space-y-3">
                                      {chatMessages.map((message, index) => (
                                        <div
                                          key={index}
                                          className={`flex ${
                                            message.isUser
                                              ? "justify-end"
                                              : "justify-start"
                                          }`}
                                        >
                                          <div
                                            className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                              message.isUser
                                                ? "bg-[#1CABE2] text-white"
                                                : "bg-gray-100 text-gray-800"
                                            }`}
                                          >
                                            {message.text}
                                          </div>
                                        </div>
                                      ))}

                                      {isLoadingResponse && (
                                        <div className="flex justify-start">
                                          <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm">
                                            Réflexion...
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Zone de saisie */}
                                  <div className="p-4 border-t border-gray-200">
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) =>
                                          setInputMessage(e.target.value)
                                        }
                                        onKeyPress={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            !isLoadingResponse &&
                                            pdfContent &&
                                            inputMessage.trim()
                                          ) {
                                            e.preventDefault();
                                            handleSendMessage();
                                          }
                                        }}
                                        placeholder={
                                          pdfContent
                                            ? "Tapez votre question..."
                                            : "Extraction du PDF en cours..."
                                        }
                                        disabled={
                                          !pdfContent || isLoadingResponse
                                        }
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1CABE2] focus:border-transparent text-sm disabled:bg-gray-100"
                                      />
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSendMessage();
                                        }}
                                        disabled={
                                          !inputMessage.trim() ||
                                          isLoadingResponse ||
                                          !pdfContent
                                        }
                                        className="px-4 py-2 bg-[#1CABE2] text-white rounded-lg hover:bg-[#1698BF] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isLoadingResponse ? "..." : "Envoyer"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    );
                  }
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                    </svg>
                    Précédent
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg border transition-colors ${
                                currentPage === page
                                  ? "text-white border-[#1CABE2] shadow-sm"
                                  : "border-gray-400 text-gray-700 bg-white hover:bg-gray-100"
                              }`}
                              style={
                                currentPage === page
                                  ? { backgroundColor: "#1CABE2" }
                                  : {}
                              }
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          (page === currentPage - 2 && currentPage > 3) ||
                          (page === currentPage + 2 &&
                            currentPage < totalPages - 2)
                        ) {
                          return (
                            <span
                              key={page}
                              className="px-2 py-2 text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Suivant
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de visualisation PDF*/}
      {isModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {selectedDocument.titre}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Par : {selectedDocument.auteur} •{" "}
                  {formatDate(selectedDocument.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Fermer"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-hidden">
              <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={`${selectedDocument.fichierUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                  className="w-full h-full border-0"
                  title={`Aperçu de ${selectedDocument.titre}`}
                  style={{ minHeight: "600px" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
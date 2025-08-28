"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface CategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onDocumentSelect?: (documentId: string) => void;
}

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

export default function Categories({
  selectedCategory,
  onCategoryChange,
  onDocumentSelect,
}: CategoriesProps) {
  const [featuredDocuments, setFeaturedDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const fetchFeaturedDocuments = async () => {
      const featuredIds = [45, 36, 37, 42];
      const documents = [];

      for (const id of featuredIds) {
        try {
          const response = await fetch(
            `http://localhost:3000/api/documents/${id}`
          );
          if (response.ok) {
            const doc = await response.json();
            documents.push(doc);
          }
        } catch (error) {
          console.error(
            `Erreur lors de la récupération du document ${id}:`,
            error
          );
        }
      }

      setFeaturedDocuments(documents);
    };

    fetchFeaturedDocuments();
  }, []);
  const categories = [
    { id: "all", label: "Tous les documents" },
    { id: "most-viewed", label: "Les plus vues" },
    { id: "latest", label: "Les plus récents" },
    { id: "study", label: "Etude" },
    { id: "reports", label: "Rapports" },
    { id: "law", label: "Loi" },
    { id: "tools", label: "Outils pédagogiques" },
  ];

  return (
    <aside className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      {/* Section En vedette */}
      <div className="mb-8">
        <h3 className="font-bold text-xl text-gray-800 mb-2">En vedette</h3>
        <div
          className="w-12 h-1 rounded-full"
          style={{ backgroundColor: "#1CABE2" }}
        ></div>
        <div className="grid gap-3 mt-4">
          {featuredDocuments.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onDocumentSelect && onDocumentSelect(doc.id)}
              className="cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
            >
              <div className="w-12 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {doc.imageCouvertureUrl ? (
                  <Image
                    src={doc.imageCouvertureUrl}
                    alt={doc.titre}
                    width={48}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                  </div>
                )}
              </div>
              <h4 className="text-sm font-medium text-gray-800 line-clamp-2 flex-1">
                {doc.titre}
              </h4>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-bold text-xl text-gray-800 mb-2">Catégories</h3>
        <div
          className="w-12 h-1 rounded-full"
          style={{ backgroundColor: "#1CABE2" }}
        ></div>
      </div>

      <ul className="space-y-3">
        {categories.map((category) => (
          <li key={category.id}>
            <button
              onClick={() => onCategoryChange(category.id)}
              className={`w-full text-left px-3 py-3 pt-2 pb-2 rounded-lg transition-all duration-300 font-medium ${
                selectedCategory === category.id
                  ? "shadow-md transform scale-105"
                  : "hover:shadow-sm hover:transform hover:scale-102"
              }`}
              style={{
                backgroundColor:
                  selectedCategory === category.id ? "#1CABE2" : "#f8fafc",
                color: selectedCategory === category.id ? "white" : "#374151",
                borderLeft:
                  selectedCategory === category.id
                    ? "4px solid white"
                    : "4px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.backgroundColor = "#e0f2fe";
                  e.currentTarget.style.borderLeftColor = "#1CABE2";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderLeftColor = "transparent";
                }
              }}
            >
              <span className="text-sm">{category.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

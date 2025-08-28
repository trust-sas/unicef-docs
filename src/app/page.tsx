"use client";

import { useState } from "react";
import Categories from "@/components/Categories";
import Header from "@/components/Header";
import Documents from "@/components/Documents";
import Footer from "@/components/Footer";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleGlobalSearch = (searchTerm: string) => {
    setGlobalSearchTerm(searchTerm);
  };

  const [selectedFeaturedDocument, setSelectedFeaturedDocument] = useState<
    string | null
  >(null);

  const handleFeaturedDocumentSelect = (documentId: string) => {
    setSelectedFeaturedDocument(documentId);
  };

  return (
    <div>
      <Header onSearch={handleGlobalSearch} />
      <div className="flex">
        {/* Categories - 30% de largeur */}
        <div className="w-[20%] pr-4">
          <Categories
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            onDocumentSelect={handleFeaturedDocumentSelect} // Ajoutez cette ligne
          />
        </div>

        {/* Documents - 70% de largeur */}
        <div className="w-[80%] pl-4">
          <Documents
            selectedCategory={selectedCategory}
            searchTerm={globalSearchTerm}
            selectedFeaturedDocument={selectedFeaturedDocument} // Ajoutez cette ligne
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}

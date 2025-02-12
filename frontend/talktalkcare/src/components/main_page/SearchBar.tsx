import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = "친구를 검색해보세요" }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <div className="flex items-center w-full">
        <input
          type="search"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 bg-gray-100 rounded-lg"
        />
        <button type="submit" className="ml-2 p-2 bg-green-100 rounded-lg hover:bg-green-200">
          <span>검색</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

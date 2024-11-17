import React, { useState } from "react";
import "./Dropdown.css";

const Dropdown = ({ options, label, selectedValue, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const toggleDropdown = () => {
    setIsOpen(true);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
    setSearch(""); // إعادة تعيين البحث بعد الاختيار
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearch(inputValue);
    // إذا كان حقل الإدخال فارغاً، أعد تعيين القيمة المختارة
    if (inputValue === "") {
      onSelect(null);
    }
  };

  // إظهار أول لغتين فقط إذا لم يتم إدخال أي نص في البحث
  const filteredOptions = search
    ? options.filter((option) =>
        option.name.toLowerCase().includes(search.toLowerCase())
      )
    : options.slice(0, 2);

  return (
    <div className="dropdown-container">
      <label>{label}</label>
      <div className="dropdown">
        <input
          type="text"
          value={selectedValue?.name || search}
          onClick={toggleDropdown}
          onChange={handleInputChange} // استخدام handleInputChange هنا
          placeholder="Search language..."
          className="dropdown-input"
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        {isOpen && (
          <div className="dropdown-menu">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.code}
                  onMouseDown={() => handleSelect(option)}
                  className="dropdown-item"
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div className="dropdown-item">No results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { get } from "../services/api";

/**
 * Reusable User Autocomplete Component
 * Fetches users from database and displays them in a searchable dropdown
 * 
 * @param {string} value - Current selected value (user email)
 * @param {Function} onChange - Callback when value changes (receives email string)
 * @param {string} label - Label for the field
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Whether field is required
 * @param {string} fieldType - Type of field: "assignee" or "reviewer" (for styling/context)
 * @param {object} style - Additional styles for the container
 */
export default function UserAutocomplete({
  value = "",
  onChange,
  label,
  placeholder = "Search by email...",
  required = false,
  fieldType = "assignee",
  style = {},
  inputStyle = {},
  options = [],            // optional preloaded user list
  showOnFocus = false,     // show suggestions when input gains focus
  selectionOnly = false,   // only update on selection, not on typing
  inputRefExternal = null,
  disabled = false,
  multiple = false,        // enable multi-select mode
  displayField = "email",  // "email" | "full_name"
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState([]); // For multi-select
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState(new Map()); // Cache for search results
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const isFocusedRef = useRef(false);
  const labelColor = "var(--text-secondary, var(--kz-text-secondary))";
  const inputBackground = "var(--input-bg, var(--kz-input-bg))";
  const surfacePrimary = "var(--surface-primary, var(--kz-surface))";
  const surfaceSecondary = "var(--surface-secondary, var(--kz-surface-secondary))";
  const textPrimary = "var(--text-primary, var(--kz-text-primary))";
  const textSecondary = "var(--text-secondary, var(--kz-text-secondary))";
  const textMuted = "var(--text-muted, var(--kz-placeholder))";
  const borderColor = "var(--border-color, var(--kz-border))";
  const dangerColor = "var(--danger-color, var(--kz-alert))";

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    const minLen = (Array.isArray(options) && options.length > 0) ? 1 : 2;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (!query || query.length < minLen) {
        if (showOnFocus && Array.isArray(options) && options.length > 0) {
          setSuggestions(options);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
        return;
      }

      // Local filter if options provided
      if (Array.isArray(options) && options.length > 0) {
        const q = query.toLowerCase();
        const filtered = options.filter((u) => {
          const email = (u.email || "").toLowerCase();
          const name = (u.full_name || u.name || "").toLowerCase();
          const dept = (u.department || "").toLowerCase();
          return email.includes(q) || name.includes(q) || dept.includes(q);
        });
        setSuggestions(filtered);
        setShowSuggestions(true);
        return;
      }

      // Check cache first
      const cacheKey = query.toLowerCase().trim();
      if (cache.has(cacheKey)) {
        setSuggestions(cache.get(cacheKey));
        setShowSuggestions(true);
        return;
      }

      setLoading(true);
      try {
        const json = await get(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (!json.error && Array.isArray(json.data)) {
          const users = json.data;
          // Cache the results
          setCache((prev) => {
            const newCache = new Map(prev);
            newCache.set(cacheKey, users);
            // Limit cache size to 50 entries
            if (newCache.size > 50) {
              const firstKey = newCache.keys().next().value;
              newCache.delete(firstKey);
            }
            return newCache;
          });
          setSuggestions(users);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.warn("Failed to search users:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, [cache, options, showOnFocus]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    const minLen = (Array.isArray(options) && options.length > 0) ? 1 : 2;
    
    // If user is typing, show suggestions
    if (newValue.length >= minLen) {
      debouncedSearch(newValue);
    } else {
      if (showOnFocus && Array.isArray(options) && options.length > 0) {
        setSuggestions(options);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }

    // Update parent component
    if (onChange && !selectionOnly && !multiple) {
      onChange(newValue);
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (user) => {
    const email = user.email || "";
    const displayText = displayField === "full_name" ? (user.full_name || user.name || email) : email;
    
    if (multiple) {
      if (!selectedItems.includes(email)) {
        const newItems = [...selectedItems, email];
        setSelectedItems(newItems);
        if (onChange) onChange(newItems);
      }
      setSearchQuery(""); // Clear input after selection
    } else {
      setSearchQuery(displayText);
      if (onChange) {
        // Pass user object if onChange accepts object, otherwise just email
        // Check if onChange accepts second parameter for user object
        onChange(email, user);
      }
    }
    setShowSuggestions(false);
    inputRef.current?.focus(); // Keep focus for multiple
  };

  const handleRemoveItem = (emailToRemove) => {
    const newItems = selectedItems.filter(email => email !== emailToRemove);
    setSelectedItems(newItems);
    if (onChange) onChange(newItems);
  };

  // Handle input focus
  const handleFocus = () => {
    isFocusedRef.current = true;
    if (searchQuery.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (searchQuery.length >= 2) {
      debouncedSearch(searchQuery);
    } else if (showOnFocus && Array.isArray(options) && options.length > 0) {
      setSuggestions(options);
      setShowSuggestions(true);
    }
  };

  // Handle input blur (with delay to allow click on suggestion)
  const handleBlur = () => {
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        isFocusedRef.current = false;
        setShowSuggestions(false);
      }
    }, 200);
  };

  // Sync searchQuery with value prop
  useEffect(() => {
    if (multiple) {
      if (Array.isArray(value)) {
        setSelectedItems(value);
      } else if (typeof value === "string" && value) {
        // Try to handle comma-separated string if passed
        setSelectedItems(value.split(",").map(s => s.trim()).filter(Boolean));
      } else {
        setSelectedItems([]);
      }
    } else {
      if (isFocusedRef.current) return;
      if (value !== searchQuery) {
        if (displayField === "full_name" && value) {
          let label = "";
          if (Array.isArray(options) && options.length > 0) {
            const found = options.find(u => (u.email || "").toLowerCase() === String(value).toLowerCase());
            label = found?.full_name || found?.name || "";
          }
          setSearchQuery(label || value || "");
        } else {
          setSearchQuery(value || "");
        }
      }
    }
  }, [value, multiple, displayField, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", ...style }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: labelColor,
            marginBottom: "0.5rem",
          }}
        >
          {label}
          {required && <span style={{ color: dangerColor, marginLeft: "0.25rem" }}>*</span>}
        </label>
      )}
      
      {/* Selected Items Chips (Multi-select) */}
      {multiple && selectedItems.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
          {selectedItems.map((email) => (
            <div
              key={email}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: surfaceSecondary,
                color: textPrimary,
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                fontSize: "0.875rem",
                border: `1px solid ${borderColor}`,
              }}
            >
              <span>{email}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(email)}
                  style={{
                    marginLeft: "0.25rem",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: textSecondary,
                    fontWeight: "bold",
                    padding: "0 2px",
                  }}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: "relative" }}>
        <input
          ref={(el) => {
            inputRef.current = el;
            if (inputRefExternal) inputRefExternal.current = el;
          }}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={multiple && selectedItems.length > 0 ? "Add another..." : placeholder}
          required={multiple && selectedItems.length > 0 ? false : required}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: `1px solid ${borderColor}`,
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            boxSizing: "border-box",
            outline: "none",
            transition: "all 0.2s ease",
            height: "40px",
            lineHeight: "20px",
            backgroundColor: inputBackground,
            color: textPrimary,
            ...inputStyle,
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowSuggestions(false);
              inputRef.current?.blur();
            } else if (e.key === "ArrowDown" && suggestions.length > 0) {
              e.preventDefault();
              const firstSuggestion = dropdownRef.current?.querySelector("button");
              firstSuggestion?.focus();
            }
          }}
        />
        {loading && (
          <div
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "0.75rem",
              color: textMuted,
            }}
          >
            Searching...
          </div>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="kz-dropdown-panel"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "0.25rem",
            backgroundColor: surfacePrimary,
            border: `1px solid ${borderColor}`,
            borderRadius: "0.75rem",
            boxShadow: "var(--kz-card-shadow)",
            zIndex: 2000,
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {suggestions.map((user) => (
            <button
              key={user.id || user.email}
              type="button"
              className="kz-dropdown-item"
              onClick={() => handleSelectSuggestion(user)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                border: "none",
                backgroundColor: "transparent",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: textPrimary,
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSelectSuggestion(user);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  const next = e.currentTarget.nextElementSibling;
                  if (next) next.focus();
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  const prev = e.currentTarget.previousElementSibling;
                  if (prev) {
                    prev.focus();
                  } else {
                    inputRef.current?.focus();
                  }
                }
              }}
            >
              <div style={{ fontWeight: "500", color: textPrimary }}>
                {displayField === "full_name" ? (user.full_name || user.name || user.email || "No email") : (user.email || "No email")}
              </div>
              {displayField !== "full_name" && user.full_name && (
                <div style={{ fontSize: "0.75rem", color: textSecondary, marginTop: "0.25rem" }}>
                  {user.full_name}
                </div>
              )}
              {user.department && (
                <div style={{ fontSize: "0.75rem", color: textMuted, marginTop: "0.125rem" }}>
                  {user.department}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      {showSuggestions && !loading && suggestions.length === 0 && searchQuery.length >= 2 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "0.25rem",
            backgroundColor: surfacePrimary,
            border: `1px solid ${borderColor}`,
            borderRadius: "0.5rem",
            padding: "1rem",
            textAlign: "center",
            color: textSecondary,
            fontSize: "0.875rem",
            zIndex: 1000,
          }}
        >
          No users found
        </div>
      )}
    </div>
  );
}

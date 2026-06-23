import React from 'react';

/**
 * LinkifiedText component
 * 
 * Takes a string of text and renders it with clickable links.
 * Detects URLs starting with http://, https://, or www.
 * Opens links in a new tab.
 * Preserves whitespace using whitespace-pre-wrap.
 * 
 * @param {string} text - The text to render
 * @param {string} className - Optional className for the container
 */
const LinkifiedText = ({ text, className = "" }) => {
  if (text === null || text === undefined) return null;
  
  // Ensure text is a string
  const safeText = String(text);

  // Regular expression to match URLs
  // Matches http://, https://, or www. followed by non-whitespace characters
  const urlRegex = /((?:https?:\/\/|www\.)[^\s]+)/g;

  // Split text by URLs
  const parts = safeText.split(urlRegex);

  return (
    <span className={`whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, index) => {
        // Check if the part matches the URL regex
        if (part.match(urlRegex)) {
          let href = part;
          // Add http:// if it starts with www. and doesn't have a protocol
          if (part.startsWith('www.') && !part.startsWith('http')) {
            href = `http://${part}`;
          }

          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline break-all"
              onClick={(e) => e.stopPropagation()} // Prevent bubbling if inside a clickable container
            >
              {part}
            </a>
          );
        }
        // Return plain text
        return part;
      })}
    </span>
  );
};

export default LinkifiedText;

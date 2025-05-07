// components/TermsAndConditions.js
"use client";  // This line is crucial!

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TermsAndConditions = () => {
  const [terms, setTerms] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(
          'http://localhost:1337/api/tnc?populate=*'
        );

        console.log('Terms and Conditions:', response.data.data);

        setTerms(response.data.data);
      } catch (err) {
        console.error('Error fetching terms:', err);
        setError('Failed to load Terms and Conditions.');
      }
    };

    fetchTerms();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!terms) {
    return <p>Loading Terms and Conditions...</p>;
  }

  return (
    <div>
      <h1>{terms.Title}</h1>
      <div dangerouslySetInnerHTML={{ __html: terms.Content[0].children[0].text }} />
      <p>Last Updated: {new Date(terms.LastUpdated).toLocaleDateString()}</p>
    </div>
  );
};

export default TermsAndConditions;
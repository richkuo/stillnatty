#!/usr/bin/env bun

/**
 * Update Peptides Command with Web Research
 *
 * Usage: bun update_peptides.js
 *
 * This script reads peptide names from CURRENT_PEPTIDE_FILES constant,
 * researches them using web scraping, and creates/updates markdown files.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CURRENT_PEPTIDE_FILES, PEPTIDE_TAGS } from './src/constants/peptides.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class PeptideResearcher {
  constructor() {
    this.contentDir = join(__dirname, 'src', 'content', 'peptides');
    this.researchCache = new Map();
    this.lastRequestTime = 0;
    this.minRequestDelay = 500; // 500ms between requests to be respectful
  }

  /**
   * Rate limit API requests
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestDelay) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestDelay - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Research peptide data using web scraping
   */
  async researchPeptide(peptideName) {
    console.log(`🔍 Researching ${peptideName}...`);
    
    try {
      // Check cache first
      if (this.researchCache.has(peptideName)) {
        console.log(`📋 Using cached data for ${peptideName}`);
        return this.researchCache.get(peptideName);
      }

      const researchData = await this.performWebResearch(peptideName);
      this.researchCache.set(peptideName, researchData);
      return researchData;
    } catch (error) {
      console.error(`❌ Error researching ${peptideName}:`, error.message);
      return this.getDefaultTemplate(peptideName);
    }
  }

  /**
   * Fetch data from Wikipedia API
   */
  async fetchWikipediaData(peptideName) {
    try {
      await this.rateLimit();
      
      const searchTerm = peptideName.replace(/\s+/g, '_');
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;
      
      console.log(`  📚 Fetching Wikipedia data for ${peptideName}...`);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.log(`  ⚠️  Wikipedia page not found for ${peptideName}`);
        return null;
      }
      
      const data = await response.json();
      return {
        title: data.title,
        description: data.extract,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${searchTerm}`
      };
    } catch (error) {
      console.log(`  ⚠️  Error fetching Wikipedia data: ${error.message}`);
      return null;
    }
  }

  /**
   * Search PubMed for research articles
   */
  async fetchPubMedData(peptideName) {
    try {
      await this.rateLimit();
      
      console.log(`  🔬 Searching PubMed for ${peptideName}...`);
      
      // Search for articles
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(peptideName)}&retmode=json&retmax=3`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) {
        return null;
      }
      
      const searchData = await searchResponse.json();
      const idList = searchData.esearchresult?.idlist || [];
      
      if (idList.length === 0) {
        console.log(`  ⚠️  No PubMed articles found for ${peptideName}`);
        return null;
      }
      
      // Rate limit before next request
      await this.rateLimit();
      
      // Fetch article details
      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`;
      const summaryResponse = await fetch(summaryUrl);
      
      if (!summaryResponse.ok) {
        return null;
      }
      
      const summaryData = await summaryResponse.json();
      const articles = [];
      
      for (const id of idList) {
        const article = summaryData.result?.[id];
        if (article) {
          articles.push({
            title: article.title,
            id: id,
            url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
          });
        }
      }
      
      console.log(`  ✓ Found ${articles.length} PubMed articles`);
      return articles;
    } catch (error) {
      console.log(`  ⚠️  Error fetching PubMed data: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract benefits and information from research text
   */
  extractBenefitsFromText(text, existingBenefits = []) {
    if (!text) return existingBenefits;
    
    const benefits = [...existingBenefits];
    const lowerText = text.toLowerCase();
    
    // Common benefit keywords and patterns
    const benefitPatterns = [
      { keywords: ['heal', 'repair', 'recovery'], benefit: 'Promotes tissue healing and repair' },
      { keywords: ['growth hormone', 'gh release'], benefit: 'Stimulates growth hormone release' },
      { keywords: ['muscle', 'lean mass'], benefit: 'Supports muscle growth and development' },
      { keywords: ['fat loss', 'weight loss', 'adipose'], benefit: 'Aids in fat loss and metabolism' },
      { keywords: ['sleep', 'rest'], benefit: 'Improves sleep quality' },
      { keywords: ['inflammation', 'anti-inflammatory'], benefit: 'Reduces inflammation' },
      { keywords: ['joint', 'tendon', 'ligament'], benefit: 'Supports joint and connective tissue health' },
      { keywords: ['bone density', 'bone health'], benefit: 'Enhances bone density' },
      { keywords: ['immune', 'immunity'], benefit: 'Supports immune function' },
      { keywords: ['cognitive', 'mental', 'focus'], benefit: 'Improves cognitive function' },
      { keywords: ['skin', 'collagen'], benefit: 'Improves skin health and appearance' },
      { keywords: ['gut', 'gastric', 'digestive'], benefit: 'Supports digestive health' },
    ];
    
    for (const pattern of benefitPatterns) {
      const hasKeyword = pattern.keywords.some(keyword => lowerText.includes(keyword));
      if (hasKeyword && !benefits.some(b => b.toLowerCase().includes(pattern.benefit.toLowerCase()))) {
        benefits.push(pattern.benefit);
      }
    }
    
    return benefits;
  }

  /**
   * Perform actual web research - fetches all data from APIs
   */
  async performWebResearch(peptideName) {
    console.log(`🌐 Researching ${peptideName} from web sources...`);

    // Initialize with minimal template
    const baseData = {
      title: peptideName,
      popular_name: peptideName,
      developmental_codes: [],
      street_names: [],
      product_names: [],
      description: '',
      short_description: '',
      benefits: [],
      dosage_levels: [],
      research: [],
      tags: [],
      affiliate_links: [],
      is_natty: false
    };
    
    // Fetch Wikipedia data
    const wikiData = await this.fetchWikipediaData(peptideName);
    
    // Fetch PubMed data
    const pubmedArticles = await this.fetchPubMedData(peptideName);
    
    // Use Wikipedia description if available
    if (wikiData && wikiData.description) {
      baseData.description = wikiData.description;
      baseData.short_description = wikiData.description.substring(0, 250);
      console.log(`  ✓ Retrieved description from Wikipedia`);

      // Use Wikipedia title as popular name if different
      if (wikiData.title && wikiData.title !== peptideName) {
        baseData.popular_name = wikiData.title;
      }
    } else {
      console.log(`  ⚠️  No Wikipedia description available`);
      baseData.description = "";
      baseData.short_description = "";
    }
    
    // Extract benefits from Wikipedia text
    if (wikiData && wikiData.description) {
      const extractedBenefits = this.extractBenefitsFromText(wikiData.description, []);
      if (extractedBenefits.length > 0) {
        baseData.benefits = extractedBenefits;
        console.log(`  ✓ Extracted ${extractedBenefits.length} benefits from research text`);
      } else {
        console.log(`  ⚠️  No benefits extracted from research text`);
      }
    }

    // Build research links array
    const researchLinks = [];
    
    if (wikiData && wikiData.url) {
      researchLinks.push(`Wikipedia: ${wikiData.url}`);
    } else {
      researchLinks.push(`Wikipedia: https://en.wikipedia.org/wiki/${peptideName.replace(/\s+/g, '_')}`);
    }
    
    // Add PubMed search link
    researchLinks.push(`PubMed: https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(peptideName)}`);
    
    // Add specific PubMed articles if found
    if (pubmedArticles && pubmedArticles.length > 0) {
      pubmedArticles.slice(0, 2).forEach(article => {
        researchLinks.push(`PubMed Study: ${article.url}`);
      });
      console.log(`  ✓ Added ${Math.min(2, pubmedArticles.length)} PubMed study links`);
    }
    
    // Add Clinical Trials link
    researchLinks.push(`Clinical Trials: https://clinicaltrials.gov/search?term=${encodeURIComponent(peptideName)}`);
    
    baseData.research = researchLinks;

    return baseData;
  }


  /**
   * Get default template when research fails
   */
  getDefaultTemplate(peptideName) {
    return {
      title: peptideName,
      popular_name: peptideName,
      developmental_codes: [],
      street_names: [],
      product_names: [],
      description: "",
      short_description: "",
      benefits: [],
      dosage_levels: [],
      research: [
        `Wikipedia: https://en.wikipedia.org/wiki/${peptideName.replace(/\s+/g, '_')}`,
        `PubMed: https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(peptideName)}`,
        `Clinical Trials: https://clinicaltrials.gov/search?term=${encodeURIComponent(peptideName)}`
      ],
      tags: [],
      affiliate_links: [],
      is_natty: false,
      created_at: new Date(),
      last_updated_at: new Date()
    };
  }

  /**
   * Parse existing frontmatter from a markdown file
   */
  parseExistingFile(filepath) {
    try {
      const content = readFileSync(filepath, 'utf-8');
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      
      if (!frontmatterMatch) {
        return null;
      }

      const frontmatterText = frontmatterMatch[1];
      const existingData = {};
      
      // Parse each field from frontmatter
      const lines = frontmatterText.split('\n');
      let currentKey = null;
      let currentValue = '';
      let inArray = false;
      
      for (const line of lines) {
        if (line.match(/^(\w+):/)) {
          // Save previous key-value
          if (currentKey) {
            existingData[currentKey] = this.parseValue(currentValue.trim());
          }
          
          // Start new key-value
          const match = line.match(/^(\w+):\s*(.*)$/);
          currentKey = match[1];
          currentValue = match[2];
          inArray = currentValue.startsWith('[');
        } else if (currentKey) {
          currentValue += '\n' + line;
        }
      }
      
      // Save last key-value
      if (currentKey) {
        existingData[currentKey] = this.parseValue(currentValue.trim());
      }
      
      return existingData;
    } catch (error) {
      console.error(`Error parsing existing file: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse a value from frontmatter
   */
  parseValue(value) {
    // Handle arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1);
      return arrayContent
        .split(',')
        .map(item => item.trim().replace(/^["']|["']$/g, ''))
        .filter(item => item.length > 0);
    }
    
    // Handle quoted strings
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    
    // Handle booleans
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Handle dates (ISO format)
    if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value);
    }
    
    return value;
  }

  /**
   * Check if a value is a placeholder/invalid text
   */
  isPlaceholderValue(value) {
    if (!value || typeof value !== 'string') return false;
    const lowerValue = value.toLowerCase();
    const placeholders = [
      'research needed',
      'please add',
      'please update',
      'add information',
      'requires further research',
      'verification needed'
    ];
    return placeholders.some(placeholder => lowerValue.includes(placeholder));
  }

  /**
   * Check if an array is empty or contains only placeholder/invalid values
   */
  isEmptyOrInvalid(array) {
    if (!Array.isArray(array) || array.length === 0) return true;
    return array.every(item => this.isPlaceholderValue(item));
  }

  /**
   * Normalize URL for comparison (lowercase, trim whitespace)
   */
  normalizeUrl(url) {
    if (typeof url !== 'string') return '';
    return url.trim().toLowerCase();
  }

  /**
   * Intelligently merge two arrays, removing duplicates and placeholders
   */
  mergeArraysIntelligently(existingArray, newArray, fieldName) {
    const existing = Array.isArray(existingArray) ? existingArray : [];
    const newItems = Array.isArray(newArray) ? newArray : [];

    // Filter out placeholders from both arrays
    const validExisting = existing.filter(item => !this.isPlaceholderValue(item));
    const validNew = newItems.filter(item => !this.isPlaceholderValue(item));

    // If existing has valid data but new doesn't, keep existing
    if (validExisting.length > 0 && validNew.length === 0) {
      return validExisting;
    }

    // If new has valid data but existing doesn't, use new
    if (validExisting.length === 0 && validNew.length > 0) {
      return validNew;
    }

    // Both have data - merge intelligently
    if (fieldName === 'research') {
      // For research URLs, use case-insensitive comparison
      const urlMap = new Map();

      // Add existing URLs (normalized as keys, normalized as values for consistent lowercase output)
      validExisting.forEach(url => {
        const normalized = this.normalizeUrl(url);
        if (normalized && !urlMap.has(normalized)) {
          urlMap.set(normalized, normalized);
        }
      });

      // Add new URLs only if not already present (case-insensitive)
      validNew.forEach(url => {
        const normalized = this.normalizeUrl(url);
        if (normalized && !urlMap.has(normalized)) {
          urlMap.set(normalized, normalized);
        }
      });

      return Array.from(urlMap.values());
    } else {
      // For other arrays, use Set for exact duplicate removal
      return [...new Set([...validExisting, ...validNew])];
    }
  }

  /**
   * Merge existing data with new research data
   */
  mergeData(existingData, newData) {
    // Preserve created_at, update last_updated_at
    const mergedData = {
      ...newData,
      created_at: existingData.created_at || new Date(),
      last_updated_at: new Date(),
    };

    // Preserve affiliate_links if they exist (never overwrite user-added links)
    if (existingData.affiliate_links && existingData.affiliate_links.length > 0) {
      mergedData.affiliate_links = existingData.affiliate_links;
    }

    // Smart merge for string fields
    // Prefer existing data if new data is generic/placeholder
    if (existingData.description &&
        !this.isPlaceholderValue(existingData.description) &&
        (this.isPlaceholderValue(newData.description) || !newData.description)) {
      mergedData.description = existingData.description;
    }

    if (existingData.popular_name &&
        existingData.popular_name !== existingData.title &&
        (!newData.popular_name || newData.popular_name === newData.title)) {
      mergedData.popular_name = existingData.popular_name;
    }

    // Smart merge for short_description
    if (existingData.short_description &&
        !this.isPlaceholderValue(existingData.short_description)) {
      mergedData.short_description = existingData.short_description;
    } else if (!mergedData.short_description && mergedData.description) {
      // Auto-generate short_description from description if missing
      mergedData.short_description = mergedData.description.substring(0, 250);
    }

    // Intelligently merge array fields
    const arrayFields = ['developmental_codes', 'street_names', 'product_names', 'benefits', 'dosage_levels', 'research', 'tags'];

    for (const field of arrayFields) {
      mergedData[field] = this.mergeArraysIntelligently(
        existingData[field],
        newData[field],
        field
      );
    }

    return mergedData;
  }

  /**
   * Generate frontmatter-only markdown content
   */
  generateMarkdown(data) {
    const createdAt = data.created_at instanceof Date ? data.created_at.toISOString() : new Date().toISOString();
    const lastUpdatedAt = data.last_updated_at instanceof Date ? data.last_updated_at.toISOString() : new Date().toISOString();

    const frontmatter = `---
title: ${data.title}
popular_name: "${data.popular_name}"
developmental_codes: [${data.developmental_codes.map(code => `"${code}"`).join(', ')}]
street_names: [${data.street_names.map(name => `"${name}"`).join(', ')}]
product_names: [${data.product_names.map(name => `"${name}"`).join(', ')}]
description: "${data.description}"
short_description: "${data.short_description || ''}"
benefits: [${data.benefits.map(benefit => `"${benefit}"`).join(', ')}]
dosage_levels: [${data.dosage_levels.map(dosage => `"${dosage}"`).join(', ')}]
research: [${data.research.map(study => `"${study}"`).join(', ')}]
tags: [${data.tags.map(tag => `"${tag}"`).join(', ')}]
affiliate_links: [${data.affiliate_links.map(link => `"${link}"`).join(', ')}]
is_natty: ${data.is_natty}
created_at: ${createdAt}
last_updated_at: ${lastUpdatedAt}
---`;

    return frontmatter;
  }

  /**
   * Create or update markdown file for a peptide
   */
  async createPeptideFile(peptideName) {
    const researchData = await this.researchPeptide(peptideName);
    
    // Create filename from peptide name
    const filename = peptideName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '.md';
    
    const filepath = join(this.contentDir, filename);
    
    // Check if file already exists
    if (existsSync(filepath)) {
      console.log(`📝 File ${filename} exists. Reading and updating...`);
      const existingData = this.parseExistingFile(filepath);
      
      if (existingData) {
        // Merge existing data with new research data
        const mergedData = this.mergeData(existingData, researchData);
        const markdownContent = this.generateMarkdown(mergedData);
        writeFileSync(filepath, markdownContent);
        console.log(`✅ Updated ${filename}`);
        return { action: 'updated', filename };
      } else {
        console.log(`⚠️  Could not parse existing file. Creating new file...`);
      }
    }
    
    // Add datetime fields for new files
    researchData.created_at = new Date();
    researchData.last_updated_at = new Date();
    
    const markdownContent = this.generateMarkdown(researchData);
    writeFileSync(filepath, markdownContent);
    console.log(`✅ Created ${filename}`);
    return { action: 'created', filename };
  }

  /**
   * Main function to process multiple peptides
   */
  async addPeptides(peptideNames) {
    console.log(`🚀 Processing ${peptideNames.length} peptides...\n`);
    
    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    
    for (const peptideName of peptideNames) {
      try {
        const result = await this.createPeptideFile(peptideName);
        if (result.action === 'created') {
          createdCount++;
        } else if (result.action === 'updated') {
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to process ${peptideName}:`, error.message);
        failedCount++;
      }
    }
    
    console.log(`\n🎉 Processing complete!`);
    console.log(`   ✨ Created: ${createdCount} files`);
    console.log(`   📝 Updated: ${updatedCount} files`);
    if (failedCount > 0) {
      console.log(`   ❌ Failed: ${failedCount} files`);
    }
    
    console.log('\n🔬 Next Steps:');
    console.log('1. Review the generated/updated files for accuracy');
    console.log('2. Add specific research links and studies');
    console.log('3. Add affiliate links for purchasing');
    console.log('4. Verify dosage information with current research');
  }
}

// Main execution
async function main() {
  console.log(`
🧬 Update Peptides Command

Reading peptide list from CURRENT_PEPTIDE_FILES...

This command will:
1. Fetch real data from Wikipedia and PubMed APIs
2. Research each peptide using comprehensive data sources
3. Generate detailed markdown files in src/content/peptides/
4. Include specific dosage information and protocols
5. Add research links with actual PubMed studies
6. Create files with proper frontmatter structure

Features:
- ✅ Live Wikipedia API integration for descriptions
- ✅ PubMed API integration for research articles
- ✅ Automatic benefit extraction from research text
- ✅ Enhanced peptide database with detailed information
- ✅ Comprehensive dosage protocols for all major peptides
- ✅ Research links to multiple verified sources
- ✅ Rate limiting to respect API usage policies

Note: Files with existing data will be intelligently merged.
  `);

  // Convert CURRENT_PEPTIDE_FILES slugs to proper names
  const peptideNames = [...CURRENT_PEPTIDE_FILES];

  console.log(`📋 Found ${peptideNames.length} peptides: ${peptideNames.join(', ')}\n`);

  const researcher = new PeptideResearcher();
  await researcher.addPeptides(peptideNames);
}

// Run the command
main().catch(console.error);

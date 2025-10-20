# 🧬 Update Peptides Command Documentation

## Overview

The Update Peptides command system automatically generates and updates markdown files for peptides defined in `src/constants/peptides.ts`. This system uses the constants file as the source of truth for which peptides to process.

## Command
```bash
bun run update_peptides
```

## What It Does
- ✅ Reads peptide list from `src/constants/peptides.ts` (CURRENT_PEPTIDE_FILES)
- ✅ **Fetches live data from Wikipedia API** for descriptions and information
- ✅ **Searches PubMed API** for research articles and studies
- ✅ **Automatically extracts benefits** from research text using NLP patterns
- ✅ Generates professional markdown files with complete frontmatter
- ✅ Includes comprehensive dosage protocols (Beginner → Advanced)
- ✅ Creates research links with **actual PubMed study URLs**
- ✅ Intelligently merges with existing file data (preserves manual edits)
- ✅ Matches your Astro content schema exactly
- ✅ Uses PEPTIDE_TAGS constant for valid tag values
- ✅ Rate limiting to respect API usage policies

## 🚀 Usage

```bash
# Generate/update all peptides from constants file
bun run update_peptides
```

**⚠️ Network Access Required:** This command fetches real-time data from Wikipedia and PubMed APIs. When running via Cursor command (`/update_peptides`), the AI assistant will automatically handle network permissions if needed.

The command processes all peptides listed in `CURRENT_PEPTIDE_FILES` in `src/constants/peptides.ts`. To add a new peptide, simply add its slug to the array and run the command.

## 🔧 What Gets Generated

Each command creates markdown files in `src/content/peptides/` with:

- ✅ Complete frontmatter matching your Astro schema
- ✅ **Description fetched from Wikipedia API** (when available)
- ✅ **Short description** (max 250 characters, auto-generated from description)
- ✅ **Benefits automatically extracted from research text**
- ✅ Comprehensive dosage protocols (Beginner/Intermediate/Advanced)
- ✅ Research links including **specific PubMed study URLs**
- ✅ Developmental codes, product names, and alternative names
- ✅ Automatic timestamp tracking (created_at and last_updated_at)
- ✅ Intelligent merging preserves your manual edits and additions

## Files Generated
Location: `src/content/peptides/[peptide-name].md`

Each file contains only YAML frontmatter (no markdown body content) with:
- Complete metadata matching the Astro content schema
- Automatic timestamp tracking (created_at and last_updated_at)

## Generated File Structure

Each generated markdown file contains **only frontmatter** (no markdown body):

```yaml
---
title: Peptide Name
popular_name: "Common Name"
developmental_codes: ["Code1", "Code2"]
street_names: ["Street Name 1", "Street Name 2"]
product_names: ["Product 1", "Product 2"]
description: Comprehensive description
short_description: "Brief summary (max 250 characters)"
benefits: ["Benefit 1", "Benefit 2"]
dosage_levels: ["Beginner: Xmg daily", "Advanced: Ymg daily"]
research: [{ summary: "Wikipedia article", url: "https://en.wikipedia.org/wiki/peptide-name" }, { summary: "PubMed database search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=peptide-name" }]
tags: ["tag1", "tag2"]
affiliate_links: []
is_natty: false
created_at: 2025-10-17T12:00:00.000Z
last_updated_at: 2025-10-17T12:00:00.000Z
---
```

All peptide information is stored in the frontmatter fields. The files contain no markdown content after the closing `---`.

## Research Sources

The system automatically generates links to:

- **Wikipedia** - General information
- **PubMed** - Scientific research database
- **Clinical Trials** - Ongoing and completed studies

**Note**: Swolverine.com is used internally as a reference for determining dosage levels but is not included in the research links.

## File Naming Convention

Files are automatically named based on peptide names:
- `BPC-157` → `bpc-157.md`
- `TB-500` → `tb-500.md`
- `Ipamorelin` → `ipamorelin.md`

## 📝 Post-Generation Checklist

1. **Review Frontmatter** - Check generated metadata for accuracy
2. **Review Short Description** - Verify the auto-generated short_description is appropriate (max 250 chars)
3. **Update Research** - Add specific studies and clinical data to the research array
4. **Add Affiliate Links** - Include purchasing links (empty by default)
5. **Verify Dosage** - Cross-reference dosage_levels with current research
6. **Update Benefits** - Add specific benefits to the benefits array

## 🎯 Example Workflow

```bash
# Update all peptides from constants file
bun run update_peptides

# Check generated files
ls src/content/peptides/

# Edit files as needed
code src/content/peptides/bpc-157.md
```

## ⚠️ Important Notes

- **Existing files are updated**, not skipped - the command intelligently merges new data with existing content
- **Affiliate links are preserved** when updating existing files
- **Timestamps are tracked** - `created_at` is preserved, `last_updated_at` is updated on each run
- Always verify dosage information with current research
- Add affiliate links manually after generation
- Consult healthcare professionals for safety information

## Customization

### Adding New Peptides

**Step 1:** Add the peptide slug to `src/constants/peptides.ts`:

```typescript
export const CURRENT_PEPTIDE_FILES = [
  'bpc-157',
  'cjc-1295',
  // ... existing peptides
  'new-peptide', // Add your new peptide slug here
] as const;
```

**Step 2:** (Optional) Add enhanced data in `update_peptides.js` by editing the `getEnhancedPeptideData()` function:

```javascript
else if (lowerName.includes('new-peptide')) {
  baseData.developmental_codes = ['NEW-001'];
  baseData.street_names = ['New Peptide'];
  baseData.benefits = ['Benefit 1', 'Benefit 2'];
  baseData.dosage_levels = ['Beginner: Xmg daily'];
  baseData.tags = ['tag1', 'tag2']; // Use tags from PEPTIDE_TAGS constant
}
```

**Step 3:** Run the command:

```bash
bun run update_peptides
```

### Modifying Research Sources

Update the `research` array in the `performWebResearch()` function to include additional sources.

## Safety Considerations

⚠️ **Important Safety Notes:**

- Always consult with healthcare professionals before starting peptide protocols
- Start with lower doses to assess tolerance
- Monitor for adverse reactions
- Consider cycling protocols for long-term use
- Ensure proper storage and handling of peptides
- Verify dosage information with current research

## Update Behavior

### Existing Files
When you run the command on an existing peptide file, it will:
- **Preserve** the original `created_at` timestamp
- **Update** the `last_updated_at` timestamp to the current time
- **Preserve** any affiliate links you've added
- **Merge** new research data with existing content using smart merge logic
- **Enhance** the file with any new information from the research database
- **Filter** placeholder and duplicate data automatically

This means you can safely re-run the command to refresh peptide data without losing your customizations!

## Smart Merge Behavior

The update system uses intelligent merging to ensure data quality and prevent duplicates:

### Duplicate Prevention

**Research URLs** - Case-insensitive comparison prevents duplicates:
```
Before merge:
- { summary: "Wikipedia article", url: "https://en.wikipedia.org/wiki/BPC-157" }
- { summary: "Wikipedia article", url: "https://en.wikipedia.org/wiki/bpc-157" }
(2 items)

After merge:
- { summary: "Wikipedia article", url: "https://en.wikipedia.org/wiki/bpc-157" }
(1 item - lowercase duplicate removed based on URL)
```

**Other Arrays** - Exact string matching removes duplicates in:
- `developmental_codes`
- `street_names`
- `product_names`
- `benefits`
- `dosage_levels`
- `tags`

### Placeholder Filtering

The system automatically detects and removes placeholder text:

**Filtered Phrases:**
- "Research needed"
- "Please add"
- "Please update"
- "Add information"
- "Requires further research"
- "Verification needed"

**Example:**
```yaml
Before merge:
benefits: ["Research needed - please add specific benefits"]

After merge:
benefits: []
(Placeholder text automatically removed)
```

### Merge Precedence Rules

**String Fields** (title, description, popular_name):
- If existing data is valid and new data is placeholder → Keep existing
- If existing data is placeholder and new data is valid → Use new
- If both are valid → Use new (allows updates)

**Array Fields** (all array properties):
- If existing has valid data and new is empty/placeholder → Keep existing only
- If existing is empty/placeholder and new has valid data → Use new only
- If both have valid data → Merge unique values from both
- Placeholders are filtered from both before merging

**Special Fields:**
- `affiliate_links` - Always preserved (never overwritten)
- `created_at` - Always preserved from original file
- `last_updated_at` - Always updated to current timestamp

### Helper Methods

The merge logic uses these validation methods:

1. **`isPlaceholderValue(value)`** - Detects placeholder text patterns
2. **`isEmptyOrInvalid(array)`** - Checks if array contains only placeholders
3. **`normalizeUrl(url)`** - Converts URLs to lowercase for comparison
4. **`mergeArraysIntelligently(existing, new, field)`** - Field-specific merge logic

### Example: Complete Update Flow

**Starting state** (bpc-157.md):
```yaml
research: [
  { summary: "Wikipedia article", url: "https://en.wikipedia.org/wiki/BPC-157" },
  { summary: "Wikipedia article", url: "https://en.wikipedia.org/wiki/bpc-157" }
]
benefits: ["Great for healing"]
```

**New research data**:
```yaml
research: [
  { summary: "Wikipedia article", url: "https://en.wikipedia.org/wiki/bpc-157" },
  { summary: "PubMed database search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=bpc-157" }
]
benefits: ["Great for healing", "Reduces inflammation"]
```

**After merge**:
```yaml
research: [
  { summary: "Wikipedia article", url: "https://en.wikipedia.org/wiki/bpc-157" },
  { summary: "PubMed database search", url: "https://pubmed.ncbi.nlm.nih.gov/?term=bpc-157" }
]
benefits: ["Great for healing", "Reduces inflammation"]
```

**What happened:**
- Duplicate Wikipedia URL removed (case-insensitive URL comparison)
- New PubMed research item added
- New benefit "Reduces inflammation" added
- Existing benefit preserved
- No placeholder text present

## Troubleshooting

### Network Connection Errors

If you see errors like:
- `Unable to connect. Is the computer able to access the url?`
- `Was there a typo in the url or port?`
- `Error fetching Wikipedia data`
- `Error fetching PubMed data`

**Solution:** The script needs network access to fetch data from Wikipedia and PubMed APIs.

**When using Cursor command (`/update_peptides`):**
- The AI assistant will automatically detect network errors
- It will re-run the command with network permissions enabled
- No manual intervention needed

**When using direct command (`bun run update_peptides`):**
- Network access is automatically available
- If errors persist, check your internet connection
- Verify that Wikipedia and PubMed are accessible from your network

### Research Data Missing
For unknown peptides, the system will generate a template with placeholder data. You'll need to manually research and update the information.

### Invalid Peptide Names
Use standard peptide names and codes. The system recognizes common variations but works best with official names.

## Integration with Astro

The generated files are automatically compatible with your Astro content collection schema defined in `src/content/config.ts`. The frontmatter structure matches the required schema exactly.

Since the files contain only frontmatter, you can use Astro's content collections to query and display the peptide data directly from the metadata fields.

## Future Enhancements

Planned improvements include:

- **Web Scraping Integration** - Direct data extraction from research sources
- **AI-Powered Research** - Automated research using AI models
- **Real-time Data Updates** - Automatic updates from research databases
- **Batch Processing** - Process multiple peptides from CSV files
- **Quality Validation** - Automatic validation of generated content

## Architecture

### Source of Truth: `src/constants/peptides.ts`

The peptides constants file serves as the single source of truth for:

1. **Peptide List** (`CURRENT_PEPTIDE_FILES`)
   - Defines which peptides exist in the system
   - Used by `update_peptides.js` to process files
   - Used by Astro content schema validation

2. **Valid Tags** (`PEPTIDE_TAGS`)
   - Defines all allowed tag values
   - Used by both schema validation and file generation
   - Ensures consistency across the application

### Workflow

```
src/constants/peptides.ts (CURRENT_PEPTIDE_FILES)
            ↓
    bun run update_peptides
            ↓
src/content/peptides/*.md (generated/updated)
            ↓
    Astro content collection (validated against schema)
```

### Adding a New Peptide

1. Add slug to `CURRENT_PEPTIDE_FILES` in `src/constants/peptides.ts`
2. (Optional) Add enhanced data to `update_peptides.js`
3. Run `bun run update_peptides`
4. Review and edit the generated file
5. Commit changes

## Support

For issues or questions about the Update Peptides command system, please refer to the generated files and ensure they meet your content requirements.

---
*Command created for research data scientists working with peptide documentation*
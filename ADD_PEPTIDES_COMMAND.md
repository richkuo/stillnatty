# 🧬 Add Peptides Command Documentation

## Overview

The Add Peptides command system automatically generates and updates markdown files for peptides defined in `src/constants/peptides.ts`. This system uses the constants file as the source of truth for which peptides to process.

## Command
```bash
bun run add_peptides
```

## What It Does
- ✅ Reads peptide list from `src/constants/peptides.ts` (CURRENT_PEPTIDE_FILES)
- ✅ Researches peptide information from multiple sources
- ✅ Generates professional markdown files with complete frontmatter
- ✅ Includes comprehensive dosage protocols (Beginner → Advanced)
- ✅ Adds safety considerations and warnings
- ✅ Creates research links (Wikipedia, PubMed, Clinical Trials, Swolverine)
- ✅ Matches your Astro content schema exactly
- ✅ Uses PEPTIDE_TAGS constant for valid tag values

## 🚀 Usage

```bash
# Generate/update all peptides from constants file
bun run add_peptides
```

The command processes all peptides listed in `CURRENT_PEPTIDE_FILES`:
- bpc-157
- cjc-1295
- ibutamoren
- ipamorelin
- retatrutide
- semaglutide
- sermorelin
- tb-500
- tirzepatide

To add a new peptide, simply add its slug to the `CURRENT_PEPTIDE_FILES` array in `src/constants/peptides.ts` and run the command.

## 🔧 What Gets Generated

Each command creates markdown files in `src/content/peptides/` with:

- ✅ Complete frontmatter matching your Astro schema
- ✅ Comprehensive benefits and dosage information
- ✅ Research links to Wikipedia, PubMed, Clinical Trials
- ✅ Safety considerations and warnings
- ✅ Professional documentation structure

## Files Generated
Location: `src/content/peptides/[peptide-name].md`

Each file includes:
- Complete YAML frontmatter with timestamps
- Overview section
- Benefits list
- Dosage levels (Beginner/Intermediate/Advanced)
- Research links
- Safety considerations
- Stacking recommendations
- Automatic timestamp tracking (created_at and last_updated_at)

## Generated File Structure

Each generated markdown file includes:

### Frontmatter (YAML)
```yaml
---
title: Peptide Name
popular_name: "Common Name"
developmental_codes: ["Code1", "Code2"]
street_names: ["Street Name 1", "Street Name 2"]
product_names: ["Product 1", "Product 2"]
description: Comprehensive description
benefits: ["Benefit 1", "Benefit 2"]
dosage_levels: ["Beginner: Xmg daily", "Advanced: Ymg daily"]
research: ["Research Link 1", "Research Link 2"]
tags: ["tag1", "tag2"]
affiliate_links: []
is_natty: false
created_at: 2025-10-17T12:00:00.000Z
last_updated_at: 2025-10-17T12:00:00.000Z
---
```

### Content Sections
- **Overview** - Detailed description
- **Benefits** - Comprehensive benefit list
- **Dosage Levels** - Beginner to advanced protocols
- **Research & Studies** - Multiple research sources
- **Safety & Considerations** - Important safety information
- **Stacking Recommendations** - Combination protocols

## Research Sources

The system automatically generates links to:

- **Wikipedia** - General information
- **PubMed** - Scientific research database
- **Clinical Trials** - Ongoing and completed studies
- **Swolverine.com** - Specific dosage and protocol information

## File Naming Convention

Files are automatically named based on peptide names:
- `BPC-157` → `bpc-157.md`
- `TB-500` → `tb-500.md`
- `Ipamorelin` → `ipamorelin.md`

## 📝 Post-Generation Checklist

1. **Review Files** - Check generated content for accuracy
2. **Add Research** - Include specific studies and clinical data  
3. **Add Affiliate Links** - Include purchasing links (empty by default)
4. **Verify Dosage** - Cross-reference with current research
5. **Update Safety Info** - Add specific warnings if needed

## 🎯 Example Workflow

```bash
# Add multiple peptides at once
bun run add_peptides "BPC-157" "TB-500" "Ipamorelin" "CJC-1295"

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

**Step 2:** (Optional) Add enhanced data in `add_peptides.js` by editing the `getEnhancedPeptideData()` function:

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
bun run add_peptides
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
- **Merge** new research data with existing content (keeping unique values)
- **Enhance** the file with any new information from the research database

This means you can safely re-run the command to refresh peptide data without losing your customizations!

## Troubleshooting

### Research Data Missing
For unknown peptides, the system will generate a template with placeholder data. You'll need to manually research and update the information.

### Invalid Peptide Names
Use standard peptide names and codes. The system recognizes common variations but works best with official names.

## Integration with Astro

The generated files are automatically compatible with your Astro content collection schema defined in `src/content/config.ts`. The frontmatter structure matches the required schema exactly.

## Future Enhancements

Planned improvements include:

- **Web Scraping Integration** - Direct data extraction from research sources
- **AI-Powered Research** - Automated research using AI models
- **Real-time Data Updates** - Automatic updates from research databases
- **Batch Processing** - Process multiple peptides from CSV files
- **Quality Validation** - Automatic validation of generated content

## Support

For issues or questions about the Add Peptides command system, please refer to the generated files and ensure they meet your content requirements.

---
*Command created for research data scientists working with peptide documentation*
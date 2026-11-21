# Upload enquiry list

**Route:** /admissions/imports/new. **Primary action:** one per step.

Four steps: Choose file → Match columns → Review → Import. Step labels remain visible; current step blue. Keep previous completed steps accessible without losing selected file/mapping.

Choose file: 180px bordered drop area, labelled file picker, template link and actual supported limits. Multiple worksheets require explicit selection. Invalid format/file errors stay beside the file.

Match columns: source heading, sample value and destination select. Required fields marked. “Do not import” explicit. Detect duplicate mappings and missing required columns before Review.

Review: plain count strip with total/ready/needs-review/invalid; paginated row preview. Duplicate drawer compares incoming and existing record. Open existing, Skip or Different application with reason; no silent overwrite.

Import: exact count and skipped rows visible before confirmation. Progress persists across navigation. Result offers View enquiries and Download error report. Retry preserves row identities.

Test corrupt file, empty sheet, sibling match, wrong mapping, 1,000 rows, interrupted response and partial failure. Actual Excel support is required before labelling the feature Excel-compatible; unsupported format must be explained.

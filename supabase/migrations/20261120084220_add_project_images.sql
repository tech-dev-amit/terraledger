/*
# Add project photos

1. Plain-English
   Adds an image_url column to projects so each project can show a photo
   in the inventory header and buyer portal hero.

2. Modified Tables
   - projects: + image_url text (nullable, webp path under /projects)

3. Security
   - No policy changes; column covered by existing table grants.
*/

ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url text;

UPDATE projects SET image_url = '/projects/meridian-heights.webp' WHERE name = 'Meridian Heights' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/oakridge-villas.webp' WHERE name = 'Oakridge Villas' AND image_url IS NULL;
UPDATE projects SET image_url = '/projects/apex-trade-hub.webp' WHERE name = 'Apex Trade Hub' AND image_url IS NULL;

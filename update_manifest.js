import fs from 'fs';
import path from 'path';

const presetsDir = path.join(process.cwd(), 'public', 'presets');
const manifestPath = path.join(process.cwd(), 'public', 'presets.json');

if (!fs.existsSync(presetsDir)) {
  console.error(`Presets directory not found at: ${presetsDir}`);
  process.exit(1);
}

const emojiMap = {
  'Chibi Human': '🧑', 'Cat': '🐾', 'Dog': '🐕', 'Knight': '⚔️', 'Skeleton': '💀', 'Slime': '💧', 'Bird': '🐦',
  'House': '🏠', 'Street Light': '💡', 'Fence': '🪵', 'Tree': '🌳', 'Pine Tree': '🌲',
  'Chest': '🧰', 'Barrel': '🛢️', 'Campfire': '🔥', 'Rock': '🪨',
  'Arrow Tower': '🏹', 'Cannon Tower': '💣', 'Magic Tower': '🔮',
  'Goblin': '🟢', 'Orc': '🧌', 'Gargoyle': '🦇',
  'Castle Base': '🏰', 'Barricade': '🚧', 'Gold Mine': '💰'
};

const manifest = [];
const genreDirs = fs.readdirSync(presetsDir).filter(f => fs.statSync(path.join(presetsDir, f)).isDirectory());

genreDirs.forEach(dirName => {
  // "TD_Bases_and_Traps" -> "TD Bases & Traps"
  const genreLabel = dirName.replace(/_/g, ' ').replace(/and/g, '&');
  const catOutDir = path.join(presetsDir, dirName);
  
  const manifestCategory = {
    genre: genreLabel,
    items: []
  };

  const jsonFiles = fs.readdirSync(catOutDir).filter(f => f.endsWith('.json'));

  jsonFiles.forEach(file => {
    const filePath = path.join(catOutDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const def = JSON.parse(content);

      // EMOJI assignment: Use predefined map, or fallback to generic types
      const icon = emojiMap[def.name] || (def.type === 'humanoid' ? '🧑' : (def.type === 'quadruped' ? '🐾' : '📦'));
      const label = `${icon} ${def.name}`;

      manifestCategory.items.push({
        label: label,               // Label shown in UI
        name: def.name,
        type: def.type || 'static',
        url: `/presets/${dirName}/${encodeURIComponent(file)}`
      });
    } catch (err) {
      console.error(`Failed to parse ${filePath}:`, err);
    }
  });

  if (manifestCategory.items.length > 0) {
    manifest.push(manifestCategory);
  }
});

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ Success: public/presets.json has been generated from actual JSON files.');
console.log(`Scanned ${manifest.length} categories.`);
manifest.forEach(c => console.log(`  - ${c.genre}: ${c.items.length} items`));

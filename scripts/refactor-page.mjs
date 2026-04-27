import fs from 'fs';
import path from 'path';

const pagePath = path.resolve('./src/app/music/page.tsx');
let content = fs.readFileSync(pagePath, 'utf-8');

const mapStart = content.indexOf('albums.map((album, albumIndex) => (');
const motionDivStart = content.indexOf('<motion.div', mapStart);
const mapEnd = content.indexOf('))', content.indexOf('</motion.div>', motionDivStart) + 12);
// find the last motion.div inside the map
let index = motionDivStart;
let depth = 0;
while (index < content.length) {
    if (content.substring(index, index + 11) === '<motion.div') {
        depth++;
        index += 11;
    } else if (content.substring(index, index + 12) === '</motion.div>') {
        depth--;
        index += 12;
        if (depth === 0) {
            break;
        }
    } else {
        index++;
    }
}
const exactMapEnd = content.indexOf('))', index) + 2;

let block = content.substring(motionDivStart, index);

const renderAlbumString = `
    const renderAlbumCard = (album: Album, albumIndex: number, isFeatured: boolean = false) => (
        <motion.div
            key={album.name}
            id={album.name.toLowerCase().replace(/\\s+/g, '-')}
            initial={isFeatured ? { opacity: 0, y: 30 } : { opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: isFeatured ? 0.2 : albumIndex * 0.2 }}
            className={isFeatured ? "bg-gradient-to-br from-noir-charcoal/80 to-noir-slate/40 backdrop-blur-xl rounded-3xl border border-accent-cyan/30 overflow-hidden relative shadow-2xl shadow-accent-cyan/10" : "relative scroll-mt-32"}
        >
            {isFeatured && (
                <div className="absolute top-0 left-1/4 w-1/2 h-full bg-accent-cyan/10 blur-[100px] -z-10" />
            )}
            {isFeatured && (
                <div className="flex items-center gap-3 px-6 pt-6 pb-4">
                    <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-xs font-black uppercase tracking-widest rounded-full border border-accent-cyan/30 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                        Featured Release
                    </span>
                </div>
            )}
`;

block = block.replace(/<motion\.div\s+key={album\.name}[\s\S]*?className="relative scroll-mt-32"\s*>/, renderAlbumString);

const functionDef = `
    const renderAlbumCard = (album: Album, albumIndex: number, isFeatured: boolean = false) => {
        return (
${block}
        );
    };
`;

content = content.replace('    return (', functionDef + '\n    return (');

// Now replace the map content
const mapSection = content.substring(mapStart, exactMapEnd);
content = content.replace(mapSection, 'albums.filter(a => a.name !== "Munchies").map((album, albumIndex) => renderAlbumCard(album, albumIndex, false))');

// Now replace the featured section
const featuredStartString = '{/* Featured / New Songs */}';
const featuredStart = content.indexOf(featuredStartString);
const featuredEnd = content.indexOf('</section>', featuredStart) + 10;

const newFeaturedSection = `{/* Featured / New Songs */}
            <section className="relative px-6 pt-32 pb-16 z-20">
                <div className="max-w-7xl mx-auto">
                    {albums.find(a => a.name === "Munchies") && renderAlbumCard(albums.find(a => a.name === "Munchies")!, 0, true)}
                </div>
            </section>`;

content = content.substring(0, featuredStart) + newFeaturedSection + content.substring(featuredEnd);

fs.writeFileSync(pagePath, content);
console.log("Success");

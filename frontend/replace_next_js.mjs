import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:/Skills/MERN/Tech Track SHouse/frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('next/link')) {
        content = content.replace(/import Link from ["']next\/link["'];?/g, 'import { Link } from "react-router-dom";');
        content = content.replace(/<Link\s+href=/g, '<Link to=');
        changed = true;
    }
    
    if (content.includes('next/image')) {
        content = content.replace(/import Image from ["']next\/image["'];?/g, '');
        content = content.replace(/<Image/g, '<img');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});

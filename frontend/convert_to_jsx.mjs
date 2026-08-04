import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules') {
                results = results.concat(walk(fullPath));
            }
        } else {
            if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

function stripTypeScript(content) {
    // Remove "use client" directives
    content = content.replace(/^\s*"use client";\s*\n/gm, '');
    
    // Remove type imports: import type { ... } from "..."
    content = content.replace(/import\s+type\s+\{[^}]*\}\s+from\s+["'][^"']+["'];?\s*\n?/g, '');
    
    // Remove type-only parts from mixed imports: import { type Foo, Bar } -> import { Bar }
    content = content.replace(/,\s*type\s+\w+/g, '');
    content = content.replace(/\{\s*type\s+\w+\s*,\s*/g, '{ ');
    
    // Remove interface declarations (single and multiline)
    content = content.replace(/^(export\s+)?interface\s+\w+(\s+extends\s+[^{]+)?\s*\{[^}]*\}\s*\n?/gm, '');
    
    // Remove type declarations
    content = content.replace(/^(export\s+)?type\s+\w+\s*=\s*[^;]+;\s*\n?/gm, '');
    
    // Remove generic type parameters from function declarations: function Foo<T>(
    content = content.replace(/(function\s+\w+)\s*<[^>]+>/g, '$1');
    
    // Remove `: React.ReactNode`, `: React.FormEvent`, etc.
    content = content.replace(/:\s*React\.\w+(\[\])?/g, '');
    
    // Remove type annotations from arrow function params: (e: React.FormEvent) -> (e)
    content = content.replace(/\(\s*(\w+)\s*:\s*[^)]+\)/g, '($1)');
    
    // Remove type annotations from destructured params: ({ cart }: CartContextType) -> ({ cart })
    content = content.replace(/(\{[^}]+\})\s*:\s*\w+/g, '$1');
    
    // Remove type casting: as string, as number, as const etc.
    content = content.replace(/\s+as\s+\w+(\[\])?/g, '');
    
    // Remove Readonly<{ ... }> wrapper
    content = content.replace(/Readonly<([^>]+)>/g, '$1');
    
    // Remove type annotations on const/let/var: const x: string = -> const x =
    content = content.replace(/((?:const|let|var)\s+\w+)\s*:\s*(?:string|number|boolean|any|void|null|undefined|object|\w+(?:\[\])?(?:\s*\|\s*\w+(?:\[\])?)*)\s*=/g, '$1 =');
    
    // Remove return type annotations from arrow functions: ): string => -> ) =>
    content = content.replace(/\)\s*:\s*(?:string|number|boolean|any|void|null|undefined|JSX\.Element|React\.ReactNode|\w+(?:\[\])?(?:\s*\|\s*\w+(?:\[\])?)*)\s*=>/g, ') =>');
    
    // Remove return type annotations from function declarations: ): string { -> ) {
    content = content.replace(/\)\s*:\s*(?:string|number|boolean|any|void|null|undefined|JSX\.Element|React\.ReactNode|\w+(?:\[\])?(?:\s*\|\s*\w+(?:\[\])?)*)\s*\{/g, ') {');
    
    // Clean up any remaining simple type annotations in parameters like (total: any, item: { quantity: any; })
    // This handles inline object type annotations
    content = content.replace(/(\w+)\s*:\s*\{[^}]*\}/g, '$1');
    content = content.replace(/(\w+)\s*:\s*(?:any|string|number|boolean)\b/g, '$1');
    
    // Remove empty lines that might have been left behind (collapse multiple blank lines)
    content = content.replace(/\n{3,}/g, '\n\n');
    
    return content;
}

const srcDir = 'd:/Skills/MERN/Tech Track SHouse/frontend/src';
const files = walk(srcDir);

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    content = stripTypeScript(content);
    
    // Determine new extension
    const newPath = filePath.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js');
    
    // Write the converted content
    fs.writeFileSync(newPath, content, 'utf8');
    
    // Remove the old .tsx/.ts file if renamed
    if (newPath !== filePath) {
        fs.unlinkSync(filePath);
    }
    
    console.log(`Converted: ${path.basename(filePath)} -> ${path.basename(newPath)}`);
});

// Now fix all imports in ALL js/jsx files to remove .tsx/.ts extensions if referenced
const allFiles = walk(srcDir);
function walkAll(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules') {
                results = results.concat(walkAll(fullPath));
            }
        } else {
            if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const jsFiles = walkAll(srcDir);
jsFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Fix imports that reference .tsx or .ts extensions
    const newContent = content.replace(/from\s+["']([^"']+)\.(tsx|ts)["']/g, (match, p1, ext) => {
        changed = true;
        const newExt = ext === 'tsx' ? 'jsx' : 'js';
        return `from "${p1}.${newExt}"`;
    });
    
    if (changed) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Fixed imports in: ${path.basename(filePath)}`);
    }
});

console.log('\nDone! All .tsx -> .jsx and .ts -> .js conversion complete.');

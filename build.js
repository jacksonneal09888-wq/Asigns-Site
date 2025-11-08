#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const SKIP_NAMES = new Set(['node_modules', 'dist', '.git']);
const SKIP_FILES = new Set(['package.json', 'package-lock.json', 'build.js', '.DS_Store']);

const log = (message) => console.log(`[build] ${message}`);

function cleanDist() {
    fs.rmSync(DIST, { recursive: true, force: true });
    fs.mkdirSync(DIST, { recursive: true });
    log('Cleaned dist directory');
}

function shouldSkip(entryPath, stats) {
    const base = path.basename(entryPath);
    if (SKIP_NAMES.has(base) && stats.isDirectory()) return true;
    if (SKIP_FILES.has(base) && stats.isFile()) return true;
    return false;
}

function copyEntry(source, destination) {
    const stats = fs.statSync(source);
    if (shouldSkip(source, stats)) return;

    if (stats.isDirectory()) {
        fs.mkdirSync(destination, { recursive: true });
        for (const child of fs.readdirSync(source)) {
            copyEntry(path.join(source, child), path.join(destination, child));
        }
    } else if (stats.isFile()) {
        fs.copyFileSync(source, destination);
    }
}

function build() {
    cleanDist();
    for (const entry of fs.readdirSync(ROOT)) {
        const source = path.join(ROOT, entry);
        const destination = path.join(DIST, entry);
        copyEntry(source, destination);
    }
    log('Build complete');
}

build();

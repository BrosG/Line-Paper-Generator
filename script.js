/**
 * Line Paper Generator Pro
 * A professional paper template generator with 18+ paper types
 * 
 * @author BrosG
 * @version 2.0.0
 * @license MIT
 */

// ==========================================================================
// Configuration & Constants
// ==========================================================================

const CONFIG = {
    // Paper dimensions in pixels at 96 DPI
    paperSizes: {
        letter: { width: 816, height: 1056, label: '8.5" × 11"' },
        a4: { width: 794, height: 1123, label: '210 × 297mm' },
        legal: { width: 816, height: 1344, label: '8.5" × 14"' },
        a5: { width: 559, height: 794, label: '148 × 210mm' },
        a3: { width: 1123, height: 1587, label: '297 × 420mm' }
    },
    
    // Margin presets in pixels
    margins: {
        narrow: { top: 36, right: 36, bottom: 36, left: 36 },
        normal: { top: 72, right: 72, bottom: 72, left: 72 },
        wide: { top: 96, right: 96, bottom: 96, left: 96 }
    },
    
    // Default settings
    defaults: {
        paperType: 'wide-ruled',
        pageSize: 'letter',
        orientation: 'portrait',
        margin: 'normal',
        lineSpacing: 8,
        gridSize: 5,
        lineColor: '#b8c5d6',
        lineWeight: 1,
        leftMargin: true,
        quality: 2
    },
    
    // Paper type configurations
    paperTypes: {
        // Writing papers
        'wide-ruled': { category: 'writing', hasSpacing: true, hasLeftMargin: true, defaultSpacing: 10 },
        'college-ruled': { category: 'writing', hasSpacing: true, hasLeftMargin: true, defaultSpacing: 8 },
        'narrow-ruled': { category: 'writing', hasSpacing: true, hasLeftMargin: true, defaultSpacing: 6 },
        'handwriting': { category: 'writing', hasSpacing: true, hasLeftMargin: true, defaultSpacing: 10 },
        'seyes': { category: 'writing', hasSpacing: true, hasLeftMargin: true, defaultSpacing: 8 },
        'calligraphy': { category: 'writing', hasSpacing: true, hasLeftMargin: false, defaultSpacing: 12 },
        
        // Technical papers
        'graph': { category: 'technical', hasGridSize: true, hasLeftMargin: false, defaultGridSize: 5 },
        'dot-grid': { category: 'technical', hasGridSize: true, hasLeftMargin: false, defaultGridSize: 5 },
        'isometric': { category: 'technical', hasGridSize: true, hasLeftMargin: false, defaultGridSize: 10 },
        'hex': { category: 'technical', hasGridSize: true, hasLeftMargin: false, defaultGridSize: 12 },
        'coordinate': { category: 'technical', hasGridSize: true, hasLeftMargin: false, defaultGridSize: 5 },
        'polar': { category: 'technical', hasGridSize: true, hasLeftMargin: false, defaultGridSize: 8 },
        'engineering': { category: 'technical', hasGridSize: true, hasLeftMargin: false, defaultGridSize: 4 },
        
        // Specialty papers
        'music': { category: 'specialty', hasSpacing: false, hasLeftMargin: false },
        'tab': { category: 'specialty', hasSpacing: false, hasLeftMargin: false },
        'cornell': { category: 'specialty', hasSpacing: true, hasLeftMargin: false, defaultSpacing: 7 },
        'planner': { category: 'specialty', hasSpacing: true, hasLeftMargin: false, defaultSpacing: 6 },
        'storyboard': { category: 'specialty', hasSpacing: false, hasLeftMargin: false },
        'blank': { category: 'specialty', hasSpacing: false, hasLeftMargin: false }
    },
    
    // Keyboard shortcuts
    shortcuts: {
        't': 'toggleTheme',
        'p': 'print',
        'g': 'generate',
        'd': 'downloadPng',
        's': 'downloadSvg',
        '?': 'showShortcuts',
        'Escape': 'closeModal',
        '1': () => selectPaperType('wide-ruled'),
        '2': () => selectPaperType('college-ruled'),
        '3': () => selectPaperType('narrow-ruled'),
        '4': () => selectPaperType('graph'),
        '5': () => selectPaperType('dot-grid'),
        '6': () => selectPaperType('isometric'),
        '7': () => selectPaperType('music'),
        '8': () => selectPaperType('cornell'),
        '9': () => selectPaperType('planner')
    }
};

// ==========================================================================
// State Management
// ==========================================================================

const state = {
    paperType: CONFIG.defaults.paperType,
    pageSize: CONFIG.defaults.pageSize,
    orientation: CONFIG.defaults.orientation,
    margin: CONFIG.defaults.margin,
    lineSpacing: CONFIG.defaults.lineSpacing,
    gridSize: CONFIG.defaults.gridSize,
    lineColor: CONFIG.defaults.lineColor,
    lineWeight: CONFIG.defaults.lineWeight,
    leftMargin: CONFIG.defaults.leftMargin,
    quality: CONFIG.defaults.quality,
    zoom: 100,
    theme: 'light'
};

// ==========================================================================
// DOM Elements Cache
// ==========================================================================

const elements = {};

function cacheElements() {
    elements.canvas = document.getElementById('paperCanvas');
    elements.ctx = elements.canvas?.getContext('2d');
    elements.previewWrapper = document.getElementById('previewWrapper');
    elements.previewLoading = document.getElementById('previewLoading');
    elements.previewDimensions = document.getElementById('previewDimensions');
    elements.previewType = document.getElementById('previewType');
    elements.pageSize = document.getElementById('pageSize');
    elements.lineSpacing = document.getElementById('lineSpacing');
    elements.gridSize = document.getElementById('gridSize');
    elements.lineColor = document.getElementById('lineColor');
    elements.lineColorPicker = document.getElementById('lineColorPicker');
    elements.lineWeight = document.getElementById('lineWeight');
    elements.quality = document.getElementById('quality');
    elements.spacingControl = document.getElementById('spacingControl');
    elements.gridSizeControl = document.getElementById('gridSizeControl');
    elements.leftMarginControl = document.getElementById('leftMarginControl');
    elements.spacingValue = document.getElementById('spacingValue');
    elements.gridValue = document.getElementById('gridValue');
    elements.weightValue = document.getElementById('weightValue');
    elements.zoomLevel = document.getElementById('zoomLevel');
    elements.themeToggle = document.getElementById('themeToggle');
    elements.shortcutsModal = document.getElementById('shortcutsModal');
    elements.followModal = document.getElementById('followModal');
    elements.toastContainer = document.getElementById('toastContainer');
}

// ==========================================================================
// Utility Functions
// ==========================================================================

/**
 * Convert millimeters to pixels
 * @param {number} mm - Millimeters
 * @returns {number} Pixels
 */
function mmToPixels(mm) {
    return mm * 3.7795275591; // 96 DPI conversion
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Get paper type display name
 * @param {string} type - Paper type key
 * @returns {string} Display name
 */
function getPaperTypeName(type) {
    const names = {
        'wide-ruled': 'Wide Ruled',
        'college-ruled': 'College Ruled',
        'narrow-ruled': 'Narrow Ruled',
        'handwriting': 'Handwriting',
        'seyes': 'Seyes (French)',
        'calligraphy': 'Calligraphy',
        'graph': 'Graph Paper',
        'dot-grid': 'Dot Grid',
        'isometric': 'Isometric',
        'hex': 'Hexagonal',
        'coordinate': 'Coordinate',
        'polar': 'Polar Grid',
        'engineering': 'Engineering',
        'music': 'Music Staff',
        'tab': 'Guitar Tab',
        'cornell': 'Cornell Notes',
        'planner': 'Daily Planner',
        'storyboard': 'Storyboard',
        'blank': 'Blank'
    };
    return names[type] || type;
}

// ==========================================================================
// Toast Notifications
// ==========================================================================

/**
 * Show a toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, warning)
 * @param {number} duration - Duration in ms
 */
function showToast(title, message, type = 'success', duration = 3000) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Auto remove
    setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
}

// ==========================================================================
// Theme Management
// ==========================================================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme();
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    localStorage.setItem('theme', state.theme);
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
}

// ==========================================================================
// Controls Management
// ==========================================================================

function selectPaperType(type) {
    state.paperType = type;
    
    // Update UI
    document.querySelectorAll('.paper-type-card').forEach(card => {
        const isActive = card.dataset.type === type;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-checked', isActive);
    });
    
    // Update visible controls
    const paperConfig = CONFIG.paperTypes[type];
    
    elements.spacingControl?.classList.toggle('hidden', !paperConfig.hasSpacing);
    elements.gridSizeControl?.classList.toggle('hidden', !paperConfig.hasGridSize);
    elements.leftMarginControl?.classList.toggle('hidden', !paperConfig.hasLeftMargin);
    
    // Update preview type label
    if (elements.previewType) {
        elements.previewType.textContent = getPaperTypeName(type);
    }
    
    generatePaper();
}

function setOrientation(orientation) {
    state.orientation = orientation;
    
    document.querySelectorAll('[data-orientation]').forEach(btn => {
        const isActive = btn.dataset.orientation === orientation;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive);
    });
    
    updateDimensionsDisplay();
    generatePaper();
}

function setMargin(margin) {
    state.margin = margin;
    
    document.querySelectorAll('[data-margin]').forEach(btn => {
        const isActive = btn.dataset.margin === margin;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive);
    });
    
    generatePaper();
}

function setLeftMargin(hasMargin) {
    state.leftMargin = hasMargin;
    
    document.querySelectorAll('[data-leftmargin]').forEach(btn => {
        const isActive = (btn.dataset.leftmargin === 'yes') === hasMargin;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-checked', isActive);
    });
    
    generatePaper();
}

function updateDimensionsDisplay() {
    if (!elements.previewDimensions) return;
    
    const size = CONFIG.paperSizes[state.pageSize];
    const label = state.orientation === 'landscape' 
        ? size.label.split('×').reverse().join('×').trim()
        : size.label;
    elements.previewDimensions.textContent = label;
}

// ==========================================================================
// Zoom Controls
// ==========================================================================

function setZoom(level) {
    state.zoom = Math.max(25, Math.min(200, level));
    
    if (elements.previewWrapper) {
        elements.previewWrapper.style.transform = `scale(${state.zoom / 100})`;
    }
    
    if (elements.zoomLevel) {
        elements.zoomLevel.textContent = `${state.zoom}%`;
    }
}

function zoomIn() {
    setZoom(state.zoom + 25);
}

function zoomOut() {
    setZoom(state.zoom - 25);
}

function zoomFit() {
    setZoom(100);
}

// ==========================================================================
// Paper Generation
// ==========================================================================

const generatePaper = debounce(function() {
    if (!elements.canvas || !elements.ctx) return;
    
    // Show loading
    elements.previewLoading?.classList.add('visible');
    
    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        const ctx = elements.ctx;
        const quality = parseFloat(elements.quality?.value || state.quality);
        
        // Get dimensions
        let size = { ...CONFIG.paperSizes[state.pageSize] };
        if (state.orientation === 'landscape') {
            [size.width, size.height] = [size.height, size.width];
        }
        
        // Apply quality scaling
        const scaledWidth = Math.round(size.width * quality);
        const scaledHeight = Math.round(size.height * quality);
        
        // Set canvas size
        elements.canvas.width = scaledWidth;
        elements.canvas.height = scaledHeight;
        
        // Scale for display
        elements.canvas.style.width = `${size.width}px`;
        elements.canvas.style.height = `${size.height}px`;
        
        // Apply quality scale to context
        ctx.scale(quality, quality);
        
        // Clear and fill white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size.width, size.height);
        
        // Get settings
        const margins = CONFIG.margins[state.margin];
        const lineSpacing = mmToPixels(parseFloat(elements.lineSpacing?.value || state.lineSpacing));
        const gridSize = mmToPixels(parseFloat(elements.gridSize?.value || state.gridSize));
        const lineColor = state.lineColor;
        const lineWeight = parseFloat(elements.lineWeight?.value || state.lineWeight);
        
        // Draw paper based on type
        const drawFunctions = {
            'wide-ruled': () => drawRuledPaper(ctx, size, margins, lineSpacing, lineColor, lineWeight),
            'college-ruled': () => drawRuledPaper(ctx, size, margins, lineSpacing, lineColor, lineWeight),
            'narrow-ruled': () => drawRuledPaper(ctx, size, margins, lineSpacing, lineColor, lineWeight),
            'handwriting': () => drawHandwritingPaper(ctx, size, margins, lineSpacing, lineColor, lineWeight),
            'seyes': () => drawSeyesRuled(ctx, size, margins, lineSpacing, lineColor, lineWeight),
            'calligraphy': () => drawCalligraphyGuide(ctx, size, margins, lineSpacing, lineColor, lineWeight),
            'graph': () => drawGraphPaper(ctx, size, margins, gridSize, lineColor, lineWeight),
            'dot-grid': () => drawDotGrid(ctx, size, margins, gridSize, lineColor, lineWeight),
            'isometric': () => drawIsometric(ctx, size, margins, gridSize, lineColor, lineWeight),
            'hex': () => drawHexGrid(ctx, size, margins, gridSize, lineColor, lineWeight),
            'coordinate': () => drawCoordinatePlane(ctx, size, margins, gridSize, lineColor, lineWeight),
            'polar': () => drawPolarGrid(ctx, size, margins, gridSize, lineColor, lineWeight),
            'engineering': () => drawEngineeringPaper(ctx, size, margins, gridSize, lineColor, lineWeight),
            'music': () => drawMusicStaff(ctx, size, margins, lineColor, lineWeight),
            'tab': () => drawGuitarTab(ctx, size, margins, lineColor, lineWeight),
            'cornell': () => drawCornellNotes(ctx, size, margins, lineSpacing, lineColor, lineWeight),
            'planner': () => drawDailyPlanner(ctx, size, margins, lineSpacing, lineColor, lineWeight),
            'storyboard': () => drawStoryboard(ctx, size, margins, lineColor, lineWeight),
            'blank': () => {} // Just white paper
        };
        
        if (drawFunctions[state.paperType]) {
            drawFunctions[state.paperType]();
        }
        
        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Hide loading
        setTimeout(() => {
            elements.previewLoading?.classList.remove('visible');
        }, 100);
    });
}, 50);

// ==========================================================================
// Paper Drawing Functions
// ==========================================================================

function drawRuledPaper(ctx, size, margins, spacing, color, weight) {
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    
    // Draw left margin line
    if (state.leftMargin) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = weight * 1.5;
        ctx.beginPath();
        ctx.moveTo(margins.left + 60, margins.top);
        ctx.lineTo(margins.left + 60, size.height - margins.bottom);
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.lineWidth = weight;
    }
    
    // Draw horizontal lines
    for (let y = margins.top + spacing; y <= size.height - margins.bottom; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
    }
}

function drawHandwritingPaper(ctx, size, margins, spacing, color, weight) {
    // Draw left margin
    if (state.leftMargin) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = weight * 1.5;
        ctx.beginPath();
        ctx.moveTo(margins.left + 60, margins.top);
        ctx.lineTo(margins.left + 60, size.height - margins.bottom);
        ctx.stroke();
    }
    
    ctx.lineWidth = weight;
    const groupHeight = spacing * 3;
    
    for (let y = margins.top; y <= size.height - margins.bottom - groupHeight; y += groupHeight) {
        // Top line (solid)
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
        
        // Middle line (dashed)
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(margins.left, y + spacing);
        ctx.lineTo(size.width - margins.right, y + spacing);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Bottom line (solid)
        ctx.beginPath();
        ctx.moveTo(margins.left, y + spacing * 2);
        ctx.lineTo(size.width - margins.right, y + spacing * 2);
        ctx.stroke();
    }
}

function drawGraphPaper(ctx, size, margins, gridSize, color, weight) {
    const lightColor = color;
    const darkWeight = weight * 2;
    
    // Light grid
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = weight * 0.5;
    
    for (let x = margins.left; x <= size.width - margins.right; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, margins.top);
        ctx.lineTo(x, size.height - margins.bottom);
        ctx.stroke();
    }
    
    for (let y = margins.top; y <= size.height - margins.bottom; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
    }
    
    // Bold grid every 5 squares
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    
    let count = 0;
    for (let x = margins.left; x <= size.width - margins.right; x += gridSize) {
        if (count % 5 === 0) {
            ctx.beginPath();
            ctx.moveTo(x, margins.top);
            ctx.lineTo(x, size.height - margins.bottom);
            ctx.stroke();
        }
        count++;
    }
    
    count = 0;
    for (let y = margins.top; y <= size.height - margins.bottom; y += gridSize) {
        if (count % 5 === 0) {
            ctx.beginPath();
            ctx.moveTo(margins.left, y);
            ctx.lineTo(size.width - margins.right, y);
            ctx.stroke();
        }
        count++;
    }
}

function drawDotGrid(ctx, size, margins, gridSize, color, weight) {
    ctx.fillStyle = color;
    const dotRadius = weight * 1.2;
    
    for (let x = margins.left; x <= size.width - margins.right; x += gridSize) {
        for (let y = margins.top; y <= size.height - margins.bottom; y += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawIsometric(ctx, size, margins, gridSize, color, weight) {
    ctx.strokeStyle = color;
    ctx.lineWidth = weight * 0.5;
    
    const angle30 = Math.PI / 6;
    const spacing = gridSize;
    
    // Vertical lines
    for (let x = margins.left; x <= size.width - margins.right; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, margins.top);
        ctx.lineTo(x, size.height - margins.bottom);
        ctx.stroke();
    }
    
    // Lines going right (30 degrees from vertical)
    const tanAngle = Math.tan(angle30);
    for (let offset = -size.height * 2; offset <= size.width + size.height; offset += spacing) {
        ctx.beginPath();
        ctx.moveTo(margins.left + offset, margins.top);
        ctx.lineTo(margins.left + offset + (size.height - margins.top - margins.bottom) * tanAngle, size.height - margins.bottom);
        ctx.stroke();
    }
    
    // Lines going left
    for (let offset = 0; offset <= size.width + size.height * 2; offset += spacing) {
        ctx.beginPath();
        ctx.moveTo(size.width - margins.right - offset, margins.top);
        ctx.lineTo(size.width - margins.right - offset - (size.height - margins.top - margins.bottom) * tanAngle, size.height - margins.bottom);
        ctx.stroke();
    }
}

function drawHexGrid(ctx, size, margins, gridSize, color, weight) {
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    
    // gridSize represents the side length of each hexagon
    const s = gridSize;
    
    // For flat-top hexagons (flat edge on top/bottom, points on left/right):
    // - Width (point to point, horizontal) = 2 * s
    // - Height (flat to flat, vertical) = sqrt(3) * s ≈ 1.732 * s
    const hexWidth = 2 * s;
    const hexHeight = Math.sqrt(3) * s;
    
    // Tessellation: use column-major layout with alternating column offset
    // - Columns are spaced by 3/4 of hex width = 1.5 * s
    // - Within a column, hexes are spaced by full hex height
    // - Odd columns are offset vertically by half hex height
    const colSpacing = 1.5 * s;
    const rowSpacing = hexHeight;
    const colOffset = hexHeight / 2;
    
    // Calculate grid bounds
    const startX = margins.left + s; // Start with center inside margins
    const startY = margins.top + hexHeight / 2;
    const endX = size.width - margins.right;
    const endY = size.height - margins.bottom;
    
    let col = 0;
    for (let x = startX; x <= endX; x += colSpacing) {
        const yOffset = (col % 2) * colOffset;
        
        for (let y = startY + yOffset; y <= endY; y += rowSpacing) {
            drawFlatTopHexagon(ctx, x, y, s);
        }
        col++;
    }
}

function drawFlatTopHexagon(ctx, cx, cy, sideLength) {
    // Flat-top hexagon: flat edges on top and bottom, pointy vertices on left and right
    // Starting at 0° (right) and going counterclockwise:
    // 0° (right), 60° (lower-right), 120° (lower-left), 180° (left), 240° (upper-left), 300° (upper-right)
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = cx + sideLength * Math.cos(angle);
        const y = cy + sideLength * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.stroke();
}

function drawCoordinatePlane(ctx, size, margins, gridSize, color, weight) {
    // Calculate center point - this is where axes will cross
    const centerX = Math.round(size.width / 2);
    const centerY = Math.round(size.height / 2);
    
    // Draw grid STARTING FROM CENTER so it aligns with axes
    ctx.strokeStyle = color;
    ctx.lineWidth = weight * 0.3;
    
    // Vertical lines - from center going right
    for (let x = centerX; x <= size.width - margins.right; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, margins.top);
        ctx.lineTo(x, size.height - margins.bottom);
        ctx.stroke();
    }
    // Vertical lines - from center going left
    for (let x = centerX - gridSize; x >= margins.left; x -= gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, margins.top);
        ctx.lineTo(x, size.height - margins.bottom);
        ctx.stroke();
    }
    
    // Horizontal lines - from center going down
    for (let y = centerY; y <= size.height - margins.bottom; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
    }
    // Horizontal lines - from center going up
    for (let y = centerY - gridSize; y >= margins.top; y -= gridSize) {
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
    }
    
    // Draw axes (heavier weight)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = weight * 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margins.left, centerY);
    ctx.lineTo(size.width - margins.right, centerY);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(centerX, margins.top);
    ctx.lineTo(centerX, size.height - margins.bottom);
    ctx.stroke();
    
    // Draw arrows
    ctx.fillStyle = '#000000';
    const arrowSize = 10;
    
    // X-axis arrow (pointing right)
    ctx.beginPath();
    ctx.moveTo(size.width - margins.right, centerY);
    ctx.lineTo(size.width - margins.right - arrowSize, centerY - arrowSize / 2);
    ctx.lineTo(size.width - margins.right - arrowSize, centerY + arrowSize / 2);
    ctx.closePath();
    ctx.fill();
    
    // Y-axis arrow (pointing up)
    ctx.beginPath();
    ctx.moveTo(centerX, margins.top);
    ctx.lineTo(centerX - arrowSize / 2, margins.top + arrowSize);
    ctx.lineTo(centerX + arrowSize / 2, margins.top + arrowSize);
    ctx.closePath();
    ctx.fill();
    
    // Tick marks every 5 grid units
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = weight;
    const tickSize = 6;
    const tickInterval = gridSize * 5;
    
    // X-axis ticks - positive direction
    for (let x = centerX + tickInterval; x <= size.width - margins.right; x += tickInterval) {
        ctx.beginPath();
        ctx.moveTo(x, centerY - tickSize);
        ctx.lineTo(x, centerY + tickSize);
        ctx.stroke();
    }
    // X-axis ticks - negative direction
    for (let x = centerX - tickInterval; x >= margins.left; x -= tickInterval) {
        ctx.beginPath();
        ctx.moveTo(x, centerY - tickSize);
        ctx.lineTo(x, centerY + tickSize);
        ctx.stroke();
    }
    
    // Y-axis ticks - positive direction (down in screen coords)
    for (let y = centerY + tickInterval; y <= size.height - margins.bottom; y += tickInterval) {
        ctx.beginPath();
        ctx.moveTo(centerX - tickSize, y);
        ctx.lineTo(centerX + tickSize, y);
        ctx.stroke();
    }
    // Y-axis ticks - negative direction (up in screen coords)
    for (let y = centerY - tickInterval; y >= margins.top; y -= tickInterval) {
        ctx.beginPath();
        ctx.moveTo(centerX - tickSize, y);
        ctx.lineTo(centerX + tickSize, y);
        ctx.stroke();
    }
}

function drawPolarGrid(ctx, size, margins, gridSize, color, weight) {
    const centerX = size.width / 2;
    const centerY = size.height / 2;
    const maxRadius = Math.min(size.width / 2 - margins.left, size.height / 2 - margins.top);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = weight * 0.5;
    
    // Draw concentric circles
    for (let r = gridSize; r <= maxRadius; r += gridSize) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw radial lines (every 15 degrees)
    for (let angle = 0; angle < 360; angle += 15) {
        const radian = (angle * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + maxRadius * Math.cos(radian),
            centerY + maxRadius * Math.sin(radian)
        );
        ctx.stroke();
    }
    
    // Draw axes (heavier)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = weight * 1.5;
    
    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(centerX - maxRadius, centerY);
    ctx.lineTo(centerX + maxRadius, centerY);
    ctx.stroke();
    
    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - maxRadius);
    ctx.lineTo(centerX, centerY + maxRadius);
    ctx.stroke();
}

function drawEngineeringPaper(ctx, size, margins, gridSize, color, weight) {
    const smallGrid = gridSize;
    const largeGrid = gridSize * 5;
    
    // Small grid (light)
    ctx.strokeStyle = color;
    ctx.lineWidth = weight * 0.3;
    
    for (let x = margins.left; x <= size.width - margins.right; x += smallGrid) {
        ctx.beginPath();
        ctx.moveTo(x, margins.top);
        ctx.lineTo(x, size.height - margins.bottom);
        ctx.stroke();
    }
    
    for (let y = margins.top; y <= size.height - margins.bottom; y += smallGrid) {
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
    }
    
    // Large grid (heavier)
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    
    for (let x = margins.left; x <= size.width - margins.right; x += largeGrid) {
        ctx.beginPath();
        ctx.moveTo(x, margins.top);
        ctx.lineTo(x, size.height - margins.bottom);
        ctx.stroke();
    }
    
    for (let y = margins.top; y <= size.height - margins.bottom; y += largeGrid) {
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
    }
}

function drawMusicStaff(ctx, size, margins, color, weight) {
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    
    const staffLineSpacing = 10;
    const staffGroupSpacing = 80;
    
    let y = margins.top + 20;
    
    while (y + 4 * staffLineSpacing < size.height - margins.bottom - 40) {
        // Draw 5 staff lines
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(margins.left, y + i * staffLineSpacing);
            ctx.lineTo(size.width - margins.right, y + i * staffLineSpacing);
            ctx.stroke();
        }
        
        // Draw bar lines
        ctx.lineWidth = weight * 1.5;
        const barSpacing = (size.width - margins.left - margins.right) / 4;
        
        for (let i = 0; i <= 4; i++) {
            const x = margins.left + i * barSpacing;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 4 * staffLineSpacing);
            ctx.stroke();
        }
        
        ctx.lineWidth = weight;
        y += staffGroupSpacing;
    }
}

function drawGuitarTab(ctx, size, margins, color, weight) {
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    
    const stringSpacing = 12;
    const tabGroupSpacing = 100;
    
    let y = margins.top + 20;
    
    while (y + 5 * stringSpacing < size.height - margins.bottom - 40) {
        // Draw 6 string lines
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(margins.left, y + i * stringSpacing);
            ctx.lineTo(size.width - margins.right, y + i * stringSpacing);
            ctx.stroke();
        }
        
        // Draw bar lines
        ctx.lineWidth = weight * 1.5;
        const barSpacing = (size.width - margins.left - margins.right) / 4;
        
        for (let i = 0; i <= 4; i++) {
            const x = margins.left + i * barSpacing;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 5 * stringSpacing);
            ctx.stroke();
        }
        
        // String labels
        ctx.fillStyle = '#666666';
        ctx.font = '10px monospace';
        const strings = ['e', 'B', 'G', 'D', 'A', 'E'];
        strings.forEach((str, i) => {
            ctx.fillText(str, margins.left - 15, y + i * stringSpacing + 4);
        });
        
        ctx.lineWidth = weight;
        y += tabGroupSpacing;
    }
}

function drawCornellNotes(ctx, size, margins, spacing, color, weight) {
    const cueColumnWidth = (size.width - margins.left - margins.right) * 0.3;
    const summaryHeight = 100;
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = weight * 2;
    
    // Vertical divider (cue column)
    ctx.beginPath();
    ctx.moveTo(margins.left + cueColumnWidth, margins.top);
    ctx.lineTo(margins.left + cueColumnWidth, size.height - margins.bottom - summaryHeight);
    ctx.stroke();
    
    // Horizontal divider (summary section)
    ctx.beginPath();
    ctx.moveTo(margins.left, size.height - margins.bottom - summaryHeight);
    ctx.lineTo(size.width - margins.right, size.height - margins.bottom - summaryHeight);
    ctx.stroke();
    
    // Draw lines in notes section
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    
    for (let y = margins.top + spacing; y < size.height - margins.bottom - summaryHeight; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(margins.left + cueColumnWidth + 10, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
    }
    
    // Draw lines in summary section
    for (let y = size.height - margins.bottom - summaryHeight + spacing; y < size.height - margins.bottom; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
    }
    
    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CUES', margins.left + 10, margins.top + 20);
    ctx.fillText('NOTES', margins.left + cueColumnWidth + 20, margins.top + 20);
    ctx.fillText('SUMMARY', margins.left + 10, size.height - margins.bottom - summaryHeight + 20);
}

function drawDailyPlanner(ctx, size, margins, spacing, color, weight) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = weight * 1.5;
    
    // Header section
    const headerHeight = 60;
    ctx.strokeRect(margins.left, margins.top, size.width - margins.left - margins.right, headerHeight);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Date: _________________', margins.left + 20, margins.top + 25);
    ctx.fillText('Day: _________________', margins.left + 250, margins.top + 25);
    ctx.font = '12px sans-serif';
    ctx.fillText("Today's Goals:", margins.left + 20, margins.top + 48);
    
    const contentTop = margins.top + headerHeight + 15;
    const leftColumnWidth = (size.width - margins.left - margins.right) * 0.55;
    const scheduleHeight = (size.height - contentTop - margins.bottom - 120) * 0.65;
    
    // Schedule section
    ctx.strokeRect(margins.left, contentTop, leftColumnWidth, scheduleHeight);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('SCHEDULE', margins.left + 15, contentTop + 20);
    
    // Time slots
    ctx.strokeStyle = color;
    ctx.lineWidth = weight * 0.5;
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';
    
    const times = ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    const slotHeight = (scheduleHeight - 35) / times.length;
    
    times.forEach((time, i) => {
        const y = contentTop + 35 + i * slotHeight;
        ctx.fillText(time, margins.left + 10, y + 12);
        ctx.beginPath();
        ctx.moveTo(margins.left + 50, y);
        ctx.lineTo(margins.left + leftColumnWidth - 10, y);
        ctx.stroke();
    });
    
    // To-do section
    const todoLeft = margins.left + leftColumnWidth + 15;
    const todoWidth = size.width - margins.right - todoLeft;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = weight * 1.5;
    ctx.strokeRect(todoLeft, contentTop, todoWidth, scheduleHeight);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('TO-DO', todoLeft + 15, contentTop + 20);
    
    // Checkboxes
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    
    for (let y = contentTop + 40; y < contentTop + scheduleHeight - 15; y += spacing * 1.5) {
        ctx.strokeRect(todoLeft + 15, y - 8, 10, 10);
        ctx.beginPath();
        ctx.moveTo(todoLeft + 35, y);
        ctx.lineTo(todoLeft + todoWidth - 15, y);
        ctx.stroke();
    }
    
    // Notes section
    const notesTop = contentTop + scheduleHeight + 15;
    const notesHeight = size.height - margins.bottom - notesTop;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = weight * 1.5;
    ctx.strokeRect(margins.left, notesTop, size.width - margins.left - margins.right, notesHeight);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('NOTES', margins.left + 15, notesTop + 20);
    
    // Lines in notes
    ctx.strokeStyle = color;
    ctx.lineWidth = weight * 0.5;
    
    for (let y = notesTop + 35; y < size.height - margins.bottom - 10; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(margins.left + 15, y);
        ctx.lineTo(size.width - margins.right - 15, y);
        ctx.stroke();
    }
}

function drawSeyesRuled(ctx, size, margins, spacing, color, weight) {
    const smallSpacing = spacing / 4;
    
    // Left margin line
    if (state.leftMargin) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = weight * 1.5;
        ctx.beginPath();
        ctx.moveTo(margins.left + 60, margins.top);
        ctx.lineTo(margins.left + 60, size.height - margins.bottom);
        ctx.stroke();
    }
    
    // Horizontal lines
    let lineCount = 0;
    for (let y = margins.top; y <= size.height - margins.bottom; y += smallSpacing) {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineCount % 4 === 0 ? weight * 1.5 : weight * 0.5;
        
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
        
        lineCount++;
    }
    
    // Vertical guide lines
    ctx.strokeStyle = color;
    ctx.lineWidth = weight * 0.3;
    
    for (let x = margins.left + 60 + spacing; x <= size.width - margins.right; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, margins.top);
        ctx.lineTo(x, size.height - margins.bottom);
        ctx.stroke();
    }
}

function drawCalligraphyGuide(ctx, size, margins, spacing, color, weight) {
    const groupSpacing = spacing * 4;
    const angle = 55;
    const angleRad = (angle * Math.PI) / 180;
    
    for (let y = margins.top + spacing; y <= size.height - margins.bottom - spacing * 2; y += groupSpacing) {
        // Descender line (dashed)
        ctx.strokeStyle = color;
        ctx.lineWidth = weight * 0.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(margins.left, y);
        ctx.lineTo(size.width - margins.right, y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Baseline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = weight * 1.5;
        ctx.beginPath();
        ctx.moveTo(margins.left, y + spacing);
        ctx.lineTo(size.width - margins.right, y + spacing);
        ctx.stroke();
        
        // X-height line
        ctx.strokeStyle = color;
        ctx.lineWidth = weight;
        ctx.beginPath();
        ctx.moveTo(margins.left, y + spacing * 2);
        ctx.lineTo(size.width - margins.right, y + spacing * 2);
        ctx.stroke();
        
        // Ascender line (dashed)
        ctx.lineWidth = weight * 0.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(margins.left, y + spacing * 3);
        ctx.lineTo(size.width - margins.right, y + spacing * 3);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Slant lines
    ctx.strokeStyle = color;
    ctx.lineWidth = weight * 0.3;
    const slantSpacing = spacing * 2;
    const pageHeight = size.height - margins.top - margins.bottom;
    const slantOffset = pageHeight / Math.tan(angleRad);
    
    for (let x = margins.left - slantOffset; x <= size.width - margins.right + slantOffset; x += slantSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, margins.top);
        ctx.lineTo(x + slantOffset, size.height - margins.bottom);
        ctx.stroke();
    }
}

function drawStoryboard(ctx, size, margins, color, weight) {
    const cols = 2;
    const rows = 3;
    const gap = 20;
    const labelHeight = 30;
    
    const cellWidth = (size.width - margins.left - margins.right - gap * (cols - 1)) / cols;
    const cellHeight = (size.height - margins.top - margins.bottom - gap * (rows - 1) - labelHeight * rows) / rows;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = weight * 1.5;
    
    let panelNum = 1;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = margins.left + col * (cellWidth + gap);
            const y = margins.top + row * (cellHeight + labelHeight + gap);
            
            // Draw frame (16:9 aspect approximation)
            ctx.strokeRect(x, y, cellWidth, cellHeight);
            
            // Draw panel number
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`Panel ${panelNum}`, x + 5, y + cellHeight + 18);
            
            // Draw notes line
            ctx.strokeStyle = color;
            ctx.lineWidth = weight * 0.5;
            ctx.beginPath();
            ctx.moveTo(x + 70, y + cellHeight + 20);
            ctx.lineTo(x + cellWidth, y + cellHeight + 20);
            ctx.stroke();
            
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = weight * 1.5;
            
            panelNum++;
        }
    }
}

// ==========================================================================
// Export Functions
// ==========================================================================

// Store pending action
let pendingAction = null;

function printPaper() {
    if (shouldShowFollowModal()) {
        // Show modal BEFORE printing
        pendingAction = {
            type: 'print',
            execute: () => {
                window.print();
                showToast('Printing', 'Opening print dialog...', 'success');
            }
        };
        showFollowModal();
    } else {
        // Execute directly
        window.print();
        showToast('Printing', 'Opening print dialog...', 'success');
    }
}

function downloadPng() {
    if (!elements.canvas) return;
    
    if (shouldShowFollowModal()) {
        // Show modal BEFORE downloading
        pendingAction = {
            type: 'download',
            format: 'PNG',
            execute: () => {
                const link = document.createElement('a');
                link.download = `${state.paperType}-paper.png`;
                link.href = elements.canvas.toDataURL('image/png');
                link.click();
                showToast('Downloaded', `${getPaperTypeName(state.paperType)} paper saved as PNG`, 'success');
            }
        };
        showFollowModal();
    } else {
        // Execute directly
        const link = document.createElement('a');
        link.download = `${state.paperType}-paper.png`;
        link.href = elements.canvas.toDataURL('image/png');
        link.click();
        showToast('Downloaded', `${getPaperTypeName(state.paperType)} paper saved as PNG`, 'success');
    }
}

function downloadSvg() {
    if (!elements.canvas) return;
    
    if (shouldShowFollowModal()) {
        // Show modal BEFORE downloading
        pendingAction = {
            type: 'download',
            format: 'SVG',
            execute: () => {
                const quality = parseFloat(elements.quality?.value || state.quality);
                let size = { ...CONFIG.paperSizes[state.pageSize] };
                if (state.orientation === 'landscape') {
                    [size.width, size.height] = [size.height, size.width];
                }
                
                const dataUrl = elements.canvas.toDataURL('image/png');
                const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">
    <image width="${size.width}" height="${size.height}" xlink:href="${dataUrl}"/>
</svg>`;
                
                const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                const link = document.createElement('a');
                link.download = `${state.paperType}-paper.svg`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
                
                showToast('Downloaded', `${getPaperTypeName(state.paperType)} paper saved as SVG`, 'success');
            }
        };
        showFollowModal();
    } else {
        // Execute directly
        const quality = parseFloat(elements.quality?.value || state.quality);
        let size = { ...CONFIG.paperSizes[state.pageSize] };
        if (state.orientation === 'landscape') {
            [size.width, size.height] = [size.height, size.width];
        }
        
        const dataUrl = elements.canvas.toDataURL('image/png');
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">
    <image width="${size.width}" height="${size.height}" xlink:href="${dataUrl}"/>
</svg>`;
        
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = `${state.paperType}-paper.svg`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        
        showToast('Downloaded', `${getPaperTypeName(state.paperType)} paper saved as SVG`, 'success');
    }
}

// ==========================================================================
// Modal Functions
// ==========================================================================

function showShortcuts() {
    elements.shortcutsModal?.classList.add('visible');
}

function closeModal() {
    elements.shortcutsModal?.classList.remove('visible');
    elements.followModal?.classList.remove('visible');
}

// ==========================================================================
// Follow Modal Functions - Rotating Messages System
// ==========================================================================

// Rotating messages that get progressively better
const FOLLOW_MESSAGES = [
    {
        emoji: '🚀',
        message: '<strong>Love free tools?</strong> I create <span class="highlight">10+ productivity tools</span> like this one. Follow for updates on new releases! <span class="emoji">💙</span>',
        twitterText: 'Get early access to new tools',
        githubText: 'See all 10+ projects',
        linkedinText: 'Connect for pro tips'
    },
    {
        emoji: '🎯',
        message: '<strong>Quick heads up!</strong> I have <span class="highlight">other free generators</span> you might love: Invoice generator, Resume builder, QR code maker & more! <span class="emoji">✨</span>',
        twitterText: 'Follow for more free tools',
        githubText: 'Browse all projects',
        linkedinText: 'Professional network'
    },
    {
        emoji: '🔥',
        message: '<strong>Did you know?</strong> Followers get <span class="highlight">early access</span> to new tools before public launch + exclusive tips & tricks! <span class="emoji">🎁</span>',
        twitterText: 'Get exclusive early access',
        githubText: 'Star for notifications',
        linkedinText: 'Pro networking'
    },
    {
        emoji: '💎',
        message: '<strong>Special offer!</strong> Join <span class="highlight">2,000+ creators</span> using my free toolkit: Forms, calculators, converters, and 15+ productivity tools. <span class="emoji">🚀</span>',
        twitterText: 'Join 2,000+ followers',
        githubText: 'Explore 15+ tools',
        linkedinText: 'Network with creators'
    },
    {
        emoji: '⚡',
        message: '<strong>Power user detected!</strong> Since you love this tool, check out my <span class="highlight">premium collection</span> (still 100% free): Advanced generators, APIs, and automation tools! <span class="emoji">🎨</span>',
        twitterText: 'Unlock premium tools',
        githubText: 'Access API docs',
        linkedinText: 'Connect for collabs'
    },
    {
        emoji: '🎁',
        message: '<strong>You\'re awesome!</strong> As a thank you, follow me and get instant access to <span class="highlight">hidden bonus tools</span> not listed publicly + priority support! <span class="emoji">💝</span>',
        twitterText: 'Get hidden bonus tools',
        githubText: 'Unlock secret repos',
        linkedinText: 'Premium networking'
    },
    {
        emoji: '🌟',
        message: '<strong>VIP Access!</strong> You\'ve used this <span class="highlight">{count} times</span>. Loyal users get first dibs on new features, beta testing, and direct support. Join the VIP club! <span class="emoji">👑</span>',
        twitterText: 'Join the VIP club',
        githubText: 'Beta tester access',
        linkedinText: 'VIP networking'
    },
    {
        emoji: '🏆',
        message: '<strong>You\'re a superstar!</strong> <span class="highlight">{count} downloads</span> - you clearly value great tools. Get exclusive access to my <span class="highlight">Pro Suite</span> (still free): Advanced features, no ads, unlimited use! <span class="emoji">💪</span>',
        twitterText: 'Get Pro Suite access',
        githubText: 'Premium features',
        linkedinText: 'Elite networking'
    }
];

/**
 * Get the appropriate message based on visit count
 */
function getFollowMessage() {
    const visitCount = parseInt(localStorage.getItem('followModalVisits') || '0') + 1;
    
    // Cycle through messages, but use more enticing ones for higher counts
    let messageIndex;
    if (visitCount <= 1) messageIndex = 0;
    else if (visitCount <= 2) messageIndex = 1;
    else if (visitCount <= 3) messageIndex = 2;
    else if (visitCount <= 5) messageIndex = 3;
    else if (visitCount <= 7) messageIndex = 4;
    else if (visitCount <= 10) messageIndex = 5;
    else if (visitCount <= 15) messageIndex = 6;
    else {
        // Rotate through the last two most enticing messages
        messageIndex = visitCount % 2 === 0 ? 6 : 7;
    }
    
    // Replace {count} with actual count
    const message = FOLLOW_MESSAGES[messageIndex];
    return {
        ...message,
        message: message.message.replace('{count}', visitCount),
        visitCount
    };
}

/**
 * Check if we should show the follow modal - ALWAYS true now!
 */
function shouldShowFollowModal() {
    // Always show, unless they've followed (clicked a social link)
    if (localStorage.getItem('hasFollowed') === 'true') {
        // Show less frequently after following (every 3rd time)
        const visitCount = parseInt(localStorage.getItem('followModalVisits') || '0');
        return visitCount % 3 === 0;
    }
    return true;
}

/**
 * Show the follow modal with rotating content
 */
function showFollowModal() {
    if (!pendingAction || !shouldShowFollowModal()) {
        // Still execute if they've already followed
        if (pendingAction) {
            executePendingAction();
        }
        return;
    }
    
    // Get the rotating message
    const messageData = getFollowMessage();
    
    // Update modal content
    const actionTypeEl = document.getElementById('followActionType');
    const continueTextEl = document.getElementById('continueActionText');
    const emojiEl = document.getElementById('followEmoji');
    const messageContainer = document.getElementById('followMessageContainer');
    const followCountEl = document.getElementById('followCount');
    const twitterSubtext = document.getElementById('twitterSubtext');
    const githubSubtext = document.getElementById('githubSubtext');
    const linkedinSubtext = document.getElementById('linkedinSubtext');
    
    // Update action type
    if (pendingAction.type === 'print') {
        if (actionTypeEl) actionTypeEl.textContent = 'print';
        if (continueTextEl) continueTextEl.textContent = 'Continue to Print';
    } else {
        if (actionTypeEl) actionTypeEl.textContent = 'download';
        if (continueTextEl) continueTextEl.textContent = `Continue to Download ${pendingAction.format || ''}`;
    }
    
    // Update emoji
    if (emojiEl) emojiEl.textContent = messageData.emoji;
    
    // Update message with fade effect
    if (messageContainer) {
        messageContainer.innerHTML = `<p class="follow-message">${messageData.message}</p>`;
    }
    
    // Update subtext for social buttons
    if (twitterSubtext) twitterSubtext.textContent = messageData.twitterText;
    if (githubSubtext) githubSubtext.textContent = messageData.githubText;
    if (linkedinSubtext) linkedinSubtext.textContent = messageData.linkedinText;
    
    // Update counter
    if (followCountEl) followCountEl.textContent = `Visit #${messageData.visitCount}`;
    
    // Save visit count
    localStorage.setItem('followModalVisits', messageData.visitCount.toString());
    
    // Show modal
    elements.followModal?.classList.add('visible');
}

/**
 * Execute the pending action and close modal
 */
function executePendingAction() {
    if (pendingAction && pendingAction.execute) {
        // Close modal
        elements.followModal?.classList.remove('visible');
        
        // Execute the action after a brief delay
        setTimeout(() => {
            pendingAction.execute();
            pendingAction = null;
        }, 100);
    }
}

/**
 * Mark user as followed and execute action
 */
function markAsFollowed() {
    localStorage.setItem('hasFollowed', 'true');
    executePendingAction();
}

/**
 * Close the follow modal without executing (shouldn't happen now)
 */
function closeFollowModal() {
    // Always execute the action
    executePendingAction();
}

// ==========================================================================
// Event Handlers
// ==========================================================================

function setupEventListeners() {
    // Paper type cards
    document.querySelectorAll('.paper-type-card').forEach(card => {
        card.addEventListener('click', () => {
            selectPaperType(card.dataset.type);
        });
    });
    
    // Orientation buttons
    document.querySelectorAll('[data-orientation]').forEach(btn => {
        btn.addEventListener('click', () => {
            setOrientation(btn.dataset.orientation);
        });
    });
    
    // Margin buttons
    document.querySelectorAll('[data-margin]').forEach(btn => {
        btn.addEventListener('click', () => {
            setMargin(btn.dataset.margin);
        });
    });
    
    // Left margin buttons
    document.querySelectorAll('[data-leftmargin]').forEach(btn => {
        btn.addEventListener('click', () => {
            setLeftMargin(btn.dataset.leftmargin === 'yes');
        });
    });
    
    // Page size
    elements.pageSize?.addEventListener('change', () => {
        state.pageSize = elements.pageSize.value;
        updateDimensionsDisplay();
        generatePaper();
    });
    
    // Line spacing slider
    elements.lineSpacing?.addEventListener('input', () => {
        const value = elements.lineSpacing.value;
        if (elements.spacingValue) elements.spacingValue.textContent = value;
        state.lineSpacing = parseFloat(value);
        generatePaper();
    });
    
    // Grid size slider
    elements.gridSize?.addEventListener('input', () => {
        const value = elements.gridSize.value;
        if (elements.gridValue) elements.gridValue.textContent = value;
        state.gridSize = parseFloat(value);
        generatePaper();
    });
    
    // Line weight slider
    elements.lineWeight?.addEventListener('input', () => {
        const value = elements.lineWeight.value;
        if (elements.weightValue) elements.weightValue.textContent = value;
        state.lineWeight = parseFloat(value);
        generatePaper();
    });
    
    // Line color select
    elements.lineColor?.addEventListener('change', () => {
        const value = elements.lineColor.value;
        if (value === 'custom') {
            elements.lineColorPicker?.click();
        } else {
            state.lineColor = value;
            if (elements.lineColorPicker) elements.lineColorPicker.value = value;
            generatePaper();
        }
    });
    
    // Color picker
    elements.lineColorPicker?.addEventListener('input', () => {
        state.lineColor = elements.lineColorPicker.value;
        elements.lineColor.value = 'custom';
        generatePaper();
    });
    
    // Quality select
    elements.quality?.addEventListener('change', () => {
        state.quality = parseFloat(elements.quality.value);
        generatePaper();
    });
    
    // Action buttons
    document.getElementById('generateBtn')?.addEventListener('click', generatePaper);
    document.getElementById('printBtn')?.addEventListener('click', printPaper);
    document.getElementById('downloadPngBtn')?.addEventListener('click', downloadPng);
    document.getElementById('downloadSvgBtn')?.addEventListener('click', downloadSvg);
    
    // Theme toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // Zoom controls
    document.getElementById('zoomIn')?.addEventListener('click', zoomIn);
    document.getElementById('zoomOut')?.addEventListener('click', zoomOut);
    document.getElementById('zoomFit')?.addEventListener('click', zoomFit);
    
    // Shortcuts Modal
    document.getElementById('closeShortcuts')?.addEventListener('click', closeModal);
    elements.shortcutsModal?.addEventListener('click', (e) => {
        if (e.target === elements.shortcutsModal) closeModal();
    });
    
    // Follow Modal
    document.getElementById('continueAction')?.addEventListener('click', executePendingAction);
    elements.followModal?.addEventListener('click', (e) => {
        // Don't close on backdrop click - force interaction
    });
    
    // Track clicks on follow buttons - mark as followed and execute action
    document.querySelectorAll('.follow-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // User clicked a social link - they engaged!
            markAsFollowed();
            // Let the link open, then execute action
            setTimeout(() => {
                // Action already executed by markAsFollowed
            }, 100);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

function handleKeyboard(e) {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
    }
    
    const key = e.key.toLowerCase();
    const action = CONFIG.shortcuts[key] || CONFIG.shortcuts[e.key];
    
    if (action) {
        e.preventDefault();
        
        if (typeof action === 'function') {
            action();
        } else {
            switch (action) {
                case 'toggleTheme': toggleTheme(); break;
                case 'print': printPaper(); break;
                case 'generate': generatePaper(); break;
                case 'downloadPng': downloadPng(); break;
                case 'downloadSvg': downloadSvg(); break;
                case 'showShortcuts': showShortcuts(); break;
                case 'closeModal': closeModal(); break;
            }
        }
    }
}

// ==========================================================================
// Initialization
// ==========================================================================

function init() {
    // Cache DOM elements
    cacheElements();
    
    // Initialize theme
    initTheme();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update dimension display
    updateDimensionsDisplay();
    
    // Generate initial paper
    generatePaper();
    
    console.log('📝 Line Paper Generator Pro initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generatePaper,
        selectPaperType,
        downloadPng,
        downloadSvg,
        printPaper
    };
}
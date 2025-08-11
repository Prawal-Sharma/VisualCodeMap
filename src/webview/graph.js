// Graph visualization using D3.js
import * as d3 from 'd3';

// Global variables
let graphData = { nodes: [], edges: [] };
let simulation;
let svg;
let g;
let link;
let node;
let nodeLabels;
let vscode;
let zoom; // Store zoom behavior globally
let minimapSvg;
let minimapG;
let minimapViewport;

// Initialize VS Code API and data
export function initialize(vscodeApi, initialData) {
    vscode = vscodeApi;
    graphData = initialData || { nodes: [], edges: [] };
    initGraph();
    setupEventListeners();
}

// Dimensions
function getWidth() {
    return window.innerWidth - 300;
}

function getHeight() {
    return window.innerHeight - 60;
}

// Color scale based on file type
const colorScale = {
    'file': '#3178c6',
    'directory': '#868e96',
    'external': '#ff6b6b',
    'entry': '#51cf66',
    'orphaned': '#ff6b6b'
};

// Initialize the graph
function initGraph() {
    const width = getWidth();
    const height = getHeight();
    
    // Clear existing SVG
    d3.select('#graph').selectAll('*').remove();
    
    svg = d3.select('#graph')
        .attr('width', width)
        .attr('height', height);
    
    // Add zoom behavior
    zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
            updateMinimapViewport();
        });
    
    svg.call(zoom);
    
    // Container for graph elements
    g = svg.append('g');
    
    // Add arrow markers for directed edges
    svg.append('defs').selectAll('marker')
        .data(['arrow'])
        .enter().append('marker')
        .attr('id', d => d)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#999');
    
    // Create force simulation
    simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(30));
    
    updateGraph();
    initMinimap();
}

// Initialize minimap
function initMinimap() {
    const minimapContainer = document.getElementById('minimap');
    if (!minimapContainer) return;
    
    minimapSvg = d3.select('#minimap-svg');
    minimapG = minimapSvg.append('g');
    
    // Create viewport indicator
    minimapViewport = minimapSvg.append('rect')
        .attr('class', 'minimap-viewport')
        .attr('fill', 'none')
        .attr('stroke', '#3794ff')
        .attr('stroke-width', 2)
        .attr('stroke-opacity', 0.5)
        .attr('fill-opacity', 0.1)
        .attr('fill', '#3794ff');
    
    // Make minimap interactive
    minimapSvg.on('click', function(event) {
        const [x, y] = d3.pointer(event);
        const minimapWidth = 200;
        const minimapHeight = 150;
        const mainWidth = getWidth();
        const mainHeight = getHeight();
        
        // Calculate scale factor
        const scaleX = mainWidth / minimapWidth;
        const scaleY = mainHeight / minimapHeight;
        
        // Center main view on clicked position
        const centerX = x * scaleX;
        const centerY = y * scaleY;
        
        // Apply transform to center on clicked position
        svg.transition()
            .duration(500)
            .call(zoom.transform, d3.zoomIdentity.translate(mainWidth/2 - centerX, mainHeight/2 - centerY));
    });
    
    updateMinimap();
}

// Update minimap
function updateMinimap() {
    if (!minimapG) return;
    
    const minimapWidth = 200;
    const minimapHeight = 150;
    const mainWidth = getWidth();
    const mainHeight = getHeight();
    
    // Calculate scale to fit graph in minimap
    const scale = Math.min(minimapWidth / mainWidth, minimapHeight / mainHeight) * 0.8;
    
    // Clear existing minimap content
    minimapG.selectAll('*').remove();
    
    // Draw minimap nodes
    minimapG.selectAll('.minimap-node')
        .data(graphData.nodes)
        .enter().append('circle')
        .attr('class', 'minimap-node')
        .attr('cx', d => (d.x || 0) * scale)
        .attr('cy', d => (d.y || 0) * scale)
        .attr('r', 2)
        .attr('fill', d => d.color || '#868e96');
    
    // Draw minimap links
    minimapG.selectAll('.minimap-link')
        .data(graphData.edges)
        .enter().append('line')
        .attr('class', 'minimap-link')
        .attr('x1', d => {
            const sourceNode = graphData.nodes.find(n => n.id === (d.source.id || d.source));
            return (sourceNode?.x || 0) * scale;
        })
        .attr('y1', d => {
            const sourceNode = graphData.nodes.find(n => n.id === (d.source.id || d.source));
            return (sourceNode?.y || 0) * scale;
        })
        .attr('x2', d => {
            const targetNode = graphData.nodes.find(n => n.id === (d.target.id || d.target));
            return (targetNode?.x || 0) * scale;
        })
        .attr('y2', d => {
            const targetNode = graphData.nodes.find(n => n.id === (d.target.id || d.target));
            return (targetNode?.y || 0) * scale;
        })
        .attr('stroke', '#666')
        .attr('stroke-width', 0.5)
        .attr('stroke-opacity', 0.3);
    
    // Center minimap content
    const bounds = minimapG.node()?.getBBox();
    if (bounds) {
        const dx = minimapWidth / 2 - (bounds.x + bounds.width / 2);
        const dy = minimapHeight / 2 - (bounds.y + bounds.height / 2);
        minimapG.attr('transform', `translate(${dx}, ${dy})`);
    }
    
    updateMinimapViewport();
}

// Update minimap viewport indicator
function updateMinimapViewport() {
    if (!minimapViewport || !zoom) return;
    
    const transform = d3.zoomTransform(svg.node());
    const minimapWidth = 200;
    const minimapHeight = 150;
    const mainWidth = getWidth();
    const mainHeight = getHeight();
    
    // Calculate viewport dimensions in minimap scale
    const scale = Math.min(minimapWidth / mainWidth, minimapHeight / mainHeight) * 0.8;
    const viewportWidth = (mainWidth / transform.k) * scale;
    const viewportHeight = (mainHeight / transform.k) * scale;
    
    // Calculate viewport position
    const viewportX = minimapWidth / 2 - (transform.x / transform.k) * scale - viewportWidth / 2;
    const viewportY = minimapHeight / 2 - (transform.y / transform.k) * scale - viewportHeight / 2;
    
    minimapViewport
        .attr('x', viewportX)
        .attr('y', viewportY)
        .attr('width', viewportWidth)
        .attr('height', viewportHeight);
}

// Update graph with new data
function updateGraph() {
    // Prepare nodes and links
    const nodes = graphData.nodes.map(d => Object.assign({}, d));
    const links = graphData.edges.map(d => ({
        source: d.source,
        target: d.target,
        type: d.type,
        weight: d.weight || 1
    }));
    
    // Clear existing elements
    g.selectAll('.link').remove();
    g.selectAll('.node').remove();
    g.selectAll('.node-label').remove();
    
    // Add links with enhanced visualization
    link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('class', d => `link link-${d.type}`)
        .attr('stroke', d => {
            // Color based on dependency type
            const typeColors = {
                'import': '#3178c6',
                'dynamic': '#ff6b6b',
                'require': '#51cf66',
                'type-only': '#868e96'
            };
            return typeColors[d.type] || '#999';
        })
        .attr('stroke-opacity', d => {
            // Opacity based on weight
            return Math.min(0.3 + (d.weight * 0.1), 0.9);
        })
        .attr('stroke-width', d => {
            // Width based on weight (number of imports)
            return Math.min(Math.sqrt(d.weight) * 2, 8);
        })
        .attr('stroke-dasharray', d => {
            // Dashed line for dynamic imports
            return d.type === 'dynamic' ? '5,5' : null;
        })
        .attr('marker-end', 'url(#arrow)')
        .on('mouseover', function(event, d) {
            // Show tooltip with dependency details
            const sourceNode = graphData.nodes.find(n => n.id === (d.source.id || d.source));
            const targetNode = graphData.nodes.find(n => n.id === (d.target.id || d.target));
            
            const tooltip = d3.select('body').append('div')
                .attr('class', 'link-tooltip')
                .style('position', 'absolute')
                .style('padding', '8px')
                .style('background', 'var(--vscode-editorWidget-background, #252526)')
                .style('border', '1px solid var(--vscode-widget-border, #454545)')
                .style('border-radius', '3px')
                .style('font-size', '12px')
                .style('pointer-events', 'none')
                .style('z-index', '1000')
                .style('left', event.pageX + 10 + 'px')
                .style('top', event.pageY - 10 + 'px')
                .html(`
                    <strong>${sourceNode?.label || 'Unknown'}</strong> → <strong>${targetNode?.label || 'Unknown'}</strong><br>
                    Type: ${d.type}<br>
                    Import count: ${d.weight}
                `);
            
            // Highlight the link
            d3.select(this)
                .attr('stroke-width', d => Math.min(Math.sqrt(d.weight) * 3, 12))
                .attr('stroke-opacity', 1);
        })
        .on('mouseout', function(event, d) {
            // Remove tooltip
            d3.selectAll('.link-tooltip').remove();
            
            // Reset link style
            d3.select(this)
                .attr('stroke-width', d => Math.min(Math.sqrt(d.weight) * 2, 8))
                .attr('stroke-opacity', d => Math.min(0.3 + (d.weight * 0.1), 0.9));
        });
    
    // Add nodes
    const nodeGroup = g.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nodes)
        .enter().append('g')
        .attr('class', 'node-group')
        .call(drag(simulation));
    
    node = nodeGroup.append('circle')
        .attr('class', 'node')
        .attr('r', 10)
        .attr('fill', d => colorScale[d.type] || '#868e96')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .on('click', handleNodeClick)
        .on('mouseover', handleNodeHover)
        .on('mouseout', handleNodeLeave);
    
    nodeLabels = nodeGroup.append('text')
        .attr('class', 'node-label')
        .attr('dx', 15)
        .attr('dy', 5)
        .text(d => d.label)
        .style('font-size', '12px')
        .style('pointer-events', 'none');
    
    // Add tooltips
    nodeGroup.append('title')
        .text(d => `${d.path}\nType: ${d.type}`);
    
    // Update simulation
    simulation.nodes(nodes)
        .on('tick', ticked);
    
    simulation.force('link')
        .links(links);
    
    simulation.alpha(1).restart();
}

// Drag behavior
function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
}

// Update positions on tick
function ticked() {
    link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
    
    node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);
    
    nodeLabels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    
    // Update minimap periodically (not every tick for performance)
    if (simulation.alpha() > 0.3 || simulation.alpha() < 0.01) {
        updateMinimap();
    }
}

// Handle node click
function handleNodeClick(event, d) {
    event.stopPropagation();
    vscode.postMessage({
        command: 'openFile',
        filePath: d.id
    });
    highlightConnected(d);
}

// Handle node hover
function handleNodeHover(event, d) {
    // Update info panel
    document.getElementById('node-info').innerHTML = `
        <strong>${d.label}</strong><br>
        Path: ${d.path}<br>
        Type: ${d.type}<br>
        Group: ${d.group || 'None'}
    `;
    
    // Highlight node
    d3.select(event.target)
        .transition()
        .duration(200)
        .attr('r', 15);
}

// Handle node leave
function handleNodeLeave(event, d) {
    d3.select(event.target)
        .transition()
        .duration(200)
        .attr('r', 10);
}

// Highlight connected nodes
function highlightConnected(selectedNode) {
    const connectedNodeIds = new Set();
    connectedNodeIds.add(selectedNode.id);
    
    // Find connected nodes
    graphData.edges.forEach(edge => {
        if (edge.source === selectedNode.id || edge.source.id === selectedNode.id) {
            connectedNodeIds.add(edge.target.id || edge.target);
        }
        if (edge.target === selectedNode.id || edge.target.id === selectedNode.id) {
            connectedNodeIds.add(edge.source.id || edge.source);
        }
    });
    
    // Update node opacity
    node.style('opacity', d => connectedNodeIds.has(d.id) ? 1 : 0.3);
    nodeLabels.style('opacity', d => connectedNodeIds.has(d.id) ? 1 : 0.3);
    link.style('opacity', d => {
        const sourceId = d.source.id || d.source;
        const targetId = d.target.id || d.target;
        return (sourceId === selectedNode.id || targetId === selectedNode.id) ? 1 : 0.1;
    });
}

// Reset highlighting
function resetHighlight() {
    node.style('opacity', 1);
    nodeLabels.style('opacity', 1);
    link.style('opacity', 0.6);
}

// Search functionality with regex support
function searchNodes(query) {
    if (!query) {
        resetHighlight();
        updateSearchResults([]);
        return;
    }
    
    let matchingNodes = [];
    let searchRegex;
    
    // Try to create regex from query (support for advanced search)
    try {
        // Check if query looks like a regex (starts with /)
        if (query.startsWith('/') && query.includes('/', 1)) {
            const regexMatch = query.match(/^\/(.+)\/([gimuy]*)$/);
            if (regexMatch) {
                searchRegex = new RegExp(regexMatch[1], regexMatch[2]);
            } else {
                searchRegex = new RegExp(query.slice(1), 'i');
            }
        } else {
            // Normal text search - escape special regex characters
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            searchRegex = new RegExp(escapedQuery, 'i');
        }
    } catch (e) {
        // Fallback to simple string matching if regex is invalid
        const lowerQuery = query.toLowerCase();
        searchRegex = {
            test: (str) => str.toLowerCase().includes(lowerQuery)
        };
    }
    
    // Find matching nodes
    graphData.nodes.forEach(d => {
        const matches = searchRegex.test(d.label) || 
                       searchRegex.test(d.path) || 
                       searchRegex.test(d.group || '');
        if (matches) {
            matchingNodes.push(d);
        }
    });
    
    // Update visual highlighting
    if (node) {
        node.style('opacity', d => matchingNodes.includes(d) ? 1 : 0.1)
            .style('stroke-width', d => matchingNodes.includes(d) ? 3 : 2)
            .style('stroke', d => matchingNodes.includes(d) ? '#ffd43b' : '#fff');
    }
    
    if (nodeLabels) {
        nodeLabels.style('opacity', d => matchingNodes.includes(d) ? 1 : 0.1)
                  .style('font-weight', d => matchingNodes.includes(d) ? 'bold' : 'normal');
    }
    
    if (link) {
        link.style('opacity', 0.05);
    }
    
    // Update search results panel
    updateSearchResults(matchingNodes);
}

// Update search results panel
function updateSearchResults(results) {
    const searchResultsDiv = document.getElementById('search-results');
    if (!searchResultsDiv) {
        // Create search results div if it doesn't exist
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            const div = document.createElement('div');
            div.id = 'search-results';
            div.innerHTML = '<h3>Search Results</h3><div id="search-results-list"></div>';
            infoPanel.insertBefore(div, infoPanel.children[2]);
        }
    }
    
    const resultsList = document.getElementById('search-results-list');
    if (resultsList) {
        if (results.length === 0) {
            resultsList.innerHTML = '<em>No matches found</em>';
        } else {
            resultsList.innerHTML = `
                <div>Found ${results.length} matches:</div>
                ${results.slice(0, 10).map(r => `
                    <div class="search-result-item" data-node-id="${r.id}" style="cursor: pointer; padding: 4px; margin: 2px 0; border-radius: 3px;">
                        • ${r.label}
                    </div>
                `).join('')}
                ${results.length > 10 ? `<div><em>... and ${results.length - 10} more</em></div>` : ''}
            `;
            
            // Add click handlers to search results
            resultsList.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const nodeId = item.getAttribute('data-node-id');
                    const node = graphData.nodes.find(n => n.id === nodeId);
                    if (node) {
                        centerOnNode(node);
                        highlightConnected(node);
                    }
                });
                item.addEventListener('mouseenter', (e) => {
                    e.target.style.background = 'var(--vscode-list-hoverBackground, #2a2d2e)';
                });
                item.addEventListener('mouseleave', (e) => {
                    e.target.style.background = '';
                });
            });
        }
    }
}

// Center view on a specific node
function centerOnNode(targetNode) {
    const width = getWidth();
    const height = getHeight();
    
    // Calculate the transform to center the node
    const scale = 1.5; // Zoom in slightly
    const x = width / 2 - targetNode.x * scale;
    const y = height / 2 - targetNode.y * scale;
    
    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
}

// Layout change
function changeLayout(layoutType) {
    switch(layoutType) {
        case 'hierarchical':
            applyHierarchicalLayout();
            break;
        case 'circular':
            applyCircularLayout();
            break;
        default:
            simulation.alpha(1).restart();
    }
}

// Apply hierarchical layout
function applyHierarchicalLayout() {
    const width = getWidth();
    const height = getHeight();
    
    simulation.stop();
    
    // Group nodes by directory depth
    const nodesByDepth = new Map();
    let maxDepth = 0;
    
    graphData.nodes.forEach(node => {
        const depth = (node.path.match(/\//g) || []).length;
        maxDepth = Math.max(maxDepth, depth);
        
        if (!nodesByDepth.has(depth)) {
            nodesByDepth.set(depth, []);
        }
        nodesByDepth.get(depth).push(node);
    });
    
    // Calculate positions based on hierarchy
    const levelHeight = height / (maxDepth + 2);
    const positions = new Map();
    
    for (let depth = 0; depth <= maxDepth; depth++) {
        const nodesAtDepth = nodesByDepth.get(depth) || [];
        const levelWidth = width / (nodesAtDepth.length + 1);
        
        nodesAtDepth.forEach((node, index) => {
            positions.set(node.id, {
                x: levelWidth * (index + 1),
                y: levelHeight * (depth + 1)
            });
        });
    }
    
    // Apply positions with animation
    if (node) {
        node.transition()
            .duration(750)
            .attr('cx', d => {
                const pos = positions.get(d.id);
                if (pos) {
                    d.x = pos.x;
                    return pos.x;
                }
                return d.x;
            })
            .attr('cy', d => {
                const pos = positions.get(d.id);
                if (pos) {
                    d.y = pos.y;
                    return pos.y;
                }
                return d.y;
            });
    }
    
    if (nodeLabels) {
        nodeLabels.transition()
            .duration(750)
            .attr('x', d => {
                const pos = positions.get(d.id);
                return pos ? pos.x : d.x;
            })
            .attr('y', d => {
                const pos = positions.get(d.id);
                return pos ? pos.y : d.y;
            });
    }
    
    // Update links
    if (link) {
        link.transition()
            .duration(750)
            .attr('x1', d => {
                const sourceNode = graphData.nodes.find(n => n.id === (d.source.id || d.source));
                const pos = positions.get(sourceNode?.id);
                return pos ? pos.x : d.source.x;
            })
            .attr('y1', d => {
                const sourceNode = graphData.nodes.find(n => n.id === (d.source.id || d.source));
                const pos = positions.get(sourceNode?.id);
                return pos ? pos.y : d.source.y;
            })
            .attr('x2', d => {
                const targetNode = graphData.nodes.find(n => n.id === (d.target.id || d.target));
                const pos = positions.get(targetNode?.id);
                return pos ? pos.x : d.target.x;
            })
            .attr('y2', d => {
                const targetNode = graphData.nodes.find(n => n.id === (d.target.id || d.target));
                const pos = positions.get(targetNode?.id);
                return pos ? pos.y : d.target.y;
            });
    }
}

// Apply circular layout
function applyCircularLayout() {
    const width = getWidth();
    const height = getHeight();
    const radius = Math.min(width, height) / 3;
    const angleStep = (2 * Math.PI) / graphData.nodes.length;
    
    simulation.stop();
    
    // Store positions for link updates
    const positions = new Map();
    graphData.nodes.forEach((node, i) => {
        positions.set(node.id, {
            x: width / 2 + radius * Math.cos(i * angleStep),
            y: height / 2 + radius * Math.sin(i * angleStep)
        });
    });
    
    // Update nodes
    if (node) {
        node.transition()
            .duration(750)
            .attr('cx', (d, i) => {
                const pos = positions.get(d.id);
                if (pos) {
                    d.x = pos.x;
                    return pos.x;
                }
                return width / 2 + radius * Math.cos(i * angleStep);
            })
            .attr('cy', (d, i) => {
                const pos = positions.get(d.id);
                if (pos) {
                    d.y = pos.y;
                    return pos.y;
                }
                return height / 2 + radius * Math.sin(i * angleStep);
            });
    }
    
    // Update labels
    if (nodeLabels) {
        nodeLabels.transition()
            .duration(750)
            .attr('x', (d, i) => {
                const pos = positions.get(d.id);
                return pos ? pos.x : width / 2 + radius * Math.cos(i * angleStep);
            })
            .attr('y', (d, i) => {
                const pos = positions.get(d.id);
                return pos ? pos.y : height / 2 + radius * Math.sin(i * angleStep);
            });
    }
    
    // Update links
    if (link) {
        link.transition()
            .duration(750)
            .attr('x1', d => {
                const sourceNode = graphData.nodes.find(n => n.id === (d.source.id || d.source));
                const pos = positions.get(sourceNode?.id);
                return pos ? pos.x : d.source.x;
            })
            .attr('y1', d => {
                const sourceNode = graphData.nodes.find(n => n.id === (d.source.id || d.source));
                const pos = positions.get(sourceNode?.id);
                return pos ? pos.y : d.source.y;
            })
            .attr('x2', d => {
                const targetNode = graphData.nodes.find(n => n.id === (d.target.id || d.target));
                const pos = positions.get(targetNode?.id);
                return pos ? pos.x : d.target.x;
            })
            .attr('y2', d => {
                const targetNode = graphData.nodes.find(n => n.id === (d.target.id || d.target));
                const pos = positions.get(targetNode?.id);
                return pos ? pos.y : d.target.y;
            });
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Check if a text input is focused
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            return; // Don't handle shortcuts when typing in input
        }
        
        // Handle keyboard shortcuts
        switch(event.key) {
            case '+':
            case '=':
                // Zoom in
                svg.transition().duration(350).call(zoom.scaleBy, 1.3);
                event.preventDefault();
                break;
            case '-':
            case '_':
                // Zoom out
                svg.transition().duration(350).call(zoom.scaleBy, 0.7);
                event.preventDefault();
                break;
            case '0':
                // Reset zoom
                svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity);
                resetHighlight();
                event.preventDefault();
                break;
            case 'f':
                if (event.ctrlKey || event.metaKey) {
                    // Focus search
                    document.getElementById('search').focus();
                    event.preventDefault();
                }
                break;
            case 'l':
                // Cycle through layouts
                const layoutSelect = document.getElementById('layout');
                const currentIndex = layoutSelect.selectedIndex;
                const nextIndex = (currentIndex + 1) % layoutSelect.options.length;
                layoutSelect.selectedIndex = nextIndex;
                changeLayout(layoutSelect.value);
                event.preventDefault();
                break;
            case 'e':
                // Export
                showExportOptions();
                event.preventDefault();
                break;
            case 'r':
                // Refresh
                vscode.postMessage({ command: 'refresh' });
                event.preventDefault();
                break;
            case 'Escape':
                // Clear search and reset highlights
                document.getElementById('search').value = '';
                resetHighlight();
                updateSearchResults([]);
                event.preventDefault();
                break;
            case 'h':
                // Show help
                showHelpDialog();
                event.preventDefault();
                break;
        }
    });
}

// Show help dialog
function showHelpDialog() {
    const dialog = document.createElement('div');
    dialog.id = 'help-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--vscode-editorWidget-background, #252526);
        border: 1px solid var(--vscode-widget-border, #454545);
        border-radius: 4px;
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        max-width: 500px;
    `;
    
    dialog.innerHTML = `
        <h3 style="margin-top: 0;">Keyboard Shortcuts</h3>
        <div style="margin: 15px 0; line-height: 1.8;">
            <div><kbd>+</kbd> / <kbd>=</kbd> - Zoom In</div>
            <div><kbd>-</kbd> - Zoom Out</div>
            <div><kbd>0</kbd> - Reset Zoom</div>
            <div><kbd>Ctrl/Cmd + F</kbd> - Focus Search</div>
            <div><kbd>L</kbd> - Cycle Layouts</div>
            <div><kbd>E</kbd> - Export Graph</div>
            <div><kbd>R</kbd> - Refresh</div>
            <div><kbd>Esc</kbd> - Clear Search</div>
            <div><kbd>H</kbd> - Show This Help</div>
        </div>
        <h3>Search Tips</h3>
        <div style="margin: 15px 0; line-height: 1.8;">
            <div>• Use regular expressions: <code>/\.tsx?$/</code></div>
            <div>• Search by path: <code>components/</code></div>
            <div>• Click search results to navigate</div>
        </div>
        <button id="help-close" style="padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 2px; cursor: pointer;">
            Close
        </button>
    `;
    
    document.body.appendChild(dialog);
    
    document.getElementById('help-close').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    
    // Close on Escape
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(dialog);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
        svg.transition()
            .duration(350)
            .call(zoom.scaleBy, 1.3);
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
        svg.transition()
            .duration(350)
            .call(zoom.scaleBy, 0.7);
    });
    
    document.getElementById('zoom-reset').addEventListener('click', () => {
        svg.transition()
            .duration(350)
            .call(zoom.transform, d3.zoomIdentity);
        resetHighlight();
    });
    
    document.getElementById('refresh').addEventListener('click', () => {
        vscode.postMessage({ command: 'refresh' });
    });
    
    document.getElementById('export').addEventListener('click', () => {
        showExportOptions();
    });
    
    document.getElementById('help').addEventListener('click', () => {
        showHelpDialog();
    });
    
    document.getElementById('search').addEventListener('input', (e) => {
        searchNodes(e.target.value);
    });
    
    document.getElementById('layout').addEventListener('change', (e) => {
        changeLayout(e.target.value);
    });
    
    document.getElementById('show-orphaned').addEventListener('change', (e) => {
        const showOrphaned = e.target.checked;
        
        // Hide/show orphaned nodes
        if (node) {
            node.style('visibility', d => 
                (!showOrphaned && d.type === 'orphaned') ? 'hidden' : 'visible'
            );
        }
        
        if (nodeLabels) {
            nodeLabels.style('visibility', d => 
                (!showOrphaned && d.type === 'orphaned') ? 'hidden' : 'visible'
            );
        }
        
        // Also hide links connected to orphaned nodes
        if (link) {
            link.style('visibility', d => {
                const sourceOrphaned = graphData.nodes.find(n => n.id === (d.source.id || d.source))?.type === 'orphaned';
                const targetOrphaned = graphData.nodes.find(n => n.id === (d.target.id || d.target))?.type === 'orphaned';
                return (!showOrphaned && (sourceOrphaned || targetOrphaned)) ? 'hidden' : 'visible';
            });
        }
    });
    
    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'update':
                graphData = message.data;
                updateGraph();
                // Update stats
                document.getElementById('total-files').textContent = graphData.metadata.totalFiles;
                document.getElementById('total-deps').textContent = graphData.metadata.totalDependencies;
                document.getElementById('circular-deps').textContent = graphData.metadata.circularDependencies;
                document.getElementById('orphaned-files').textContent = graphData.metadata.orphanedFiles;
                break;
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = getWidth();
        const newHeight = getHeight();
        svg.attr('width', newWidth).attr('height', newHeight);
        simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
        simulation.alpha(0.3).restart();
    });
}

// Export functionality
function showExportOptions() {
    // Create export dialog
    const dialog = document.createElement('div');
    dialog.id = 'export-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--vscode-editorWidget-background, #252526);
        border: 1px solid var(--vscode-widget-border, #454545);
        border-radius: 4px;
        padding: 20px;
        z-index: 10000;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
    `;
    
    dialog.innerHTML = `
        <h3 style="margin-top: 0;">Export Graph</h3>
        <div style="margin: 15px 0;">
            <button id="export-svg" style="margin-right: 10px; padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 2px; cursor: pointer;">
                Export as SVG
            </button>
            <button id="export-png" style="margin-right: 10px; padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 2px; cursor: pointer;">
                Export as PNG
            </button>
            <button id="export-json" style="margin-right: 10px; padding: 8px 16px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 2px; cursor: pointer;">
                Export as JSON
            </button>
        </div>
        <button id="export-cancel" style="padding: 8px 16px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); border: none; border-radius: 2px; cursor: pointer;">
            Cancel
        </button>
    `;
    
    document.body.appendChild(dialog);
    
    // Add event handlers
    document.getElementById('export-svg').addEventListener('click', () => {
        exportAsSVG();
        document.body.removeChild(dialog);
    });
    
    document.getElementById('export-png').addEventListener('click', () => {
        exportAsPNG();
        document.body.removeChild(dialog);
    });
    
    document.getElementById('export-json').addEventListener('click', () => {
        exportAsJSON();
        document.body.removeChild(dialog);
    });
    
    document.getElementById('export-cancel').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
}

function exportAsSVG() {
    // Clone the SVG element
    const svgElement = svg.node();
    const svgClone = svgElement.cloneNode(true);
    
    // Add styles to the clone
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .node { cursor: pointer; }
        .link { stroke-opacity: 0.6; }
        .node-label { font-family: sans-serif; font-size: 12px; }
    `;
    svgClone.insertBefore(styleElement, svgClone.firstChild);
    
    // Serialize to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    
    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'code-map.svg';
    link.click();
    URL.revokeObjectURL(url);
    
    vscode.postMessage({ 
        command: 'log', 
        text: 'Graph exported as SVG' 
    });
}

function exportAsPNG() {
    const svgElement = svg.node();
    const { width, height } = svgElement.getBoundingClientRect();
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width * 2; // Higher resolution
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    
    // Set background
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create image from SVG
    const svgClone = svgElement.cloneNode(true);
    svgClone.setAttribute('width', width * 2);
    svgClone.setAttribute('height', height * 2);
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(svgUrl);
        
        // Convert to PNG and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'code-map.png';
            link.click();
            URL.revokeObjectURL(url);
            
            vscode.postMessage({ 
                command: 'log', 
                text: 'Graph exported as PNG' 
            });
        }, 'image/png');
    };
    img.src = svgUrl;
}

function exportAsJSON() {
    // Prepare export data
    const exportData = {
        metadata: graphData.metadata,
        nodes: graphData.nodes.map(n => ({
            id: n.id,
            label: n.label,
            path: n.path,
            type: n.type,
            group: n.group,
            color: n.color
        })),
        edges: graphData.edges.map(e => ({
            source: typeof e.source === 'object' ? e.source.id : e.source,
            target: typeof e.target === 'object' ? e.target.id : e.target,
            type: e.type,
            weight: e.weight
        })),
        timestamp: new Date().toISOString()
    };
    
    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'code-map.json';
    link.click();
    URL.revokeObjectURL(url);
    
    vscode.postMessage({ 
        command: 'log', 
        text: 'Graph data exported as JSON' 
    });
}

// Initialize when the script loads
if (typeof window !== 'undefined' && window.vscode && window.initialData) {
    initialize(window.vscode, window.initialData);
}
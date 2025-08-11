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
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
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
    
    // Add links
    link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter().append('line')
        .attr('class', 'link')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .attr('stroke-width', d => Math.sqrt(d.weight))
        .attr('marker-end', 'url(#arrow)');
    
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

// Search functionality
function searchNodes(query) {
    if (!query) {
        resetHighlight();
        return;
    }
    
    const lowerQuery = query.toLowerCase();
    node.style('opacity', d => 
        d.label.toLowerCase().includes(lowerQuery) || 
        d.path.toLowerCase().includes(lowerQuery) ? 1 : 0.1
    );
    nodeLabels.style('opacity', d => 
        d.label.toLowerCase().includes(lowerQuery) || 
        d.path.toLowerCase().includes(lowerQuery) ? 1 : 0.1
    );
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
    
    const hierarchy = d3.stratify()
        .id(d => d.id)
        .parentId(d => {
            // Find parent based on path
            const parts = d.path.split('/');
            if (parts.length <= 1) return null;
            parts.pop();
            return graphData.nodes.find(n => n.path === parts.join('/'))?.id;
        });
    
    try {
        const root = hierarchy(graphData.nodes);
        const treeLayout = d3.tree().size([width - 100, height - 100]);
        treeLayout(root);
        
        simulation.stop();
        
        node.transition()
            .duration(750)
            .attr('cx', d => {
                const found = root.descendants().find(n => n.id === d.id);
                return found ? found.x + 50 : d.x;
            })
            .attr('cy', d => {
                const found = root.descendants().find(n => n.id === d.id);
                return found ? found.y + 50 : d.y;
            });
    } catch (error) {
        console.warn('Cannot apply hierarchical layout:', error);
    }
}

// Apply circular layout
function applyCircularLayout() {
    const width = getWidth();
    const height = getHeight();
    const radius = Math.min(width, height) / 3;
    const angleStep = (2 * Math.PI) / graphData.nodes.length;
    
    simulation.stop();
    
    node.transition()
        .duration(750)
        .attr('cx', (d, i) => width / 2 + radius * Math.cos(i * angleStep))
        .attr('cy', (d, i) => height / 2 + radius * Math.sin(i * angleStep));
}

// Setup event listeners
function setupEventListeners() {
    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
        svg.transition().call(
            d3.zoom().scaleBy,
            1.3
        );
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
        svg.transition().call(
            d3.zoom().scaleBy,
            0.7
        );
    });
    
    document.getElementById('zoom-reset').addEventListener('click', () => {
        svg.transition().call(
            d3.zoom().transform,
            d3.zoomIdentity
        );
        resetHighlight();
    });
    
    document.getElementById('refresh').addEventListener('click', () => {
        vscode.postMessage({ command: 'refresh' });
    });
    
    document.getElementById('export').addEventListener('click', () => {
        vscode.postMessage({ command: 'export' });
    });
    
    document.getElementById('search').addEventListener('input', (e) => {
        searchNodes(e.target.value);
    });
    
    document.getElementById('layout').addEventListener('change', (e) => {
        changeLayout(e.target.value);
    });
    
    document.getElementById('show-orphaned').addEventListener('change', (e) => {
        const showOrphaned = e.target.checked;
        node.style('display', d => 
            (!showOrphaned && d.type === 'orphaned') ? 'none' : 'block'
        );
        nodeLabels.style('display', d => 
            (!showOrphaned && d.type === 'orphaned') ? 'none' : 'block'
        );
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

// Initialize when the script loads
if (typeof window !== 'undefined' && window.vscode && window.initialData) {
    initialize(window.vscode, window.initialData);
}
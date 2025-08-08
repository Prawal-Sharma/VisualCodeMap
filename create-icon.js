const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a 128x128 canvas
const canvas = createCanvas(128, 128);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#1e1e1e';
ctx.fillRect(0, 0, 128, 128);

// Draw nodes and connections to represent a code map
ctx.strokeStyle = '#007ACC';
ctx.lineWidth = 2;

// Draw connections
ctx.beginPath();
ctx.moveTo(30, 30);
ctx.lineTo(64, 50);
ctx.moveTo(98, 30);
ctx.lineTo(64, 50);
ctx.moveTo(64, 50);
ctx.lineTo(40, 90);
ctx.moveTo(64, 50);
ctx.lineTo(88, 90);
ctx.stroke();

// Draw nodes
ctx.fillStyle = '#007ACC';
// Top left node
ctx.beginPath();
ctx.arc(30, 30, 8, 0, Math.PI * 2);
ctx.fill();

// Top right node
ctx.beginPath();
ctx.arc(98, 30, 8, 0, Math.PI * 2);
ctx.fill();

// Center node (larger)
ctx.fillStyle = '#40E0D0';
ctx.beginPath();
ctx.arc(64, 50, 10, 0, Math.PI * 2);
ctx.fill();

// Bottom left node
ctx.fillStyle = '#007ACC';
ctx.beginPath();
ctx.arc(40, 90, 8, 0, Math.PI * 2);
ctx.fill();

// Bottom right node
ctx.beginPath();
ctx.arc(88, 90, 8, 0, Math.PI * 2);
ctx.fill();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('/Users/prawalsharma/Desktop/Pers/VisualCodeMap/resources/icon.png', buffer);
console.log('Icon created successfully');
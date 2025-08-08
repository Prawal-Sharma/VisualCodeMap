import React from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
    return (
        <div className="app">
            <h1>Visual Code Map</h1>
            <div id="graph-container">
                Graph will be rendered here
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
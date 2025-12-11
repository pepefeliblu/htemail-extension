import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';

const Popup = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">HTEMAIL</h1>
            <p className="text-gray-600 mb-4">Visual Email Builder</p>
            <a
                href="https://github.com/HTEMAIL/htemail-extension"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline"
            >
                Project on GitHub
            </a>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);

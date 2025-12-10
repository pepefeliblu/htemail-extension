import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';

const Popup = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold text-blue-600">HTEMAIL</h1>
            <p className="mt-2 text-gray-600">Visual Email Builder</p>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);

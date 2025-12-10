import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';

const Editor = () => {
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold">Editor Placeholder</h1>
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Editor />
    </React.StrictMode>
);

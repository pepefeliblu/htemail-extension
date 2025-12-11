import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import Editor from './components/Editor';
import { MilkdownProvider } from '@milkdown/react';

const App = () => {
    return (
        <MilkdownProvider>
            <div className="h-full w-full overflow-hidden bg-white">
                <Editor />
            </div>
        </MilkdownProvider>
    );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.scss';

const App = () => {
    return (
        <div>
            Hi
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('file-explorer-root')!);
root.render(<App />);

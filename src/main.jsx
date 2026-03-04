import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**5.** Click **"Commit new file"**

---

## Then create index.css:

**1.** Click **"Add file"** → **"Create new file"**

**2.** In filename box type:
```
src/index.css

* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0d14; color: #e8eaf0; }

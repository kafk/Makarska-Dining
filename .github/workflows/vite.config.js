import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Makarska-Dining/',
})
```

**2. Add the workflow file**

Click into the `.github` folder and create a `workflows` folder inside it (if it doesn't exist), then add `deploy.yml` inside that:
```
.github/
  workflows/
    deploy.yml   ← put the file here

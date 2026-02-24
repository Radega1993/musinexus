# Estructura del Proyecto

```
.
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   └── app
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── docker-compose.yml
├── eslint.config.mjs
├── .gitignore
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json

4 directories, 19 files
```

## Descripción de Directorios

- **`public/`**: Archivos estáticos públicos (SVG, imágenes, etc.)
- **`src/app/`**: Código fuente de la aplicación Next.js (App Router)
  - `layout.tsx`: Layout principal de la aplicación
  - `page.tsx`: Página principal
  - `globals.css`: Estilos globales
  - `favicon.ico`: Icono de la aplicación

## Archivos de Configuración

- `docker-compose.yml`: Configuración de Docker Compose
- `eslint.config.mjs`: Configuración de ESLint
- `next.config.ts`: Configuración de Next.js
- `postcss.config.mjs`: Configuración de PostCSS
- `tsconfig.json`: Configuración de TypeScript
- `package.json`: Dependencias y scripts del proyecto
- `.gitignore`: Archivos y directorios ignorados por Git

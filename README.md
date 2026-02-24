# Musinexus

Aplicación web de música social construida con Next.js 16, TypeScript y Prisma.

## 🚀 Características

- **Framework**: Next.js 16.1.6 con App Router
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js con adaptador Prisma
- **Almacenamiento**: AWS S3 para archivos multimedia
- **Colas de Trabajo**: BullMQ con Redis
- **Logging**: Pino con formato legible
- **Validación**: Zod para validación de esquemas
- **Estilos**: Tailwind CSS v4
- **Procesamiento de Imágenes**: Sharp
- **Gestión de Cambios**: OpenSpec para especificaciones y planificación de features

## 📋 Requisitos Previos

- Node.js 20 o superior
- Docker y Docker Compose (para servicios de base de datos)
- npm, yarn, pnpm o bun
- OpenSpec CLI (instalado globalmente o disponible en el proyecto)

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd musinexus
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   # Base de datos
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/musinexus?schema=public"
   
   # NextAuth (configura según tus necesidades)
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="tu-secret-key-aqui"
   
   # AWS S3 (opcional, si usas almacenamiento en la nube)
   AWS_ACCESS_KEY_ID="tu-access-key"
   AWS_SECRET_ACCESS_KEY="tu-secret-key"
   AWS_REGION="us-east-1"
   AWS_S3_BUCKET_NAME="tu-bucket-name"
   
   # Redis (para colas de trabajo)
   REDIS_URL="redis://localhost:6379"
   ```

4. **Iniciar servicios con Docker Compose**
   ```bash
   docker-compose up -d
   ```
   
   Esto iniciará:
   - PostgreSQL en el puerto 5432
   - Redis en el puerto 6379

5. **Configurar la base de datos**
   ```bash
   # Generar el cliente de Prisma
   npx prisma generate
   
   # Ejecutar migraciones (cuando estén disponibles)
   npx prisma migrate dev
   
   # O abrir Prisma Studio para gestionar la base de datos
   npx prisma studio
   ```

## 🏃 Ejecución

### Modo Desarrollo
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### Modo Producción

1. **Construir la aplicación**
   ```bash
   npm run build
   ```

2. **Iniciar el servidor de producción**
   ```bash
   npm start
   ```

## 📁 Estructura del Proyecto

```
musinexus/
├── openspec/
│   ├── config.yaml            # Configuración de OpenSpec
│   ├── changes/               # Cambios activos en desarrollo
│   │   └── archive/          # Cambios completados y archivados
│   └── specs/                 # Especificaciones principales del proyecto
├── prisma/
│   ├── schema.prisma          # Schema de la base de datos
│   └── migrations/            # Migraciones de Prisma
├── public/                    # Archivos estáticos
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Página principal
│   │   └── globals.css        # Estilos globales
│   └── generated/
│       └── prisma/            # Cliente de Prisma generado
├── docker-compose.yml         # Configuración de servicios Docker
├── next.config.ts             # Configuración de Next.js
├── prisma.config.ts           # Configuración de Prisma
├── tsconfig.json              # Configuración de TypeScript
└── package.json               # Dependencias del proyecto
```

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint para verificar el código

## 🗄️ Base de Datos

El proyecto utiliza Prisma como ORM. El cliente de Prisma se genera en `src/generated/prisma`.

### Comandos útiles de Prisma:

```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear una nueva migración
npx prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Abrir Prisma Studio (interfaz visual)
npx prisma studio

# Resetear la base de datos (solo desarrollo)
npx prisma migrate reset
```

## 🔐 Autenticación

La autenticación está configurada con NextAuth.js y utiliza el adaptador de Prisma para almacenar sesiones y usuarios en la base de datos.

## 📦 Servicios Docker

El proyecto incluye un `docker-compose.yml` con los siguientes servicios:

- **PostgreSQL 16**: Base de datos principal
  - Puerto: 5432
  - Usuario: postgres
  - Contraseña: postgres
  - Base de datos: socialmusic

- **Redis 7**: Para colas de trabajo y caché
  - Puerto: 6379

Para detener los servicios:
```bash
docker-compose down
```

Para detener y eliminar los volúmenes (⚠️ esto eliminará los datos):
```bash
docker-compose down -v
```

## 🎨 Estilos

El proyecto utiliza Tailwind CSS v4 con soporte para modo oscuro. Los estilos globales se encuentran en `src/app/globals.css`.

## 📝 Validación

Se utiliza Zod para la validación de esquemas y tipos en tiempo de ejecución.

## 🔍 Logging

El proyecto utiliza Pino para logging estructurado. En desarrollo, puedes usar `pino-pretty` para logs más legibles.

## 📋 Gestión de Cambios con OpenSpec

Este proyecto utiliza [OpenSpec](https://openspec.dev) para gestionar cambios, especificaciones y planificación de features de manera estructurada. OpenSpec ayuda a mantener un flujo de trabajo organizado desde la propuesta hasta la implementación.

### Configuración

El proyecto está configurado con el schema `spec-driven`, que sigue el flujo:
1. **Proposal** - Propuesta inicial del cambio
2. **Specs** - Especificaciones técnicas detalladas
3. **Design** - Diseño de la solución
4. **Tasks** - Tareas de implementación

### Comandos de OpenSpec

#### Comandos básicos

```bash
# Ver el estado de OpenSpec
openspec status

# Listar todos los cambios activos
openspec list

# Ver el estado de un cambio específico
openspec status --change "<nombre-del-cambio>"
```

#### Crear un nuevo cambio

```bash
# Crear un nuevo cambio
openspec new change "<nombre-del-cambio>"

# Ver instrucciones para crear el primer artefacto
openspec instructions proposal --change "<nombre-del-cambio>"
```

#### Trabajar con cambios

```bash
# Continuar trabajando en un cambio existente
openspec instructions <artifact-id> --change "<nombre-del-cambio>"

# Verificar el estado de un cambio antes de implementar
openspec status --change "<nombre-del-cambio>" --json

# Obtener instrucciones para implementar tareas
openspec instructions apply --change "<nombre-del-cambio>"
```

#### Sincronizar especificaciones

Cuando un cambio incluye especificaciones delta que deben integrarse en las especificaciones principales:

```bash
# Sincronizar especificaciones delta con las principales
# (usar el comando /opsx:sync en Cursor o seguir el proceso manual)
```

#### Archivar cambios completados

```bash
# Archivar un cambio completado
openspec archive "<nombre-del-cambio>"
```

### Comandos de Cursor (OPSX)

El proyecto incluye comandos integrados en Cursor para trabajar con OpenSpec:

- `/opsx:new` - Crear un nuevo cambio
- `/opsx:onboard` - Guía interactiva para tu primer ciclo de OpenSpec
- `/opsx:continue` - Continuar trabajando en un cambio existente
- `/opsx:ff` - Fast-forward: crear todos los artefactos rápidamente
- `/opsx:apply` - Implementar las tareas de un cambio
- `/opsx:sync` - Sincronizar especificaciones delta con las principales
- `/opsx:archive` - Archivar un cambio completado
- `/opsx:verify` - Verificar el estado de un cambio
- `/opsx:explore` - Modo exploración (solo lectura, sin implementación)

### Estructura de un Cambio

Cada cambio se almacena en `openspec/changes/<nombre-del-cambio>/` y contiene:

- `proposal.md` - Propuesta inicial del cambio
- `design.md` - Diseño de la solución
- `tasks.md` - Lista de tareas de implementación
- `specs/` - Especificaciones delta por capacidad
  - `<capacidad>/spec.md` - Especificación técnica
- `.openspec.yaml` - Metadatos del cambio

### Flujo de Trabajo Recomendado

1. **Crear un cambio**: Usa `/opsx:new` o `openspec new change`
2. **Crear artefactos**: Sigue las instrucciones para crear proposal → specs → design → tasks
3. **Implementar**: Usa `/opsx:apply` para implementar las tareas
4. **Sincronizar specs**: Si hay especificaciones delta, usa `/opsx:sync`
5. **Archivar**: Una vez completado, usa `/opsx:archive` para moverlo a `openspec/changes/archive/`

### Configuración

La configuración de OpenSpec se encuentra en `openspec/config.yaml`. Puedes personalizar:
- El schema de workflow
- Contexto del proyecto (tech stack, convenciones, etc.)
- Reglas por artefacto

### Recursos

- [Documentación de OpenSpec](https://openspec.dev/docs)
- Usa `/opsx:onboard` para una guía interactiva de tu primer ciclo completo

## 🚢 Despliegue

### Vercel (Recomendado)

La forma más fácil de desplegar es usando [Vercel](https://vercel.com):

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Vercel detectará automáticamente Next.js y desplegará la aplicación

### Otros proveedores

La aplicación puede desplegarse en cualquier plataforma que soporte Node.js y Next.js.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado.

## 📚 Recursos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de NextAuth.js](https://next-auth.js.org)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de BullMQ](https://docs.bullmq.io)
- [Documentación de OpenSpec](https://openspec.dev/docs)

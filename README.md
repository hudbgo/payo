# 🏆 Payómetro

> Compite con tus amigos por ser el más payo.

Una aplicación web full-stack construida con React + Vite + Supabase.

---

## ✨ Características

- **Autenticación completa** — Registro, login, logout y recuperación de contraseña
- **Grupos (Payómetros)** — Crea grupos e invita amigos con enlace o código
- **Sistema de puntos** — Asigna puntos con motivo y fecha
- **Ranking en tiempo real** — Clasificación sincronizada con Supabase Realtime
- **Historial completo** — Todos los eventos con quién, a quién, motivo y fecha
- **Estadísticas** — Gráficos de actividad semanal y mensual
- **Diseño Apple-inspired** — Dark mode, mobile-first, animaciones suaves
- **RLS seguro** — Row Level Security en Supabase

---

## 🚀 Instalación

### 1. Clonar y preparar

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto gratuito.

2. En el panel de Supabase, ve a **SQL Editor** y ejecuta el contenido de `supabase_schema.sql`.

3. Copia tus credenciales desde **Project Settings → API**:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`

4. Edita `.env.local`:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Configurar autenticación en Supabase

En **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:5173` (desarrollo) o tu dominio
- **Redirect URLs**: añade `http://localhost:5173/reset-password`

### 4. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## 📁 Estructura de archivos

```
payometro/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── supabase_schema.sql          ← SQL completo de la BD
├── .env.example                 ← Plantilla de variables de entorno
└── src/
    ├── main.jsx                 ← Punto de entrada
    ├── App.jsx                  ← Router principal
    ├── index.css                ← Estilos globales + Tailwind
    ├── lib/
    │   └── supabase.js          ← Cliente Supabase
    ├── context/
    │   └── AuthContext.jsx      ← Estado global de autenticación
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── RegisterPage.jsx
    │   ├── ForgotPasswordPage.jsx
    │   ├── ResetPasswordPage.jsx
    │   ├── DashboardPage.jsx    ← Lista de Payómetros
    │   ├── CreatePayometerPage.jsx
    │   ├── PayometerPage.jsx    ← Vista principal con tabs
    │   └── JoinPage.jsx         ← Unirse con código
    └── components/
        ├── layout/
        │   └── Layout.jsx       ← Header + nav inferior
        ├── payometer/
        │   ├── InviteModal.jsx  ← Modal de invitación
        │   └── AddPointsModal.jsx ← Modal para asignar puntos
        ├── ranking/
        │   └── RankingTab.jsx   ← Podio + lista ordenada
        ├── history/
        │   └── HistoryTab.jsx   ← Historial de eventos
        └── stats/
            └── StatsTab.jsx     ← Estadísticas + gráficos
```

---

## 🗄️ Esquema de base de datos

```
profiles          — Perfiles de usuario (extiende auth.users)
payometers        — Grupos de competición
memberships       — Relación usuario ↔ payómetro (con rol admin/member)
score_events      — Registro de puntos asignados
```

### Relaciones

```
auth.users → profiles (1:1)
profiles → payometers (created_by)
profiles ↔ payometers via memberships (N:M)
profiles → score_events (given_by, received_by)
payometers → score_events (payometer_id)
```

---

## 🔒 Seguridad (RLS)

- Los usuarios **solo ven** los Payómetros de los que son miembros
- Solo el **creador** puede editar/borrar su Payómetro
- Solo los **miembros** pueden asignar puntos dentro del grupo
- No se pueden asignar puntos **a uno mismo**
- Solo el **admin** puede eliminar eventos ajenos

---

## 🌐 Despliegue en producción

### Vercel (recomendado)

```bash
npm i -g vercel
vercel --prod
```

Añade las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el dashboard de Vercel.

### Netlify

```bash
npm run build
# Sube la carpeta dist/ a Netlify
# Añade las variables de entorno en Site Settings
```

### Variables de entorno necesarias

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| React 18 | UI y estado |
| Vite 5 | Build tool y dev server |
| Supabase | BD PostgreSQL + Auth + Realtime |
| Tailwind CSS 3 | Estilos utility-first |
| React Router 6 | Navegación |
| Recharts | Gráficos de estadísticas |
| date-fns | Formateo de fechas en español |
| Lucide React | Iconos |

---

## 💡 Ejemplos de puntos de payo

| Motivo | Puntos |
|---|---|
| 🩴 Chanclas con calcetines | +5 |
| 💪 Llamar "bro" a todo el mundo | +10 |
| 🌅 Historia motivacional a las 6am | +15 |
| 📸 Foto de comida sin comer | +8 |
| 🤳 Selfie en el gym | +12 |
| 🤓 Hablar de productividad en vacaciones | +20 |

---

Hecho con ❤️ y mucho payo

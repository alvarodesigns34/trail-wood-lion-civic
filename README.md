# DESTRUCT LAB

Sandbox de destrucción y física 3D para navegador. Construye un pequeño entorno
urbano, provoca explosiones, terremotos, impactos de meteorito, ondas expansivas
y vendavales, y observa cómo las estructuras pierden estabilidad y colapsan.

Three.js · React Three Fiber · Rapier · Zustand · Vite · TypeScript.

## Enlace público

**https://alvarodesigns34.github.io/trail-wood-lion-civic/**

> El despliegue está automatizado (`.github/workflows/pages.yml`), pero GitHub
> Pages hay que activarlo una vez a mano: el token de Actions no tiene permiso
> para crear el sitio.
>
> **Settings → Pages → Build and deployment → Source: «GitHub Actions»**
>
> Hecho eso, cualquier push a `main` publica. Para publicar sin esperar a un
> push: pestaña **Actions → Publicar en GitHub Pages → Run workflow**.

## Probar en local

```bash
npm install
npm run dev          # http://localhost:8080
```

## Qué probar

1. Panel izquierdo → **Explosión**. Preset **Muy débil (0,5 kg)** y clic
   directamente sobre un edificio: apenas lo agrieta.
2. Sube a **Media (20 kg)** en el mismo punto: boquete y plantas superiores
   cayendo.
3. **Fuerte (120 kg)** en la **base** de la torre central, y luego la misma
   carga en la **coronación**. La diferencia es enorme, y es el resultado que
   más importa del modelo estructural.
4. Pon la velocidad en **0,25×** antes de detonar para ver el colapso en cámara
   lenta, y **Pausar** a media caída.
5. Herramienta **Seleccionar** sobre una planta: el inspector muestra
   integridad, si sigue apoyada y qué porcentaje de su capacidad soporta.

La carga se mide en **kilogramos equivalentes de TNT**, no en un número
abstracto. El radio de efecto se calcula solo a partir de la carga.

## Física

El modelo completo está documentado en **[docs/FISICA.md](docs/FISICA.md)**:
unidades, cómo se deduce la masa, las ecuaciones de la onda expansiva y sus
puntos de calibración, el solver estructural y la separación entre daño,
integridad, apoyo, fallo y movimiento.

## Pruebas

No comprueban que compile, sino que la simulación se comporta:

```bash
npm run dev                                                   # en una terminal
node scripts/qa/physics-lab.mjs                               # 20 comprobaciones
node scripts/qa/collapse.mjs --kg 50 --x 13.5 --y 1.2 --z 2   # traza del colapso
```

## Compilaciones

- `npm run build` — aplicación completa con SSR (TanStack Start + Nitro).
- `npm run build:pages` — versión estática de sólo cliente que se publica en
  GitHub Pages, sin servidor, sesión ni base de datos.

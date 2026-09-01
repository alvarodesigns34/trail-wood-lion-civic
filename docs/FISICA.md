# DESTRUCT LAB · Modelo físico

Documento de referencia del núcleo de simulación. Está pensado para que
cualquiera que continúe el proyecto entienda **por qué** las cosas se mueven
como se mueven antes de tocar una constante.

Principio rector: la simulación está simplificada, pero **las escalas son
reales y coherentes entre sí**. Nada se ajusta con multiplicadores mágicos; si
algo no se siente bien, la causa está en una magnitud física, no en un factor
de corrección.

---

## 1. Unidades

Todo en SI. Nada de números abstractos.

| Magnitud | Unidad | Dónde vive |
|---|---|---|
| Masa | kg | `SimBody.mass`, densidad del collider |
| Carga explosiva | kg equivalentes de TNT | `explosion.power` en el store |
| Sobrepresión | kPa | `blastField().overpressure` |
| Impulso específico | Pa·s | `blastField().impulse` |
| Resistencia del material | kPa de sobrepresión | `MaterialDef.strength` |
| Tenacidad al impacto | J/kg | `MaterialDef.toughness` |
| Capacidad de apoyo | N | `SimBody.supportCapacity` |
| Viento | m/s | `sim.wind` |
| Terremoto | m/s² de aceleración del terreno | `sim.quake.amplitude` |

---

## 2. Masa (`src/game/materials.ts`)

**Trampa histórica, y la causa original de casi todos los problemas:** en
`@react-three/rapier` la propiedad `mass` pertenece al *collider*, no al
`RigidBody`. Un `<RigidBody mass={260}>` se ignora en silencio y el cuerpo
acaba con densidad 1 kg/m³, es decir, masa igual a su volumen. Un coche pesaba
11 kg y un pilar de puente 1,3 kg.

Ahora la masa se deduce siempre igual:

```
masa = volumen × densidad_del_material × ocupación(kind) × hueco?
```

- `densidad` es la densidad **efectiva sobre la caja envolvente**, no la del
  material puro: un perfil de acero es casi todo aire.
- `ocupación` es la fracción de la caja realmente ocupada por materia. Una
  planta de edificio es 0,13 (forjado + pilares + tabiques ≈ 300 kg/m³ de
  media); un bloque macizo es 1.
- `hueco` es un ajuste puntual para piezas tubulares o vacías (farolas 0,18,
  cajas 0,32, celosías de antena 0,12).

El resultado se pasa a Rapier como `density` del `CuboidCollider`, de modo que
la masa y el tensor de inercia son consistentes entre sí y con lo que cree la
simulación.

Valores actuales de referencia: caja de madera 153 kg · barrera de hormigón
1,3 t · coche 1,4 t · furgoneta 2,6 t · camión 8,6 t · tablero de puente 12 t ·
planta de la torre central ≈ 31 t · meteorito ≈ 59 t.

---

## 3. Explosión (`src/game/blast.ts`)

La carga se expresa en kg de TNT. Las curvas siguen la forma de las leyes de
escala de Hopkinson-Cranz, calibradas para que **1 kg de TNT a 3 m** dé unos
**35 kPa** y **85 Pa·s**, que son los valores reales.

```
d0 = 0,55·∛W + 0,4                      (radio de bola de fuego)
r  = d + d0                             (d = distancia libre a la superficie)
conf = (1 − (d/R)²)²                    (corte suave en el radio de efecto)

sobrepresión = (1750·W/r³ + 195·∛W²/r²) · conf     [kPa]
impulso_esp. = (800·W/r²) · conf                    [Pa·s]
```

Dos magnitudes con dos papeles distintos, y esta separación es deliberada:

- **La sobrepresión hace daño.** `daño = ((p − resistencia) / (3,2·resistencia))^0,8`,
  multiplicado por la **cobertura**: la fracción de la pieza que queda dentro
  del radio donde la sobrepresión supera tres veces su resistencia
  (`destructiveRadius`). Sin esa acotación cualquier carga en contacto arruinaba
  la pieza entera por grande que fuera, y medio kilo bien colocado bastaba para
  tirar un edificio. Ahora una carga pequeña abre un boquete y una grande se
  lleva la planta.
- **El impulso específico mueve.** `J = impulso_esp. × área_proyectada`,
  aplicado con `applyImpulseAtPoint` en el punto más cercano de la caja.

Consecuencias que salen solas, sin código adicional:

- El área proyectada hace que una losa ancha reciba mucho más empuje que una
  columna estrecha, y que la misma onda lance una caja de 150 kg y apenas
  empuje un forjado de 31 t (Δv = J/m).
- La dirección es la geometría pura (foco → centro de la pieza). **No hay
  ninguna bonificación vertical.** El código original sumaba `+0,42·mag` hacia
  arriba, que es exactamente por lo que los edificios salían disparados.
- Aplicar el impulso en el punto más cercano, y no en el centro, genera el giro
  correcto cuando la carga estalla en una esquina o en la base.
- El Δv de una sola onda está topado a 40 m/s y el giro a 9 rad/s.

**Oclusión.** Antes de calcular nada se recorre el segmento foco→pieza y se
atenúa por cada obstáculo que lo corta, según su espesor y su integridad. Una
pieza intacta deja pasar poco (0,3); una destrozada deja pasar casi todo. Por
eso una carga en la calle no arrasa el interior del edificio, y una segunda
carga sobre un boquete ya abierto sí llega al fondo.

**Escala de referencia** (presets de la interfaz):

| Preset | Carga | Efecto esperado |
|---|---|---|
| Muy débil | 0,5 kg | Rompe cristales cerca. No toca la estructura. |
| Débil | 3 kg | Desplaza cajas y mobiliario, abolla chapa. |
| Media | 20 kg | Destroza objetos, agrieta hormigón a corta distancia. |
| Fuerte | 120 kg | Vuelca vehículos, puede arruinar los apoyos de una planta. |
| Extrema | 500 kg | Arrasa la planta baja y tira el edificio entero. |

El **radio de efecto** por defecto se calcula solo (`naturalRadius`): la
distancia a la que la sobrepresión baja de 5 kPa, el umbral de rotura del
vidrio. Bajarlo a mano concentra el efecto en menos espacio, como un
confinamiento.

---

## 4. Estructura (`src/game/structure.ts`)

El punto clave del rediseño: **daño, integridad, apoyo, fallo y movimiento son
cinco cosas distintas.** En el prototipo eran la misma: un 12 % de daño
convertía la pieza en cuerpo dinámico. Ahora:

- `integrity` (0–1) es capacidad estructural restante, no "vida".
- `supportCapacity` (N) se calcula al construir: `2,8 × carga_de_diseño +
  0,5 × peso_propio`. Es decir, cada planta se construyó para aguantar lo que
  lleva encima con un coeficiente de seguridad de 2,8.
- La capacidad disponible es `supportCapacity × integrity^1,5`. Con esa curva
  una planta cede alrededor del **50 % de integridad perdida**, que es el
  umbral que hace que atacar la base tenga sentido.
- Si la demanda supera la capacidad, la integridad se degrada progresivamente
  (`overloaded`), y el edificio se viene abajo solo. Nadie lo ordena.
- Al perder el apoyo, la planta **se suelta sin ningún impulso**. Sólo recibe
  una deriva lateral (0,25–0,7 m/s), un sesgo hacia el lado por el que le
  hicieron daño y un giro de 0,18–0,58 rad/s. Las tres son **velocidades, no
  impulsos**: no dependen de la masa y nunca pueden convertirse en un
  lanzamiento. A partir de ahí manda la gravedad.
- El desfase de propagación (0,06 s + 0,085 s por planta) hace que el bloque
  superior se desgrane al caer en vez de bajar entero como un ascensor.

Las estructuras horizontales (el puente) se resuelven por **conectividad**: un
recorrido en anchura desde los apoyos anclados al suelo; lo que no se alcanza,
cae. Cortar un pilar tira su mitad del tablero.

**Daño por impacto** (`sim.resolveImpact`). Se detecta por el salto de
velocidad en un paso, descontando la gravedad. La energía se reparte
aproximadamente mitad y mitad entre quien golpea y lo golpeado:

```
daño_propio  = 0,5·Δv² / tenacidad          (independiente de la masa)
daño_al_otro = 0,5·m·Δv²·0,5 / (m_otro · tenacidad_otro)
```

Esto es lo que hace que un colapso **progrese**: cada forjado que cae arruina
al de abajo. La tenacidad lleva el mismo factor de montaje que la resistencia,
así que un forjado hueco se destroza cayendo una planta mientras que una
barrera maciza sólo se agrieta.

---

## 5. Terremoto y viento

- **Terremoto**: aceleración del terreno horizontal y oscilante, con envolvente
  de subida y caída. Sin componente vertical sistemática. A las estructuras les
  aplica cortante en la base proporcional a la masa que llevan encima (no las
  mueve: las debilita); a los cuerpos sueltos les aplica la fuerza de inercia
  `m·a`. El código anterior aplicaba un impulso **por fotograma** con un término
  vertical siempre positivo, lo que daba una aceleración ascendente comparable a
  `g` durante segundos: de ahí la sensación de que no había gravedad.
- **Viento**: arrastre aerodinámico real, `F = ½·ρ·Cd·A·v_rel²`. Escala con el
  área, no con la masa, así que una caja sale volando y una losa no se entera.
  El código anterior usaba `addForce` en cada fotograma sin `resetForces`; como
  en Rapier el acumulador de fuerzas persiste entre pasos, la fuerza crecía sin
  límite durante toda la ráfaga.

---

## 6. Escombros

- Heredan la velocidad de la pieza de origen más una separación radial pequeña.
  **Sin bonificación vertical**: no son confeti.
- Conservan la densidad del material, así que un cascote de hormigón pesa como
  el hormigón.
- Reparten aproximadamente la mitad del volumen del original; el resto se va en
  polvo, que toma el color del material roto.
- Tope de 110 escombros vivos. Se retiran a los 26 s si están dormidos, o al
  caer por debajo de y = −18.

---

## 7. Rendimiento

- Todo lo que no se ha movido nunca es un cuerpo `fixed`: no consume solver.
- Rapier duerme los cuerpos en reposo; sólo se les aplica fuerza mientras hay
  viento o terremoto activos.
- El paso es fijo (1/60) con subpasos acumulados. Con escala de tiempo el tope
  es de 0,35 s por fotograma (21 subpasos).
- CCD sólo en meteoritos, escombros y forjados en caída.
- La oclusión de la onda es O(n²) sobre las piezas dentro del radio, pero se
  ejecuta una vez por explosión, no por fotograma.

---

## 8. Cómo probarlo

```bash
npm run dev
node scripts/qa/physics-lab.mjs      # 20 comprobaciones de comportamiento
node scripts/qa/collapse.mjs --kg 50 --x 13.5 --y 1.2 --z 2
```

`physics-lab.mjs` no comprueba que compile: comprueba que la escala de cargas
es monótona, que nada sale despedido hacia arriba, que atacar la base es más
destructivo que atacar la coronación, que la escena se estabiliza, que nada
atraviesa el suelo, y que pausa, cámara lenta y repetición funcionan.

`collapse.mjs` traza planta a planta cuándo se suelta cada una y dónde acaba.

La API de pruebas vive en `window.__lab` (`probe`, `explodeAt`, `state`,
`earthquake`, `wind`, `meteor`, `reset`) y el estado en `window.__labStore`.

Nota: en este contenedor Chromium renderiza por software, así que los fps
medidos (4–12) no representan el rendimiento real en GPU. Lo que sí es válido
es todo lo demás, porque la física es independiente del renderizador.

---

## 9. Qué queda pendiente

- Los efectos visuales (bola de fuego, humo, polvo) siguen siendo los del
  prototipo. Funcionan, pero se pueden mejorar mucho ahora que la física debajo
  aguanta el escrutinio.
- Los escombros son cajas. Instanciarlos y darles alguna forma más variada
  mejoraría el acabado sin coste apreciable.
- La ciudad no tiene interiores: una planta es una sola caja. Dividirla en
  fachada + núcleo permitiría boquetes localizados en vez de perder la planta
  entera.
- El terremoto no mueve el suelo visualmente; sólo aplica sus efectos.

## 10. Cómo se detona

- Con la herramienta **Explotar** activa, un clic en el suelo detona a la altura
  del foco indicada en el panel; un clic **sobre cualquier pieza** detona en ese
  punto exacto en 3D, que es lo que permite atacar una planta concreta.
- La herramienta **Meteorito** funciona igual: el clic marca el punto de caída.
- El panel de explosión permite además detonar en unas coordenadas concretas
  sin usar el ratón.

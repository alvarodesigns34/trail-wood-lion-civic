/**
 * Punto de entrada de la versión estática publicada en GitHub Pages.
 *
 * El laboratorio es íntegramente de cliente, así que aquí se monta directamente
 * `LabApp` sin el enrutador, la sesión ni la base de datos de la aplicación
 * completa. Lo único que se queda fuera es el experimento con IA por servidor,
 * que se sustituye por el intérprete local de órdenes (ver `experiment-stub.ts`).
 */
import { createRoot } from "react-dom/client";
import LabApp from "@/components/lab/LabApp";
import "@/styles.css";

const container = document.getElementById("root");
if (container) createRoot(container).render(<LabApp />);

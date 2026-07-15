import Link from "next/link";

import { createVehicle } from "./actions";
import styles from "./nuevo.module.css";

export default function NuevoVehiculoPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Nuevo inventario</p>

          <h1>
            Añadir
            <br />
            vehículo.
          </h1>

          <p className={styles.description}>
            Introduce la información principal y selecciona las fotografías
            directamente desde tu Mac.
          </p>
        </div>

        <Link href="/admin/vehicles" className={styles.backButton}>
          ← Volver a vehículos
        </Link>
      </section>

      <section className={styles.content}>
        <form action={createVehicle} className={styles.form}>
          <div className={styles.formHeading}>
            <span>01</span>

            <div>
              <h2>Información principal</h2>
              <p>Marca, modelo, año, kilometraje y precio.</p>
            </div>
          </div>

          <div className={styles.grid}>
            <label>
              <span>Marca *</span>

              <input
                type="text"
                name="brand"
                placeholder="Mercedes-Benz"
                required
              />
            </label>

            <label>
              <span>Modelo *</span>

              <input
                type="text"
                name="model"
                placeholder="Sprinter"
                required
              />
            </label>

            <label>
              <span>Versión</span>

              <input
                type="text"
                name="version"
                placeholder="316 CDI L2H2"
              />
            </label>

            <label>
              <span>Año *</span>

              <input
                type="number"
                name="year"
                min="1900"
                max="2100"
                placeholder="2020"
                required
              />
            </label>

            <label>
              <span>Kilometraje *</span>

              <input
                type="number"
                name="mileage"
                min="0"
                placeholder="125000"
                required
              />
            </label>

            <label>
              <span>Precio en euros *</span>

              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                placeholder="24500"
                required
              />
            </label>
          </div>

          <div className={styles.divider} />

          <div className={styles.formHeading}>
            <span>02</span>

            <div>
              <h2>Características</h2>
              <p>Datos técnicos y apariencia del vehículo.</p>
            </div>
          </div>

          <div className={styles.grid}>
            <label>
              <span>Combustible *</span>

              <select name="fuel" defaultValue="" required>
                <option value="" disabled>
                  Seleccionar
                </option>

                <option value="Diesel">Diésel</option>
                <option value="Gasoline">Gasolina</option>
                <option value="Hybrid">Híbrido</option>
                <option value="Electric">Eléctrico</option>
                <option value="LPG">GLP</option>
              </select>
            </label>

            <label>
              <span>Transmisión *</span>

              <select name="transmission" defaultValue="" required>
                <option value="" disabled>
                  Seleccionar
                </option>

                <option value="Manual">Manual</option>
                <option value="Automatic">Automática</option>
              </select>
            </label>

            <label>
              <span>Tracción</span>

              <input
                type="text"
                name="drivetrain"
                placeholder="Trasera, delantera, 4x4..."
              />
            </label>

            <label>
              <span>Motor</span>

              <input
                type="text"
                name="engine"
                placeholder="2.2 CDI"
              />
            </label>

            <label>
              <span>Potencia</span>

              <input
                type="text"
                name="power"
                placeholder="163 CV"
              />
            </label>

            <label>
              <span>Color</span>

              <input
                type="text"
                name="color"
                placeholder="Blanco"
              />
            </label>
          </div>

          <div className={styles.divider} />

          <div className={styles.formHeading}>
            <span>03</span>

            <div>
              <h2>Fotografías</h2>

              <p>
                Selecciona las imágenes reales del vehículo desde el ordenador.
              </p>
            </div>
          </div>

          <div className={styles.uploadBox}>
            <label>
              <span>Seleccionar fotografías</span>

              <input
                className={styles.fileInput}
                type="file"
                multiple
                name="images"
                accept="image/jpeg,image/png,image/webp,image/avif"
              />

              <small>
                Máximo 8 fotografías. Cada archivo puede ocupar hasta 8 MB.
                Formatos admitidos: JPG, PNG, WebP y AVIF. La primera imagen
                será la portada del vehículo.
              </small>
            </label>
          </div>

          <div className={styles.divider} />

          <div className={styles.formHeading}>
            <span>04</span>

            <div>
              <h2>Descripción</h2>

              <p>
                Información sobre estado, mantenimiento y equipamiento.
              </p>
            </div>
          </div>

          <div className={styles.fullGrid}>
            <label>
              <span>Descripción del vehículo</span>

              <textarea
                name="description"
                rows={9}
                placeholder="Describe el estado, mantenimiento, equipamiento, historial y características especiales..."
              />
            </label>
          </div>

          <div className={styles.actions}>
            <Link href="/admin/vehicles" className={styles.cancelButton}>
              Cancelar
            </Link>

            <button type="submit" className={styles.submitButton}>
              Guardar vehículo <span>→</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
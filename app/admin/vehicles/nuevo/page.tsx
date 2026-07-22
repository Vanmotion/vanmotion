import Link from "next/link";

import { prisma } from "@/app/lib/prisma";

import { createVehicle } from "./actions";
import styles from "./nuevo.module.css";

export const dynamic = "force-dynamic";

export default async function NuevoVehiculoPage() {
  const brands = await prisma.brand.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            Nuevo inventario
          </p>

          <h1>
            Añadir
            <br />
            vehículo.
          </h1>

          <p className={styles.description}>
            Introduce primero la información del vehículo. Después de guardarlo
            accederás a la pantalla de edición para subir las fotografías
            directamente a Vercel Blob.
          </p>
        </div>

        <Link
          href="/admin/vehicles"
          className={styles.backButton}
        >
          ← Volver a vehículos
        </Link>
      </section>

      <section className={styles.content}>
        {brands.length === 0 ? (
          <div className={styles.form}>
            <div className={styles.formHeading}>
              <span>!</span>

              <div>
                <h2>No hay marcas registradas</h2>

                <p>
                  Antes de añadir un vehículo debes registrar al menos una
                  marca.
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              <Link
                href="/admin/brands"
                className={styles.submitButton}
              >
                Ir a marcas <span>→</span>
              </Link>
            </div>
          </div>
        ) : (
          <form
            action={createVehicle}
            className={styles.form}
          >
            <div className={styles.formHeading}>
              <span>01</span>

              <div>
                <h2>Información principal</h2>
                <p>
                  Marca, modelo, año, kilometraje y precio.
                </p>
              </div>
            </div>

            <div className={styles.grid}>
              <label>
                <span>Marca *</span>

                <select
                  name="brandId"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Selecciona una marca
                  </option>

                  {brands.map((brand) => (
                    <option
                      key={brand.id}
                      value={brand.id}
                    >
                      {brand.name}
                    </option>
                  ))}
                </select>
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
                  placeholder="516 CDI"
                />
              </label>

              <label>
                <span>Año *</span>

                <input
                  type="number"
                  name="year"
                  min="1886"
                  max={new Date().getFullYear() + 1}
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
                  step="1"
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
                  placeholder="25000"
                  required
                />
              </label>
            </div>

            <div className={styles.divider} />

            <div className={styles.formHeading}>
              <span>02</span>

              <div>
                <h2>Características</h2>
                <p>
                  Datos técnicos y apariencia del vehículo.
                </p>
              </div>
            </div>

            <div className={styles.grid}>
              <label>
                <span>Combustible *</span>

                <select
                  name="fuel"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>

                  <option value="Diesel">
                    Diésel
                  </option>

                  <option value="Gasoline">
                    Gasolina
                  </option>

                  <option value="Hybrid">
                    Híbrido
                  </option>

                  <option value="Electric">
                    Eléctrico
                  </option>

                  <option value="LPG">
                    GLP
                  </option>
                </select>
              </label>

              <label>
                <span>Transmisión *</span>

                <select
                  name="transmission"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    Seleccionar
                  </option>

                  <option value="Manual">
                    Manual
                  </option>

                  <option value="Automatic">
                    Automática
                  </option>
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
                <span>Potencia en CV</span>

                <input
                  type="number"
                  name="power"
                  min="0"
                  step="1"
                  placeholder="190"
                />
              </label>

              <label>
                <span>Color</span>

                <input
                  type="text"
                  name="color"
                  placeholder="Negro"
                />
              </label>
            </div>

            <div className={styles.divider} />

            <div className={styles.formHeading}>
              <span>03</span>

              <div>
                <h2>Descripción</h2>

                <p>
                  Información sobre estado, mantenimiento y equipamiento.
                </p>
              </div>
            </div>

            <div className={styles.fullGrid}>
              <label>
                <span>
                  Descripción del vehículo
                </span>

                <textarea
                  name="description"
                  rows={9}
                  placeholder="Describe el estado, mantenimiento, equipamiento, historial y características especiales..."
                />
              </label>
            </div>

            <div className={styles.divider} />

            <div className={styles.formHeading}>
              <span>04</span>

              <div>
                <h2>Fotografías</h2>

                <p>
                  Primero guarda el vehículo. A continuación accederás
                  automáticamente a la edición, donde podrás seleccionar hasta
                  8 fotografías y subirlas directamente a Vercel Blob.
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              <Link
                href="/admin/vehicles"
                className={styles.cancelButton}
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className={styles.submitButton}
              >
                Guardar y añadir fotos{" "}
                <span>→</span>
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
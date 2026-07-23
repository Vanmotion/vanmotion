import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentLanguage } from "@/app/lib/language";

import styles from "../legal.module.css";

export const dynamic = "force-dynamic";

const CANONICAL_URL =
  "https://vanmotion.es/condiciones-compra";

const translations = {
  es: {
    metadataTitle:
      "Condiciones de compra",
    metadataDescription:
      "Condiciones aplicables a la compra online de productos VANMOTION.",

    location: "Madrid · España",
    eyebrow: "Contratación electrónica",
    title: "CONDICIONES DE COMPRA",
    introduction:
      "Estas condiciones regulan la compra online de ropa y otros productos físicos vendidos directamente por VANMOTION a través de su sitio web.",

    sellerTitle:
      "1. Identificación del vendedor",
    sellerText:
      "La persona responsable de la venta, del cobro, de la preparación del pedido y de la atención posventa es:",

    ownerName: "Titular",
    commercialName: "Nombre comercial",
    taxId: "NIF",
    address: "Domicilio",
    phone: "Teléfono",
    email: "Correo electrónico",

    scopeTitle:
      "2. Ámbito de aplicación",
    scopeText:
      "Estas condiciones se aplican a las compras de productos físicos realizadas mediante el sistema de pago habilitado en vanmotion.es. Actualmente, la venta online está prevista para prendas y productos propios de VANMOTION, comenzando por la colección CARPE DIEM · Black Edition · Drop 01.",

    consumerText:
      "La compra está dirigida principalmente a consumidores y usuarios que actúan con un propósito ajeno a su actividad empresarial o profesional. Cuando el comprador actúe como empresa o profesional, se aplicará la normativa que corresponda a dicha relación.",

    productTitle:
      "3. Información del producto",
    productText:
      "Antes de iniciar el pago, la ficha del producto muestra su denominación, descripción, imágenes, talla, precio, disponibilidad y stock. Las fotografías permiten identificar el producto, aunque pueden existir pequeñas diferencias de color derivadas de la pantalla, iluminación o dispositivo utilizado.",

    sizeText:
      "El cliente debe revisar la talla seleccionada, la cantidad y las características del producto antes de pulsar el botón de compra. Las unidades agotadas o no disponibles no pueden adquirirse mediante el proceso ordinario de pago.",

    processTitle:
      "4. Proceso de compra",

    selectionLabel:
      "Selección",
    selectionText:
      "El cliente selecciona una talla disponible y una cantidad comprendida entre una y cinco unidades por operación, siempre dentro del stock existente.",

    reviewLabel:
      "Revisión",
    reviewText:
      "Antes de confirmar el pago, Stripe muestra el producto, la cantidad, el importe total y los datos necesarios para completar el pedido.",

    paymentLabel:
      "Pago",
    processPaymentText:
      "El cliente confirma la operación dentro del entorno seguro de Stripe Checkout.",

    confirmationLabel:
      "Confirmación",
    confirmationText:
      "Una vez confirmado el pago, VANMOTION registra el pedido y envía un correo con su referencia, producto, talla, cantidad, importe y dirección de entrega.",

    correctionText:
      "El cliente debe comprobar todos los datos antes de pagar. Cuando detecte un error después de la compra, deberá contactar con VANMOTION lo antes posible indicando el número de pedido.",

    priceTitle:
      "5. Precio, impuestos y envío",
    priceText:
      "Los precios mostrados al consumidor se expresan en euros e incluyen los impuestos legalmente aplicables. El importe total que aparece en Stripe antes de confirmar el pago es el importe final de la operación.",

    shippingIncludedText:
      "El envío ordinario a una dirección válida de España está incluido en el precio final. VANMOTION no solicitará después del pago una cantidad adicional por el envío ordinario de ese pedido.",

    priceMismatchText:
      "En caso de existir una diferencia técnica entre el precio mostrado en la ficha del producto y el importe presentado por Stripe, el cliente no debe confirmar la compra y deberá comunicar la incidencia a VANMOTION.",

    paymentTitle:
      "6. Medios de pago y seguridad",
    paymentText:
      "Los pagos se procesan mediante Stripe Checkout. Los medios de pago disponibles serán los que Stripe muestre al cliente en el momento de la operación y pueden depender del dispositivo, del país o de la configuración de la plataforma.",

    cardText:
      "VANMOTION no recibe ni almacena el número completo de la tarjeta. Stripe gestiona la información de pago, la autenticación de la operación y sus sistemas de prevención del fraude.",

    chargeText:
      "La compra solo se considerará pagada cuando Stripe confirme correctamente el pago. Una operación cancelada, rechazada o pendiente no se tratará como un pedido pagado hasta recibir la confirmación correspondiente.",

    contractTitle:
      "7. Confirmación y formalización del contrato",
    contractText:
      "El envío de la orden de pago constituye una solicitud de compra. El contrato se entenderá formalizado cuando el pago haya sido confirmado y el pedido quede registrado por VANMOTION.",

    emailText:
      "El cliente recibirá una confirmación en el correo facilitado durante el proceso de pago. Este mensaje constituye una referencia duradera de la compra y debe conservarse hasta que finalice la entrega y cualquier gestión posventa.",

    emailFailureText:
      "Si el correo de confirmación no llega por una incidencia técnica, el pedido seguirá siendo válido cuando el pago figure confirmado y haya quedado registrado. El cliente podrá solicitar nuevamente la información contactando con VANMOTION.",

    stockTitle:
      "8. Disponibilidad e incidencias de stock",
    stockText:
      "VANMOTION comprueba el stock antes de abrir el pago y vuelve a validarlo cuando registra el pedido. No obstante, dos compras simultáneas pueden producir excepcionalmente una falta de disponibilidad después del cobro.",

    stockResolutionText:
      "Cuando una unidad pagada no pueda ser servida, VANMOTION contactará con el cliente y ofrecerá, según corresponda, esperar una reposición aceptada expresamente, cambiar el producto o recibir el reembolso íntegro. No se sustituirá el producto sin autorización del cliente.",

    deliveryTitle:
      "9. Preparación y entrega",

    destinationLabel:
      "Zona de entrega",
    destinationText:
      "Direcciones válidas dentro de España.",

    deliveryTimeLabel:
      "Plazo previsto",
    deliveryTimeText:
      "Entre 5 y 10 días laborables desde la confirmación del pago.",

    trackingLabel:
      "Seguimiento",
    trackingText:
      "Cuando exista número de seguimiento, VANMOTION podrá comunicarlo al cliente por correo electrónico.",

    deliveryText:
      "Los plazos indicados son estimaciones razonables de preparación y transporte. Si se produjera un retraso relevante, VANMOTION informará al cliente y acordará una nueva fecha o la solución legalmente aplicable.",

    addressText:
      "El cliente es responsable de facilitar una dirección completa y correcta. Si una entrega no pudiera realizarse por datos erróneos, ausencia reiterada o falta de recogida imputable al cliente, podrán repercutirse únicamente los costes adicionales reales de un nuevo envío, previa información y aceptación.",

    riskText:
      "El riesgo de pérdida o deterioro se transmite al cliente cuando él, o una persona autorizada distinta del transportista, recibe materialmente el pedido.",

    withdrawalTitle:
      "10. Derecho de desistimiento",
    withdrawalText:
      "El consumidor puede desistir de la compra sin necesidad de justificar su decisión durante los 14 días naturales siguientes al día en que él, o una persona autorizada distinta del transportista, reciba materialmente el producto.",

    withdrawalNoticeText:
      "Para ejercer este derecho debe comunicar a VANMOTION, antes de que termine el plazo, una declaración inequívoca que identifique al cliente, el pedido y la decisión de desistir.",

    electronicWithdrawalText:
      "El desistimiento podrá comunicarse mediante el correo indicado en estas condiciones y, antes de activar las ventas al público, mediante una función electrónica visible denominada «Desistir del contrato», que proporcionará confirmación inmediata de la solicitud.",

    optionalFormText:
      "El cliente podrá utilizar el formulario de desistimiento facilitado por VANMOTION, aunque su utilización no será obligatoria siempre que la comunicación exprese claramente su decisión.",

    returnTitle:
      "11. Devolución voluntaria",
    returnText:
      "Después de comunicar el desistimiento, el cliente deberá devolver el producto sin demora indebida y, como máximo, dentro de los 14 días naturales siguientes a dicha comunicación.",

    returnCostText:
      "En las devoluciones voluntarias por desistimiento, el cliente asumirá el coste directo del transporte de vuelta. No se cobrarán penalizaciones ni gastos de gestión adicionales por ejercer este derecho.",

    handlingText:
      "El cliente puede manipular la prenda únicamente en la medida necesaria para comprobar su naturaleza, características, talla y funcionamiento, de forma similar a como podría examinarla en un establecimiento. Podrá responder de la disminución de valor causada por una manipulación superior a la necesaria.",

    returnPackageText:
      "La devolución debe incluir el producto y, cuando sea razonablemente posible, sus etiquetas, accesorios y embalaje original. La ausencia del embalaje original no eliminará por sí sola el derecho de desistimiento, aunque el producto deberá protegerse correctamente para su transporte.",

    refundTitle:
      "12. Reembolso",
    refundText:
      "Cuando el desistimiento sea válido, VANMOTION reembolsará los pagos recibidos correspondientes al pedido, incluido el envío ordinario que estuviera integrado en el precio, sin demoras indebidas y dentro del plazo legal aplicable.",

    refundMethodText:
      "El reembolso se realizará mediante el mismo medio de pago utilizado en la compra, salvo que el cliente acepte expresamente otro medio que no le ocasione ningún coste.",

    withholdingText:
      "VANMOTION podrá retener el reembolso hasta recibir los productos devueltos o hasta que el cliente aporte una prueba suficiente de haberlos enviado, según qué circunstancia se produzca primero.",

    defectiveTitle:
      "13. Producto incorrecto, dañado o defectuoso",
    defectiveText:
      "Cuando el cliente reciba una prenda distinta de la comprada, dañada durante el transporte o con una falta de conformidad, deberá comunicarlo a VANMOTION aportando el número de pedido y, cuando resulte útil, fotografías de la incidencia.",

    defectiveCostText:
      "En estos casos, VANMOTION asumirá los costes razonables de recogida, devolución, sustitución o solución que legalmente corresponda. Esta gestión es diferente de una devolución voluntaria por desistimiento.",

    inspectText:
      "Es recomendable revisar el paquete al recibirlo y comunicar cualquier daño visible lo antes posible. Esta recomendación no limita los derechos legales del consumidor.",

    warrantyTitle:
      "14. Garantía legal",
    warrantyText:
      "Los productos nuevos están cubiertos por la garantía legal frente a faltas de conformidad que se manifiesten dentro de los tres años siguientes a su entrega, conforme a la normativa aplicable.",

    remediesText:
      "Cuando exista una falta de conformidad, el consumidor podrá solicitar las medidas correctoras legalmente previstas, como la puesta en conformidad, sustitución, reducción del precio o resolución del contrato, según la naturaleza del problema y los requisitos legales aplicables.",

    misuseText:
      "La garantía no cubre el desgaste normal, los daños ocasionados por un uso contrario a las instrucciones de cuidado, accidentes, modificaciones, lavado inadecuado o deterioros imputables al cliente, sin perjuicio de la valoración concreta de cada caso.",

    obligationsTitle:
      "15. Obligaciones del cliente",
    obligationsText:
      "El cliente debe proporcionar información verdadera y completa, utilizar un medio de pago autorizado, revisar la talla y cantidad elegidas, facilitar una dirección válida y atender las comunicaciones necesarias para entregar o gestionar el pedido.",

    fraudText:
      "VANMOTION podrá suspender o cancelar una operación cuando existan indicios razonables de fraude, uso no autorizado del medio de pago, manipulación del sistema o incumplimiento grave, sin menoscabar los derechos que correspondan al consumidor.",

    liabilityTitle:
      "16. Responsabilidad y fuerza mayor",
    liabilityText:
      "VANMOTION responderá del cumplimiento de sus obligaciones y de los derechos irrenunciables reconocidos al consumidor. No responderá de retrasos o imposibilidades causados por acontecimientos extraordinarios fuera de su control razonable, sin perjuicio de informar al cliente y ofrecer la solución que corresponda.",

    availabilityWebsiteText:
      "Una interrupción temporal del sitio, de Stripe, del proveedor de correo o de otros servicios técnicos no elimina un pedido que ya haya sido pagado y registrado.",

    privacyTitle:
      "17. Datos personales",
    privacyText:
      "Los datos facilitados durante la compra se utilizarán para gestionar el pago, registrar y preparar el pedido, realizar el envío, prestar atención posventa, prevenir el fraude y cumplir las obligaciones legales.",

    privacyLinkText:
      "La información detallada sobre responsables, proveedores, conservación y derechos se encuentra en la Política de Privacidad de VANMOTION.",

    lawTitle:
      "18. Legislación y reclamaciones",
    lawText:
      "Estas condiciones se rigen por la legislación española. Cuando el comprador sea consumidor, se respetarán las normas imperativas de protección de consumidores y de competencia territorial que resulten aplicables.",

    complaintText:
      "Antes de iniciar una reclamación formal, el cliente puede contactar con VANMOTION para intentar resolver la incidencia. También puede acudir a los servicios públicos de consumo y a los juzgados o tribunales competentes.",

    changesTitle:
      "19. Modificación de las condiciones",
    changesText:
      "VANMOTION podrá actualizar estas condiciones para adaptarlas a cambios legales, técnicos, logísticos o comerciales. A cada compra se aplicará la versión disponible y aceptada en el momento de realizar el pedido.",

    contactTitle:
      "20. Atención al cliente",
    contactText:
      "Para consultas sobre pagos, pedidos, entregas, devoluciones, desistimiento o garantía, el cliente puede contactar mediante los siguientes datos:",

    update:
      "Última actualización: 23 de julio de 2026",
    legalNotice: "Aviso legal",
    privacy: "Privacidad",
    cookies: "Cookies",
    back: "Volver a VANMOTION",
  },

  en: {
    metadataTitle:
      "Purchase terms",
    metadataDescription:
      "Terms governing online purchases of VANMOTION products.",

    location: "Madrid · Spain",
    eyebrow: "Electronic contracting",
    title: "PURCHASE TERMS",
    introduction:
      "These terms govern online purchases of clothing and other physical products sold directly by VANMOTION through its website.",

    sellerTitle:
      "1. Seller identification",
    sellerText:
      "The person responsible for the sale, collection of payment, order preparation and after-sales service is:",

    ownerName: "Owner",
    commercialName: "Trading name",
    taxId: "Tax identification number",
    address: "Address",
    phone: "Telephone",
    email: "Email",

    scopeTitle:
      "2. Scope",
    scopeText:
      "These terms apply to purchases of physical products made through the payment system available at vanmotion.es. Online sales are currently intended for VANMOTION clothing and original products, beginning with the CARPE DIEM · Black Edition · Drop 01 collection.",

    consumerText:
      "Purchases are primarily intended for consumers acting for purposes outside their trade, business or profession. Where the buyer acts as a business or professional, the rules applicable to that relationship will apply.",

    productTitle:
      "3. Product information",
    productText:
      "Before payment begins, the product page displays its name, description, images, size, price, availability and stock. Photographs help identify the product, although minor colour differences may arise from the screen, lighting or device used.",

    sizeText:
      "Customers must review the selected size, quantity and product characteristics before pressing the purchase button. Sold-out or unavailable units cannot be purchased through the ordinary checkout process.",

    processTitle:
      "4. Purchase process",

    selectionLabel:
      "Selection",
    selectionText:
      "The customer selects an available size and a quantity between one and five units per transaction, subject to existing stock.",

    reviewLabel:
      "Review",
    reviewText:
      "Before payment is confirmed, Stripe displays the product, quantity, total amount and the information required to complete the order.",

    paymentLabel:
      "Payment",
    processPaymentText:
      "The customer confirms the transaction within the secure Stripe Checkout environment.",

    confirmationLabel:
      "Confirmation",
    confirmationText:
      "Once payment is confirmed, VANMOTION records the order and sends an email containing its reference, product, size, quantity, amount and delivery address.",

    correctionText:
      "Customers must check all information before paying. If an error is discovered after purchase, they must contact VANMOTION as soon as possible and provide the order number.",

    priceTitle:
      "5. Price, taxes and delivery",
    priceText:
      "Prices displayed to consumers are stated in euros and include legally applicable taxes. The total shown by Stripe before payment is confirmed is the final transaction amount.",

    shippingIncludedText:
      "Standard delivery to a valid address in Spain is included in the final price. VANMOTION will not request an additional standard-delivery charge after payment.",

    priceMismatchText:
      "If there is a technical difference between the price displayed on the product page and the amount presented by Stripe, the customer must not confirm the purchase and should report the issue to VANMOTION.",

    paymentTitle:
      "6. Payment methods and security",
    paymentText:
      "Payments are processed through Stripe Checkout. Available payment methods are those shown by Stripe at the time of the transaction and may depend on the device, country or platform configuration.",

    cardText:
      "VANMOTION does not receive or store the full payment-card number. Stripe manages payment information, transaction authentication and fraud-prevention systems.",

    chargeText:
      "A purchase is treated as paid only after Stripe successfully confirms the payment. A cancelled, rejected or pending transaction will not be treated as a paid order until the relevant confirmation is received.",

    contractTitle:
      "7. Confirmation and formation of the contract",
    contractText:
      "Submitting the payment order constitutes a request to purchase. The contract is formed when payment has been confirmed and the order has been recorded by VANMOTION.",

    emailText:
      "The customer receives confirmation at the email address supplied during checkout. This message is a durable reference for the purchase and should be retained until delivery and any after-sales matter have been completed.",

    emailFailureText:
      "If the confirmation email is not delivered because of a technical incident, the order remains valid where payment is confirmed and the order has been recorded. The customer may request the information again by contacting VANMOTION.",

    stockTitle:
      "8. Availability and stock incidents",
    stockText:
      "VANMOTION checks stock before opening checkout and validates it again when recording the order. However, two simultaneous purchases may exceptionally cause an item to become unavailable after payment.",

    stockResolutionText:
      "Where a paid item cannot be supplied, VANMOTION will contact the customer and offer, as appropriate, an expressly accepted wait for restocking, a product change or a full refund. No substitute product will be supplied without the customer's permission.",

    deliveryTitle:
      "9. Preparation and delivery",

    destinationLabel:
      "Delivery area",
    destinationText:
      "Valid addresses within Spain.",

    deliveryTimeLabel:
      "Estimated period",
    deliveryTimeText:
      "Between 5 and 10 working days from payment confirmation.",

    trackingLabel:
      "Tracking",
    trackingText:
      "Where a tracking number is available, VANMOTION may send it to the customer by email.",

    deliveryText:
      "The stated periods are reasonable estimates for preparation and transport. If a significant delay occurs, VANMOTION will inform the customer and agree a new date or provide the legally appropriate solution.",

    addressText:
      "The customer is responsible for providing a complete and accurate address. If delivery cannot be completed because of incorrect details, repeated absence or failure to collect attributable to the customer, only the actual additional cost of a new delivery may be charged after prior information and acceptance.",

    riskText:
      "Risk of loss or damage passes to the customer when the customer, or an authorised person other than the carrier, physically receives the order.",

    withdrawalTitle:
      "10. Right of withdrawal",
    withdrawalText:
      "Consumers may withdraw from the purchase without giving a reason during the 14 calendar days following the day on which they, or an authorised person other than the carrier, physically receive the product.",

    withdrawalNoticeText:
      "To exercise this right, the customer must send VANMOTION an unequivocal statement identifying the customer, the order and the decision to withdraw before the period expires.",

    electronicWithdrawalText:
      "Withdrawal may be communicated using the email stated in these terms and, before public sales are activated, through a clearly visible electronic function called “Withdraw from the contract”, which will provide immediate confirmation of the request.",

    optionalFormText:
      "Customers may use the withdrawal form supplied by VANMOTION, although its use is not compulsory where the communication clearly expresses the decision to withdraw.",

    returnTitle:
      "11. Voluntary returns",
    returnText:
      "After communicating withdrawal, the customer must return the product without undue delay and no later than 14 calendar days after that communication.",

    returnCostText:
      "For voluntary withdrawal returns, the customer bears the direct cost of return transport. No penalty or additional administration charge will be imposed for exercising this right.",

    handlingText:
      "The customer may handle the garment only as necessary to establish its nature, characteristics, size and functioning, in a manner comparable to examining it in a shop. The customer may be responsible for diminished value caused by handling beyond what is necessary.",

    returnPackageText:
      "The return should include the product and, where reasonably possible, its labels, accessories and original packaging. Absence of the original packaging does not by itself remove the right of withdrawal, although the product must be adequately protected for transport.",

    refundTitle:
      "12. Refund",
    refundText:
      "Where withdrawal is valid, VANMOTION will refund payments received for the order, including ordinary delivery incorporated into the price, without undue delay and within the legally applicable period.",

    refundMethodText:
      "The refund will be made using the same payment method used for the purchase unless the customer expressly agrees to another method that causes no cost.",

    withholdingText:
      "VANMOTION may withhold the refund until the returned products are received or the customer supplies sufficient evidence that they have been sent, whichever occurs first.",

    defectiveTitle:
      "13. Incorrect, damaged or defective product",
    defectiveText:
      "Where the customer receives a garment different from the one purchased, damaged during delivery or lacking conformity, the customer should contact VANMOTION and provide the order number and, where useful, photographs of the issue.",

    defectiveCostText:
      "In these cases, VANMOTION will bear reasonable collection, return, replacement or other legally applicable remedy costs. This process is different from a voluntary withdrawal return.",

    inspectText:
      "Customers are advised to inspect the parcel on receipt and report visible damage as soon as possible. This recommendation does not restrict statutory consumer rights.",

    warrantyTitle:
      "14. Statutory guarantee",
    warrantyText:
      "New products are covered by the statutory guarantee for lack of conformity appearing within three years after delivery, in accordance with applicable law.",

    remediesText:
      "Where a lack of conformity exists, consumers may request the remedies provided by law, including bringing the goods into conformity, replacement, price reduction or termination of the contract, depending on the nature of the issue and applicable legal requirements.",

    misuseText:
      "The guarantee does not cover normal wear, damage caused by use contrary to care instructions, accidents, alterations, unsuitable washing or deterioration attributable to the customer, subject to an assessment of each case.",

    obligationsTitle:
      "15. Customer obligations",
    obligationsText:
      "Customers must provide true and complete information, use an authorised payment method, review the chosen size and quantity, provide a valid address and respond to communications required to deliver or manage the order.",

    fraudText:
      "VANMOTION may suspend or cancel a transaction where there are reasonable indications of fraud, unauthorised payment use, system manipulation or serious breach, without affecting the rights available to consumers.",

    liabilityTitle:
      "16. Liability and force majeure",
    liabilityText:
      "VANMOTION is responsible for performing its obligations and respecting consumers' mandatory rights. It is not responsible for delays or impossibility caused by extraordinary events outside its reasonable control, without prejudice to informing the customer and providing the appropriate solution.",

    availabilityWebsiteText:
      "A temporary interruption affecting the website, Stripe, the email provider or another technical service does not remove an order that has already been paid and recorded.",

    privacyTitle:
      "17. Personal data",
    privacyText:
      "Information supplied during purchase is used to manage payment, record and prepare the order, arrange delivery, provide after-sales support, prevent fraud and comply with legal obligations.",

    privacyLinkText:
      "Detailed information about controllers, providers, retention and individual rights is available in VANMOTION's Privacy Policy.",

    lawTitle:
      "18. Applicable law and complaints",
    lawText:
      "These terms are governed by Spanish law. Where the buyer is a consumer, mandatory consumer-protection and territorial-jurisdiction rules will be respected.",

    complaintText:
      "Before starting a formal claim, customers may contact VANMOTION to seek a resolution. They may also approach public consumer services and the competent courts.",

    changesTitle:
      "19. Changes to these terms",
    changesText:
      "VANMOTION may update these terms to reflect legal, technical, logistical or commercial changes. Each purchase is governed by the version available and accepted when the order is placed.",

    contactTitle:
      "20. Customer service",
    contactText:
      "For enquiries about payments, orders, deliveries, returns, withdrawal or guarantees, customers may use the following contact details:",

    update:
      "Last updated: July 23, 2026",
    legalNotice: "Legal notice",
    privacy: "Privacy",
    cookies: "Cookies",
    back: "Return to VANMOTION",
  },
} as const;

function requireLegalValue(
  variableName: string,
): string {
  const value =
    process.env[variableName]?.trim();

  if (!value) {
    throw new Error(
      `Falta la variable legal ${variableName}.`,
    );
  }

  return value;
}

export async function generateMetadata(): Promise<Metadata> {
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  return {
    title: content.metadataTitle,
    description:
      content.metadataDescription,

    alternates: {
      canonical: CANONICAL_URL,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PurchaseTermsPage() {
  const language =
    await getCurrentLanguage();

  const content =
    translations[language];

  const legal = {
    ownerName:
      requireLegalValue(
        "LEGAL_OWNER_NAME",
      ),

    nif:
      requireLegalValue(
        "LEGAL_OWNER_NIF",
      ),

    address:
      requireLegalValue(
        "LEGAL_ADDRESS",
      ),

    phone:
      requireLegalValue(
        "LEGAL_PHONE",
      ),

    email:
      requireLegalValue(
        "LEGAL_EMAIL",
      ),
  };

  const telephoneHref =
    legal.phone.replace(/[^\d+]/g, "");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          href="/proximamente"
          className={styles.brand}
        >
          VANMOTION
        </Link>

        <span>{content.location}</span>
      </header>

      <div className={styles.hero}>
        <p className={styles.eyebrow}>
          {content.eyebrow}
        </p>

        <h1>{content.title}</h1>

        <p className={styles.introduction}>
          {content.introduction}
        </p>
      </div>

      <article className={styles.content}>
        <section className={styles.section}>
          <h2>{content.sellerTitle}</h2>

          <div>
            <p>{content.sellerText}</p>

            <address className={styles.dataGrid}>
              <div>
                <span>{content.ownerName}</span>
                <strong>{legal.ownerName}</strong>
              </div>

              <div>
                <span>
                  {content.commercialName}
                </span>
                <strong>VANMOTION</strong>
              </div>

              <div>
                <span>{content.taxId}</span>
                <strong>{legal.nif}</strong>
              </div>

              <div>
                <span>{content.address}</span>
                <strong>{legal.address}</strong>
              </div>

              <div>
                <span>{content.phone}</span>

                <a href={`tel:${telephoneHref}`}>
                  {legal.phone}
                </a>
              </div>

              <div>
                <span>{content.email}</span>

                <a href={`mailto:${legal.email}`}>
                  {legal.email}
                </a>
              </div>
            </address>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.scopeTitle}</h2>

          <div>
            <p>{content.scopeText}</p>
            <p>{content.consumerText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.productTitle}</h2>

          <div>
            <p>{content.productText}</p>
            <p>{content.sizeText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.processTitle}</h2>

          <div>
            <div className={styles.dataGrid}>
              <div>
                <span>{content.selectionLabel}</span>
                <strong>
                  {content.selectionText}
                </strong>
              </div>

              <div>
                <span>{content.reviewLabel}</span>
                <strong>
                  {content.reviewText}
                </strong>
              </div>

              <div>
                <span>{content.paymentLabel}</span>
                <strong>
                  {content.processPaymentText}
                </strong>
              </div>

              <div>
                <span>
                  {content.confirmationLabel}
                </span>
                <strong>
                  {content.confirmationText}
                </strong>
              </div>
            </div>

            <p>{content.correctionText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.priceTitle}</h2>

          <div>
            <p>{content.priceText}</p>
            <p>{content.shippingIncludedText}</p>
            <p>{content.priceMismatchText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.paymentTitle}</h2>

          <div>
            <p>{content.paymentText}</p>
            <p>{content.cardText}</p>
            <p>{content.chargeText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.contractTitle}</h2>

          <div>
            <p>{content.contractText}</p>
            <p>{content.emailText}</p>
            <p>{content.emailFailureText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.stockTitle}</h2>

          <div>
            <p>{content.stockText}</p>
            <p>{content.stockResolutionText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.deliveryTitle}</h2>

          <div>
            <div className={styles.dataGrid}>
              <div>
                <span>
                  {content.destinationLabel}
                </span>
                <strong>
                  {content.destinationText}
                </strong>
              </div>

              <div>
                <span>
                  {content.deliveryTimeLabel}
                </span>
                <strong>
                  {content.deliveryTimeText}
                </strong>
              </div>

              <div>
                <span>{content.trackingLabel}</span>
                <strong>
                  {content.trackingText}
                </strong>
              </div>
            </div>

            <p>{content.deliveryText}</p>
            <p>{content.addressText}</p>
            <p>{content.riskText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.withdrawalTitle}</h2>

          <div>
            <p>{content.withdrawalText}</p>
            <p>{content.withdrawalNoticeText}</p>
            <p>
              {content.electronicWithdrawalText}
            </p>
            <p>{content.optionalFormText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.returnTitle}</h2>

          <div>
            <p>{content.returnText}</p>
            <p>{content.returnCostText}</p>
            <p>{content.handlingText}</p>
            <p>{content.returnPackageText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.refundTitle}</h2>

          <div>
            <p>{content.refundText}</p>
            <p>{content.refundMethodText}</p>
            <p>{content.withholdingText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.defectiveTitle}</h2>

          <div>
            <p>{content.defectiveText}</p>
            <p>{content.defectiveCostText}</p>
            <p>{content.inspectText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.warrantyTitle}</h2>

          <div>
            <p>{content.warrantyText}</p>
            <p>{content.remediesText}</p>
            <p>{content.misuseText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.obligationsTitle}</h2>

          <div>
            <p>{content.obligationsText}</p>
            <p>{content.fraudText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.liabilityTitle}</h2>

          <div>
            <p>{content.liabilityText}</p>
            <p>
              {content.availabilityWebsiteText}
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.privacyTitle}</h2>

          <div>
            <p>{content.privacyText}</p>

            <p>
              <Link href="/privacidad">
                {content.privacyLinkText}
              </Link>
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.lawTitle}</h2>

          <div>
            <p>{content.lawText}</p>
            <p>{content.complaintText}</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>{content.changesTitle}</h2>

          <p>{content.changesText}</p>
        </section>

        <section className={styles.section}>
          <h2>{content.contactTitle}</h2>

          <div>
            <p>{content.contactText}</p>

            <div className={styles.dataGrid}>
              <div>
                <span>{content.email}</span>

                <a href={`mailto:${legal.email}`}>
                  {legal.email}
                </a>
              </div>

              <div>
                <span>{content.phone}</span>

                <a href={`tel:${telephoneHref}`}>
                  {legal.phone}
                </a>
              </div>
            </div>
          </div>
        </section>
      </article>

      <footer className={styles.footer}>
        <p>{content.update}</p>

        <Link href="/aviso-legal">
          {content.legalNotice}
        </Link>

        <Link href="/privacidad">
          {content.privacy}
        </Link>

        <Link href="/cookies">
          {content.cookies}
        </Link>

        <Link href="/proximamente">
          {content.back} →
        </Link>
      </footer>
    </main>
  );
}
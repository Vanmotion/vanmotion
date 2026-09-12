import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error(
      "Falta STRIPE_SECRET_KEY en las variables de entorno.",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(stripeSecretKey, {
      appInfo: {
        name: "VANMOTION",
        version: "1.0.0",
      },
    });
  }

  return stripeClient;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, property) {
    const client = getStripeClient();
    const value = Reflect.get(client, property, client);

    return typeof value === "function"
      ? value.bind(client)
      : value;
  },
});

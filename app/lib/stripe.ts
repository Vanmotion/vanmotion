import "server-only";

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "Falta STRIPE_SECRET_KEY en las variables de entorno.",
  );
}

export const stripe = new Stripe(stripeSecretKey, {
  appInfo: {
    name: "VANMOTION",
    version: "1.0.0",
  },
});
import { ForbiddenException, Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_API_KEY as string, {
      apiVersion: "2022-11-15",
      appInfo: {
        name: "vanguard",
        version: "0.0.1",
      },
    });
  }

  createAndSaveStripeId = async (userId: string, email: string) => {
    const stripeCustomer = await this.stripe.customers.create({
      email,
    });

    await this.prisma.customers.update({
      where: {
        id: userId,
      },
      data: {
        stripeId: stripeCustomer.id,
      },
    });

    return stripeCustomer.id;
  };

  createSessionId = async (stripeId: string) => {
    const session = await this.stripe.checkout.sessions.create({
      customer: stripeId,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_PRODUCT_SIGNATURE,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return session.id;
  };

  createStripeCustomer = async (userId: string, email: string) => {
    const user = await this.prisma.customers.findUnique({
      where: {
        id: userId,
      },
      include: {
        status: true,
      },
    });

    if (user.status.description === "Inativo")
      throw new ForbiddenException("This user is not active");

    let stripeId = user.stripeId;

    if (!stripeId) {
      stripeId = await this.createAndSaveStripeId(userId, email);
    }

    const sessionId = await this.createSessionId(stripeId);

    return {
      sessionId,
    };
  };

  getSignatures = async () => {
    const signature = await this.stripe.prices.retrieve(
      process.env.STRIPE_PRICE_PRODUCT_SIGNATURE as string
    );

    return signature;
  };
}

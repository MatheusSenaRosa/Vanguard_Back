import { Controller, Get, Post } from "@nestjs/common";
import { CurrentUser, Public, Roles } from "@decorators";
import { StripeService } from "./stripe.service";

@Controller("stripe")
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get()
  @Public()
  getSignatures() {
    return this.stripeService.getSignatures();
  }

  @Post()
  @Roles(["Aluno"])
  createStripeCustomer(@CurrentUser() body: { id: string; email: string }) {
    return this.stripeService.createStripeCustomer(body.id, body.email);
  }
}

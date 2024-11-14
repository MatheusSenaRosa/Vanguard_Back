import { Global, Module } from "@nestjs/common";
import { MemoryTokensService } from "./memory-tokens.service";

@Global()
@Module({
  providers: [MemoryTokensService],
  exports: [MemoryTokensService],
})
export class MemoryTokensModule {}


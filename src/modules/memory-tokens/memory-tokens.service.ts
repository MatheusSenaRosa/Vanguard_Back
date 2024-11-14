import { Injectable } from "@nestjs/common";
import { Token } from "./types";
import { UserTable } from "@types";

@Injectable()
export class MemoryTokensService {
  tokens: Token[] = [];

  addToken(userId: string, token: string, table: UserTable) {
    const index = this.tokens.findIndex(
      (item) => item.userId === userId && item.table === table
    );

    if (index !== -1) {
      this.tokens[index].token = token;
      return;
    }

    this.tokens.push({
      userId,
      table,
      token: token,
    });
  }

  removeToken(userId: string, table: UserTable) {
    const index = this.tokens.findIndex(
      (item) => item.userId === userId && item.table === table
    );

    if (index !== -1) {
      this.tokens.splice(index, 1);
    }
  }
}

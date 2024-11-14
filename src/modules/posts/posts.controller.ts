import { PostsService } from "./posts.service";
import {
  Body,
  Controller,
  Delete,
  Put,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { CurrentUser, Public, Roles } from "@decorators";
import {
  CommentDto,
  CreateCommentDto,
  UpdateCommentDto,
  CreateReplyDto,
  UpdateReplyDto,
} from "./dtos";
import { Serialize } from "@interceptors";
import { User } from "./types";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ***************************** COMMENTS ***********************************
  @Get("comments/non-approved")
  @Roles(["Supervisor"])
  @HttpCode(HttpStatus.OK)
  @Serialize(CommentDto)
  listNonApprovedCommentsAndReplies() {
    return this.postsService.listNonApprovedCommentsAndReplies();
  }

  @Get("comments/ban")
  @Roles(["Administrador"])
  @Serialize(CommentDto)
  @HttpCode(HttpStatus.OK)
  listBannedCommentsAndReplies() {
    return this.postsService.listBannedCommentsAndReplies();
  }

  @Put("comments/ban/:commentId")
  @Roles(["Supervisor"])
  @HttpCode(HttpStatus.NO_CONTENT)
  banComment(@Param("commentId") commentId: string) {
    return this.postsService.banComment(commentId);
  }

  @Put("comments/approve/:commentId")
  @Roles(["Administrador", "Supervisor"])
  @HttpCode(HttpStatus.NO_CONTENT)
  approveComment(
    @Param("commentId") commentId: string,
    @CurrentUser() user: User
  ) {
    return this.postsService.approveComment(commentId, user);
  }

  @Put("comments/reports/:commentId")
  @Roles(["Aluno"])
  @HttpCode(HttpStatus.NO_CONTENT)
  reportComment(
    @Param("commentId") commentId: string,
    @CurrentUser("id") userId: string
  ) {
    return this.postsService.reportComment(commentId, userId);
  }

  @Get("comments/reports")
  @Roles(["Administrador"])
  @Serialize(CommentDto)
  @HttpCode(HttpStatus.OK)
  listReportedCommentsAndReplies() {
    return this.postsService.listReportedCommentsAndReplies();
  }

  @Get("comments/private/:postId")
  @Roles(["Criador de conteúdo"])
  @HttpCode(HttpStatus.OK)
  @Serialize(CommentDto)
  listPrivateComments(
    @Param("postId") postId: string,
    @CurrentUser("id") userId: string
  ) {
    return this.postsService.listPrivateComments(postId, userId);
  }

  @Get("comments/:postId")
  @Public()
  @HttpCode(HttpStatus.OK)
  @Serialize(CommentDto)
  listPublicComments(
    @Param("postId") postId: string,
    @Query("managerId") managerId: string,
    customerId: string
  ) {
    return this.postsService.listPublicComments(postId, {
      customerId: customerId,
      managerId: managerId,
    });
  }

  @Delete("comments/:commentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(["Administrador", "Aluno", "Criador de conteúdo"])
  removeComment(
    @Param("commentId") commentId: string,
    @CurrentUser() user: User
  ) {
    return this.postsService.removeComment(commentId, user);
  }

  @Post("comments")
  @Roles(["Administrador", "Aluno", "Criador de conteúdo"])
  @HttpCode(HttpStatus.CREATED)
  @Serialize(CommentDto)
  createComment(@Body() body: CreateCommentDto, @CurrentUser() user: User) {
    return this.postsService.createComment(body, user);
  }

  @Put("comments")
  @Roles(["Administrador", "Aluno", "Criador de conteúdo"])
  @HttpCode(HttpStatus.OK)
  @Serialize(CommentDto)
  updateComment(@Body() body: UpdateCommentDto, @CurrentUser() user: User) {
    return this.postsService.updateComment(body, user);
  }

  // ***************************** REPLIES ***********************************
  @Post("replies")
  @Roles(["Administrador", "Aluno", "Criador de conteúdo"])
  @HttpCode(HttpStatus.CREATED)
  @Serialize(CommentDto)
  createReply(@Body() body: CreateReplyDto, @CurrentUser() user: User) {
    return this.postsService.createReply(body, user);
  }

  @Put("replies")
  @Roles(["Administrador", "Aluno", "Criador de conteúdo"])
  @HttpCode(HttpStatus.OK)
  @Serialize(CommentDto)
  updateReply(@Body() body: UpdateReplyDto, @CurrentUser() user: User) {
    return this.postsService.updateReply(body, user);
  }

  @Put("replies/ban/:replyId")
  @Roles(["Supervisor"])
  @HttpCode(HttpStatus.NO_CONTENT)
  banReply(@Param("replyId") replyId: string) {
    return this.postsService.banReply(replyId);
  }

  @Put("replies/approve/:replyId")
  @Roles(["Administrador", "Supervisor"])
  @HttpCode(HttpStatus.NO_CONTENT)
  approveReply(@Param("replyId") replyId: string, @CurrentUser() user: User) {
    return this.postsService.approveReply(replyId, user);
  }

  @Put("replies/reports/:replyId")
  @Roles(["Aluno"])
  @HttpCode(HttpStatus.NO_CONTENT)
  reportReply(
    @Param("replyId") replyId: string,
    @CurrentUser("id") userId: string
  ) {
    return this.postsService.reportReply(replyId, userId);
  }

  @Delete("replies/:replyId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(["Administrador", "Aluno", "Criador de conteúdo"])
  @Serialize(CommentDto)
  removeReply(@Param("replyId") replyId: string, @CurrentUser() user: User) {
    return this.postsService.removeReply(replyId, user);
  }
}

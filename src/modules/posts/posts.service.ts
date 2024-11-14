import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateCommentDto,
  CreateReplyDto,
  UpdateCommentDto,
  UpdateReplyDto,
} from "./dtos";
import { FormattedReports, User, UserIds } from "./types";
import { v4 as uuid } from "uuid";

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // POST
  createPost = async (postId: string) => {
    const post = await this.prisma.posts.create({
      data: {
        id: postId,
      },
    });

    return post;
  };

  listBannedCommentsAndReplies = async () => {
    const [comments, replies] = await Promise.all([
      this.prisma.postComments.findMany({
        where: {
          isBanned: true,
        },
        include: {
          manager: true,
          customer: true,
        },
      }),
      this.prisma.postReplies.findMany({
        where: {
          isBanned: true,
        },
        include: {
          manager: true,
          customer: true,
        },
      }),
    ]);

    return {
      comments,
      replies,
    };
  };

  listNonApprovedCommentsAndReplies = async () => {
    const [comments, replies] = await Promise.all([
      this.prisma.postComments.findMany({
        where: {
          approval: null,
          isBanned: false,
          manager: {
            role: {
              description: "Criador de conteúdo",
            },
          },
        },
        include: {
          manager: true,
          customer: true,
        },
      }),
      this.prisma.postReplies.findMany({
        where: {
          approval: null,
          isBanned: false,
          manager: {
            role: {
              description: "Criador de conteúdo",
            },
          },
        },
        include: {
          manager: true,
          customer: true,
        },
      }),
    ]);

    return { comments, replies };
  };

  listReportedCommentsAndReplies = async () => {
    const reports = await this.prisma.postCommentsReports.findMany({
      include: {
        comment: {
          include: {
            approval: {
              include: {
                approver: true,
              },
            },
          },
        },
        reply: {
          include: {
            approval: {
              include: {
                approver: true,
              },
            },
          },
        },
      },
    });

    const formatted = reports.reduce((acc: FormattedReports[], cur) => {
      const foundIndex = acc.findIndex(
        (item) =>
          (cur.commentId && item.commentId === cur.commentId) ||
          (cur.replyId && item.replyId === cur.replyId)
      );

      if (foundIndex !== -1) {
        acc[foundIndex].reportsAmount += 1;

        return acc;
      }

      return [
        ...acc,
        {
          ...cur,
          reportsAmount: 1,
        },
      ];
    }, []);

    return { reports: formatted };
  };

  // COMMENT
  listPublicComments = async (postId: string, userIds: UserIds) => {
    const post = await this.prisma.posts.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return { comments: [] };

    const comments = await this.prisma.postComments.findMany({
      where: {
        postId,
        isBanned: false,
        OR: [
          {
            NOT: {
              customer: null,
            },
          },
          {
            manager: {
              role: {
                description: "Administrador",
              },
            },
          },
          {
            manager: {
              role: {
                description: "Criador de conteúdo",
              },
            },
            NOT: {
              approval: null,
            },
          },
        ],
      },
      include: {
        customer: true,
        manager: {
          include: {
            role: true,
          },
        },
        replies: {
          where: {
            isBanned: false,
            OR: [
              {
                NOT: {
                  customer: null,
                },
              },
              {
                manager: {
                  role: {
                    description: "Administrador",
                  },
                },
              },
              {
                manager: {
                  role: {
                    description: "Criador de conteúdo",
                  },
                },
                NOT: {
                  approval: null,
                },
              },
            ],
          },
          include: {
            customer: true,
            manager: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    return { comments };
  };

  listPrivateComments = async (postId: string, userId: string) => {
    const post = await this.prisma.posts.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) return { comments: [] };

    const comments = await this.prisma.postComments.findMany({
      where: {
        postId,
        OR: [
          {
            NOT: {
              approval: null,
              managerId: userId,
            },
          },
          {
            approval: null,
            managerId: userId,
          },
          {
            managerId: userId,
            isBanned: true,
          },
        ],
      },
      include: {
        replies: {
          where: {
            OR: [
              {
                NOT: {
                  approval: null,
                  managerId: userId,
                },
              },
              {
                approval: null,
                managerId: userId,
              },
              {
                managerId: userId,
                isBanned: true,
              },
            ],
          },
        },
        customer: true,
        manager: {
          include: {
            role: true,
          },
        },
      },
    });

    return { comments };
  };

  approveComment = async (commentId: string, user: User) => {
    const foundComment = await this.prisma.postComments.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!foundComment)
      throw new NotFoundException("This comment does not exist");

    if (foundComment.isBanned && user.role !== "Administrador")
      throw new BadRequestException("You cant approve a banned comment");

    await this.prisma.postComments.update({
      where: {
        id: commentId,
      },
      data: {
        isBanned: false,
        approval: {
          create: {
            id: uuid(),
            approverId: user.id,
          },
        },
        reports: {
          deleteMany: {
            commentId,
          },
        },
      },
    });
  };

  banComment = async (commentId: string) => {
    const foundComment = await this.prisma.postComments.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!foundComment)
      throw new NotFoundException("This comment does not exist");

    if (foundComment.isBanned)
      throw new BadRequestException("This comment is already banned");

    await this.prisma.postComments.update({
      where: {
        id: commentId,
      },
      data: {
        isBanned: true,
        reports: {
          deleteMany: {
            commentId,
          },
        },
      },
    });
  };

  reportComment = async (commentId: string, userId: string) => {
    const foundComment = await this.prisma.postComments.findUnique({
      where: {
        id: commentId,
      },
      include: {
        reports: {
          where: {
            customerId: userId,
          },
        },
      },
    });

    if (!foundComment) throw new NotFoundException("Comment does not exist");

    if (foundComment.reports.length)
      throw new BadRequestException("You have already reported this comment");

    await this.prisma.postCommentsReports.create({
      data: {
        commentId,
        customerId: userId,
      },
    });
  };

  createComment = async (data: CreateCommentDto, user: User) => {
    const managerRoles = ["Administrador", "Criador de conteúdo"];

    const isManager = managerRoles.includes(user.role);

    const foundPost = await this.prisma.posts.findUnique({
      where: { id: data.postId },
    });

    if (!foundPost) await this.createPost(data.postId);

    const comment = await this.prisma.postComments.create({
      data: {
        id: uuid(),
        postId: data.postId,
        isBanned: false,
        description: data.description,
        managerId: isManager ? user.id : null,
        customerId: isManager ? null : user.id,
      },
    });

    return comment;
  };

  updateComment = async (data: UpdateCommentDto, user: User) => {
    const foundComment = await this.prisma.postComments.findUnique({
      where: { id: data.commentId },
    });

    if (!foundComment) throw new NotFoundException("Comment does not exist");

    const isCommentOwner =
      (user.role === "Aluno" && foundComment?.customerId === user.id) ||
      (user.role !== "Aluno" && foundComment?.managerId === user.id);

    if (!isCommentOwner) {
      throw new ForbiddenException("You cant update others user comment");
    }

    const comment = await this.prisma.postComments.update({
      where: { id: data.commentId },
      data: {
        description: data.description,
        ...(user.role === "Supervisor" && {
          approval: {
            delete: true,
          },
        }),
      },
    });

    return comment;
  };

  removeComment = async (commentId: string, user: User) => {
    const foundComment = await this.prisma.postComments.findUnique({
      where: { id: commentId },
    });

    if (!foundComment) throw new NotFoundException("Comment does not exist");

    const isCommentOwner =
      (user.role === "Aluno" && user.id === foundComment?.customerId) ||
      (user.role !== "Aluno" && user.id === foundComment?.managerId);

    const isAdmin = user.role === "Administrador";

    if (!isAdmin && !isCommentOwner)
      throw new ForbiddenException("You cant remove others user comment");

    await this.prisma.postComments.delete({ where: { id: commentId } });
  };

  // REPLY
  createReply = async (data: CreateReplyDto, user: User) => {
    const isManager = user.role !== "Aluno";

    const foundComment = await this.prisma.postComments.findUnique({
      where: { id: data.commentId },
      include: {
        manager: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!foundComment) throw new NotFoundException("Comment does not exist");

    if (
      foundComment?.manager?.role?.description === "Criador de conteúdo" &&
      !foundComment?.approvalId
    )
      throw new BadRequestException("You cant reply a non approved comment");

    const reply = await this.prisma.postReplies.create({
      data: {
        id: uuid(),
        description: data.description,
        isBanned: false,
        commentId: data.commentId,
        managerId: isManager ? user.id : null,
        customerId: isManager ? null : user.id,
      },
    });

    return reply;
  };

  banReply = async (replyId: string) => {
    const foundReply = await this.prisma.postReplies.findUnique({
      where: {
        id: replyId,
      },
    });

    if (!foundReply) throw new NotFoundException("This reply does not exist");

    if (foundReply.isBanned)
      throw new BadRequestException("This reply is already banned");

    await this.prisma.postReplies.update({
      where: {
        id: replyId,
      },
      data: {
        isBanned: true,
        reports: {
          deleteMany: {
            replyId,
          },
        },
      },
    });
  };

  reportReply = async (replyId: string, userId: string) => {
    const foundReply = await this.prisma.postReplies.findUnique({
      where: {
        id: replyId,
      },
      include: {
        reports: {
          where: {
            customerId: userId,
          },
        },
      },
    });

    if (!foundReply) throw new NotFoundException("Reply does not exist");

    if (foundReply.reports.length)
      throw new BadRequestException("You have already reported this reply");

    await this.prisma.postCommentsReports.create({
      data: {
        replyId,
        customerId: userId,
      },
    });
  };

  approveReply = async (replyId: string, user: User) => {
    const foundReply = await this.prisma.postReplies.findUnique({
      where: {
        id: replyId,
      },
    });

    if (!foundReply) throw new NotFoundException("This comment does not exist");

    if (foundReply.isBanned && user.role !== "Administrador")
      throw new BadRequestException("You cant approve a banned reply");

    await this.prisma.postReplies.update({
      where: {
        id: replyId,
      },
      data: {
        isBanned: false,
        approval: {
          create: {
            id: uuid(),
            approverId: user.id,
          },
        },
        reports: {
          deleteMany: {
            replyId,
          },
        },
      },
    });
  };

  updateReply = async (data: UpdateReplyDto, user: User) => {
    const foundReply = await this.prisma.postReplies.findUnique({
      where: { id: data.replyId },
    });

    if (!foundReply) throw new NotFoundException("Reply does not exist");

    const isReplyOwner =
      (user.role === "Aluno" && foundReply?.customerId === user.id) ||
      (user.role !== "Aluno" && foundReply?.managerId === user.id);

    if (!isReplyOwner)
      throw new ForbiddenException("You cant update others user replie");

    const reply = await this.prisma.postReplies.update({
      where: { id: data.replyId },
      data: {
        description: data.description,
        ...(user.role === "Supervisor" && {
          approval: {
            delete: true,
          },
        }),
      },
    });

    return reply;
  };

  removeReply = async (replyId: string, user: User) => {
    const foundReply = await this.prisma.postReplies.findUnique({
      where: { id: replyId },
    });

    if (!foundReply) throw new NotFoundException("Reply does not exist");

    const isCommentOwner =
      (user.role === "Aluno" && user.id === foundReply?.customerId) ||
      (user.role !== "Aluno" && user.id === foundReply?.managerId);

    const isAdmin = user.role === "Administrador";

    if (!isAdmin && !isCommentOwner)
      throw new ForbiddenException("You cant remove others user replie");

    await this.prisma.postReplies.delete({ where: { id: replyId } });
  };
}

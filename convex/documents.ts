import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const getByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, { ids }) => {
    const documents = [];

    for (const id of ids) {
      const document = await ctx.db.get(id);

      if (document) {
        documents.push({ id: document, name: document.title })
      } else {
        documents.push({ id, name: "[Deleted]" })
      }
    }

    return documents;
  }
});

export const create = mutation({
  args: { 
    title: v.optional(v.string()),
    initialContent: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized User");
    }

    const organizationId = typeof user.organization_id === "string" ? user.organization_id : undefined;

    return await ctx.db.insert("documents", {
      title: args.title ?? "Untitled Document",
      ownerId: user.subject,
      organizationId,
      initialContent: args.initialContent,
    });
  }
});

export const getDocuments = query({
  args: { paginationOpts: paginationOptsValidator, search: v.optional(v.string()) },
  handler: async (ctx, { search, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized User");
    }

    const organizationId = typeof user.organization_id === "string" ? user.organization_id : undefined;
    const ownerId = typeof user.subject === "string" ? user.subject : String(user.subject);

    if (search) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq(organizationId ? "organizationId" : "ownerId", organizationId ?? ownerId)
        )
        .paginate(paginationOpts);
    }

    return await ctx.db
      .query("documents")
      .withIndex(organizationId ? "by_organization_id" : "by_owner_id", (q) =>
        q.eq(organizationId ? "organizationId" : "ownerId", organizationId ?? ownerId)
      )
      .paginate(paginationOpts);
  },
});

export const removeById = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized User");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new ConvexError("Document Not Found");
    }

    return await ctx.db.delete(args.id);
  },
});

export const updateById = mutation({
  args: { id: v.id("documents"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new ConvexError("Unauthorized User");
    }

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new ConvexError("Document Not Found");
    }

    return await ctx.db.patch(args.id, { title: args.title });
  },
});

export const getById = query({
  args: { id: v.id("documents") },
  handler: async (ctx, { id }) => {
    const document = await ctx.db.get(id);

    if (!document) {
      throw new ConvexError("Document Not Found");
    }
    
    return document;
  },
});

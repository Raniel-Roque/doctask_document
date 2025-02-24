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
        documents.push({ id: document, name: document.title})
      } else {
        documents.push({id, name: "[Deleted]"})
      }
    }

    return documents;
  }
})

export const create = mutation({
  args: { 
    title: v.optional(v.string()),
    initialContent: v.optional(v.string())
  },
  handler: async(ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized User")
    }

    const organizationId = (user.organization_id ?? undefined) as | string | undefined;

    return await ctx.db.insert("documents", {
      title: args.title ?? "Untitled Document",
      ownerId: user.subject,
      organizationId,
      initialContent: args.initialContent,
    })
  }
})

export const getDocuments = query({
  args: { paginationOpts: paginationOptsValidator, search: v.optional(v.string()) },
  handler: async (ctx, { search, paginationOpts }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new ConvexError("Unauthorized User")
    }

    const organizationId = (user.organization_id ?? undefined) as | string | undefined;

    //Search within Org
    if (search && organizationId) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("organizationId", organizationId)
        )
        .paginate(paginationOpts)
    }

    //Search within Personal
    if (search) {
      return await ctx.db
        .query("documents")
        .withSearchIndex("search_title", (q) => 
          q.search("title", search)
          .eq("ownerId", user.subject)
        )
        .paginate(paginationOpts)
    }

    //Org
    if (organizationId) {
      return await ctx.db
      .query("documents")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", organizationId))
      .paginate(paginationOpts);
    }

    //Personal
    return await ctx.db
      .query("documents")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", user.subject))
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

    const organizationId = user.organization_id ?? undefined;
    const organizationRole = user.organization_role ?? undefined; // Get role from Clerk

    const document = await ctx.db.get(args.id);
    if (!document) {
      throw new ConvexError("Document Not Found");
    }

    const isOwner = document.ownerId === user.subject;
    const isOrganizationAdmin = !!(document.organizationId && document.organizationId === organizationId && organizationRole === "admin"); // Only allow admins

    if (!isOwner && !isOrganizationAdmin) {
      throw new ConvexError("Only the document owner or an organization admin can delete this document.");
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

    const organizationId = user.organization_id ?? undefined;
    const organizationRole = user.organization_role ?? undefined; // Get role from Clerk

    const isOwner = document.ownerId === user.subject;
    const isOrganizationAdmin = !!(document.organizationId && document.organizationId === organizationId && organizationRole === "admin"); // Only allow admins

    if (!isOwner && !isOrganizationAdmin) {
      throw new ConvexError("Only the document owner or an organization admin can rename this document.");
    }

    return await ctx.db.patch(args.id, { title: args.title });
  },
});

export const getById = query({
  args: { id: v.id("documents")},
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getServerSession } from "next-auth"
import slugify from "slugify"

import prisma from "@/lib/db"
import { authOptions } from "@/lib/auth"

// Схема валидации для создания статьи
const createArticleSchema = z.object({
  title: z.string().min(1, "Заголовок обязателен"),
  content: z.string().min(1, "Содержание обязательно"),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  publish: z.boolean().optional(),
})

// Схема валидации для обновления статьи
const updateArticleSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Заголовок обязателен"),
  content: z.string().min(1, "Содержание обязательно"),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
  publish: z.boolean().optional(),
})

// Создание статьи
export async function createArticle(data: {
  title: string
  content: string
  categoryId?: string
  tags?: string[]
  featured?: boolean
  allowComments?: boolean
  publish?: boolean
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: "Необходима авторизация" }
  }

  // Проверка прав доступа
  const isAdmin = session.user.role === "ADMIN"
  if (!isAdmin) {
    return { error: "Недостаточно прав для создания статьи" }
  }

  const validatedFields = createArticleSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: "Некорректные данные", details: validatedFields.error.flatten().fieldErrors }
  }

  const { title, content, categoryId, tags, featured, allowComments, publish } = validatedFields.data

  try {
    // Создание слага из заголовка
    const baseSlug = slugify(title, { lower: true, strict: true })

    // Проверка уникальности слага
    const existingArticlesCount = await prisma.knowledgeArticle.count({
      where: {
        slug: {
          startsWith: baseSlug,
        },
      },
    })

    // Если есть статьи с похожим слагом, добавляем число
    const slug = existingArticlesCount > 0 ? `${baseSlug}-${existingArticlesCount + 1}` : baseSlug

    const article = await prisma.knowledgeArticle.create({
      data: {
        title,
        content,
        slug,
        featured: featured || false,
        allowComments: allowComments ?? true,
        publishedAt: publish ? new Date() : null,
        authorId: session.user.id,
        categoryId: categoryId || null,
      },
    })

    // Добавление тегов, если они есть
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Находим или создаем тег
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: slugify(tagName, { lower: true, strict: true }),
          },
        })

        // Связываем тег со статьей
        await prisma.tagsOnArticles.create({
          data: {
            articleId: article.id,
            tagId: tag.id,
          },
        })
      }
    }

    revalidatePath("/knowledge")
    return { success: true, articleId: article.id, slug: article.slug }
  } catch (error) {
    return { error: "Ошибка при создании статьи" }
  }
}

// Получение всех статей
export async function getArticles() {
  try {
    const articles = await prisma.knowledgeArticle.findMany({
      where: {
        publishedAt: {
          not: null,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { articles }
  } catch (error) {
    return { error: "Ошибка при получении статей" }
  }
}

// Получение всех статей для администратора (включая черновики)
export async function getAdminArticles() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: "Необходима авторизация" }
  }

  // Проверка прав доступа
  const isAdmin = session.user.role === "ADMIN"
  if (!isAdmin) {
    return { error: "Недостаточно прав для просмотра всех статей" }
  }

  try {
    const articles = await prisma.knowledgeArticle.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { articles }
  } catch (error) {
    return { error: "Ошибка при получении статей" }
  }
}

// Получение статьи по слагу
export async function getArticleBySlug(slug: string) {
  try {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    })

    if (!article) {
      return { error: "Статья не найдена" }
    }

    // Если статья не опубликована, проверяем права доступа
    if (!article.publishedAt) {
      const session = await getServerSession(authOptions)
      const isAdmin = session?.user?.role === "ADMIN"

      if (!isAdmin) {
        return { error: "Статья не найдена" }
      }
    }

    // Увеличиваем счетчик просмотров
    await prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return { article }
  } catch (error) {
    return { error: "Ошибка при получении статьи" }
  }
}

// Обновление статьи
export async function updateArticle(data: {
  id: string
  title: string
  content: string
  categoryId?: string
  tags?: string[]
  featured?: boolean
  allowComments?: boolean
  publish?: boolean
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { error: "Необходима авторизация" }
  }

  // Проверка прав доступа
  const isAdmin = session.user.role === "ADMIN"
  if (!isAdmin) {
    return { error: "Недостаточно прав для обновления статьи" }
  }

  const validatedFields = updateArticleSchema.safeParse(data)

  if (!validatedFields.success) {
    return { error: "Некорректные данные", details: validatedFields.error.flatten().fieldErrors }
  }

  const { id, title, content, categoryId, tags, featured, allowComments, publish } = validatedFields.data

  try {
    // Проверка существования статьи
    const existingArticle = await prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        tags: true,
      },
    })

    if (!existingArticle) {
      return { error: "Статья не найдена" }
    }

    // Обновление статьи
    const article = await prisma.knowledgeArticle.update({
      where: { id },
      data: {
        title,
        content,
        featured: featured ?? existingArticle.featured,
        allowComments: allowComments ?? existingArticle.allowComments,
        publishedAt: publish && !existingArticle.publishedAt ? new Date() : existingArticle.publishedAt,
        categoryId: categoryId || null,
      },
    })

    // Обновление тегов
    if (tags) {
      // Удаляем существующие связи с тегами
      await prisma.tagsOnArticles.deleteMany({
        where: { articleId: id },
      })

      // Добавляем новые теги
      for (const tagName of tags) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: slugify(tagName, { lower: true, strict: true }),
          },
        })

        await prisma.tagsOnArticles.create({
          data: {
            articleId: article.id,
            tagId: tag.id,
          },
        })
      }
    }

    revalidatePath(`/knowledge/${existingArticle.slug}`)
    revalidatePath("/knowledge")
    revalidatePath("/admin/knowledge")
    return { success: true, articleId: article.id }
  } catch (error) {
    return { error: "Ошибка при обновлении статьи" }
  }
}

// Получение категорий
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return { categories }
  } catch (error) {
    return { error: "Ошибка при получении категорий" }
  }
}

// Получение тегов
export async function getTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return { tags }
  } catch (error) {
    return { error: "Ошибка при получении тегов" }
  }
}

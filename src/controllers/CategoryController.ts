import { Context } from "koa";
import { AppDataSource } from "../data-source";
import { Category } from "../entity/Category";
import { StatusCodes} from "../utils/StatusCodes";

export class CategoryController {
    static async getAllCategories(ctx: Context) {
        try {
            console.log("Category GET request");
            const categoryRepository = AppDataSource.getRepository(Category);
            ctx.body = await categoryRepository.find();
        } catch (error) {
            console.error("Error fetching categories:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async getCategoryById(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} category GET request`);
            const categoryRepository = AppDataSource.getRepository(Category);
            const category = await categoryRepository.findOne({
                where: { id },
            });

            if (!category) {
                ctx.throw(StatusCodes.NOT_FOUND, "Category not found");
            }

            ctx.body = category;
        } catch (error) {
            console.error("Error fetching category by ID:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async createCategory(ctx: Context) {
        try {
            console.log("Category POST request");
            const body: any = await ctx.request.body;

            if (!body.name) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Category name is required.");
            }

            const categoryRepository = AppDataSource.getRepository(Category);
            const category = categoryRepository.create({
                name: body.name,
                description: body.description || "",
            });

            await categoryRepository.save(category);
            ctx.body = category;
        } catch (error) {
            console.error("Error creating category:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async updateCategory(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} category PUT request`);
            const body: any = await ctx.request.body;

            const categoryRepository = AppDataSource.getRepository(Category);
            const category = await categoryRepository.findOne({ where: { id } });

            if (!category) {
                ctx.throw(StatusCodes.NOT_FOUND, "Category not found");
            }

            if (!body.name) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Category name is required.");
            }

            category.name = body.name;
            category.description = body.description || "";

            await categoryRepository.save(category);
            ctx.body = category;
        } catch (error) {
            console.error("Error updating category:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async deleteCategory(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }
            console.log(`${id} category DELETE request`);
            const categoryRepository = AppDataSource.getRepository(Category);
            const category = await categoryRepository.findOne({ where: { id } });

            if (!category) {
                ctx.throw(StatusCodes.NOT_FOUND, "Category not found");
            }
            await categoryRepository.remove(category);
            ctx.body = `Category with ID ${id} has been deleted`;
        } catch (error) {
            console.error("Error deleting category:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}

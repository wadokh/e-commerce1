import { Context } from "koa";
import { AppDataSource } from "../data-source";
import { Product } from "../entity/Product";
import { Category } from "../entity/Category";
import { StatusCodes} from "../utils/StatusCodes";

export class ProductController {
    static async getAllProducts(ctx: Context) {
        try {
            console.log("Product GET request");
            const productRepository = AppDataSource.getRepository(Product);
            ctx.body = await productRepository.find({ relations: ["category"] });
        } catch (error) {
            console.error("Error fetching products:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async getProductById(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} Product GET request`);
            const productRepository = AppDataSource.getRepository(Product);
            const product = await productRepository.findOne({
                where: { id },
                relations: ["category"],
            });

            if (!product) {
                ctx.throw(StatusCodes.NOT_FOUND, "Product not found.");
            }

            ctx.body = product;
        } catch (error) {
            console.error("Error fetching product by ID:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async createProduct(ctx: Context) {
        try {
            console.log("Product POST request");
            const body: any = ctx.request.body;
            const { name, price, description, stock, categoryId } = body;

            if (!name || !price || !description || !stock || !categoryId) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Missing required fields: name, price, description, stock, or categoryId");
            }

            const categoryRepository = AppDataSource.getRepository(Category);
            const category = await categoryRepository.findOne({ where: { id: parseInt(categoryId) } });

            if (!category) {
                ctx.throw(StatusCodes.NOT_FOUND, `Category with ID ${categoryId} not found`);
            }

            const productRepository = AppDataSource.getRepository(Product);
            const product = productRepository.create({
                name,
                price: parseFloat(price),
                description,
                stock: parseInt(stock),
                category,
            });

            await productRepository.save(product);

            ctx.body = product;
        } catch (error) {
            console.error("Error creating product:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async updateProduct(ctx: Context) {
        try {
            console.log("Product PUT request");
            const productId = parseInt(ctx.params.id);
            if (isNaN(productId)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            const body: any = ctx.request.body;
            const { name, price, description, stock, categoryId } = body;

            const productRepository = AppDataSource.getRepository(Product);
            const product = await productRepository.findOne({
                where: { id: productId },
                relations: ["category"],
            });

            if (!product) {
                ctx.throw(StatusCodes.NOT_FOUND, `Product with ID ${productId} not found`);
            }

            if (name) product.name = name;
            if (price) product.price = parseFloat(price);
            if (description) product.description = description;
            if (stock) product.stock = parseInt(stock);

            if (categoryId) {
                const categoryRepository = AppDataSource.getRepository(Category);
                const category = await categoryRepository.findOne({ where: { id: parseInt(categoryId) } });

                if (!category) {
                    ctx.throw(StatusCodes.NOT_FOUND, `Category with ID ${categoryId} not found`);
                }

                product.category = category;
            }

            await productRepository.save(product);

            ctx.body = product;
        } catch (error) {
            console.error("Error updating product:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async deleteProduct(ctx: Context) {
        try {
            console.log("Product DELETE request");
            const productId = parseInt(ctx.params.id);
            if (isNaN(productId)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            const productRepository = AppDataSource.getRepository(Product);
            const product = await productRepository.findOne({
                where: { id: productId },
                relations: ["orderItems"],
            });

            if (!product) {
                ctx.throw(StatusCodes.NOT_FOUND, `Product with ID ${productId} not found`);
            }

            if (product.orderItems && product.orderItems.length > 0) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Cannot delete the product as it is associated with existing order items.");
            }

            await productRepository.remove(product);

            ctx.body = { message: `Product with ID ${productId} has been deleted successfully.` };
        } catch (error) {
            console.error("Error deleting product:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}

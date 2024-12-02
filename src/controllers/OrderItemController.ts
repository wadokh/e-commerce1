import { Context } from "koa";
import { AppDataSource } from "../data-source";
import { OrderItem } from "../entity/OrderItem";
import { Product } from "../entity/Product";

export class OrderItemController {
    static async getAllOrderItems(ctx: Context) {
        try {
            console.log("OrderItem GET request");
            const orderItemRepository = AppDataSource.getRepository(OrderItem);
            ctx.body = await orderItemRepository.find({ relations: ["product", "order"] });
        } catch (error) {
            console.error("Error fetching order items:", error);
            ctx.throw(500, "Internal server error");
        }
    }

    static async getOrderItemById(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(400, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} OrderItem GET request`);
            const orderItemRepository = AppDataSource.getRepository(OrderItem);
            const orderItem = await orderItemRepository.findOne({
                where: { id },
                relations: ["product", "order"],
            });

            if (!orderItem) {
                ctx.throw(404, "OrderItem not found.");
            }

            ctx.body = orderItem;
        } catch (error) {
            console.error("Error fetching OrderItem by ID:", error);
            ctx.throw(500, "Internal server error");
        }
    }

    static async updateOrderItem(ctx: Context) {
        try {
            const orderItemId = parseInt(ctx.params.id);
            if (isNaN(orderItemId)) {
                ctx.throw(400, "Invalid ID format. ID must be a number.");
            }

            console.log(`${orderItemId} OrderItem PUT request`);
            const body: any = await ctx.request.body;
            const { productId, quantity, price } = body;

            const orderItemRepository = AppDataSource.getRepository(OrderItem);
            const productRepository = AppDataSource.getRepository(Product);

            const orderItem = await orderItemRepository.findOne({
                where: { id: orderItemId },
                relations: ["product", "order"],
            });

            if (!orderItem) {
                ctx.throw(404, `OrderItem with ID ${orderItemId} not found`);
            }

            if (productId) {
                const product = await productRepository.findOne({ where: { id: productId } });

                if (!product) {
                    ctx.throw(404, `Product with ID ${productId} not found`);
                }

                // Adjust stock
                product.stock += orderItem.quantity; // Revert old quantity
                if (product.stock - quantity < 0) {
                    ctx.throw(400, `Not enough stock`);
                }
                product.stock -= quantity;

                orderItem.product = product;
                await productRepository.save(product);
            }

            if (quantity) {
                if (quantity <= 0) {
                    ctx.throw(400, "Quantity must be greater than zero.");
                }
                orderItem.quantity = quantity;
            }

            if (price) {
                if (price <= 0) {
                    ctx.throw(400, "Price must be greater than zero.");
                }
                orderItem.price = price;
            }

            await orderItemRepository.save(orderItem);
            ctx.body = orderItem;
        } catch (error) {
            console.error("Error updating OrderItem:", error);
            ctx.throw(500, "Internal server error");
        }
    }
}

import {Context} from "koa";
import {AppDataSource} from "../data-source";
import {Order} from "../entity/Order";
import {OrderItem} from "../entity/OrderItem";
import {Product} from "../entity/Product";
import {Customer} from "../entity/Customer";
import {OrderStatus} from "../utils/OrderStatus";
import { StatusCodes} from "../utils/StatusCodes";

export class OrderController {
    static async getAllOrders(ctx: Context) {
        try {
            console.log("Order GET request");
            const orderRepository = AppDataSource.getRepository(Order);
            ctx.body = await orderRepository.find({
                relations: ["customer", "orderItems", "orderItems.product"],
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async getOrderById(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} order GET request`);
            const orderRepository = AppDataSource.getRepository(Order);
            const order = await orderRepository.findOne({
                where: { id },
                relations: ["customer", "orderItems", "orderItems.product"],
            });

            if (!order) {
                ctx.throw(StatusCodes.NOT_FOUND, "Order not found");
            }

            ctx.body = order;
        } catch (error) {
            console.error("Error fetching order by ID:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async createOrder(ctx: Context) {
        try {
            console.log("Order POST request");
            const body: any = await ctx.request.body;
            const { customerId, orderItems } = body;

            if (!customerId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Customer ID and order items are required.");
            }

            const customerRepository = AppDataSource.getRepository(Customer);
            const customer = await customerRepository.findOne({ where: { id: customerId } });

            if (!customer) {
                ctx.throw(StatusCodes.NOT_FOUND, "Customer not found.");
            }

            const productRepository = AppDataSource.getRepository(Product);
            const orderRepository = AppDataSource.getRepository(Order);
            const orderItemRepository = AppDataSource.getRepository(OrderItem);

            const order = orderRepository.create({
                customer,
                status: OrderStatus.Pending,
                totalAmount: 0,
                orderItems: [],
            });

            let totalAmount = 0;

            for (const item of orderItems) {
                const product = await productRepository.findOne({ where: { id: item.productId } });
                if (!product) {
                    ctx.throw(StatusCodes.NOT_FOUND, `Product with ID ${item.productId} not found.`);
                }

                if (product.stock < item.quantity) {
                    ctx.throw(StatusCodes.BAD_REQUEST, `Insufficient stock for product ID ${item.productId}.`);
                }

                const orderItem = orderItemRepository.create({
                    product,
                    order,
                    quantity: item.quantity,
                    price: product.price * item.quantity,
                });

                totalAmount += orderItem.price;
                product.stock -= item.quantity;
                await productRepository.save(product);
                order.orderItems.push(orderItem);
            }

            order.totalAmount = totalAmount;
            await orderRepository.save(order);

            ctx.body = order;
        } catch (error) {
            console.error("Error creating order:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async updateOrder(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} order PUT request`);
            const body: any = await ctx.request.body;
            const { status } = body;

            if (!status) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Order status is required.");
            }

            const orderRepository = AppDataSource.getRepository(Order);
            const order = await orderRepository.findOne({ where: { id } });

            if (!order) {
                ctx.throw(StatusCodes.NOT_FOUND, "Order not found.");
            }

            order.status = status;
            await orderRepository.save(order);

            ctx.body = order;
        } catch (error) {
            console.error("Error updating order:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async deleteOrder(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} order DELETE request`);
            const orderRepository = AppDataSource.getRepository(Order);
            const order = await orderRepository.findOne({ where: { id } });

            if (!order) {
                ctx.throw(StatusCodes.NOT_FOUND, "Order not found.");
            }

            await orderRepository.remove(order);
            ctx.body = `Order with ID ${id} has been deleted.`;
        } catch (error) {
            console.error("Error deleting order:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}

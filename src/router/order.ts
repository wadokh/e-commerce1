import Router from 'koa-router'
import { AppDataSource } from "../data-source"
import "reflect-metadata";
import {Order} from "../entity/Order";
import {Customer} from "../entity/Customer";
import {OrderItem} from "../entity/OrderItem";
import {Product} from "../entity/Product";

const routerOpts: Router.IRouterOptions = {
    prefix: '/order',
};

const router: Router = new Router(routerOpts);

router.get('/', async (ctx) => {
    console.log("order get request");
    ctx.body =  await AppDataSource.manager.find(Order,{
        relations: ["customer", "orderItems", "orderItems.product"]
    });
});

router.get('/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log(`${id} order get request`);
    const order = await AppDataSource.manager.findOne(Order,{
        where: { id: parseInt(id) }
    });
    if (!order){
        ctx.throw(404);
    }
    ctx.body = order;
})

router.post('/', async (ctx) => {
    console.log("Order post request");
    const order = new Order()
    const body: any = await ctx.request.body;
    const {customerId, items} = body;
    console.log(body);
    if (!customerId || !items || items.length===0) {
        ctx.throw(404, "Customer or items not found");
    }
    const customer = await AppDataSource.manager.findOne(Customer,{
        where: { id: parseInt(customerId) }
    });
    if (!customer){
        ctx.throw(404,"no such key");
    }
    order.customer = customer
    order.status = "pending"
    order.totalAmount =  0
    order.orderItems = []
    for (const item of items) {
        const product = await AppDataSource.manager.findOne(Product, {
            where: { id: parseInt(item.productId) }
        });

        if (!product) {
            ctx.throw(404, `Product with ID ${item.productId} not found`);
        }

        if (item.quantity <= 0 || product.stock-item.quantity<0) {
            ctx.throw(400, `Invalid quantity for product ID ${item.productId}`);
        }
        product.stock = product.stock  - item.quantity;

        const orderItem = new OrderItem();
        orderItem.product = product
        orderItem.quantity = item.quantity
        orderItem.price = product.price * item.quantity

        order.totalAmount += orderItem.price

        await AppDataSource.manager.save(orderItem)
        order.orderItems.push(orderItem)
    }
    await AppDataSource.manager.save(order)
    ctx.body = order;
})
router.put('/:id', async (ctx) => {
    console.log("Order put request")
    const orderId = parseInt(ctx.params.id)
    const body: any = await ctx.request.body
    const { customerId, items, status } = body
    console.log(body);

    if (!customerId || !items || items.length === 0 || !status) {
        ctx.throw(400, "Customer ID, items, or status are missing")
    }

    const order = await AppDataSource.manager.findOne(Order, {
        where: { id: orderId },
        relations: ["orderItems", "customer"],
    });

    if (!order) {
        ctx.throw(404, `Order with ID ${orderId} not found`);
    }

    const customer = await AppDataSource.manager.findOne(Customer, {
        where: { id: parseInt(customerId) },
    });

    if (!customer) {
        ctx.throw(404, `Customer with ID ${customerId} not found`)
    }

    order.customer = customer
    order.status = status
    order.totalAmount = 0

    const oldItem: OrderItem[] = []
    // for (const item of order.orderItems){
    //     const product = await AppDataSource.manager.findOne(Product, {
    //         where: { id: item.product.id},
    //     });
    //     product.stock = product.stock + item.quantity
    // }
    for (const item of order.orderItems){
        oldItem.push(item)
    }

    await AppDataSource.manager.remove(OrderItem, order.orderItems);
    order.orderItems = [];

    for (const item of items) {
        const product = await AppDataSource.manager.findOne(Product, {
            where: { id: parseInt(item.productId) },
        });

        if (!product) {
            ctx.throw(404, `Product with ID ${item.productId} not found`);
        }

        if (item.quantity <= 0) {
            ctx.throw(400, `Invalid quantity for product ID ${item.productId}`);
        }

        const orderItem = new OrderItem();
        orderItem.product = product
        orderItem.quantity = item.quantity;
        orderItem.price = product.price * item.quantity

        order.totalAmount += orderItem.price
        order.orderItems.push(orderItem)
    }

    await AppDataSource.manager.save(order)
    for (const item of oldItem) {
        const product = await AppDataSource.manager.findOne(Product, {
            where: { id: item.product.id},
        });
        product.stock = product.stock + item.quantity
    }
    ctx.body = order
});

router.delete('/:id', async (ctx) => {
    const orderId = parseInt(ctx.params.id);

    const order = await AppDataSource.manager.findOne(Order, {
        where: { id: orderId },
        relations: ["orderItems"],
    });

    if (!order) {
        ctx.throw(404, `Order with ID ${orderId} not found`);
    }

    if (order.orderItems && order.orderItems.length > 0) {
        await AppDataSource.manager.remove(OrderItem, order.orderItems);
    }

    await AppDataSource.manager.remove(Order, order);

    ctx.body = { message: `Order with ID ${orderId} has been deleted successfully` };
});


export default router;
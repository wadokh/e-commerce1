import Router from 'koa-router'
import { AppDataSource } from "../data-source"
import "reflect-metadata";
import {OrderItem} from "../entity/OrderItem";
import {Product} from "../entity/Product";

const routerOpts: Router.IRouterOptions = {
    prefix: '/orderItem',
};

const router: Router = new Router(routerOpts);

router.get('/', async (ctx) => {
    console.log("order get request");
    ctx.body =  await AppDataSource.manager.find(OrderItem);
});

router.get('/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log(`${id} order item get request`);
    const orderItem = await AppDataSource.manager.findOne(OrderItem,{
        where: { id: parseInt(id) }
    });
    if (!orderItem){
        ctx.throw(404);
    }
    ctx.body = orderItem;
})

router.put('/:id', async (ctx
) => {
    const orderItemId = parseInt(ctx.params.id);
    console.log(`${orderItemId} order update request`);
    const body: any = await ctx.request.body;
    const { productId, quantity, price } = body;

    const orderItem = await AppDataSource.manager.findOne(OrderItem, {
        where: { id: orderItemId },
        relations: ["product", "order"],
    });

    if (!orderItem) {
        ctx.throw(404, `OrderItem with ID ${orderItemId} not found`);
    }

    if (productId) {
        const product = await AppDataSource.manager.findOne(Product, {
            where: { id: parseInt(productId) },
        });

        if (!product) {
            ctx.throw(404, `Product with ID ${productId} not found`);
        }
        product.stock = product.stock + orderItem.quantity;
        orderItem.product = product;
        if (product.stock - quantity < 0) {
            ctx.throw(400, `Not enough stock`);
        }
        product.stock = product.stock - quantity;
    }

    if (quantity) {
        if (quantity <= 0) {
            ctx.throw(400, "Quantity must be greater than zero");
        }
        orderItem.quantity = parseInt(quantity);
    }

    if (price) {
        if (price <= 0) {
            ctx.throw(400, "Price must be greater than zero");
        }
        orderItem.price = parseFloat(price);
    }

    await AppDataSource.manager.save(orderItem);

    ctx.body = orderItem;
});

export default router;
import Router from 'koa-router'
import { AppDataSource } from "../data-source"
import "reflect-metadata";
import {Product} from "../entity/Product";
import {Category} from "../entity/Category";

const routerOpts: Router.IRouterOptions = {
    prefix: '/products',
};

const router: Router = new Router(routerOpts);

router.get('/', async (ctx) => {
    console.log("product get request");
    ctx.body =  await AppDataSource.manager.find(Product);
});

router.get('/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log(`${id} product get request`);
    const product = await AppDataSource.manager.findOne(Product,{
        where: { id: parseInt(id) }
    });
    if (!product){
        ctx.throw(404);
    }
    ctx.body = product;
})

router.post('/', async (ctx) => {
    console.log("Product post request");
    const body: any = await ctx.request.body;
    console.log(body)
    const { name, price, description, stock, categoryId } = body;

    if (!name || !price || !description || !stock || !categoryId) {
        ctx.throw(400, "Missing required fields: name, price, description, stock, or categoryId");
    }

    const category = await AppDataSource.manager.findOne(Category, {
        where: { id: parseInt(categoryId) },
    });

    if (!category) {
        ctx.throw(404, `Category with ID ${categoryId} not found`);
    }

    const product = new Product();
    product.name = name;
    product.price = parseFloat(price);
    product.description = description;
    product.stock = parseInt(stock);
    product.category = category;

    await AppDataSource.manager.save(product);

    ctx.body = product;
});
router.put('/:id', async (ctx) => {
    console.log("Product put request");
    const productId = parseInt(ctx.params.id);
    const body: any = await ctx.request.body;
    console.log(body);
    const { name, price, description, stock, categoryId } = body;

    const product = await AppDataSource.manager.findOne(Product, {
        where: { id: productId },
        relations: ["category"],
    });

    if (!product) {
        ctx.throw(404, `Product with ID ${productId} not found`);
    }

    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (description) product.description = description;
    if (stock) product.stock = parseInt(stock);

    if (categoryId) {
        const category = await AppDataSource.manager.findOne(Category, {
            where: { id: parseInt(categoryId) },
        });

        if (!category) {
            ctx.throw(404, `Category with ID ${categoryId} not found`);
        }

        product.category = category;
    }

    await AppDataSource.manager.save(product);

    ctx.body = product;
});

router.delete('/:id', async (ctx) => {
    console.log("Product delete request")
    const productId = parseInt(ctx.params.id);

    const product = await AppDataSource.manager.findOne(Product, {
        where: { id: productId },
        relations: ["orderItems"],
    });

    if (!product) {
        ctx.throw(404, `Product with ID ${productId} not found`);
    }

    if (product.orderItems && product.orderItems.length > 0) {
        ctx.throw(400, "Cannot delete the product as it is associated with existing order items");
    }

    await AppDataSource.manager.remove(Product, product);

    ctx.body = { message: `Product with ID ${productId} has been deleted successfully` };
});

export default router;
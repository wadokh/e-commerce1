import Router from 'koa-router'
import { AppDataSource } from "../data-source"
import "reflect-metadata";
import {Category} from "../entity/Category";

const routerOpts: Router.IRouterOptions = {
    prefix: '/category',
};

const router: Router = new Router(routerOpts);

router.get('/', async (ctx) => {
    console.log("category get request");
    ctx.body =  await AppDataSource.manager.find(Category);
});

router.get('/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log(`${id} category get request`);
    const categ = await AppDataSource.manager.findOne(Category,{
        where: { id: parseInt(id) }
    });
    if (!categ){
        ctx.throw(404,"Category not found");
    }
    ctx.body = categ;
})

router.post('/', async (ctx) => {
    console.log("Category post request");
    const category = new Category()
    const body: any = await ctx.request.body;
    console.log(body);
    category.name = body.name
    category.description = body.description || ""
    await AppDataSource.manager.save(category)
    ctx.body = category;
})

router.put('/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log(id + " category put request");
    const category = new Category()
    const body: any = await ctx.request.body;
    console.log(body);
    category.name = body.name
    category.description = body.description || ""
    await AppDataSource
        .createQueryBuilder()
        .update(Category)
        .set({
            name: category.name,
            description: category.description,
        })
        .where("id = :id", { id: id})
        .execute()
    ctx.body = category;
})

router.delete('/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log(`${id} category delete request`)
    const category = await AppDataSource.manager.findOne(Category,{
        where: { id: parseInt(id) }
    });
    if (!category){
        ctx.throw(404,"no such key");
    }
    await AppDataSource
        .createQueryBuilder()
        .delete()
        .from(Category)
        .where("id = :id",{id: id})
        .execute()
    console.log(category);
    ctx.body = "deleted object";
})

export default router;
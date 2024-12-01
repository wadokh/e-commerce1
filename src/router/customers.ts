import Router from 'koa-router'
import { AppDataSource } from "../data-source"
import "reflect-metadata";
import {Customer} from "../entity/Customer";

const routerOpts: Router.IRouterOptions = {
    prefix: '/customers',
};

const router: Router = new Router(routerOpts);

router.get('/', async (ctx) => {
    console.log("category get request");
    ctx.body =  await AppDataSource.manager.find(Customer);
});

router.get('/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log(`${id} customer get request`);
    const customer = await AppDataSource.manager.findOne(Customer,{
        where: { id: parseInt(id) }
    });
    if (!customer){
        ctx.throw(404);
    }
    ctx.body = customer;
})

router.post('/', async (ctx) => {
    console.log("Customer post request");
    const customer = new Customer()
    const body: any = await ctx.request.body;
    console.log(body);
    const checkCustomer = await AppDataSource.manager.findOne(Customer,{
        where: { email: body.email }
    });
    if (!checkCustomer){
        customer.firstName = body.firstName
        customer.lastName = body.lastName || ""
        customer.email = body.email
        customer.address = body.address || "India"
        await AppDataSource.manager.save(customer)
        ctx.body = customer;
    }
    else {
        ctx.throw(422, "e-mail has to be unique");
    }
})

router.put('/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log(id + " customer put request");
    const customer = new Customer()
    const body: any = await ctx.request.body;
    console.log(body);
    const checkCustomer = await AppDataSource.manager.findOne(Customer,{
        where: { email: body.email }
    });
    if (!checkCustomer) {
        customer.firstName = body.firstName
        customer.lastName = body.lastName || ""
        customer.email = body.email
        customer.address = body.address || "India"
        await AppDataSource
            .createQueryBuilder()
            .update(Customer)
            .set({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                address: customer.address,
            })
            .where("id = :id", {id: id})
            .execute()
        ctx.body = customer;
    } else {
        ctx.throw(422,"e-mail  has  to be unique");
    }
})

router.delete('/:id', async (ctx) => {
    const id = ctx.params.id;
    console.log(`${id} customer delete request`)
    const customer = await AppDataSource.manager.findOne(Customer,{
        where: { id: parseInt(id) }
    });
    if (!customer){
        ctx.throw(404,"no such key");
    }
    await AppDataSource
        .createQueryBuilder()
        .delete()
        .from(Customer)
        .where("id = :id",{id: id})
        .execute()
    console.log(customer);
    ctx.body = "deleted object";
})

export default router;
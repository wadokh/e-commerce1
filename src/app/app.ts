import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-bodyparser'
import { AppDataSource } from "../data-source"
import "reflect-metadata";
import categoryRouter from "../router/category"
import customerRouter from "../router/customers"
import orderRouter from "../router/order"
import orderItemRouter from "../router/orderItem"
import productRouter from "../router/product"

const app = new Koa();
app.use(bodyParser());
const router = new Router();
(async () => {
    await AppDataSource.initialize();
})();

app.use(customerRouter.routes());
app.use(categoryRouter.routes());
app.use(orderRouter.routes());
app.use(orderItemRouter.routes());
app.use(productRouter.routes());
app.use(router.routes());
// router.get('/customers', async (ctx) => {
//     console.log("customers get request");
//     ctx.body =  await AppDataSource.manager.find(Customer);
// });

//app.use(router.routes());
// router.get('/category', async (ctx) => {
//     console.log("category get request");
//     ctx.body =  await AppDataSource.manager.find(Category);
// });

app.listen(3000, () => {
    console.log(`hellow world`);
})
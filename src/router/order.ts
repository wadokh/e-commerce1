import Router from "koa-router";
import { OrderController } from "../controllers/OrderController";

const routerOpts: Router.IRouterOptions = {
    prefix: "/orders",
};

const router: Router = new Router(routerOpts);

router.get("/", OrderController.getAllOrders);
router.get("/:id", OrderController.getOrderById);
router.post("/", OrderController.createOrder);
router.put("/:id", OrderController.updateOrder);
router.delete("/:id", OrderController.deleteOrder);

export default router;

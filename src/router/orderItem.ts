import Router from "koa-router";
import { OrderItemController} from "../controllers/OrderItemController";

const routerOpts: Router.IRouterOptions = {
    prefix: "/orderItem",
};

const router: Router = new Router(routerOpts);

router.get("/", OrderItemController.getAllOrderItems);
router.get("/:id", OrderItemController.getOrderItemById);
router.put("/:id", OrderItemController.updateOrderItem);

export default router;

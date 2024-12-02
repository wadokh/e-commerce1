import Router from "koa-router";
import {CustomerController} from "../controllers/CustomerController";

const routerOpts: Router.IRouterOptions = {
    prefix: "/customers",
};

const router: Router = new Router(routerOpts);

router.get("/", CustomerController.getAllCustomers);
router.get("/:id", CustomerController.getCustomerById);
router.post("/", CustomerController.createCustomer);
router.put("/:id", CustomerController.updateCustomer);
router.delete("/:id", CustomerController.deleteCustomer);

export default router;
